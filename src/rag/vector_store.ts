import * as lancedb from "@lancedb/lancedb";
import { startActiveObservation } from "@langfuse/tracing";
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
  return await startActiveObservation(
    "retrieve-pharmacy-policies",
    async (span) => {
      span.update({
        input: { queryText, limit },
      });

      const db = await lancedb.connect(DB_PATH);
      const table = await db.openTable(DB_TABLE_NAME);

      const queryVector = await getEmbedding(queryText, true);
      const results = await table.vectorSearch(queryVector).limit(limit).toArray();

      if (!results.length) {
        const noResult = "No institutional guidelines found for this query.";
        span.update({
          output: { resultsCount: 0, text: noResult },
        });
        return noResult;
      }

      const formatted = results.map((r: any) => `[Topic: ${r.topic}]: ${r.text}`).join("\n\n");
      span.update({
        output: {
          resultsCount: results.length,
          matches: results.map((r: any) => ({ topic: r.topic, text: r.text })),
          formattedText: formatted,
        },
      });

      return formatted;
    },
    { asType: "retriever" },
  );
}

