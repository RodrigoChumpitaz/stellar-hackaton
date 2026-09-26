/**
 * Mapeo numérico canónico de Elementos y Rarezas coordinado con el contrato Rust Soroban.
 * contracts/forge_contract/src/lib.rs (Starter templates & Element/Rarity definitions).
 */

export const ELEMENT_TO_NUM: Readonly<Record<string, number>> = {
  FIRE: 1,
  WATER: 2,
  EARTH: 3,
  AIR: 4,
  STEAM: 5,
  MAGMA: 6,
  LIGHTNING: 7,
  NATURE: 8,
  ICE: 9,
  SAND: 10,
  AETHER: 11,
};

export const RARITY_TO_NUM: Readonly<Record<string, number>> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
};
