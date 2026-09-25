import type { CardElement, CardRarity, Card } from "@/modules/cards/domain/types";

export interface ForgePreview {
  derivedElement: CardElement;
  derivedRarity: CardRarity;
  minAtk: number;
  maxAtk: number;
  minDef: number;
  maxDef: number;
  budgetMin: number;
  budgetMax: number;
}

export interface ForgeSynthesisResult {
  card: Card;
  parentA: Card;
  parentB: Card;
  txHash?: string;
  isOffChainSimulation: boolean;
}
