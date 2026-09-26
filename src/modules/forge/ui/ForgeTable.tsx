"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CardSlot } from "./CardSlot";
import type { CardData } from "@/modules/cards/domain/types";
import { forgeElement, calculateTierOutcome, rarityToTier } from "../domain/forge-rules";
import { ELEMENT_THEMES, ElementIcon } from "@/modules/cards/ui/CardItem";
import { ForgeIgniteButton } from "./ForgeIgniteButton";

const AetherCrystal = dynamic(
  () => import("./AetherCrystal"),
  {
    ssr: false,
    loading: () => (
      <div className="w-28 h-28 sm:w-36 sm:h-36 -my-2 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border border-cyan-500/20 bg-cyan-950/20 animate-pulse" />
      </div>
    ),
  }
);

interface ForgeTableProps {
  cardA: CardData | null;
  cardB: CardData | null;
  onRemoveA: () => void;
  onRemoveB: () => void;
  onStartForge: () => void;
  isForging: boolean;
  forgeStepMessage?: string | null;
  onDragEndToSlot?: (card: CardData, targetSlot: "A" | "B") => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

export function ForgeTable({
  cardA,
  cardB,
  onRemoveA,
  onRemoveB,
  onStartForge,
  isForging,
  forgeStepMessage,
  onDragEndToSlot,
  onDragStart,
  onDragEnd,
  className = "",
}: ForgeTableProps) {

  const canForge = Boolean(cardA && cardB && cardA.id !== cardB.id && !isForging);

  // Crystal energy sync during long-press hold
  const [crystalEnergy, setCrystalEnergy] = useState(0);

  // Compute preview of derived element and alphanumeric Tier (30-tier system)
  const expectedElement =
    cardA && cardB ? forgeElement(cardA.element, cardB.element) : null;
  const expectedTier =
    cardA && cardB
      ? calculateTierOutcome(
          cardA.tier || rarityToTier(cardA.rarity),
          cardB.tier || rarityToTier(cardB.rarity)
        ).resultingTier
      : null;

  const expectedTheme = expectedElement
    ? ELEMENT_THEMES[expectedElement] || ELEMENT_THEMES.AETHER
    : null;

  return (
    <section className={`relative ${className || "z-20"} w-full rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#111428]/90 via-[#0E1022]/90 to-[#0A0C18]/95 p-4 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl select-none transition-all duration-200`}>
      {/* Background container with overflow-hidden for ambient effects */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        {/* 3D Floor Perspective Holographic Altar */}
        <div className="absolute inset-x-0 -bottom-10 flex justify-center pointer-events-none [perspective:900px]">
          <div className="h-64 w-[90%] max-w-3xl rounded-full border border-cyan-500/20 bg-gradient-to-t from-cyan-950/30 to-purple-950/10 [transform:rotateX(65deg)] shadow-[0_0_60px_rgba(0,229,255,0.15)] animate-pulse" />
        </div>

        {/* Background Decorative Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="h-[480px] w-[480px] rounded-full border border-cyan-500 animate-[spin_60s_linear_infinite]" />
          <div className="absolute h-[360px] w-[360px] rounded-full border border-purple-500 animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute h-[240px] w-[240px] rounded-full border border-dashed border-cyan-300" />
        </div>
      </div>

      {/* Header - Sleek, Game-focused & Zero Technical Jargon */}
      <div className="relative text-center mb-6 sm:mb-8 z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
          La Forja de Runas
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-sm sm:max-w-md mx-auto">
          Combina dos runas para sintetizar una criatura híbrida superior.
        </p>
      </div>

      {/* Main Bench: Slot A + Fusion Core + Slot B */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-10">
        {/* Slot A */}
        <CardSlot
          slotLabel="A"
          card={cardA}
          onRemove={onRemoveA}
          isForging={isForging}
          onDragEndToSlot={onDragEndToSlot}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />

        {/* Fusion Core */}
        <div className="flex flex-col items-center justify-center gap-3 my-2 md:my-0 w-full md:w-auto">
          {/* Expected Outcome Prediction */}
          {expectedElement && expectedTier && expectedTheme ? (
            <div className="flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-3.5 py-1 text-xs font-extrabold shadow-lg animate-fade-in">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mr-0.5">
                Resultado:
              </span>
              <ElementIcon element={expectedElement} className="w-3.5 h-3.5" />
              <span className={expectedTheme.accent}>{expectedElement}</span>
              <span className="text-zinc-500">·</span>
              <span className="text-amber-300 font-mono">Rango {expectedTier}</span>
            </div>
          ) : (
            <div className="h-6" />
          )}

          {/* Central 3D Interactive Aether Crystal */}
          <AetherCrystal
            isForging={isForging}
            energyLevel={crystalEnergy}
            className="w-28 h-28 sm:w-36 sm:h-36 -my-2"
          />

          {/* Forge Action Button with Long-Press & Tap */}
          <ForgeIgniteButton
            canForge={canForge}
            isForging={isForging}
            forgeStepMessage={forgeStepMessage}
            onIgnite={onStartForge}
            onProgressChange={setCrystalEnergy}
            cardsCount={Number(Boolean(cardA)) + Number(Boolean(cardB))}
          />

          {/* Micro Gas Info - Sleek & Subtle */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Soroban Testnet</span>
            <span className="text-zinc-600">·</span>
            <span>&lt; 0.0001 XLM</span>
          </div>
        </div>

        {/* Slot B */}
        <CardSlot
          slotLabel="B"
          card={cardB}
          onRemove={onRemoveB}
          isForging={isForging}
          onDragEndToSlot={onDragEndToSlot}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />

      </div>
    </section>
  );
}
