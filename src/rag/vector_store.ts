import * as lancedb from "@lancedb/lancedb";
import knowledgeData from "../../data/knowledge.json";
import { DB_PATH, DB_TABLE_NAME, EMBEDDING_MODEL } from "../config/constants";
import { getEmbedding } from "./embeddings";

export async function initKnowledgeBase() {
  const db = await lancedb.connect(DB_PATH);
  const tableNames = await db.tableNames();

  if (tableNames.includes(DB_TABLE_NAME)) {
    return await db.openTable(DB_TABLE_NAME);
  }

  console.log(
    `⚡ Indexing knowledge base into LanceDB using ${EMBEDDING_MODEL}...`,
  );
  const recordsWithVectors = await Promise.all(
    knowledgeData.map(async (doc) => {
      const vector = await getEmbedding(doc.text, false);
      return {
        id: doc.id,
        topic: doc.topic,
        text: doc.text,
        vector,
      };
    }),
  );

  return await db.createTable(DB_TABLE_NAME, recordsWithVectors);
}

export async function searchKnowledge(
  queryText: string,
  limit = 2,
): Promise<string> {
  const db = await lancedb.connect(DB_PATH);
  const table = await db.openTable(DB_TABLE_NAME);

  const queryVector = await getEmbedding(queryText, true);
  const results = await table.vectorSearch(queryVector).limit(limit).toArray();

  if (!results.length) {
    return "No institutional guidelines found for this query.";
  }

  return results.map((r: any) => `[Topic: ${r.topic}]: ${r.text}`).join("\n\n");
}
