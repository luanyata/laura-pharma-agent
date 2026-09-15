import type { InventoryLookupResult, InventoryProduct } from "./types";

const INVENTORY_STORE: InventoryProduct[] = [
  {
    sku: "FIC-001",
    name: "Pomada Cicatrizante LunarGel",
    price: 45.5,
    branches: [
      {
        branch: "Matriz (Centro)",
        stock: 0,
        address: "Rua das Flores, 120 - Centro",
      },
      {
        branch: "Filial Areias",
        stock: 4,
        address: "Av. das Torres, 450 - Areias",
      },
    ],
  },
  {
    sku: "FIC-002",
    name: "Elixir Anti-Stress ZenZ",
    price: 62.0,
    branches: [
      {
        branch: "Matriz (Centro)",
        stock: 0,
        address: "Rua das Flores, 120 - Centro",
      },
      {
        branch: "Filial Kobrasol",
        stock: 2,
        address: "Rua Lair Cruz, 88 - Kobrasol",
      },
    ],
  },
  {
    sku: "FIC-003",
    name: "Protetor Solar SolarMax FPS 90",
    price: 79.9,
    branches: [
      {
        branch: "Matriz (Centro)",
        stock: 6,
        address: "Rua das Flores, 120 - Centro",
      },
    ],
  },
];

export function checkInventory(searchTerm?: string): InventoryLookupResult {
  if (!searchTerm) {
    return { found: false, message: "Product name not provided." };
  }

  const normalizedQuery = searchTerm.toLowerCase();
  const matchedProduct = INVENTORY_STORE.find((item) =>
    item.name.toLowerCase().includes(normalizedQuery),
  );

  if (!matchedProduct) {
    return {
      found: false,
      message: `Product "${searchTerm}" not found in catalog.`,
    };
  }

  return {
    found: true,
    product: matchedProduct.name,
    price: matchedProduct.price,
    branches: matchedProduct.branches,
  };
}
