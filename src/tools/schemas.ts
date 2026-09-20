export const TOOLS = [
  {
    type: "function",
    function: {
      name: "checkInventory",
      description:
        "Lookup product catalog, pricing, and available physical stock units. Use para consultar catálogo, preços e unidades físicas disponíveis. NUNCA execute buscas repetidas se o estoque já foi retornado nos turnos anteriores da conversa. Call this ONLY when the user asks for a concrete medicine name or active ingredient.",
      parameters: {
        type: "object",
        properties: {
          productName: {
            type: "string",
            description:
              "The concrete medication or active ingredient name to look up (e.g., 'Dipirona', 'SolarMax', 'LunarGel'). Pass ONLY concrete medication or active ingredient names. NEVER pass loose attribute, class, or category words (such as 'genérico', 'remédio', 'comprimido', 'pomada'). If the user asks a follow-up question with pronouns or attributes (e.g., 'tem genérico dele?', 'quanto custa ele?'), resolve the coreference keeping the specific medicine name cited previously in the conversation.",
          },
        },
        required: ["productName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getPharmacyPolicies",
      description:
        "Consulta EXCLUSIVAMENTE políticas institucionais: regras de retenção de receita médica, tele-entrega, convênios/PBM e trocas de medicamentos da Anvisa. NUNCA use esta ferramenta para consultar endereços, filiais, estoques ou horários de funcionamento.",
      parameters: {
        type: "object",
        properties: {
          searchQuery: {
            type: "string",
            description:
              "The specific policy topic to search (e.g., 'prescription digital signature', 'delivery time', 'return policy').",
          },
        },
        required: ["searchQuery"],
      },
    },
  },
] as const;
