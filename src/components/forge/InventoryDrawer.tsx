"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardItem, type CardData } from "@/components/cards/CardItem";
import { BASE_ELEMENTS, CARD_ELEMENTS, type CardElement } from "@/lib/cards/constants";
import {
  FireIcon,
  WaterIcon,
  EarthIcon,
  AirIcon,
  SparklesIcon,
} from "@/components/icons/Elements";

interface InventoryDrawerProps {
  cards: CardData[];
  selectedA: CardData | null;
  selectedB: CardData | null;
  onSelectCard?: (card: CardData) => void;
  onQuickTap: (card: CardData) => void;
  onLongPress: (card: CardData) => void;
  onDragEndToSlot: (card: CardData, targetSlot: "A" | "B") => void;
  isConnected: boolean;
  onClaimStarter?: () => void;
  isClaimingStarter?: boolean;
}

export function InventoryDrawer({
  cards,
  selectedA,
  selectedB,
  onQuickTap,
  onLongPress,
  onDragEndToSlot,
  isConnected,
  onClaimStarter,
  isClaimingStarter,
}: InventoryDrawerProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filteredCards = useMemo(() => {
    if (activeFilter === "ALL") return cards;
    if (activeFilter === "HYBRIDS") {
      return cards.filter(
        (c) => !BASE_ELEMENTS.includes(c.element as (typeof BASE_ELEMENTS)[number])
      );
    }
    return cards.filter((c) => c.element === activeFilter);
  }, [cards, activeFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 350, damping: 25 },
    },
  };

  return (
    <section className="relative w-full rounded-3xl border border-zinc-800/80 bg-[#0E1122]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Top Bar: Title, Count, Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isConnected ? "Tu Mazo de Runas" : "Mazo de Exhibición"}
            </h3>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-400">
              {filteredCards.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Arrastra una carta al altar para equipar · Toca para pantalla completa · Mantén (0.5s) para detalles
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("FIRE")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "FIRE"
                ? "bg-red-500 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            <FireIcon className="w-3.5 h-3.5 text-red-400" />
            <span>Fuego</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("WATER")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "WATER"
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            <WaterIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agua</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("EARTH")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "EARTH"
                ? "bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            <EarthIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tierra</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("AIR")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "AIR"
                ? "bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            <AirIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Viento</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("HYBRIDS")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "HYBRIDS"
                ? "bg-purple-500 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5 text-purple-300" />
            <span>Híbridos</span>
          </button>
        </div>
      </div>

      {/* Cards Grid with Staggered Framer Motion Animation */}
      <div className="pt-6">
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <span className="text-3xl mb-2">🃏</span>
            <p className="font-bold text-white text-sm">No hay cartas en esta categoría</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              {isConnected
                ? "Aún no posees cartas de este elemento. Reclama tu mazo inicial para comenzar."
                : "Conecta tu billetera para forjar nuevas cartas híbridas."}
            </p>
            {isConnected && onClaimStarter && (
              <button
                type="button"
                onClick={onClaimStarter}
                disabled={isClaimingStarter}
                className="mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isClaimingStarter ? "Acuñando Mazo Inicial..." : "✦ Reclamar Mazo Inicial (Gratis)"}
              </button>
            )}
          </div>
        ) : (
          <motion.div
            key={activeFilter}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center"
          >
            {filteredCards.map((card) => {
              const isSelectedA = selectedA?.id === card.id;
              const isSelectedB = selectedB?.id === card.id;
              const selectedSlot = isSelectedA ? "A" : isSelectedB ? "B" : null;

              return (
                <motion.div
                  key={card.id.toString()}
                  variants={itemVariants}
                  className="w-full flex justify-center"
                >
                  <CardItem
                    card={card}
                    selectedSlot={selectedSlot}
                    draggable={true}
                    onQuickTap={onQuickTap}
                    onLongPress={onLongPress}
                    onDragEndToSlot={onDragEndToSlot}
                    size="sm"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
