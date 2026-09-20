export const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
export const OLLAMA_URL = `${OLLAMA_HOST}/api/chat`;
export const OLLAMA_EMBEDDINGS_URL = `${OLLAMA_HOST}/api/embeddings`;

export const CHAT_MODEL = "llama3.1:8b";
export const EMBEDDING_MODEL = "nomic-embed-text-v2-moe";

export const TEMPERATURES = {
  CHAT: 0.1,
  ROUTER: 0,
} as const;

export const DB_PATH = "./.lancedb_data";
export const DB_TABLE_NAME = "pharmacy_knowledge";
