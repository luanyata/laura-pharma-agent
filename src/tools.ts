export const TOOLS = [
  {
    type: "function",
    function: {
      name: "checkInventory",
      description:
        "Lookup product availability, current pricing, and branch store locations.",
      parameters: {
        type: "object",
        properties: {
          productName: {
            type: "string",
            description:
              "Product name or search keyword (e.g., LunarGel, ZenZ, SolarMax).",
          },
        },
        required: ["productName"],
      },
    },
  },
] as const;
