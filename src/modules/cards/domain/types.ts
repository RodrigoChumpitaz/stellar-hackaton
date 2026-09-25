/**
 * Entidades y tipos canónicos de dominio para el módulo de Cartas.
 * Bounded Context: Cards (Domain Layer)
 */

import type { CardElement, CardRarity, BaseElement, HybridElement } from "./constants";

export type { CardElement, CardRarity, BaseElement, HybridElement };

export interface Card {
  id: string | number;
  name: string;
  element: CardElement;
  rarity: CardRarity;
  atk: number;
  def: number;
  image_url?: string | null;
  lore?: string | null;
  description?: string | null;
  passive_skill?: string | null;
  token_id?: number | bigint | null;
}

export type CardData = Card;
