import { checkInventory } from "../domain/stock";
import { searchKnowledge } from "../rag/vector_store";

/**
 * Despacha a chamada da ferramenta retornada pelo LLM para o módulo de domínio correto.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  if (name === "checkInventory") {
    const query =
      (args.productName as string) ??
      (args.searchTerm as string) ??
      (args.query as string) ??
      "";

    console.log(`\n [API] Executing checkInventory("${query}")...`);
    const result = checkInventory(query);
    return JSON.stringify(result);
  }

  if (name === "getPharmacyPolicies") {
    const query = (args.searchQuery as string) ?? (args.query as string) ?? "";

    console.log(`\n [RAG] Executing getPharmacyPolicies("${query}")...`);
    return await searchKnowledge(query, 2);
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}
