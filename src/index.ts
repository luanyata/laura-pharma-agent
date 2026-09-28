import { initTracing, shutdownTracing } from "./config/instrumentation";
import { initKnowledgeBase } from "./rag/vector_store";
import { AgentSession } from "./core/agent";

// Inicializa a instrumentação OpenTelemetry / Langfuse
initTracing();

const session = new AgentSession();

try {
  // Inicialização da base vetorial e CLI
  await initKnowledgeBase();

  console.log("=== Farmacia Saude & Vida - Customer Service CLI ===");
  console.log("(Type 'exit' ou 'sair' para encerrar)\n");

  while (true) {
    const input = prompt("Voce: ");
    if (!input || ["sair", "exit"].includes(input.trim().toLowerCase())) {
      console.log("\nLaura: Até logo! Cuide-se bem.");
      break;
    }

    try {
      const { reply } = await session.handleUserMessage(input);
      console.log(`\nLaura: ${reply}\n`);
    } catch (error) {
      console.error("Interaction failed:", error);
      break;
    }
  }
} finally {
  await shutdownTracing();
}

