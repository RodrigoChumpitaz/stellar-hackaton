/**
 * Servicio de aplicación para procesar compras en la Tienda (Bazar Astral).
 * Bounded Context: Shop (Application Layer)
 */

import type { Card } from "@/modules/cards/domain/types";
import type { BoosterPackDefinition, SingleCardListing, CatalystItem } from "../domain/shop-types";
import { generatePackCards } from "../domain/pack-generator";

export interface PurchaseResult {
  success: boolean;
  error?: string;
  cards?: Card[];
  catalyst?: CatalystItem;
  txHash?: string;
  deductedXlm: number;
}

/**
 * Procesa la compra de un Sobre de Refuerzo (Booster Pack).
 */
export async function purchaseBoosterPack(
  pack: BoosterPackDefinition,
  currentXlm: number
): Promise<PurchaseResult> {
  if (currentXlm < pack.priceXlm) {
    return {
      success: false,
      error: `Saldo insuficiente. Tienes ${currentXlm.toFixed(2)} XLM y este sobre cuesta ${pack.priceXlm.toFixed(2)} XLM.`,
      deductedXlm: 0,
    };
  }

  // Generar las cartas extraídas del sobre
  const cards = generatePackCards(pack);

  // Simulación de transacción en Stellar Testnet (hash ficticio auténtico)
  const txHash = `${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}... (Stellar Testnet)`;

  return {
    success: true,
    cards,
    txHash,
    deductedXlm: pack.priceXlm,
  };
}

/**
 * Procesa la compra de una Carta Individual del Mercado Diario (Single).
 */
export async function purchaseSingleCard(
  listing: SingleCardListing,
  currentXlm: number
): Promise<PurchaseResult> {
  if (currentXlm < listing.priceXlm) {
    return {
      success: false,
      error: `Saldo insuficiente. Tienes ${currentXlm.toFixed(2)} XLM y esta carta cuesta ${listing.priceXlm.toFixed(2)} XLM.`,
      deductedXlm: 0,
    };
  }

  // Clonar la carta con un ID único para el inventario del jugador
  const purchasedCard: Card = {
    ...listing.card,
    id: `shop-single-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  const txHash = `${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}... (Stellar Testnet)`;

  return {
    success: true,
    cards: [purchasedCard],
    txHash,
    deductedXlm: listing.priceXlm,
  };
}

/**
 * Procesa la compra de un Catalizador Alquímico para La Forja.
 */
export async function purchaseCatalyst(
  catalyst: CatalystItem,
  currentXlm: number
): Promise<PurchaseResult> {
  if (currentXlm < catalyst.priceXlm) {
    return {
      success: false,
      error: `Saldo insuficiente. Tienes ${currentXlm.toFixed(2)} XLM y este catalizador cuesta ${catalyst.priceXlm.toFixed(2)} XLM.`,
      deductedXlm: 0,
    };
  }

  const txHash = `${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}... (Stellar Testnet)`;

  return {
    success: true,
    catalyst,
    txHash,
    deductedXlm: catalyst.priceXlm,
  };
}
