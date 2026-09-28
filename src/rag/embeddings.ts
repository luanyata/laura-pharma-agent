import { startActiveObservation } from "@langfuse/tracing";
import { EMBEDDING_MODEL, OLLAMA_EMBEDDINGS_URL } from "../config/constants";

/**
 * Gera vetores de embedding para consultas ou documentos via Ollama.
 */
export async function getEmbedding(
  text: string,
  isQuery = false,
): Promise<number[]> {
  return await startActiveObservation(
    "generate-embedding",
    async (span) => {
      const prompt = isQuery ? `search_query: ${text}` : `search_document: ${text}`;

      span.update({
        model: EMBEDDING_MODEL,
        input: { text, isQuery, promptPrefix: isQuery ? "search_query" : "search_document" },
      });

      const response = await fetch(OLLAMA_EMBEDDINGS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate embedding with ${EMBEDDING_MODEL}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as { embedding: number[] };

      span.update({
        output: { dimensions: data.embedding.length },
      });

      return data.embedding;
    },
    { asType: "embedding" },
  );
}

