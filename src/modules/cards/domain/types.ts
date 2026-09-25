/**
 * Entidades y tipos canónicos de dominio para el módulo de Cartas.
 * Bounded Context: Cards (Domain Layer)
 */

import type { CardElement, CardRarity, BaseElement, HybridElement } from "./constants";

export type { CardElement, CardRarity, BaseElement, HybridElement };

export interface CardPassiveSkill {
  name: string;
  description: string;
  trigger?: "ON_ATTACK" | "ON_DEFENSE" | "ON_ENTRY" | "ON_TURN_START" | "AURA" | "STATIC";
}

export interface CardActiveSkill {
  name: string;
  description: string;
  energy_cost: number;
}

export interface Card {
  id: string | number;
  name: string;
  element: CardElement;
  rarity: CardRarity;
  atk: number;
  def: number;
  speed?: number;
  power_score?: number;
  prestige_level?: number;
  image_url?: string | null;
  lore?: string | null;
  description?: string | null;
  passive_skill?: string | null;
  passive?: CardPassiveSkill | null;
  active?: CardActiveSkill | null;
  token_id?: number | bigint | null;
}

export type CardData = Card;

