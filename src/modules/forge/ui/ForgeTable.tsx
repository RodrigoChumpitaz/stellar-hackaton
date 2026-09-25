"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CardSlot } from "./CardSlot";
import type { CardData } from "@/modules/cards/domain/types";
import { forgeElement, forgeRarity } from "../domain/forge-rules";
import { ELEMENT_THEMES, ElementIcon } from "@/modules/cards/ui/CardItem";
import { ZapIcon, SparklesIcon } from "@/shared/ui/icons/Elements";
import { ForgeIgniteButton } from "./ForgeIgniteButton";

const AetherCrystal = dynamic(
  () => import("./AetherCrystal").then((m) => m.AetherCrystal),
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
}

export function ForgeTable({
  cardA,
  cardB,
  onRemoveA,
  onRemoveB,
  onStartForge,
  isForging,
  forgeStepMessage,
}: ForgeTableProps) {
  const canForge = Boolean(cardA && cardB && cardA.id !== cardB.id && !isForging);

  // Crystal energy sync during long-press hold
  const [crystalEnergy, setCrystalEnergy] = useState(0);

  // Compute preview of derived element and rarity
  const expectedElement =
    cardA && cardB ? forgeElement(cardA.element, cardB.element) : null;
  const expectedRarity =
    cardA && cardB ? forgeRarity(cardA.rarity, cardB.rarity) : null;

  const expectedTheme = expectedElement
    ? ELEMENT_THEMES[expectedElement] || ELEMENT_THEMES.AETHER
    : null;

  return (
    <section className="relative w-full rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#111428]/90 via-[#0E1022]/90 to-[#0A0C18]/95 p-4 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl overflow-hidden select-none">
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

      {/* Header */}
      <div className="relative text-center mb-4 sm:mb-6 z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-xs font-semibold text-purple-300 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <ZapIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>Altar de Síntesis Atómica</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          La Forja de Runas
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Fusiona dos cartas comunes. Gemini 2.0 Flash balanceará los stats y
          Soroban ejecutará la quema y acuñación atómica en Stellar Testnet.
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
        />

        {/* Fusion Core */}
        <div className="flex flex-col items-center justify-center gap-3 my-2 md:my-0 w-full md:w-auto">
          {/* Expected Outcome Prediction */}
          {expectedElement && expectedRarity && expectedTheme && (
            <div className="flex flex-col items-center gap-1 animate-fade-in">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Sinergia Prevista
              </span>
              <div
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold shadow-lg ${expectedTheme.badge} ${expectedTheme.glow}`}
              >
                <ElementIcon element={expectedElement} className="w-3.5 h-3.5" />
                <span>{expectedElement}</span>
                <span className="text-zinc-400">·</span>
                <span>{expectedRarity}</span>
              </div>
            </div>
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
          />

          {/* Micro Gas Info */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">●</span> Gas: &lt; 0.0001 XLM
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <SparklesIcon className="w-3 h-3 text-cyan-400" />
              Atómico en Soroban
            </span>
          </div>
        </div>

        {/* Slot B */}
        <CardSlot
          slotLabel="B"
          card={cardB}
          onRemove={onRemoveB}
          isForging={isForging}
        />
      </div>
    </section>
  );
}
