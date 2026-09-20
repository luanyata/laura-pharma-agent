import { CHAT_MODEL, OLLAMA_URL, TEMPERATURES } from "../config/constants";
import { ROUTER_PROMPT } from "../config/prompts";
import type { OllamaChatResponse } from "../domain/types";

export type UserIntent =
  | "GREETING"
  | "MEDICAL_ADVICE"
  | "PRODUCT_SEARCH"
  | "POLICY_INQUIRY"
  | "GENERAL";

export interface IntentClassification {
  intent: UserIntent;
  entity: string | null;
}

export async function classifyIntent(
  userInput: string,
): Promise<IntentClassification> {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: ROUTER_PROMPT },
          { role: "user", content: userInput },
        ],
        format: "json",
        stream: false,
        options: { temperature: TEMPERATURES.ROUTER },
      }),
    });

    if (!response.ok) {
      return { intent: "GENERAL", entity: null };
    }

    const payload = (await response.json()) as OllamaChatResponse;
    return JSON.parse(payload.message.content ?? "{}") as IntentClassification;
  } catch {
    return { intent: "GENERAL", entity: null };
  }
}
