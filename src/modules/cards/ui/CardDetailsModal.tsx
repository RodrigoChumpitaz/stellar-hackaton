"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardData } from "../domain/types";
import type { CardRarity } from "../domain/constants";
import { ELEMENT_THEMES, ElementIcon, getTierBadgeStyle } from "./CardItem";
import { rarityToTier } from "@/modules/forge/domain/forge-rules";
import { SwordIcon, ShieldIcon, SparklesIcon, ZapIcon } from "@/shared/ui/icons/Elements";

interface CardDetailsModalProps {
  card: CardData | null;
  onClose: () => void;
}

export function CardDetailsModal({ card, onClose }: CardDetailsModalProps) {
  useEffect(() => {
    if (!card) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  const theme = ELEMENT_THEMES[card.element] || ELEMENT_THEMES.AETHER;
  const displayTier = card.tier || rarityToTier(card.rarity as CardRarity);
  const tierStyle = getTierBadgeStyle(displayTier);
  const maxStat = 12; // Base scale reference

  const atkPercentage = Math.min(100, Math.round((card.atk / maxStat) * 100));
  const defPercentage = Math.min(100, Math.round((card.def / maxStat) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative max-w-lg w-full rounded-3xl border border-zinc-800 bg-gradient-to-b from-[#121528] via-[#0E1022] to-[#0A0C18] p-5 sm:p-7 shadow-2xl z-10 select-none overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 h-48 w-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${theme.badge} shadow-lg`}
              >
                <ElementIcon element={card.element} className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {card.name}
                  </h3>
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-[11px] font-black border ${tierStyle.badge} ${tierStyle.border}`}
                  >
                    Rango {displayTier}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Elemento: <span className={theme.accent}>{card.element}</span>
                  {card.token_id !== undefined && card.token_id !== null && (
                    <span className="ml-2 text-cyan-400 font-bold">
                      · Token #{card.token_id.toString()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div className="py-4 space-y-4">
            {/* Lore & Description */}
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-3.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                Crónica de la Criatura
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                &ldquo;{card.lore || card.description || "Criatura mística forjada en el crisol de Aether."}&rdquo;
              </p>
            </div>

            {/* Stat Progress Bars */}
            <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                  Poder Combina-Atómico y Balance
                </span>
                <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Power Score: {card.power_score ?? Number((card.atk + card.def + (card.speed ?? 5) * 0.5).toFixed(1))}
                </span>
              </div>

              {/* ATK Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold">
                    <SwordIcon className="w-3.5 h-3.5" />
                    <span>Ataque (ATK)</span>
                  </div>
                  <span className="font-mono font-extrabold text-red-300">
                    {card.atk} / {maxStat}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${atkPercentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  />
                </div>
              </div>

              {/* DEF Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <ShieldIcon className="w-3.5 h-3.5" />
                    <span>Defensa (DEF)</span>
                  </div>
                  <span className="font-mono font-extrabold text-cyan-300">
                    {card.def} / {maxStat}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${defPercentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  />
                </div>
              </div>

              {/* Speed Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span className="text-xs">⚡</span>
                    <span>Velocidad / Iniciativa (SPD)</span>
                  </div>
                  <span className="font-mono font-extrabold text-amber-300">
                    {card.speed ?? 5} / 10
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((card.speed ?? 5) / 10) * 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  />
                </div>
              </div>
            </div>

            {/* Tactical Skills Section (Passive Left, Active Right, Hidden if none) */}
            {(card.passive || card.passive_skill || card.active) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Passive Skill (Left) */}
                {card.passive || card.passive_skill ? (
                  <div
                    className={`rounded-2xl bg-purple-950/30 border border-purple-500/30 p-3 flex items-start gap-2.5 ${
                      !card.active ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="p-1.5 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 shrink-0">
                      <ZapIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 truncate">
                          {card.passive?.name || "Habilidad Pasiva"}
                        </span>
                        <span className="rounded bg-purple-900/40 border border-purple-500/40 px-1.5 py-0.5 text-[8px] font-mono text-purple-300 shrink-0">
                          {card.passive?.trigger || "PASIVA"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                        {card.passive?.description || card.passive_skill}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Active Skill (Right) */}
                {card.active ? (
                  <div
                    className={`rounded-2xl bg-cyan-950/30 border border-cyan-500/30 p-3 flex items-start gap-2.5 ${
                      !(card.passive || card.passive_skill) ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="p-1.5 rounded-xl bg-cyan-900/40 border border-cyan-500/40 text-cyan-300 shrink-0">
                      <span className="text-xs">🔮</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 truncate">
                          {card.active.name}
                        </span>
                        <span className="rounded bg-cyan-900/40 border border-cyan-500/40 px-1.5 py-0.5 text-[8px] font-mono text-cyan-300 shrink-0">
                          Coste: {card.active.energy_cost} Éter
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                        {card.active.description}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Stellar Soroban Verification Status */}
            <div className="flex items-center justify-between text-[11px] font-mono px-1 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estado Soroban:</span>
                <span className="text-emerald-400 font-semibold">
                  {card.token_id !== undefined && card.token_id !== null ? "Acuñado on-chain" : "Catálogo Base"}
                </span>
                {card.prestige_level !== undefined && card.prestige_level > 0 && (
                  <span className="text-amber-400 font-bold ml-1">
                    (★ Ascensión {card.prestige_level})
                  </span>
                )}
              </span>
              <span>Stellar Testnet</span>
            </div>
          </div>


          {/* Footer action button */}
          <div className="pt-2 border-t border-zinc-800/80">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Cerrar Ficha Técnica
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
