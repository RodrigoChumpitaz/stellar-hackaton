/**
 * Servicio de aplicación para la Forja de Runas (Clean Architecture - Use Cases).
 * Encapsula las reglas deterministas de síntesis elemental, presupuestos de estadísticas y generación atómica.
 */

import { forgeElement, forgeRarity } from "../domain/forge-rules";
import { STAT_BUDGET, ELEMENT_IMAGE, type CardElement } from "@/modules/cards/domain/constants";
import type { Card } from "@/modules/cards/domain/types";
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
  token_id?: number | bigint;
  image_url?: string | null;
}

/**
 * Genera la nueva carta híbrida resultante de la forja atómica respetando los presupuestos de rareza.
 */
export function synthesizeHybridCard(cardA: Card, cardB: Card, options?: SynthesizeOptions): Card {
  const preview = calculateForgePreview(cardA, cardB);
  const derivedElement = preview.derivedElement;
  const derivedRarity = preview.derivedRarity;
  const budget = STAT_BUDGET[derivedRarity];

  // Cálculo de stats balanceados dentro del presupuesto de rareza
  let targetAtk = Math.max(cardA.atk, cardB.atk) + 1;
  let targetDef = Math.max(cardA.def, cardB.def) + 1;

  const totalStats = targetAtk + targetDef;
  if (totalStats > budget.max) {
    const diff = totalStats - budget.max;
    if (targetAtk > targetDef) {
      targetAtk -= diff;
    } else {
      targetDef -= diff;
    }
  } else if (totalStats < budget.min) {
    targetAtk += budget.min - totalStats;
  }

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

  return {
    id: `forged-${Date.now()}`,
    name: options?.name || defaultName,
    element: derivedElement,
    rarity: derivedRarity,
    atk: targetAtk,
    def: targetDef,
    image_url: options?.image_url !== undefined ? options.image_url : defaultImageUrl,
    lore: options?.lore || defaultLore,
    passive_skill:
      options?.passive_skill ||
      "Resonancia Elemental: Incrementa en 10% el poder frente a elementos primordiales opuestos.",
    token_id: options?.token_id ?? BigInt(Date.now() % 10000),
  };
}
