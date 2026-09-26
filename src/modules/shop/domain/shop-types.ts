/**
 * Tipos canónicos del dominio de la Tienda TCG (Bazar Astral).
 * Bounded Context: Shop (Domain Layer)
 */

import type { Card, CardElement, CardRarity, CardTier } from "@/modules/cards/domain/types";

export type ShopCategory = "PACKS" | "SINGLES" | "CATALYSTS";

export type PackRarityTier = "BASIC" | "ELITE" | "COSMIC";

export interface BoosterPackDefinition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: "PACKS";
  rarityTier: PackRarityTier;
  priceXlm: number;
  cardCount: number;
  guaranteedRarity: CardRarity;
  minTier: CardTier;
  maxTier: CardTier;
  possibleElements: CardElement[];
  accentColor: string; // Tailwind color class or hex
  glowColor: string;
  bannerImage?: string;
  icon: string;
}

export interface SingleCardListing {
  id: string;
  category: "SINGLES";
  card: Card;
  priceXlm: number;
  originalPriceXlm?: number;
  discountBadge?: string;
  stock: number;
  featured: boolean;
}

export interface CatalystItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: "CATALYSTS";
  priceXlm: number;
  icon: string;
  effect: string;
  accentColor: string;
}

export type ShopItem = BoosterPackDefinition | SingleCardListing | CatalystItem;

export type PackOpeningStep = "SEALED" | "BURSTING" | "REVEALING" | "COMPLETED";

export interface RevealedCardState {
  card: Card;
  isRevealed: boolean;
}
