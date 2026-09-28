import { startActiveObservation } from "@langfuse/tracing";
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
  return await startActiveObservation(
    "classify-intent",
    async (span) => {
      const messages = [
        { role: "system", content: ROUTER_PROMPT },
        { role: "user", content: userInput },
      ];

      span.update({
        model: CHAT_MODEL,
        modelParameters: {
          temperature: TEMPERATURES.ROUTER,
          format: "json",
        },
        input: messages,
      });

      try {
        const response = await fetch(OLLAMA_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: CHAT_MODEL,
            messages,
            format: "json",
            stream: false,
            options: { temperature: TEMPERATURES.ROUTER },
          }),
        });

        if (!response.ok) {
          const fallback: IntentClassification = { intent: "GENERAL", entity: null };
          span.update({
            output: fallback,
            metadata: { error: `HTTP ${response.status} ${response.statusText}` },
          });
          return fallback;
        }

        const payload = (await response.json()) as OllamaChatResponse;
        const parsed = JSON.parse(
          payload.message.content ?? "{}",
        ) as IntentClassification;

        const usageDetails =
          payload.prompt_eval_count !== undefined && payload.eval_count !== undefined
            ? {
                input: payload.prompt_eval_count,
                output: payload.eval_count,
                total: payload.prompt_eval_count + payload.eval_count,
              }
            : undefined;

        span.update({
          output: parsed,
          ...(usageDetails ? { usageDetails } : {}),
        });


        return parsed;
      } catch (err) {
        const fallback: IntentClassification = { intent: "GENERAL", entity: null };
        span.update({
          output: fallback,
          metadata: { error: String(err) },
        });
        return fallback;
      }
    },
    { asType: "generation" },
  );
}

