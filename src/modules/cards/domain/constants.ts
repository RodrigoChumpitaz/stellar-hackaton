// Valores canónicos compartidos por DB, oráculo y contratos.
// Bounded Context: Cards (Domain Layer)

export const BASE_ELEMENTS = ["FIRE", "WATER", "EARTH", "AIR"] as const;
export const HYBRID_ELEMENTS = [
  "STEAM",
  "MAGMA",
  "LIGHTNING",
  "NATURE",
  "ICE",
  "SAND",
  "STONK",
  "OBSIDIAN",
  "LIVING_STONE",
  "INFERNO",
  "PLASMA",
  "TSUNAMI",
  "GLACIER",
  "TEMPEST",
  "CYCLONE",
] as const;

export const COSMIC_ELEMENTS = [
  "AETHER",
  "CELESTIAL",
  "VOID",
  "CHRONOS",
  "COSMOS",
] as const;

export const CARD_ELEMENTS = [
  ...BASE_ELEMENTS,
  ...HYBRID_ELEMENTS,
  ...COSMIC_ELEMENTS,
] as const;

export const CARD_RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"] as const;

// Sistema canónico de 30 Rangos Alfanuméricos (F- hasta L+)
export const CARD_TIERS = [
  "F-", "F", "F+",
  "E-", "E", "E+",
  "D-", "D", "D+",
  "C-", "C", "C+",
  "B-", "B", "B+",
  "A-", "A", "A+",
  "S-", "S", "S+",
  "SS-", "SS", "SS+",
  "SSS-", "SSS", "SSS+",
  "L-", "L", "L+",
] as const;

export const FORGE_STATUSES = ["PENDING", "CONFIRMED", "FAILED", "EXPIRED"] as const;

export type BaseElement = (typeof BASE_ELEMENTS)[number];
export type HybridElement = (typeof HYBRID_ELEMENTS)[number];
export type CosmicElement = (typeof COSMIC_ELEMENTS)[number];
export type CardElement = (typeof CARD_ELEMENTS)[number];
export type CardRarity = (typeof CARD_RARITIES)[number];
export type CardTier = (typeof CARD_TIERS)[number];
export type ForgeStatus = (typeof FORGE_STATUSES)[number];

// Probabilidad base de éxito al fusionar cartas del MISMO rango
export const TIER_BASE_SUCCESS_RATES: Readonly<Record<CardTier, number>> = {
  "F-": 0.60001,
  "F": 0.55001,
  "F+": 0.50001,
  "E-": 0.47001,
  "E": 0.44001,
  "E+": 0.41001,
  "D-": 0.38001,
  "D": 0.35001,
  "D+": 0.32001,
  "C-": 0.29001,
  "C": 0.26001,
  "C+": 0.23001,
  "B-": 0.20001,
  "B": 0.18001,
  "B+": 0.16001,
  "A-": 0.14001,
  "A": 0.12001,
  "A+": 0.10001,
  "S-": 0.09001,
  "S": 0.08001,
  "S+": 0.07001,
  "SS-": 0.06001,
  "SS": 0.05001,
  "SS+": 0.04001,
  "SSS-": 0.03001,
  "SSS": 0.02001,
  "SSS+": 0.01001,
  "L-": 0.00101,
  "L": 0.00011,
  "L+": 0.00001,
};

// Probabilidad base de otorgar habilidad a partir de rango E
export const TIER_SKILL_PROBABILITIES: Readonly<Record<CardTier, number>> = {
  "F-": 0,
  "F": 0,
  "F+": 0,
  "E-": 0,
  "E": 0.059,
  "E+": 0.059,
  "D-": 0.069,
  "D": 0.069,
  "D+": 0.079,
  "C-": 0.079,
  "C": 0.089,
  "C+": 0.089,
  "B-": 0.099,
  "B": 0.099,
  "B+": 0.149,
  "A-": 0.199,
  "A": 0.249,
  "A+": 0.299,
  "S-": 0.349,
  "S": 0.399,
  "S+": 0.449,
  "SS-": 0.499,
  "SS": 0.549,
  "SS+": 0.599,
  "SSS-": 0.649,
  "SSS": 0.699,
  "SSS+": 0.749,
  "L-": 0.799,
  "L": 0.849,
  "L+": 0.899,
};

/** Presupuesto total ATK + DEF permitido por rareza (inclusive). */
export const STAT_BUDGET: Readonly<Record<CardRarity, { min: number; max: number }>> = {
  COMMON: { min: 6, max: 7 },
  UNCOMMON: { min: 8, max: 10 },
  RARE: { min: 11, max: 13 },
  EPIC: { min: 14, max: 16 },
  LEGENDARY: { min: 17, max: 20 },
};

/** Rango permitido para cada stat individual. */
export const STAT_RANGE = { min: 1, max: 15 } as const;

/** Arte fijo por elemento (public/cards/*.svg). */
export const ELEMENT_IMAGE: Readonly<Record<CardElement, string>> = Object.fromEntries(
  CARD_ELEMENTS.map((e) => [e, `/cards/${e.toLowerCase()}.svg`]),
) as Record<CardElement, string>;

/** Cartas que acuña `claim_starter`: 2 por elemento base. */
export const STARTER_COPIES_PER_ELEMENT = 2;
