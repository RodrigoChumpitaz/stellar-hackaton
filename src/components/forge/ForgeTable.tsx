"use client";

import { useState, useRef, useCallback } from "react";
import { CardSlot } from "./CardSlot";
import type { CardData } from "@/components/cards/CardItem";
import { forgeElement, forgeRarity } from "@/lib/cards/forge-rules";
import { ELEMENT_THEMES, ElementIcon } from "@/components/cards/CardItem";
import { ZapIcon, FireIcon, SparklesIcon } from "@/components/icons/Elements";

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

  // Long-press hold state
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = useCallback(() => {
    if (!canForge) return;
    setHoldProgress(0);
    const startTime = Date.now();
    const duration = 1100; // 1.1s hold duration
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(progress);
      if (progress >= 100) {
        if (holdIntervalRef.current) {
          clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
        setHoldProgress(0);
        onStartForge();
      }
    }, 25);
  }, [canForge, onStartForge]);

  const cancelHold = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  }, []);

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

      {/* Main Bench: Slot A + Fusion Core + Slot B (Responsive: stack or dual grid on mobile, row on desktop) */}
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

          {/* Central Magical Glyph */}
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/40 via-cyan-500/30 to-blue-700/40 p-1 ring-1 ring-cyan-400/40 shadow-[0_0_25px_rgba(0,229,255,0.35)]">
            <span
              className={`text-2xl transition-transform duration-700 ${
                isForging ? "animate-spin text-cyan-300" : "text-white"
              }`}
            >
              ✦
            </span>
          </div>

          {/* Forge Action Button with Long-Press & Tap */}
          <div className="relative w-full sm:w-auto flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                if (canForge && holdProgress === 0) {
                  onStartForge();
                }
              }}
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              onTouchCancel={cancelHold}
              disabled={!canForge}
              className={`relative overflow-hidden w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all duration-300 select-none ${
                canForge
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(123,43,249,0.5)] hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-cyan-400/60"
                  : isForging
                  ? "bg-purple-950/80 text-purple-300 border border-purple-500/50 cursor-wait shadow-inner"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {/* Long-Press Filling Gauge overlay */}
              {canForge && holdProgress > 0 && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/30 backdrop-blur-sm transition-all duration-75 pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                />
              )}

              {isForging ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  <span>{forgeStepMessage || "Canalizando Éter..."}</span>
                </>
              ) : canForge ? (
                <>
                  <FireIcon className="w-4 h-4 text-amber-300" />
                  <span>
                    {holdProgress > 0
                      ? `Canalizando ${holdProgress}%`
                      : "IGNITAR FORJA (Burn & Mint)"}
                  </span>
                </>
              ) : (
                <span>Selecciona 2 Runas</span>
              )}
            </button>

            {canForge && (
              <span className="mt-1.5 text-[10px] text-zinc-400 font-mono">
                Presiona o mantén presionado para forjar
              </span>
            )}
          </div>

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
