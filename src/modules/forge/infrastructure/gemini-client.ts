import { GoogleGenAI } from "@google/genai";
import type { CardElement, CardRarity } from "@/modules/cards/domain/constants";

// Elemento y rareza YA fueron decididos por forge-rules.ts antes de llegar aquí.
// Gemini solo aporta nombre, lore, habilidad pasiva y el reparto de ATK/DEF
// dentro del presupuesto de esa rareza.
const SYSTEM_PROMPT = `Eres el Oráculo Ancestral de Aether en el juego de cartas coleccionables "Stellar Runes".
Tu misión es narrar la fusión de dos cartas. El elemento y la rareza resultantes YA fueron
determinados por el sistema del juego — no los elijas tú, solo úsalos como contexto.
Tu trabajo es: generar un nombre épico (máx 3 palabras), un lore místico (máx 2 oraciones),
una habilidad pasiva breve, y repartir ATK/DEF dentro del presupuesto indicado.`;

const RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    atk: { type: "integer" },
    def: { type: "integer" },
    passive_skill: { type: "string" },
    lore: { type: "string" },
  },
  required: ["name", "atk", "def", "passive_skill", "lore"],
};

interface ParentCardLike {
  name: string;
  element: string;
  atk: number;
  def: number;
}

interface FusionContext {
  cardA: ParentCardLike;
  cardB: ParentCardLike;
  element: CardElement;
  rarity: CardRarity;
  budget: { min: number; max: number };
}

export interface FusionText {
  name: string;
  atk: number;
  def: number;
  passive_skill: string;
  lore: string;
}

/**
 * Llama a Gemini para la parte narrativa/numérica de la fusión.
 * NO decide element ni rarity — esos vienen ya calculados en ctx.
 */
export async function generateFusionText(ctx: FusionContext): Promise<FusionText> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada.");
  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  const ai = new GoogleGenAI({ apiKey });

  const userPrompt = `Carta A: ${JSON.stringify(ctx.cardA)}
Carta B: ${JSON.stringify(ctx.cardB)}
Elemento resultante (ya decidido por el sistema): ${ctx.element}
Rareza resultante (ya decidida por el sistema): ${ctx.rarity}
Presupuesto total ATK+DEF permitido: entre ${ctx.budget.min} y ${ctx.budget.max} (cada stat individual entre 1 y 15).

Genera nombre, lore, habilidad pasiva, y reparte ATK/DEF respetando el presupuesto exacto.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_JSON_SCHEMA,
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("Gemini no devolvió contenido.");
  return JSON.parse(raw) as FusionText;
}

/**
 * Fallback local si Gemini falla o tarda >2s (evita que la demo se congele).
 */
export function generateFallbackFusionText(ctx: FusionContext): FusionText {
  const total = Math.round((ctx.budget.min + ctx.budget.max) / 2);
  const atk = Math.min(15, Math.ceil(total / 2));
  const def = Math.min(15, total - atk);
  return {
    name: `${ctx.cardA.element}-${ctx.cardB.element} Hibrido`,
    atk,
    def,
    passive_skill: "Resonancia Elemental",
    lore: "Nacido en la urgencia de la fusión, este ser guarda el equilibrio entre dos mundos.",
  };
}
