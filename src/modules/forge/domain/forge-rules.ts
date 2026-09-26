import {
  BASE_ELEMENTS,
  CARD_RARITIES,
  CARD_TIERS,
  TIER_BASE_SUCCESS_RATES,
  TIER_SKILL_PROBABILITIES,
  STAT_BUDGET,
  STAT_RANGE,
  type BaseElement,
  type CardElement,
  type CardRarity,
  type CardTier,
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

/**
 * Síntesis Alquímica extendida:
 * - Cartas de rango L (Divinas) canalizan elementos cósmicos primordiales.
 * - Mismo elemento puede mutar a formas evolucionadas (Tierra + Tierra -> Stonk/Obsidiana/etc).
 */
export function synthesizeAlchemicalElement(
  a: CardElement,
  b: CardElement,
  tier?: CardTier
): CardElement {
  // Rango L (Divinas / Celestiales)
  if (tier && (tier === "L-" || tier === "L" || tier === "L+")) {
    const divineElements: CardElement[] = ["AETHER", "CELESTIAL", "VOID", "CHRONOS", "COSMOS"];
    const hash = (a.length + b.length + tier.length) % divineElements.length;
    return divineElements[hash];
  }

  // Fusión del mismo elemento con evolución alquímica
  if (a === b) {
    if (a === "EARTH") return "STONK";
    if (a === "FIRE") return "INFERNO";
    if (a === "WATER") return "TSUNAMI";
    if (a === "AIR") return "TEMPEST";
    return a;
  }

  return forgeElement(a, b);
}

export function forgeRarity(a: CardRarity, b: CardRarity): CardRarity {
  const top = Math.max(CARD_RARITIES.indexOf(a), CARD_RARITIES.indexOf(b));
  return CARD_RARITIES[Math.min(top + 1, CARD_RARITIES.length - 1)];
}

/** Obtiene el índice numérico (0 a 29) de un CardTier. */
export function getTierIndex(tier: CardTier): number {
  const idx = CARD_TIERS.indexOf(tier);
  return idx >= 0 ? idx : 0;
}

/** Obtiene el CardTier correspondiente a un índice (acotado a 0..29). */
export function getTierFromIndex(idx: number): CardTier {
  const clamped = Math.max(0, Math.min(CARD_TIERS.length - 1, idx));
  return CARD_TIERS[clamped];
}

/** Mapeo bidireccional entre rareza clásica y familia de tiers */
export function rarityToTier(rarity: CardRarity): CardTier {
  switch (rarity) {
    case "COMMON":
      return "F";
    case "UNCOMMON":
      return "D";
    case "RARE":
      return "B";
    case "EPIC":
      return "S";
    case "LEGENDARY":
      return "SSS";
    default:
      return "F";
  }
}

export function tierToRarity(tier: CardTier): CardRarity {
  const idx = getTierIndex(tier);
  if (idx <= 2) return "COMMON";        // F-, F, F+
  if (idx <= 8) return "UNCOMMON";      // E-, E, E+, D-, D, D+
  if (idx <= 14) return "RARE";         // C-, C, C+, B-, B, B+
  if (idx <= 20) return "EPIC";         // A-, A, A+, S-, S, S+
  return "LEGENDARY";                   // SS-, SS, SS+, SSS-, SSS, SSS+, L-, L, L+
}

/**
 * Calcula la tasa de éxito al fusionar dos rangos.
 * - Mismo rango: Probabilidad exacta según tabla oficial (ej. F- = 60.001%, L+ = 0.001%).
 * - Rangos diferentes: La probabilidad disminuye proporcionalmente a la brecha (gap).
 */
export function calculateTierSuccessRate(
  tierA: CardTier,
  tierB: CardTier
): {
  successRate: number;
  gap: number;
  maxTier: CardTier;
  minTier: CardTier;
  baseRate: number;
} {
  const idxA = getTierIndex(tierA);
  const idxB = getTierIndex(tierB);
  const maxIdx = Math.max(idxA, idxB);
  const minIdx = Math.min(idxA, idxB);
  const gap = maxIdx - minIdx;

  const maxTier = CARD_TIERS[maxIdx];
  const minTier = CARD_TIERS[minIdx];
  const baseRate = TIER_BASE_SUCCESS_RATES[maxTier];

  if (gap === 0) {
    return { successRate: baseRate, gap: 0, maxTier, minTier, baseRate };
  }

  // Penalización por diferencia de rangos: 5% menos por cada nivel de diferencia
  const penaltyFactor = Math.min(0.85, gap * 0.05);
  const successRate = Math.max(0.00001, baseRate * (1 - penaltyFactor));

  return { successRate, gap, maxTier, minTier, baseRate };
}

/**
 * Resuelve el desenlace determinista o probabilístico del rango resultante:
 * - Éxito: Asciende al rango superior del máximo usado.
 * - Fracaso con gap: Puede degradar a un rango menor que el máximo utilizado.
 */
export function calculateTierOutcome(
  tierA: CardTier,
  tierB: CardTier,
  roll: number = Math.random()
): {
  resultingTier: CardTier;
  isSuccess: boolean;
  successRate: number;
  gap: number;
} {
  const { successRate, gap, maxTier } = calculateTierSuccessRate(tierA, tierB);
  const maxIdx = getTierIndex(maxTier);
  const isSuccess = roll < successRate;

  if (isSuccess) {
    // Éxito: sube un rango (tope en L+)
    const nextIdx = Math.min(CARD_TIERS.length - 1, maxIdx + 1);
    return {
      resultingTier: CARD_TIERS[nextIdx],
      isSuccess: true,
      successRate,
      gap,
    };
  }

  // Fracaso:
  if (gap === 0) {
    // Si eran del mismo rango, conserva el rango actual o desciende levemente
    return {
      resultingTier: maxTier,
      isSuccess: false,
      successRate,
      gap,
    };
  }

  // Si había diferencia de rangos, la degradación puede resultar en un rango menor que el máximo
  const degradationSteps = Math.max(1, Math.floor(gap / 2));
  const degradedIdx = Math.max(0, maxIdx - degradationSteps);
  return {
    resultingTier: CARD_TIERS[degradedIdx],
    isSuccess: false,
    successRate,
    gap,
  };
}

/**
 * Sistema de Probabilidad de Habilidades a partir de Rango E.
 * Cada habilidad de las cartas de origen le otorga un +5% adicional a la nueva carta.
 */
export function calculateSkillChance(
  childTier: CardTier,
  parentSkillsCount: number = 0
): { baseChance: number; parentBonus: number; totalChance: number } {
  const baseChance = TIER_SKILL_PROBABILITIES[childTier] || 0;
  const parentBonus = Math.max(0, parentSkillsCount) * 0.05;
  const totalChance = Math.min(1.0, baseChance + parentBonus);

  return { baseChance, parentBonus, totalChance };
}

/** Biblioteca canónica de habilidades por elemento y jerarquía */
export const ELEMENT_SKILLS_LIBRARY: Readonly<Record<string, string[]>> = {
  FIRE: ["Llama Voraz", "Ignición Solar", "Aura del Fénix", "Calcinación Atómica"],
  WATER: ["Marea Serena", "Burbuja de Vacío", "Maelstrom Profundo", "Torrente Sagrado"],
  EARTH: ["Piel de Obsidiana", "Fisura Sísmica", "Coraza de Diamante", "Raíces Ancestrales"],
  AIR: ["Vuelo Céfiro", "Ráfaga Sónica", "Ojo de la Tempestad", "Vórtice Galáctico"],
  STEAM: ["Niebla Cegadora", "Presión Crítica", "Emisión Térmica"],
  VAPOR: ["Niebla Cegadora", "Presión Crítica", "Emisión Térmica"],
  MAGMA: ["Roca Fundida", "Erupción Piroclástica", "Armadura Volcánica"],
  LIGHTNING: ["Sobrecarga Eléctrica", "Rayo Primordial", "Conductividad Pura"],
  NATURE: ["Esporas Venenosas", "Floración Acelerada", "Égida Silvestre"],
  ICE: ["Cero Absoluto", "Empalamiento Glacial", "Permafrost"],
  SAND: ["Tormenta de Arena", "Foso Movedizo", "Espejismo Solar"],
  STONK: ["Defensa Implacable", "Gravedad Monolítica", "Resonancia Tectónica"],
  LIVING_STONE: ["Defensa Implacable", "Gravedad Monolítica", "Regeneración Pétrea"],
  OBSIDIAN: ["Reflejo Cortante", "Blindaje Negro", "Filo Volcánico"],
  INFERNO: ["Llamarada Eterna", "Cenizas Purificadoras", "Fuego Negro"],
  TSUNAMI: ["Oleaje Devastador", "Presión Abisal", "Furia Marina"],
  TEMPEST: ["Corte Ciclónico", "Vientos de Huracán", "Descarga Aérea"],
  AETHER: ["Génesis Cósmica", "Distorsión Temporal", "Juicio del Vacío", "Singularidad Aetérica"],
  CELESTIAL: ["Resplandor Divino", "Bendición Astral", "Corona Celestial"],
  VOID: ["Colapso Estelar", "Silencio del Vacío", "Anulación Total"],
  CHRONOS: ["Detención Temporal", "Bucle Infinito", "Paradoja de Égida"],
  COSMOS: ["Armonía Universal", "Fusión Estelar", "Luz Primordial"],
};

/**
 * Genera determinista o probabilísticamente las habilidades de la carta forjada.
 */
export function generateSkillsForCard(
  element: CardElement,
  tier: CardTier,
  parentASkills: string[] = [],
  parentBSkills: string[] = [],
  roll: number = Math.random()
): string[] {
  const allParentSkills = [...new Set([...parentASkills, ...parentBSkills])];
  const { totalChance } = calculateSkillChance(tier, allParentSkills.length);

  // Si no supera el umbral de probabilidad o la probabilidad base es 0 (Rango F), no desbloquea habilidad
  if (totalChance <= 0 || roll >= totalChance) {
    return [];
  }

  // Si los padres tenían habilidades, alta probabilidad (50%) de heredar una habilidad paterna
  if (allParentSkills.length > 0 && roll < 0.5) {
    const inherited = allParentSkills[Math.floor(roll * allParentSkills.length) % allParentSkills.length];
    return [inherited];
  }

  // Generar habilidad elemental según la biblioteca
  const skillsPool = ELEMENT_SKILLS_LIBRARY[element] || ELEMENT_SKILLS_LIBRARY.AETHER;
  const skillIdx = Math.floor(roll * skillsPool.length) % skillsPool.length;
  return [skillsPool[skillIdx]];
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


