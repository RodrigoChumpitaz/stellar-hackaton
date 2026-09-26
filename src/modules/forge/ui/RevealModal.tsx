"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CardItem } from "@/modules/cards/ui/CardItem";
import type { CardData } from "@/modules/cards/domain/types";

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
          className="relative flex flex-col items-center max-w-md w-full rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#14172E] via-[#0E1022] to-[#0A0C18] p-4 sm:p-6 shadow-[0_0_60px_rgba(0,229,255,0.25)] text-center z-10 select-none"
        >
          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>

          {/* Celebration Header */}
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ¡Nueva Runa Híbrida!
          </h3>

          {/* Big Card Display */}
          <div className="my-3 sm:my-4 flex justify-center transform transition-transform hover:scale-105 duration-300">
            <CardItem card={resultCard} size="lg" />
          </div>

          {/* Stellar Verification Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 mb-3.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
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
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3 text-sm font-extrabold tracking-wide uppercase text-white shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer ring-1 ring-cyan-400/60"
          >
            ✦ Equipar al Mazo &amp; Continuar
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
