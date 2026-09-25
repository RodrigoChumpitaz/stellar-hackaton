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

export function isStatLineValid(
  rarity: CardRarity,
  atk: number,
  def: number,
  prestigeLevel: number = 0
): boolean {
  const inRange = (n: number) => Number.isInteger(n) && n >= STAT_RANGE.min;
  const budget = STAT_BUDGET[rarity];
  const maxAllowed = budget.max + Math.max(0, prestigeLevel) * 2;
  return inRange(atk) && inRange(def) && atk + def >= budget.min && atk + def <= maxAllowed;
}

/**
 * Progresión matemática con rendimientos decrecientes (diminishing returns) sin hard caps arbitrarios.
 * Permite que fusiones continuas de cartas legendarias sigan progresando de manera balanceada.
 * - Por debajo de 15: Progresión directa (+bonus).
 * - A partir de 15: Escala cuadrática suave (cada nuevo punto requiere mayor potencia de origen).
 */
export function calculateProgressiveStat(
  statA: number,
  statB: number,
  bonus: number = 1
): number {
  const rawBase = Math.max(statA, statB) + bonus;
  if (rawBase <= 15) {
    return rawBase;
  }
  const excess = rawBase - 15;
  const diminishingGain = Math.floor(Math.sqrt(excess * 2));
  return 15 + Math.max(1, diminishingGain);
}

/**
 * Calcula el Power Score para control matemático de balance competitivo (Anti-Rotas).
 * Fórmula canónica: (ATK * 1.0) + (DEF * 1.0) + (SPD * 0.5) + (Prestige * 2.0)
 */
export function calculatePowerScore(
  atk: number,
  def: number,
  speed: number = 5,
  prestigeLevel: number = 0
): number {
  return Number(
    (atk * 1.0 + def * 1.0 + speed * 0.5 + prestigeLevel * 2.0).toFixed(1)
  );
}

/**
 * Normaliza y acota los atributos para evitar que el Oráculo IA o errores de red
 * generen cartas con estadísticas fuera de la curva oficial (Guardrail determinista).
 */
export function clampStatsToBudget(
  atk: number,
  def: number,
  rarity: CardRarity,
  prestigeLevel: number = 0
): { atk: number; def: number } {
  const budget = STAT_BUDGET[rarity];
  const maxBudget = budget.max + Math.max(0, prestigeLevel) * 2;

  let safeAtk = Math.max(STAT_RANGE.min, Math.round(atk));
  let safeDef = Math.max(STAT_RANGE.min, Math.round(def));

  const total = safeAtk + safeDef;
  if (total > maxBudget) {
    const ratioA = safeAtk / total;
    safeAtk = Math.max(STAT_RANGE.min, Math.floor(maxBudget * ratioA));
    safeDef = Math.max(STAT_RANGE.min, maxBudget - safeAtk);

    while (safeAtk + safeDef > maxBudget && (safeAtk > STAT_RANGE.min || safeDef > STAT_RANGE.min)) {
      if (safeAtk >= safeDef && safeAtk > STAT_RANGE.min) safeAtk--;
      else if (safeDef > STAT_RANGE.min) safeDef--;
      else break;
    }
  } else if (total < budget.min) {
    safeAtk += budget.min - total;
  }

  return { atk: safeAtk, def: safeDef };
}


