export interface BranchInventory {
  branch: string;
  stock: number;
  address: string;
}

export interface AvailableBranch {
  branchName: string;
  availableStock: number;
  address: string;
}

export interface InventoryProduct {
  sku: string;
  name: string;
  price: number;
  activeIngredient?: string; // ex: "dipirona monoidratada"
  isGeneric: boolean; // true se for genérico, false se marca/referência
  category:
  "dermocosmetico" | "fitoterapico" | "solar" | "analgesico" | "outro";
  requiresPrescription: boolean;
  tags: string[]; // sintomas, apelidos, termos populares
  branches: BranchInventory[];
}

export interface InventoryLookupSuccess {
  found: true;
  product: string;
  priceFormatted: string;
  isGeneric: boolean;
  activeIngredient?: string;
  stockAtCurrentStoreDowntown: number;
  hasStockLocally: boolean;
  otherAvailableBranches: AvailableBranch[];
  summary: string;
}

export interface InventoryLookupFailure {
  found: false;
  message: string;
}

export type InventoryLookupResult =
  InventoryLookupSuccess | InventoryLookupFailure;


// Se já não estiverem declarados no types.ts:
export interface ToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown> | string;
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_calls?: ToolCall[];
}

export interface OllamaChatResponse {
  model?: string;
  created_at?: string;
  message: ChatMessage;
  done?: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}