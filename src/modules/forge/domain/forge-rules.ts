import {
  BASE_ELEMENTS,
  CARD_RARITIES,
  STAT_BUDGET,
  STAT_RANGE,
  type BaseElement,
  type CardElement,
  type CardRarity,
  type HybridElement,
} from "@/modules/cards/domain/constants";

// Reglas deterministas de forja. Gemini NO decide elemento ni rareza:
// se calculan aquí para que el oráculo y el contrato lleguen al mismo resultado.

const HYBRID_TABLE: Readonly<Record<string, HybridElement>> = {
  "FIRE+WATER": "STEAM",
  "EARTH+FIRE": "MAGMA",
  "AIR+FIRE": "LIGHTNING",
  "EARTH+WATER": "NATURE",
  "AIR+WATER": "ICE",
  "AIR+EARTH": "SAND",
};

function isBaseElement(e: CardElement): e is BaseElement {
  return (BASE_ELEMENTS as readonly string[]).includes(e);
}

export function forgeElement(a: CardElement, b: CardElement): CardElement {
  if (a === b) return a;
  if (!isBaseElement(a) || !isBaseElement(b)) return "AETHER";
  return HYBRID_TABLE[[a, b].sort().join("+")];
}

export function forgeRarity(a: CardRarity, b: CardRarity): CardRarity {
  const top = Math.max(CARD_RARITIES.indexOf(a), CARD_RARITIES.indexOf(b));
  return CARD_RARITIES[Math.min(top + 1, CARD_RARITIES.length - 1)];
}

export function isStatLineValid(rarity: CardRarity, atk: number, def: number): boolean {
  const inRange = (n: number) => Number.isInteger(n) && n >= STAT_RANGE.min && n <= STAT_RANGE.max;
  const { min, max } = STAT_BUDGET[rarity];
  return inRange(atk) && inRange(def) && atk + def >= min && atk + def <= max;
}
