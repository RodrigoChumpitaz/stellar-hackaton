/**
 * Reglas de combate por turnos, matemáticas de daño, afinidades elementales y forja en combate.
 * Bounded Context: Arena (Domain Layer)
 */

import type { Card, CardData } from "@/modules/cards/domain/types";
import type { CardElement, CardRarity } from "@/modules/cards/domain/constants";
import { synthesizeAlchemicalElement, forgeRarity, rarityToTier } from "@/modules/forge/domain/forge-rules";

export const COMBAT_CONFIG = {
  INITIAL_HP: 50,
  MAX_ENERGY: 3,
  FORGE_MAX_ROUND: 2, // La bonificación/forja táctica solo está disponible en las 2 primeras rondas
  VICTORY_XLM_REWARD: 5.0, // Recompensa en XLM del reward pool de Stellar Testnet
  HAND_SIZE: 4,
} as const;

export const DEFAULT_ARENA_DECK: CardData[] = [
  {
    id: "starter-arena-1",
    name: "Ignis Sprite",
    element: "FIRE",
    rarity: "COMMON",
    tier: "F",
    atk: 4,
    def: 2,
    speed: 5,
    power_score: 8.5,
    description: "Una chispa inquieta nacida de las brasas del primer fuego.",
  },
  {
    id: "starter-arena-2",
    name: "Pyro Wyrm",
    element: "FIRE",
    rarity: "COMMON",
    tier: "F",
    atk: 4,
    def: 3,
    speed: 5,
    power_score: 9.5,
    description: "Sierpe ígnea nacida en magma primigenio. Furia destructiva concentrada.",
  },
  {
    id: "starter-arena-3",
    name: "Aqua Nymph",
    element: "WATER",
    rarity: "COMMON",
    tier: "F",
    atk: 2,
    def: 5,
    speed: 5,
    power_score: 9.5,
    description: "Guardiana de manantiales que se protege tras un velo de marea.",
  },
  {
    id: "starter-arena-4",
    name: "Abyssal Siren",
    element: "WATER",
    rarity: "COMMON",
    tier: "F",
    atk: 3,
    def: 4,
    speed: 5,
    power_score: 9.5,
    description: "Canto hipnótico que congela las mareas y calma el fragor bélico.",
  },
  {
    id: "starter-arena-5",
    name: "Terra Golem",
    element: "EARTH",
    rarity: "COMMON",
    tier: "F",
    atk: 3,
    def: 4,
    speed: 5,
    power_score: 9.5,
    description: "Piedra antigua que despertó con el pulso de la montaña.",
  },
  {
    id: "starter-arena-6",
    name: "Titan Core",
    element: "EARTH",
    rarity: "COMMON",
    tier: "F",
    atk: 2,
    def: 5,
    speed: 5,
    power_score: 9.5,
    description: "Núcleo tectónico inquebrantable que resiste embestidas colosales.",
  },
  {
    id: "starter-arena-7",
    name: "Zephyr Wisp",
    element: "AIR",
    rarity: "COMMON",
    tier: "F",
    atk: 5,
    def: 1,
    speed: 5,
    power_score: 8.5,
    description: "Un soplo veloz que golpea antes de que lo veas llegar.",
  },
  {
    id: "starter-arena-8",
    name: "Vortex Falcon",
    element: "AIR",
    rarity: "COMMON",
    tier: "F",
    atk: 5,
    def: 2,
    speed: 5,
    power_score: 9.5,
    description: "Cazador de tempestades aéreas con garras cargadas de estática pura.",
  },
];

export interface Combatant {
  id: string;
  name: string;
  avatar: string;
  element: CardElement;
  hp: number;
  maxHp: number;
  shield: number;
  energy: number;
  maxEnergy: number;
  isBot?: boolean;
}

export interface BotIntent {
  type: "attack" | "defend" | "special";
  value: number;
  element: CardElement;
  description: string;
  name: string;
}

export interface CombatLogEntry {
  id: string;
  round: number;
  actor: string;
  actionType: "attack" | "defend" | "forge" | "bot" | "info" | "critical";
  text: string;
  damage?: number;
  shield?: number;
}

export interface FloatingCombatText {
  id: string;
  text: string;
  color: "red" | "cyan" | "amber" | "purple" | "emerald";
  x?: number;
  y?: number;
}

/**
 * Tabla de ventajas elementales:
 * Fuego vence a Tierra/Naturaleza (+25%).
 * Agua vence a Fuego (+25%).
 * Tierra vence a Aire/Rayo (+25%).
 * Aire vence a Agua/Hielo (+25%).
 * Elementos Híbridos/Cósmicos (Plasma, Aether, Magma, etc.) tienen daño penetrante (+15%).
 */
