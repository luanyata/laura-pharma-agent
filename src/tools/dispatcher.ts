import { startActiveObservation } from "@langfuse/tracing";
import { checkInventory } from "../domain/stock";
import { searchKnowledge } from "../rag/vector_store";

/**
 * Despacha a chamada da ferramenta retornada pelo LLM para o módulo de domínio correto.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  const toolSpanName =
    name === "checkInventory"
      ? "check-inventory"
      : name === "getPharmacyPolicies"
      ? "get-pharmacy-policies"
      : name;

  return await startActiveObservation(
    toolSpanName,
    async (span) => {
      span.update({
        input: args,
      });

      if (name === "checkInventory") {
        const query =
          (args.productName as string) ??
          (args.searchTerm as string) ??
          (args.query as string) ??
          "";

        console.log(`\n [API] Executing checkInventory("${query}")...`);
        const result = checkInventory(query);
        const outputStr = JSON.stringify(result);
        span.update({ output: result });
        return outputStr;
      }

      if (name === "getPharmacyPolicies") {
        const query = (args.searchQuery as string) ?? (args.query as string) ?? "";

        console.log(`\n [RAG] Executing getPharmacyPolicies("${query}")...`);
        const result = await searchKnowledge(query, 2);
        span.update({ output: { result } });
        return result;
      }

      const errOutput = JSON.stringify({ error: `Unknown tool: ${name}` });
      span.update({ output: { error: `Unknown tool: ${name}` } });
      return errOutput;
    },
    { asType: "tool" },
  );
}

