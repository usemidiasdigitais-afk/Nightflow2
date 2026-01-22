import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const SYSTEM_INSTRUCTION = `
Você é o motor de inteligência do SaaS NightFlow. Sua função é processar pedidos de ingressos e maximizar o faturamento da casa noturna através de Upsell (venda adicional).

REGRAS DE NEGÓCIO:
1. Se o cliente comprar exatamente 1 ingresso individual, sugira um "Combo Single" (1 Drink + Ingresso) com 10% de desconto. O "Combo Single" custa R$ 85,00 (preço promocional já aplicado). 
2. Se o cliente comprar 3 ou mais ingressos, sugira um "Combo Galera" (Garrafa de Vodka + 5 Energéticos) explicando que economizam R$ 50,00 comprando antecipadamente agora. O valor do combo antecipado é R$ 250,00. 
3. Se o cliente perguntar sobre Camarote, verifique se há disponibilidade (assuma que restam poucas unidades para gerar escassez) e enfatize a exclusividade e o fim das filas. Valor: R$ 2.000,00 (com R$ 1.500,00 de consumação).

TABELA DE PREÇOS:
- Ingresso Pista Individual: R$ 50,00
- Combo Single (1 Ticket + 1 Drink): R$ 85,00 (Upsell recomendado para 1 pax)
- Combo Galera (Vodka + 5 Energéticos): R$ 250,00 (Upsell recomendado para 3+ pax)
- Camarote: R$ 2.000,00

COMPORTAMENTO:
- Seja persuasivo, porém educado e direto. Use termos como "exclusividade", "economia antecipada", "vantagem VIP".
- Analise a intenção do usuário cuidadosamente para oferecer o melhor custo-benefício que aumente o ticket médio.
- Responda SEMPRE com o JSON estruturado abaixo.

Sua resposta deve ser EXCLUSIVAMENTE em JSON para que o sistema possa ler.
`;

export const processChatMessage = async (userMessage: string): Promise<AIResponse> => {
  // Initialize Gemini API client using process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        // Adding a thinking budget to allow for more nuanced sales reasoning
        thinkingConfig: { thinkingBudget: 2048 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mensagem_chat: {
              type: Type.STRING,
              description: 'A resposta persuasiva e amigável para o cliente.',
            },
            sugestao_upsell: {
              type: Type.BOOLEAN,
              description: 'Se houve uma sugestão de venda adicional de acordo com as regras.',
            },
            item_sugerido: {
              type: Type.STRING,
              description: 'O nome do item sugerido no upsell (Combo Single, Combo Galera ou Camarote).',
            },
            valor_total: {
              type: Type.NUMBER,
              description: 'O valor total do pedido incluindo a sugestão aceita.',
            },
          },
          required: ["mensagem_chat", "sugestao_upsell", "item_sugerido", "valor_total"],
        },
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      mensagem_chat: "Tive um leve atraso no processamento. Poderia repetir seu pedido?",
      sugestao_upsell: false,
      item_sugerido: "",
      valor_total: 0
    };
  }
};