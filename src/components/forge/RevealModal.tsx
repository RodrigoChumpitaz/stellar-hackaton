"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CardItem, type CardData } from "@/components/cards/CardItem";
import { SparklesIcon } from "@/components/icons/Elements";

interface RevealModalProps {
  isOpen: boolean;
  resultCard: CardData | null;
  parentA: CardData | null;
  parentB: CardData | null;
  txHash?: string | null;
  onClose: () => void;
}

export function RevealModal({
  isOpen,
  resultCard,
  parentA,
  parentB,
  txHash,
  onClose,
}: RevealModalProps) {
  useEffect(() => {
    if (isOpen && resultCard) {
      // Fire celebration cosmic particles
      void confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#00e5ff", "#a855f7", "#38bdf8", "#fbbf24", "#ffffff"],
        ticks: 200,
      });
    }
  }, [isOpen, resultCard]);

  if (!isOpen || !resultCard) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Radiant ambient glow */}
        <div className="absolute h-96 w-96 rounded-full bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 blur-3xl pointer-events-none" />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="relative flex flex-col items-center max-w-lg w-full rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#14172E] via-[#0E1022] to-[#0A0C18] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,229,255,0.25)] text-center z-10 select-none"
        >
          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>

          {/* Celebration Header */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300 mb-3 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <SparklesIcon className="w-3.5 h-3.5 text-cyan-300" />
            <span>SÍNTESIS GENERATIVA COMPLETADA</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ¡Nueva Runa Híbrida!
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            Tus cartas originales han sido quemadas (Burn) y esta nueva criatura ha sido acuñada (Mint).
          </p>

          {/* Big Card Display */}
          <div className="my-6 flex justify-center transform transition-transform hover:scale-105 duration-300">
            <CardItem card={resultCard} size="lg" />
          </div>

          {/* Provenance / Parents summary */}
          {parentA && parentB && (
            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-mono py-1 px-3 rounded-full bg-zinc-900/80 border border-zinc-800 mb-4">
              <span className="text-zinc-500">Padres quemados:</span>
              <span className="text-red-400 font-semibold">{parentA.name}</span>
              <span>+</span>
              <span className="text-cyan-400 font-semibold">{parentB.name}</span>
            </div>
          )}

          {/* Stellar Verification Badge */}
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Acuñada en Stellar Soroban Testnet</span>
            {txHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-emerald-300 hover:text-white ml-1 font-mono text-[11px]"
              >
                (Ver TX)
              </a>
            )}
          </div>

          {/* Equip / Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3.5 text-sm font-extrabold tracking-wide uppercase text-white shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer ring-1 ring-cyan-400/60"
          >
            ✦ Equipar al Mazo &amp; Continuar
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
