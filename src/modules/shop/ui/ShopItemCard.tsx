"use client";

import { motion } from "framer-motion";
import type { BoosterPackDefinition, SingleCardListing, CatalystItem } from "../domain/shop-types";
import { CardItem } from "@/modules/cards/ui/CardItem";
import { SparklesIcon, FireIcon } from "@/shared/ui/icons/Elements";

interface ShopItemCardProps {
  item: BoosterPackDefinition | SingleCardListing | CatalystItem;
  userXlm: number;
  isProcessing: boolean;
  onPurchase: () => void;
}

export function ShopItemCard({ item, userXlm, isProcessing, onPurchase }: ShopItemCardProps) {
  const canAfford = userXlm >= item.priceXlm;

  // RENDERIZADO: SOBRE DE REFUERZO (BOOSTER PACK)
  if (item.category === "PACKS") {
    const pack = item as BoosterPackDefinition;
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col justify-between rounded-3xl border border-zinc-800 bg-[#0F1326]/90 p-5 shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-950/40"
      >
        {/* Glow Header */}
        <div
          className={`absolute inset-x-0 -top-px h-1 rounded-t-3xl bg-gradient-to-r ${pack.accentColor}`}
        />

        <div>
          {/* Top Pack Badges */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
              <span>{pack.icon}</span>
              <span>{pack.rarityTier}</span>
            </span>

            <span className="text-[11px] font-mono font-bold text-zinc-400">
              {pack.cardCount} Runas
            </span>
          </div>

          {/* Central Pack Icon & Art Representation */}
          <div className="my-5 flex flex-col items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-indigo-950/60 to-purple-950/60 shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-4xl drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]">
                {pack.icon}
              </span>
              <div
                className="absolute inset-0 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: pack.glowColor }}
              />
            </div>

            <h4 className="mt-3 text-lg font-black text-white text-center tracking-tight">
              {pack.name}
            </h4>
            <span className="text-xs font-semibold text-cyan-400 text-center">
              {pack.subtitle}
            </span>
          </div>

          <p className="text-xs text-zinc-400 text-center line-clamp-2 mb-4">
            {pack.description}
          </p>

          {/* Details Pill */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 text-[10px] font-mono text-zinc-400">
            <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5">
              Rango: {pack.minTier} a {pack.maxTier}
            </span>
            <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5">
              Garantizada: {pack.guaranteedRarity}
            </span>
          </div>
        </div>

        {/* Pricing & Buy Action */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Precio</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold font-mono text-white">
                {pack.priceXlm.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-cyan-400">XLM</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!canAfford || isProcessing}
            onClick={onPurchase}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              canAfford
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95"
                : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{isProcessing ? "Comprando..." : canAfford ? "Adquirir" : "Sin XLM"}</span>
          </button>
        </div>
      </motion.div>
    );
  }

  // RENDERIZADO: CARTA INDIVIDUAL DEL MERCADO DIARIO (SINGLE)
  if (item.category === "SINGLES") {
    const single = item as SingleCardListing;
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col justify-between rounded-3xl border border-zinc-800 bg-[#0F1326]/90 p-4 shadow-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-950/40"
      >
        {/* Discount Badge */}
        {single.discountBadge && (
          <div className="absolute -top-2.5 right-4 z-20 rounded-full bg-gradient-to-r from-red-500 to-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-md">
            {single.discountBadge}
          </div>
        )}

        <div>
          {/* Card Item Preview */}
          <div className="flex justify-center my-2">
            <CardItem card={single.card} size="sm" variant="compact" />
          </div>

          {/* Lore / Description */}
          <div className="mt-3 text-center">
            <span className="text-[11px] font-semibold text-purple-300">
              {single.card.element} · Rango {single.card.tier}
            </span>
            <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">
              {single.card.lore || single.card.description}
            </p>
          </div>
        </div>

        {/* Pricing & Buy Action */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Precio</span>
              {single.originalPriceXlm && (
                <span className="text-[10px] line-through text-zinc-600 font-mono">
                  {single.originalPriceXlm.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold font-mono text-white">
                {single.priceXlm.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-purple-400">XLM</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!canAfford || isProcessing}
            onClick={onPurchase}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              canAfford
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:brightness-110 active:scale-95"
                : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
            }`}
          >
            <span>🎴</span>
            <span>{isProcessing ? "Comprando..." : canAfford ? "Comprar" : "Sin XLM"}</span>
          </button>
        </div>
      </motion.div>
    );
  }

  // RENDERIZADO: CATALIZADOR ALQUÍMICO
  const catalyst = item as CatalystItem;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col justify-between rounded-3xl border border-zinc-800 bg-[#0F1326]/90 p-5 shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-950/40"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
            <span>{catalyst.icon}</span>
            <span>Catalizador</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Consumible</span>
        </div>

        <div className="my-4 flex flex-col items-center justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 to-yellow-950/30 shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-4xl">{catalyst.icon}</span>
          </div>

          <h4 className="mt-3 text-base font-black text-white text-center tracking-tight">
            {catalyst.name}
          </h4>
          <span className="text-xs font-semibold text-amber-400 text-center">
            {catalyst.subtitle}
          </span>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-2.5 text-center text-xs text-amber-200 mb-3 font-semibold">
          {catalyst.effect}
        </div>

        <p className="text-xs text-zinc-400 text-center line-clamp-2">
          {catalyst.description}
        </p>
      </div>

      {/* Pricing & Buy Action */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Precio</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold font-mono text-white">
              {catalyst.priceXlm.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-amber-400">XLM</span>
          </div>
        </div>

        <button
          type="button"
          disabled={!canAfford || isProcessing}
          onClick={onPurchase}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            canAfford
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95"
              : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
          }`}
        >
          <FireIcon className="w-3.5 h-3.5 text-black" />
          <span>{isProcessing ? "Sintetizando..." : canAfford ? "Sintetizar" : "Sin XLM"}</span>
        </button>
      </div>
    </motion.div>
  );
}
