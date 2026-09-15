import { checkInventory } from "./stock";
import { TOOLS } from "./tools";
import type { ChatMessage, OllamaChatResponse } from "./types";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3.1:8b";

const SYSTEM_PROMPT = `You are Laura, a virtual attendant at Farmácia Saúde & Vida (Downtown Headquarters).
Your goal is to assist customers with over-the-counter questions, cosmetics, hygiene, and store policies.

LANGUAGE CONSTRAINT:
- ALWAYS respond in Brazilian Portuguese (pt-BR). Maintain a warm, polite, and helpful tone.

HEALTH & SAFETY GUIDELINES:
- NEVER diagnose illnesses, suggest antibiotics, or recommend prescription-only medications.
- For severe pain or persistent symptoms, guide the customer to seek medical care or speak in person with our on-site pharmacist.
- Keep responses concise (maximum 2 to 3 short sentences).

INVENTORY GUIDELINES:
- When the user asks about product existence, pricing, or stock, ALWAYS call the 'checkInventory' tool.
- NEVER invent brands, substitute items, or mock stock. Rely strictly on data with 'found: true'.
- If 'checkInventory' returns 'found: false', politely and warmly inform the customer that the item is currently unavailable in the catalog, and kindly offer to check another product.
- If an item is out of stock at Downtown Headquarters, notify the user which branch has stock and provide its exact full address.`;

const conversationHistory: ChatMessage[] = [
  { role: "system", content: SYSTEM_PROMPT },
];

async function callOllama(messages: ChatMessage[]): Promise<ChatMessage> {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: TOOLS,
      stream: false,
      options: { temperature: 0.1 },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as OllamaChatResponse;
  return payload.message;
}

async function handleUserMessage(userInput: string): Promise<string> {
  conversationHistory.push({ role: "user", content: userInput });

  let currentMessage = await callOllama(conversationHistory);

  if (currentMessage.tool_calls && currentMessage.tool_calls.length > 0) {
    conversationHistory.push(currentMessage);

    for (const toolCall of currentMessage.tool_calls) {
      if (toolCall.function.name === "checkInventory") {
        const query = toolCall.function.arguments.productName;
        console.log(`\n [API] Executing checkInventory("${query ?? ""}")...`);

        const result = checkInventory(query);

        conversationHistory.push({
          role: "tool",
          content: JSON.stringify(result),
        });
      }
    }

    currentMessage = await callOllama(conversationHistory);
  }

  conversationHistory.push(currentMessage);
  return (
    currentMessage.content ?? "Desculpe, tive um problema ao gerar a resposta."
  );
}

console.log("=== Farmácia Saúde & Vida - Customer Service CLI ===");
console.log("(Type 'exit' or 'sair' to quit)\n");

while (true) {
  const input = prompt("Você: ");
  if (!input || ["sair", "exit"].includes(input.trim().toLowerCase())) {
    console.log("\nLaura: Até logo! Cuide-se bem.");
    break;
  }

  try {
    const reply = await handleUserMessage(input);
    console.log(`\nLaura: ${reply}\n`);
  } catch (error) {
    console.error("Interaction failed:", error);
    break;
  }
}
