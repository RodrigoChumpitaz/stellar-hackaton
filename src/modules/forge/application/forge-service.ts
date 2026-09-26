/**
 * Servicio de aplicación para la Forja de Runas (Clean Architecture - Use Cases).
 * Encapsula las reglas deterministas de síntesis elemental, presupuestos de estadísticas y generación atómica.
 */

import {
  forgeElement,
  forgeRarity,
  calculateProgressiveStat,
  calculatePowerScore,
  clampStatsToBudget,
  rarityToTier,
  tierToRarity,
  calculateTierOutcome,
  generateSkillsForCard,
  getTierIndex,
} from "../domain/forge-rules";
import { CARD_TIERS, STAT_BUDGET, ELEMENT_IMAGE, type CardElement } from "@/modules/cards/domain/constants";
import type { Card, CardPassiveSkill, CardActiveSkill } from "@/modules/cards/domain/types";
import type { ForgePreview } from "../domain/types";

export class InvalidForgeCombinationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidForgeCombinationError";
  }
}

/**
 * Calcula la sinergia y proyección de estadísticas para dos cartas candidatas.
 */
export function calculateForgePreview(cardA: Card, cardB: Card): ForgePreview {
  if (cardA.id === cardB.id) {
    throw new InvalidForgeCombinationError("No se puede forjar una carta consigo misma.");
  }

  const derivedElement = forgeElement(cardA.element, cardB.element);
  const derivedRarity = forgeRarity(cardA.rarity, cardB.rarity);
  const budget = STAT_BUDGET[derivedRarity];

  // La sinergia hereda los puntos más fuertes con bonificación de síntesis
  const baseAtk = Math.max(cardA.atk, cardB.atk);
  const baseDef = Math.max(cardA.def, cardB.def);

  return {
    derivedElement,
    derivedRarity,
    minAtk: baseAtk,
    maxAtk: Math.min(baseAtk + 2, budget.max - 1),
    minDef: baseDef,
    maxDef: Math.min(baseDef + 2, budget.max - 1),
    budgetMin: budget.min,
    budgetMax: budget.max,
  };
}

interface SynthesizeOptions {
  name?: string;
  lore?: string;
  passive_skill?: string;
  passive?: CardPassiveSkill | null;
  active?: CardActiveSkill | null;
  speed?: number;
  token_id?: number | bigint;
  image_url?: string | null;
  prestige_level?: number;
}

/**
 * Genera la nueva carta híbrida resultante de la forja atómica respetando
 * la progresión de rareza, escala continua y balance matemático anti-rotas.
 */
