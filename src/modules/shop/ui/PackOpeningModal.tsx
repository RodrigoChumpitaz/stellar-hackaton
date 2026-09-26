"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card } from "@/modules/cards/domain/types";
import type { BoosterPackDefinition, PackOpeningStep } from "../domain/shop-types";
import { CardItem } from "@/modules/cards/ui/CardItem";
import { SparklesIcon, FireIcon } from "@/shared/ui/icons/Elements";

interface PackOpeningModalProps {
  isOpen: boolean;
  pack: BoosterPackDefinition | null;
  cards: Card[];
  txHash?: string;
  onClose: () => void;
  onClaimAndGoToDecks?: () => void;
  onClaimAndGoToForge?: () => void;
}

export function PackOpeningModal({
  isOpen,
  pack,
  cards,
  txHash,
  onClose,
  onClaimAndGoToDecks,
  onClaimAndGoToForge,
}: PackOpeningModalProps) {
  const [step, setStep] = useState<PackOpeningStep>("SEALED");
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  if (!isOpen || !pack) return null;

  const handleStartOpening = () => {
    setStep("BURSTING");
    setTimeout(() => {
      setStep("REVEALING");
    }, 900);
  };

  const handleRevealCard = (index: number) => {
    setRevealedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      if (next.size === cards.length) {
        setStep("COMPLETED");
      }
      return next;
    });
  };

  const handleRevealAll = () => {
    const all = new Set<number>(cards.map((_, i) => i));
    setRevealedIndices(all);
    setStep("COMPLETED");
  };

  const handleClose = () => {
    setStep("SEALED");
    setRevealedIndices(new Set());
    onClose();
  };

  const allRevealed = revealedIndices.size === cards.length && cards.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          onClick={step === "COMPLETED" ? handleClose : undefined}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-4xl rounded-3xl border border-cyan-500/30 bg-[#0A0D1D]/95 p-5 sm:p-8 shadow-2xl shadow-cyan-950/60 my-auto flex flex-col items-center justify-center text-center overflow-hidden"
        >
          {/* Cosmic Aura Glow Background */}
          <div
            className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: pack.glowColor }}
          />
          <div
            className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: pack.glowColor }}
          />

          {/* Header Info */}
          <div className="relative z-10 flex flex-col items-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-bold text-cyan-300 mb-2">
              <span>{pack.icon}</span>
              <span>{pack.name}</span>
              <span className="text-zinc-500">·</span>
              <span className="font-mono text-amber-300">{pack.cardCount} Runas</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {step === "SEALED" && "Ceremonia de Desprecintado"}
              {step === "BURSTING" && "Ruptura de Velo Astral..."}
              {step === "REVEALING" && "Toca cada carta para revelarla"}
              {step === "COMPLETED" && "¡Runas Obtenidas con Éxito!"}
            </h3>

            {txHash && (
              <span className="mt-1 text-[11px] font-mono text-zinc-500">
                Tx Stellar: {txHash}
              </span>
            )}
          </div>

          {/* ========================================================================= */}
          {/* PASO 1: SOBRE SELLADO                                                     */}
          {/* ========================================================================= */}
          {step === "SEALED" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center justify-center my-4"
            >
              {/* Floating Pack Graphic */}
              <motion.div
                animate={{
                  y: [-6, 6, -6],
                  rotateZ: [-1, 1, -1],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative flex h-64 w-44 sm:h-72 sm:w-52 flex-col items-center justify-between rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-indigo-950 via-[#121630] to-purple-950 p-4 shadow-[0_0_40px_rgba(0,229,255,0.4)]"
              >
                {/* Pack Seal Emblems */}
                <div className="flex w-full justify-between items-center text-xs font-mono text-cyan-300">
                  <span className="font-bold">AETHER TCG</span>
                  <span>{pack.rarityTier}</span>
                </div>

                {/* Central Emblem */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-cyan-400 bg-cyan-950/80 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.6)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/cards/crystal-logo.png"
                      alt="Stellar Seal"
                      className="h-12 w-12 sm:h-16 sm:w-16 object-contain drop-shadow-[0_0_10px_#00e5ff] animate-pulse"
                    />
                  </div>
                  <span className="mt-3 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    Sello Rúnico
                  </span>
                </div>

                <div className="w-full text-center">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Red: Stellar Testnet
                  </span>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartOpening}
                className="mt-8 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:brightness-110 cursor-pointer"
              >
                <SparklesIcon className="w-4 h-4 text-black" />
                <span>Desprecintar Runas ({cards.length})</span>
              </motion.button>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PASO 2: RUPTURA / BURST                                                   */}
          {/* ========================================================================= */}
          {step === "BURSTING" && (
            <div className="relative flex h-72 w-full items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 2.5, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-40 w-40 rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-500 blur-2xl"
              />
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.4, 0.8] }}
                transition={{ duration: 0.9 }}
                className="text-6xl"
              >
                ✨
              </motion.div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3 & 4: REVELACIÓN DE CARTAS Y VOLTEO 3D                              */}
          {/* ========================================================================= */}
          {(step === "REVEALING" || step === "COMPLETED") && (
            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Quick Reveal Button if not all revealed */}
              {!allRevealed && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleRevealAll}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 px-4 py-2 text-xs font-bold text-cyan-300 transition-all cursor-pointer"
                  >
                    <span>⚡</span>
                    <span>Voltear Todas las Cartas</span>
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 my-2 w-full justify-items-center">
                {cards.map((card, idx) => {
                  const isRevealed = revealedIndices.has(idx);

                  return (
                    <motion.div
                      key={card.id}
                      initial={{ scale: 0.5, y: 30, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      onClick={() => !isRevealed && handleRevealCard(idx)}
                      className="cursor-pointer perspective-1000"
                    >
                      {/* 3D Flip Card Container */}
                      <motion.div
                        className="relative h-[220px] w-[145px] sm:h-[240px] sm:w-[155px] rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]"
                        animate={{ rotateY: isRevealed ? 0 : 180 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        {/* Front Side: Real CardItem */}
                        <div className="absolute inset-0 [backface-visibility:hidden] flex items-center justify-center">
                          <CardItem card={card} size="sm" variant="compact" />
                        </div>

                        {/* Back Side: Mystical Runed Card Back */}
                        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-br from-[#0c1022] via-[#151c36] to-[#0a0d1e] p-3 flex flex-col items-center justify-between shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-105 transition-transform">
                          <div className="text-[10px] font-mono font-bold text-cyan-400">
                            STELLAR RUNES
                          </div>

                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <div className="h-12 w-12 rounded-full border border-cyan-400/60 bg-cyan-950/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                              <span className="text-xl">🔮</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">
                              Toca para revelar
                            </span>
                          </div>

                          <div className="text-[9px] font-mono text-zinc-500">
                            Runa #{idx + 1}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons When Completed */}
              {allRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full"
                >
                  {onClaimAndGoToDecks && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        onClaimAndGoToDecks();
                      }}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 px-5 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
                    >
                      <span>🎴</span>
                      <span>Reclamar e Ir a Mis Mazos</span>
                    </button>
                  )}

                  {onClaimAndGoToForge && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        onClaimAndGoToForge();
                      }}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
                    >
                      <FireIcon className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ir a La Forja con estas Runas</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    🏪 Seguir en la Tienda
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
