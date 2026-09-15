export interface BranchInventory {
  branch: string;
  stock: number;
  address: string;
}

export interface InventoryProduct {
  sku: string;
  name: string;
  price: number;
  branches: BranchInventory[];
}

export interface InventoryLookupSuccess {
  found: true;
  product: string;
  price: number;
  branches: BranchInventory[];
}

export interface InventoryLookupFailure {
  found: false;
  message: string;
}

export type InventoryLookupResult =
  InventoryLookupSuccess | InventoryLookupFailure;

export interface ToolCallFunction {
  name: string;
  arguments: {
    productName?: string;
    [key: string]: unknown;
  };
}

export interface ToolCall {
  function: ToolCallFunction;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_calls?: ToolCall[];
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: ChatMessage;
  done: boolean;
}
