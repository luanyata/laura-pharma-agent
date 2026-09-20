import type { InventoryProduct } from "./types";

export const ESTOQUE_LOJAS: InventoryProduct[] = [
  {
    sku: "MED-001",
    name: "Dipirona Monoidratada 500mg (Genérico Medley)",
    price: 8.9,
    activeIngredient: "dipirona monoidratada",
    isGeneric: true,
    category: "analgesico",
    requiresPrescription: false,
    tags: [
      "dipirona",
      "novalgina",
      "dor",
      "febre",
      "dor de cabeca",
      "antitermico",
      "analgesico",
      "comprimido",
    ],
    branches: [
      {
        branch: "Matriz (Centro)",
        stock: 15,
        address: "Rua das Flores, 120 - Centro",
      },
      {
        branch: "Filial Areias",
        stock: 8,
        address: "Av. das Torres, 450 - Areias",
      },
    ],
  },
  {
    sku: "FIC-001",
    name: "Pomada Cicatrizante LunarGel 50g",
    price: 45.5,
    activeIngredient: "extrato regenerador botânico",
    isGeneric: false,
    category: "dermocosmetico",
    requiresPrescription: false,
    tags: [
      "lunargel",
      "pomada",
      "cicatrizante",
      "queimadura",
      "regenerador",
      "pele",
      "ferimento",
    ],
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
    activeIngredient: "passiflora e camomila concentrada",
    isGeneric: false,
    category: "fitoterapico",
    requiresPrescription: false,
    tags: [
      "zenz",
      "calmante",
      "estresse",
      "ansiedade",
      "dormir",
      "sono",
      "natural",
      "insonia",
    ],
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
    activeIngredient: "filtros uva/uvb fotoestaveis",
    isGeneric: false,
    category: "solar",
    requiresPrescription: false,
    tags: [
      "solarmax",
      "protetor solar",
      "bloqueador",
      "fps 90",
      "praia",
      "sol",
      "pele oleosa",
    ],
    branches: [
      {
        branch: "Matriz (Centro)",
        stock: 6,
        address: "Rua das Flores, 120 - Centro",
      },
    ],
  },
];

export const INVENTORY_STORE = ESTOQUE_LOJAS;