export function synthesizeHybridCard(cardA: Card, cardB: Card, options?: SynthesizeOptions): Card {
  const preview = calculateForgePreview(cardA, cardB);
  const derivedElement = preview.derivedElement;
  const derivedRarity = preview.derivedRarity;

  // Si dos legendarias se fusionan, se incrementa el nivel de trascendencia/prestigio
  const isHighTierMerge = cardA.rarity === "LEGENDARY" && cardB.rarity === "LEGENDARY";
  const prestigeLevel =
    options?.prestige_level !== undefined
      ? options.prestige_level
      : isHighTierMerge
      ? Math.max(cardA.prestige_level || 0, cardB.prestige_level || 0) + 1
      : Math.max(cardA.prestige_level || 0, cardB.prestige_level || 0);

  // Progresión continua con rendimientos decrecientes
  const rawTargetAtk = calculateProgressiveStat(cardA.atk, cardB.atk, 1);
  const rawTargetDef = calculateProgressiveStat(cardA.def, cardB.def, 1);

  // Clamping determinista al presupuesto oficial de la rareza
  const { atk: targetAtk, def: targetDef } = clampStatsToBudget(
    rawTargetAtk,
    rawTargetDef,
    derivedRarity,
    prestigeLevel
  );

  // Afinidad elemental para velocidad de turno (SPD 1..10)
  const defaultSpeed =
    derivedElement === "LIGHTNING" || derivedElement === "AIR"
      ? 8
      : derivedElement === "ICE" || derivedElement === "STEAM"
      ? 6
      : derivedElement === "FIRE" || derivedElement === "MAGMA"
      ? 5
      : derivedElement === "EARTH" || derivedElement === "NATURE" || derivedElement === "SAND"
      ? 4
      : 5;
  const speed = options?.speed ?? defaultSpeed;

  // Habilidades tácticas por elemento híbrido
  const ELEMENT_PASSIVES: Record<string, CardPassiveSkill> = {
    STEAM: {
      name: "Manto de Niebla",
      description: "+15% de evasión frente a ataques físicos directos.",
      trigger: "ON_DEFENSE",
    },
    MAGMA: {
      name: "Núcleo Volcánico",
      description: "+2 de daño por quemadura tras cada impacto exitoso.",
      trigger: "ON_ATTACK",
    },
    ICE: {
      name: "Cero Absoluto",
      description: "Reduce en 1 la iniciativa del atacante al bloquear un golpe.",
      trigger: "ON_DEFENSE",
    },
    LIGHTNING: {
      name: "Chispa de Sobrecarga",
      description: "Inflige 1 de daño reflejado al recibir daño de cualquier fuente.",
      trigger: "ON_DEFENSE",
    },
    NATURE: {
      name: "Fotosíntesis Rúnica",
      description: "Regenera 1 punto de defensa al inicio de cada ronda.",
      trigger: "ON_TURN_START",
    },
    SAND: {
      name: "Dunas Cegadoras",
      description: "Aura que reduce en 10% la precisión de todas las runas enemigas.",
      trigger: "AURA",
    },
    AETHER: {
      name: "Trascendencia Cósmica",
      description: "Inmune a desventajas elementales; absorbe un 10% de daño residual.",
      trigger: "STATIC",
    },
  };

  const powerScore = calculatePowerScore(targetAtk, targetDef, speed, prestigeLevel);

  // Nombre canónico por defecto si no es provisto por el oráculo
  const defaultName =
    derivedElement === "STEAM"
      ? "Vapor Primordial #211"
      : derivedElement === "MAGMA"
      ? "Quimera Volcánica #104"
      : derivedElement === "ICE"
      ? "Glaciar Rúnico #305"
      : derivedElement === "LIGHTNING"
      ? "Vórtice Eléctrico #402"
      : derivedElement === "NATURE"
      ? "Ent Ancestral #501"
      : derivedElement === "SAND"
      ? "Espejismo Dorado #603"
      : `Runa Híbrida de ${derivedElement}`;

  const defaultLore = `Sintetizada de las esencias de ${cardA.name} y ${cardB.name}. Una creación atómica certificada en Soroban Testnet.`;

  const defaultImageUrl =
    derivedElement === "STEAM"
      ? "/cards/primordial-vapor.png"
      : ELEMENT_IMAGE[derivedElement as CardElement] || null;

  // Cálculo canónico de rango (30 Tiers F- a L+) y habilidades progresivas
  const tierA = cardA.tier || rarityToTier(cardA.rarity);
  const tierB = cardB.tier || rarityToTier(cardB.rarity);
  const tierOutcome = calculateTierOutcome(tierA, tierB);

  // Armonización de Categoría & Protección Anti-Degradación:
  // Si la síntesis promovió la categoría de rareza (ej. COMMON + COMMON -> UNCOMMON),
  // el tier resultante asciende obligatoriamente para reflejar la nueva categoría (D).
  // Además, el rango nunca degrada por debajo del máximo de las dos cartas invertidas.
  const tierFromPromotedRarity = rarityToTier(derivedRarity);
  const finalTierIdx = Math.max(
    getTierIndex(tierOutcome.resultingTier),
    getTierIndex(tierFromPromotedRarity),
    getTierIndex(tierA),
    getTierIndex(tierB)
  );
  const derivedTier = CARD_TIERS[finalTierIdx];
  const finalRarity = tierToRarity(derivedTier);

  const parentSkillsA = cardA.skills || (cardA.passive_skill ? [cardA.passive_skill.split(":")[0]] : []);
  const parentSkillsB = cardB.skills || (cardB.passive_skill ? [cardB.passive_skill.split(":")[0]] : []);
  const generatedSkills = generateSkillsForCard(derivedElement, derivedTier, parentSkillsA, parentSkillsB);
  const hasSkills = generatedSkills.length > 0 || Boolean(options?.passive) || Boolean(options?.active) || Boolean(options?.passive_skill);

  const structuredPassive: CardPassiveSkill | null = hasSkills
    ? options?.passive ||
      ELEMENT_PASSIVES[derivedElement] || {
        name: generatedSkills[0] || "Resonancia Elemental",
        description: "Aumenta la efectividad de los atributos en un 10% frente a elementos opuestos.",
        trigger: "STATIC",
      }
    : null;

  const structuredActive: CardActiveSkill | null = hasSkills
    ? options?.active || {
        name: `Pulso de ${derivedElement}`,
        description: `Libera una oleada elemental que inflige ${Math.max(1, Math.floor(targetAtk / 2))} de daño directo.`,
        energy_cost: finalRarity === "LEGENDARY" ? 3 : 2,
      }
    : null;

  return {
    id: `forged-${Date.now()}`,
    name: options?.name || defaultName,
    element: derivedElement,
    rarity: finalRarity,
    tier: derivedTier,
    skills: generatedSkills.length > 0 ? generatedSkills : undefined,
    atk: targetAtk,
    def: targetDef,
    speed,
    power_score: powerScore,
    prestige_level: prestigeLevel,
    image_url: options?.image_url !== undefined ? options.image_url : defaultImageUrl,
    lore: options?.lore || defaultLore,
    passive_skill: hasSkills && structuredPassive ? (options?.passive_skill || `${structuredPassive.name}: ${structuredPassive.description}`) : undefined,
    passive: structuredPassive,
    active: structuredActive,
    token_id: options?.token_id ?? BigInt(Date.now() % 10000),
  };
}