export function calculateElementalMultiplier(
  attackElement: CardElement,
  defenseElement: CardElement
): { multiplier: number; isAdvantage: boolean; isDisadvantage: boolean; label?: string } {
  if (attackElement === defenseElement) {
    return { multiplier: 1.0, isAdvantage: false, isDisadvantage: false };
  }

  // Fuego vs otros
  if (attackElement === "FIRE" || attackElement === "INFERNO") {
    if (defenseElement === "EARTH" || defenseElement === "NATURE" || defenseElement === "LIVING_STONE") {
      return { multiplier: 1.25, isAdvantage: true, isDisadvantage: false, label: "¡Fuego incinera Tierra! (+25%)" };
    }
    if (defenseElement === "WATER" || defenseElement === "TSUNAMI" || defenseElement === "ICE" || defenseElement === "GLACIER") {
      return { multiplier: 0.8, isAdvantage: false, isDisadvantage: true, label: "Agua mitiga Fuego (-20%)" };
    }
  }

  // Agua vs otros
  if (attackElement === "WATER" || attackElement === "TSUNAMI" || attackElement === "GLACIER" || attackElement === "ICE") {
    if (defenseElement === "FIRE" || defenseElement === "INFERNO" || defenseElement === "MAGMA") {
      return { multiplier: 1.25, isAdvantage: true, isDisadvantage: false, label: "¡Agua sofoca Fuego! (+25%)" };
    }
    if (defenseElement === "EARTH" || defenseElement === "STONK") {
      return { multiplier: 0.8, isAdvantage: false, isDisadvantage: true, label: "Tierra absorbe Agua (-20%)" };
    }
  }

  // Tierra vs otros
  if (attackElement === "EARTH" || attackElement === "STONK" || attackElement === "LIVING_STONE" || attackElement === "OBSIDIAN") {
    if (defenseElement === "AIR" || defenseElement === "LIGHTNING" || defenseElement === "TEMPEST" || defenseElement === "CYCLONE") {
      return { multiplier: 1.25, isAdvantage: true, isDisadvantage: false, label: "¡Tierra descarga Rayo/Aire! (+25%)" };
    }
    if (defenseElement === "FIRE") {
      return { multiplier: 0.8, isAdvantage: false, isDisadvantage: true, label: "Fuego funde Tierra (-20%)" };
    }
  }

  // Aire vs otros
  if (attackElement === "AIR" || attackElement === "TEMPEST" || attackElement === "CYCLONE" || attackElement === "LIGHTNING") {
    if (defenseElement === "WATER" || defenseElement === "GLACIER" || defenseElement === "ICE" || defenseElement === "STEAM") {
      return { multiplier: 1.25, isAdvantage: true, isDisadvantage: false, label: "¡Aire agita el Agua! (+25%)" };
    }
    if (defenseElement === "EARTH") {
      return { multiplier: 0.8, isAdvantage: false, isDisadvantage: true, label: "Tierra resiste Aire (-20%)" };
    }
  }

  // Cósmicos e Híbridos superiores (AETHER, PLASMA, COSMOS, CHRONOS)
  const cosmicList: CardElement[] = ["AETHER", "CELESTIAL", "VOID", "CHRONOS", "COSMOS", "PLASMA", "MAGMA"];
  if (cosmicList.includes(attackElement)) {
    return { multiplier: 1.15, isAdvantage: true, isDisadvantage: false, label: "¡Energía Primordial Penetrante! (+15%)" };
  }

  return { multiplier: 1.0, isAdvantage: false, isDisadvantage: false };
}

/**
 * Calcula el impacto del daño contra el escudo y HP del defensor.
 */
export function resolveDamage(
  rawDamage: number,
  defenderShield: number,
  defenderHp: number
): { finalShield: number; finalHp: number; absorbedByShield: number; hpDamage: number } {
  let shield = defenderShield;
  let hp = defenderHp;
  let absorbedByShield = 0;
  let hpDamage = 0;

  if (shield >= rawDamage) {
    absorbedByShield = rawDamage;
    shield -= rawDamage;
  } else {
    absorbedByShield = shield;
    const remainder = rawDamage - shield;
    shield = 0;
    hpDamage = remainder;
    hp = Math.max(0, hp - remainder);
  }

  return {
    finalShield: shield,
    finalHp: hp,
    absorbedByShield,
    hpDamage,
  };
}

/**
 * Genera la próxima intención de combate del bot según su arquetipo y estado de salud.
 */
