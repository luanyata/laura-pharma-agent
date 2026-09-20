import { ESTOQUE_LOJAS } from "./catalog.data";
import type { InventoryLookupResult } from "./types";
import { normalizeText } from "../utils/text";

export function checkInventory(searchTerm?: string): InventoryLookupResult {
  if (!searchTerm) {
    return { found: false, message: "Product name or term not provided." };
  }

  const query = normalizeText(searchTerm);
  if (!query) {
    return { found: false, message: "Product name or term not provided." };
  }

  // 1. Busca inteligente: confere Nome, Princípio Ativo e Tags de sinônimos/sintomas
  const matchedProduct = ESTOQUE_LOJAS.find((item) => {
    const matchName = normalizeText(item.name).includes(query);
    const matchIngredient = item.activeIngredient
      ? normalizeText(item.activeIngredient).includes(query)
      : false;
    const matchTags = item.tags.some((tag) => {
      const normalizedTag = normalizeText(tag);
      return normalizedTag === query || query.includes(normalizedTag);
    });

    return matchName || matchIngredient || matchTags;
  });

  console.log("[stock.ts checkInventory] matchedProduct:", matchedProduct);

  if (!matchedProduct) {
    return {
      found: false,
      message: `Product or term "${searchTerm}" not found in catalog.`,
    };
  }

  // 2. Identifica estoque da Matriz (Centro)
  const downtownBranch = matchedProduct.branches.find(
    (b) =>
      b.branch.toLowerCase().includes("centro") ||
      b.branch.toLowerCase().includes("matriz"),
  );
  const stockAtCurrentStore = downtownBranch ? downtownBranch.stock : 0;

  // 3. Identifica outras filiais com estoque
  const otherBranchesWithStock = matchedProduct.branches
    .filter(
      (b) =>
        !b.branch.toLowerCase().includes("centro") &&
        !b.branch.toLowerCase().includes("matriz") &&
        b.stock > 0,
    )
    .map((b) => ({
      branchName: b.branch,
      availableStock: b.stock,
      address: b.address,
    }));

  const priceFormatted = `R$ ${matchedProduct.price.toFixed(2).replace(".", ",")}`;
  const genericTag = matchedProduct.isGeneric ? " (medicamento genérico)" : "";

  // 4. Cria resumo contextual inequívoco para o LLM
  let summary = "";
  if (stockAtCurrentStore > 0) {
    summary = `Produto encontrado: ${matchedProduct.name}${genericTag}. Preço: ${priceFormatted}. Disponível em nossa Matriz (Centro) com ${stockAtCurrentStore} unidades.`;
  } else if (otherBranchesWithStock.length > 0) {
    const branchesText = otherBranchesWithStock
      .map(
        (b) =>
          `DISPONÍVEL na ${b.branchName} (${b.availableStock} un. - Endereço: ${b.address})`,
      )
      .join("; ");
    summary = `Produto encontrado: ${matchedProduct.name}${genericTag}. Preço: ${priceFormatted}. ESGOTADO na Matriz (Centro). ${branchesText}.`;
  } else {
    summary = `Produto ${matchedProduct.name} está esgotado em todas as lojas no momento.`;
  }

  return {
    found: true,
    product: matchedProduct.name,
    priceFormatted,
    isGeneric: matchedProduct.isGeneric,
    activeIngredient: matchedProduct.activeIngredient,
    stockAtCurrentStoreDowntown: stockAtCurrentStore,
    hasStockLocally: stockAtCurrentStore > 0,
    otherAvailableBranches: otherBranchesWithStock,
    summary,
  };
}
