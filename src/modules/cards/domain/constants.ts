// Valores canónicos compartidos por DB, oráculo y contratos.
// Bounded Context: Cards (Domain Layer)

export const BASE_ELEMENTS = ["FIRE", "WATER", "EARTH", "AIR"] as const;
export const HYBRID_ELEMENTS = ["STEAM", "MAGMA", "LIGHTNING", "NATURE", "ICE", "SAND"] as const;
export const CARD_ELEMENTS = [...BASE_ELEMENTS, ...HYBRID_ELEMENTS, "AETHER"] as const;

export const CARD_RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"] as const;

export const FORGE_STATUSES = ["PENDING", "CONFIRMED", "FAILED", "EXPIRED"] as const;

export type BaseElement = (typeof BASE_ELEMENTS)[number];
export type HybridElement = (typeof HYBRID_ELEMENTS)[number];
export type CardElement = (typeof CARD_ELEMENTS)[number];
export type CardRarity = (typeof CARD_RARITIES)[number];
export type ForgeStatus = (typeof FORGE_STATUSES)[number];

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
