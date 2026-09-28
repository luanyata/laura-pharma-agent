import { initTracing, shutdownTracing } from "../src/config/instrumentation";
import { AgentSession } from "../src/core/agent";
import { initKnowledgeBase } from "../src/rag/vector_store";

// Inicializa a instrumentação OpenTelemetry / Langfuse
initTracing();

interface TestStepResult {
  step: string;
  userInput: string;
  passed: boolean;
  reply: string;
  toolCalls: Array<{ name: string; args: Record<string, unknown> }>;
  details: string[];
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function logHeader(title: string) {
  console.log(`\n${BOLD}${CYAN}=====================================================${RESET}`);
  console.log(`${BOLD}${CYAN} ${title} ${RESET}`);
  console.log(`${BOLD}${CYAN}=====================================================${RESET}`);
}

function logAssertion(description: string, passed: boolean, info?: string) {
  const badge = passed ? `${GREEN}[PASS]${RESET}` : `${RED}[FAIL]${RESET}`;
  console.log(`  ${badge} ${description}`);
  if (info && !passed) {
    console.log(`         ${YELLOW}Detalhe: ${info}${RESET}`);
  }
}

async function runScenario1(): Promise<boolean> {
  logHeader("Cenário 1: Consulta de estoque de filial e pergunta de endereço");
  const session = new AgentSession(
    undefined,
    `eval_scenario_1_${Date.now()}`,
    "eval-runner",
  );
  let scenarioPassed = true;


  // Turno 1
  console.log(`\n${BOLD}Turno 1:${RESET} "Tem pomada cicatrizante?"`);
  const t1 = await session.handleUserMessage("Tem pomada cicatrizante?");
  console.log(`${BOLD}Laura:${RESET} ${t1.reply}`);

  const t1CalledInventory = t1.toolCalls.some(
    (tc) => tc.name === "checkInventory",
  );
  logAssertion(
    "Deve chamar a tool checkInventory",
    t1CalledInventory,
    `Tools chamadas: ${JSON.stringify(t1.toolCalls.map((t) => t.name))}`,
  );

  const t1MentionsBranch =
    t1.reply.toLowerCase().includes("areias") ||
    t1.reply.toLowerCase().includes("filial");
  logAssertion(
    "Assistente responde que tem na Filial Areias",
    t1MentionsBranch,
    `Resposta: "${t1.reply}"`,
  );

  if (!t1CalledInventory || !t1MentionsBranch) scenarioPassed = false;

  // Turno 2
  console.log(`\n${BOLD}Turno 2:${RESET} "qual o endereco da filial?"`);
  const t2 = await session.handleUserMessage("qual o endereco da filial?");
  console.log(`${BOLD}Laura:${RESET} ${t2.reply}`);

  const t2NoTools = t2.toolCalls.length === 0;
  logAssertion(
    "NÃO deve chamar nenhuma tool (tool_calls vazio)",
    t2NoTools,
    `Tools chamadas: ${JSON.stringify(t2.toolCalls.map((t) => t.name))}`,
  );

  const t2HasAddress =
    t2.reply.includes("Av. das Torres, 450") ||
    t2.reply.toLowerCase().includes("av. das torres");
  logAssertion(
    "A resposta deve conter 'Av. das Torres, 450' (extraído do histórico)",
    t2HasAddress,
    `Resposta: "${t2.reply}"`,
  );

  if (!t2NoTools || !t2HasAddress) scenarioPassed = false;

  // Turno 3
  console.log(`\n${BOLD}Turno 3:${RESET} "mas nao seria essa filial que tem a pomada ?"`);
  const t3 = await session.handleUserMessage(
    "mas nao seria essa filial que tem a pomada ?",
  );
  console.log(`${BOLD}Laura:${RESET} ${t3.reply}`);

  const t3NoInventory = !t3.toolCalls.some(
    (tc) => tc.name === "checkInventory",
  );
  logAssertion(
    "NÃO deve chamar checkInventory novamente",
    t3NoInventory,
    `Tools chamadas: ${JSON.stringify(t3.toolCalls.map((t) => t.name))}`,
  );

  const t3NoRepetition =
    !t3.reply.toLowerCase().includes("esgotada na nossa loja do centro") &&
    !t3.reply.toLowerCase().includes("esgotada aqui na nossa loja do centro");
  logAssertion(
    "A resposta NÃO deve repetir a mensagem de esgotado no Centro",
    t3NoRepetition,
    `Resposta: "${t3.reply}"`,
  );

  if (!t3NoInventory || !t3NoRepetition) scenarioPassed = false;

  return scenarioPassed;
}

async function runScenario2(): Promise<boolean> {
  logHeader("Cenário 2: Pergunta sobre genérico após cotação");
  const session = new AgentSession(
    undefined,
    `eval_scenario_2_${Date.now()}`,
    "eval-runner",
  );
  let scenarioPassed = true;

  // Turno 1
  console.log(`\n${BOLD}Turno 1:${RESET} "Tem dipirona?"`);
  const t1 = await session.handleUserMessage("Tem dipirona?");
  console.log(`${BOLD}Laura:${RESET} ${t1.reply}`);

  const t1CalledDipirona = t1.toolCalls.some(
    (tc) =>
      tc.name === "checkInventory" &&
      String(tc.args.productName ?? "").toLowerCase().includes("dipirona"),
  );
  logAssertion(
    "Deve chamar checkInventory(\"dipirona\")",
    t1CalledDipirona,
    `Tools chamadas: ${JSON.stringify(t1.toolCalls)}`,
  );

  if (!t1CalledDipirona) scenarioPassed = false;

  // Turno 2
  console.log(`\n${BOLD}Turno 2:${RESET} "tem generico?"`);
  const t2 = await session.handleUserMessage("tem generico?");
  console.log(`${BOLD}Laura:${RESET} ${t2.reply}`);

  const t2NotCalledGeneric = !t2.toolCalls.some(
    (tc) =>
      tc.name === "checkInventory" &&
      String(tc.args.productName ?? "").toLowerCase() === "generico",
  );
  logAssertion(
    "NÃO deve chamar checkInventory(\"generico\")",
    t2NotCalledGeneric,
    `Tools chamadas: ${JSON.stringify(t2.toolCalls)}`,
  );

  const t2DirectGenericAnswer =
    t2.reply.toLowerCase().includes("genérico") ||
    t2.reply.toLowerCase().includes("generico");
  logAssertion(
    "Deve responder diretamente que a Dipirona disponível já é genérica",
    t2DirectGenericAnswer,
    `Resposta: "${t2.reply}"`,
  );

  if (!t2NotCalledGeneric || !t2DirectGenericAnswer) scenarioPassed = false;

  return scenarioPassed;
}

async function main() {
  let s1Passed = false;
  let s2Passed = false;

  try {
    console.log(`${BOLD}Iniciando suíte de testes de avaliação (Evals)...${RESET}`);
    await initKnowledgeBase();

    s1Passed = await runScenario1();
    s2Passed = await runScenario2();

    console.log(`\n${BOLD}================ RESUMO FINAL =================${RESET}`);
    console.log(`Cenário 1 (Estoque filial e endereço): ${s1Passed ? `${GREEN}APROVADO (PASS)${RESET}` : `${RED}FALHOU (FAIL)${RESET}`}`);
    console.log(`Cenário 2 (Perguntas sobre genérico):  ${s2Passed ? `${GREEN}APROVADO (PASS)${RESET}` : `${RED}FALHOU (FAIL)${RESET}`}`);
    console.log(`${BOLD}===============================================${RESET}\n`);
  } finally {
    console.log(`${BOLD}Finalizando e enviando traces para o Langfuse...${RESET}`);
    await shutdownTracing();
  }

  if (!s1Passed || !s2Passed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(async (err) => {
  console.error("Erro fatal na execução dos testes:", err);
  await shutdownTracing();
  process.exit(1);
});

