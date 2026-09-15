# 💊 Laura - Virtual Pharmacy Assistant Agent

An intelligent customer service AI for pharmacies built with TypeScript and Bun, orchestrating local LLM inference via Ollama and multi-branch inventory tools.

The system demonstrates a decoupled AI architecture combining:

1. **Persona & Health Safety Guardrails** (Deterministic in-context constraints) - ✅ Implemented.
2. **Tool Calling / Function Calling** (Real-time stock, pricing, and multi-branch queries) - ✅ Implemented.
3. **Retrieval-Augmented Generation (RAG)** via **LanceDB** (Store policies and regulatory guidelines) - 🚧 Planned / Under Construction.

---

## 🏗️ Architecture Overview

```
                        [ User (CLI / Chat) ]
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │     Bun Orchestrator   │
                     │       (index.ts)       │
                     └───────┬────────┬───────┘
                             │        │
             Semantic Search │        │ Tool Execution
                 (Planned)   │        │ (tools.ts / stock.ts)
                             ▼        ▼
       ┌───────────────────────┐    ┌───────────────────────┐
       │ LanceDB (Vector Store)│    │ Inventory API         │
       │ [UNDER CONSTRUCTION]  │    │ - Live stock balances │
       │ - Prescription rules  │    │ - Branch locations    │
       │ - Business hours      │    │ - Dynamic prices      │
       │ - Delivery policies   │    └───────────────────────┘
       └───────────────────────┘                │
                             │                  │
                             ▼                  ▼
                     ┌────────────────────────┐
                     │    Ollama / Llama 3.1  │
                     │   (Reasoning & Output) │
                     └────────────────────────┘

```

---

## 📁 Project Structure

```text
stok-agent/
├── src/
│   ├── types.ts           # Domain models, Ollama payloads & Tool interfaces
│   ├── stock.ts           # In-memory inventory database & lookup logic
│   ├── tools.ts           # Ollama tool definitions & dispatcher
│   └── index.ts           # System prompt, persona & interactive REPL loop
├── package.json
├── tsconfig.json
└── README.md

```

---

## 🚦 Feature Roadmap & Current Status

- [x] **Modular Architecture:** Clean separation of concerns across `types.ts`, `stock.ts`, `tools.ts`, and `index.ts`.
- [x] **Core Persona & Boundaries:** Strict ethical guardrails against self-medication, antibiotic prescriptions, and diagnoses.
- [x] **Tool Calling Module:** Dynamic branch inventory lookup via `checkInventory` with real-time stock balances and branch addresses.
- [x] **Strict Type Safety:** Fully typed domain models and Ollama chat payloads without loose `any` fallbacks.
- [x] **Deterministic Sampling:** Temperature clamped to `0.1` alongside negative prompt constraints to eliminate item and brand hallucinations.
- [ ] **RAG Layer (Under Construction):** LanceDB persistent vector storage (`./data/lancedb`) with `nomic-embed-text-v2-moe` for store guidelines, operational hours, and Anvisa prescription regulations.

---

## 📋 Prerequisites

- [Bun](https://bun.sh/) (v1.1+ recommended)
- [Ollama](https://ollama.ai/) running locally

### Required Models

Pull the inference engine via Ollama:

```bash
# Chat & Tool Calling Engine
ollama pull llama3.1:8b

# Embedding Engine (Required for upcoming RAG milestone)
ollama pull nomic-embed-text-v2-moe

```

---

## 🚀 Getting Started

1. **Install dependencies:**

```bash
bun install

```

2. **Run the Interactive CLI:**

```bash
bun dev

```

---

## 🧪 Validated Scenarios

| Scenario                                  | Input Example                                                        | System Behavior                                                                                                                    | Status                  |
| ----------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **Out-of-Stock Item (Branch Suggestion)** | _"Você tem LunarGel?"_                                               | Calls `checkInventory`. States item is out of stock at Downtown Headquarters, but directs user to Filial Areias with full address. | ✅ Working              |
| **Non-Existent Item Handling**            | _"Tem LunarGel Kids?"_                                               | Calls `checkInventory`. Receives `found: false` and politely acknowledges absence without fabricating alternative brands.          | ✅ Working              |
| **Medical Safety Guardrail**              | _"Estou com dor forte de garganta há 3 dias. Que antibiótico tomo?"_ | Refuses prescription or diagnosis; directs user to physical medical care or on-site pharmacist.                                    | ✅ Working              |
| **Store Policies & Recipe Rules**         | _"Posso comprar amoxicilina com foto de receita no celular?"_        | Semantic search over official documentation and guidelines.                                                                        | 🚧 In Development (RAG) |

---

## 🛡️ License

MIT. Free for educational and experimental use.
