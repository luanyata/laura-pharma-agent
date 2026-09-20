import { CHAT_MODEL, OLLAMA_URL, TEMPERATURES } from "../config/constants";
import { SYSTEM_PROMPT } from "../config/prompts";
import type { ChatMessage, OllamaChatResponse } from "../domain/types";
import { executeTool, TOOLS } from "../tools";
import { classifyIntent } from "./router";

export interface ExecutedToolCall {
  name: string;
  args: Record<string, unknown>;
  output: string;
}

export interface AgentTurnResult {
  reply: string;
  toolCalls: ExecutedToolCall[];
  intent: string;
}

// Parser para capturar tool call formatada em texto puro pelo modelo
export function parseRawToolCall(
  content?: string,
): { name: string; args: Record<string, unknown> } | null {
  if (!content) return null;
  const trimmed = content.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const name = parsed.name ?? parsed.function?.name;
      const args = parsed.parameters ?? parsed.arguments ?? parsed.args;

      if (name && typeof name === "string") {
        return {
          name,
          args: typeof args === "string" ? JSON.parse(args) : (args ?? {}),
        };
      }
    } catch {
      return null;
    }
  }
  return null;
}

// Chamada ao Ollama com suporte opcional a tools
export async function callOllama(
  messages: ChatMessage[],
  tools?: unknown[],
): Promise<ChatMessage> {
  const body: Record<string, unknown> = {
    model: CHAT_MODEL,
    messages,
    stream: false,
    options: { temperature: TEMPERATURES.CHAT },
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
  }

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as OllamaChatResponse;
  return payload.message;
}

export class AgentSession {
  public conversationHistory: ChatMessage[];

  constructor(systemPrompt: string = SYSTEM_PROMPT) {
    this.conversationHistory = [{ role: "system", content: systemPrompt }];
  }

  async handleUserMessage(userInput: string): Promise<AgentTurnResult> {
    const { intent } = await classifyIntent(userInput);
    const executedToolCalls: ExecutedToolCall[] = [];

    // ROTA A: Guardrail Ético / Médico
    if (intent === "MEDICAL_ADVICE") {
      const adviceRefusal =
        "Por uma questão de cuidado, respeito e zelo com a sua saúde, não posso indicar medicamentos ou tratamentos por aqui. Como nos velhos tempos, recomendo com muito carinho que converse pessoalmente com o nosso farmacêutico no balcão ou consulte o seu médico de confiança.";

      this.conversationHistory.push({ role: "user", content: userInput });
      this.conversationHistory.push({ role: "assistant", content: adviceRefusal });
      return {
        reply: adviceRefusal,
        toolCalls: executedToolCalls,
        intent,
      };
    }

    // ROTA B: Saudação, confirmações e perguntas de seguimento pelo histórico (Sem tools passadas)
    if (intent === "GREETING" || intent === "GENERAL") {
      this.conversationHistory.push({ role: "user", content: userInput });

      const assistantMessage = await callOllama(this.conversationHistory);
      this.conversationHistory.push(assistantMessage);

      return {
        reply:
          assistantMessage.content ??
          "Olá! Seja muito bem-vindo à nossa botica. Como posso lhe ajudar hoje?",
        toolCalls: executedToolCalls,
        intent,
      };
    }

    // ROTA C: Busca de Produto ou Políticas Institucionais (com Tools)
    this.conversationHistory.push({ role: "user", content: userInput });

    let currentMessage = await callOllama(
      this.conversationHistory,
      TOOLS as unknown as unknown[],
    );

    // Caso 1: Tool call estruturada nativa do Ollama
    if (currentMessage.tool_calls && currentMessage.tool_calls.length > 0) {
      this.conversationHistory.push(currentMessage);

      for (const toolCall of currentMessage.tool_calls) {
        const toolArgs =
          typeof toolCall.function.arguments === "string"
            ? JSON.parse(toolCall.function.arguments)
            : (toolCall.function.arguments as Record<string, unknown>);

        const toolOutput = await executeTool(
          toolCall.function.name,
          toolArgs,
        );

        executedToolCalls.push({
          name: toolCall.function.name,
          args: toolArgs,
          output: toolOutput,
        });

        this.conversationHistory.push({
          role: "tool",
          content: toolOutput,
        });
      }

      // Chamada sem tools para gerar o texto final baseado no output da tool
      currentMessage = await callOllama(this.conversationHistory);
    } else {
      // Caso 2: Tool call vazada como texto bruto (ex: {"name": "checkInventory", ...})
      const rawCall = parseRawToolCall(currentMessage.content);
      if (rawCall) {
        this.conversationHistory.push(currentMessage);

        const toolOutput = await executeTool(rawCall.name, rawCall.args);

        executedToolCalls.push({
          name: rawCall.name,
          args: rawCall.args,
          output: toolOutput,
        });

        this.conversationHistory.push({
          role: "tool",
          content: toolOutput,
        });

        // Chamada sem tools para gerar o texto final baseado no output da tool
        currentMessage = await callOllama(this.conversationHistory);
      }
    }

    this.conversationHistory.push(currentMessage);

    return {
      reply:
        currentMessage.content ??
        "Desculpe, tive um problema ao gerar a resposta.",
      toolCalls: executedToolCalls,
      intent,
    };
  }
}