export function generateBotIntent(
  botName: string,
  botElement: CardElement,
  round: number,
  currentHp: number
): BotIntent {
  // Guardián Ignis (Ofensivo de Fuego)
  if (botName.includes("Ignis")) {
    if (round % 3 === 0) {
      return {
        type: "special",
        value: 16,
        element: "FIRE",
        name: "Llamarada Ígnea",
        description: "Prepara un golpe devastador de 16 DMG de Fuego.",
      };
    }
    if (currentHp < 20 && Math.random() > 0.5) {
      return {
        type: "defend",
        value: 12,
        element: "FIRE",
        name: "Escudo de Ceniza",
        description: "Se cubre con un escudo ardiente de 12 DEF.",
      };
    }
    return {
      type: "attack",
      value: 10 + (round > 2 ? 2 : 0),
      element: "FIRE",
      name: "Zarpazo de Fuego",
      description: `Ataque rápido de ${10 + (round > 2 ? 2 : 0)} DMG.`,
    };
  }

  // Autómata Glaciar (Defensivo / Contraataque)
  if (botName.includes("Glaciar")) {
    if (round % 2 === 0) {
      return {
        type: "defend",
        value: 14,
        element: "GLACIER",
        name: "Muralla Glaciar",
        description: "Levanta una gruesa barrera de hielo de 14 DEF.",
      };
    }
    return {
      type: "attack",
      value: 9 + round,
      element: "ICE",
      name: "Púas de Escarcha",
      description: `Dispara proyectiles gélidos por ${9 + round} DMG.`,
    };
  }

  // Titán Tectónico (Balanceado / Fuerza Bruta)
  if (round % 4 === 0) {
    return {
      type: "special",
      value: 18,
      element: "EARTH",
      name: "Terremoto Tectónico",
      description: "Golpe colosal de 18 DMG que fractura defensas.",
    };
  }
  if (Math.random() > 0.5) {
    return {
      type: "defend",
      value: 10,
      element: "EARTH",
      name: "Piel de Granito",
      description: "Genera 10 DEF de armadura rocosa.",
    };
  }
  return {
    type: "attack",
    value: 11,
    element: "EARTH",
    name: "Embate de Roca",
    description: "Embate frontal de 11 DMG.",
  };
}

/**
 * Forja en combate: Fusión de 2 cartas de la mano durante el duelo.
 * Disponible exclusivamente en las rondas 1 y 2 con bonificación especial.
 */
export function forgeCardInBattle(cardA: Card, cardB: Card, currentRound: number): Card {
  const resultElement = synthesizeAlchemicalElement(cardA.element, cardB.element);
  const resultRarity = forgeRarity(cardA.rarity, cardB.rarity);
  const resultTier = rarityToTier(resultRarity);

  // Bonus táctico especial por forja en combate dentro de las 2 primeras rondas
  const inRoundBonus = currentRound <= COMBAT_CONFIG.FORGE_MAX_ROUND ? 1.25 : 1.0;

  const baseAtk = Math.round(((cardA.atk || 5) + (cardB.atk || 5)) * 0.7 * inRoundBonus) + 2;
  const baseDef = Math.round(((cardA.def || 5) + (cardB.def || 5)) * 0.7 * inRoundBonus) + 2;
  const baseSpeed = Math.max(cardA.speed || 5, cardB.speed || 5) + 3;

  const hybridNames: Record<string, string> = {
    STEAM: "Coloso de Vapor Primordial",
    MAGMA: "Dragón de Magma Fundido",
    LIGHTNING: "Vórtice del Rayo Centellante",
    NATURE: "Treante del Bosque Aether",
    ICE: "Espectro del Hielo Eterno",
    SAND: "Gólem de Tormenta de Arena",
    STONK: "Titán de Obsidiana Inquebrantable",
    INFERNO: "Avatar del Fuego Cósmico",
    TSUNAMI: "Leviatán de las Mareas",
    TEMPEST: "Águila de la Tempestad",
    PLASMA: "Fénix de Plasma Solar",
    AETHER: "Arcano Cósmico de Aether",
  };

  const name = hybridNames[resultElement] || `Runa Forjada: ${resultElement} ${resultTier}`;

  return {
    id: `battle-forged-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    element: resultElement,
    rarity: resultRarity,
    tier: resultTier,
    atk: Math.min(25, baseAtk),
    def: Math.min(25, baseDef),
    speed: baseSpeed,
    power_score: Number((baseAtk + baseDef + baseSpeed * 0.5).toFixed(1)),
    description: `Carta híbrida forjada en pleno combate táctico (Ronda ${currentRound}). Potenciada con energía de fusión.`,
    passive_skill: "🔥 Síntesis de Duelo: +25% Daño en batalla",
  };
}
