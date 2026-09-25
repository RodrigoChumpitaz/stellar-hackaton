"use client";

import { motion } from "framer-motion";
import type { CardElement, CardRarity } from "../domain/constants";
import type { Card, CardData } from "../domain/types";
import { useCardGestures } from "./hooks/useCardGestures";
import {
  FireIcon,
  WaterIcon,
  EarthIcon,
  AirIcon,
  SteamIcon,
  MagmaIcon,
  AetherIcon,
  SwordIcon,
  ShieldIcon,
} from "@/shared/ui/icons/Elements";

export type { Card, CardData };

export function ElementIcon({ element, className = "w-3 h-3" }: { element: CardElement | string; className?: string }) {
  switch (element) {
    case "FIRE":
      return <FireIcon className={className} />;
    case "WATER":
      return <WaterIcon className={className} />;
    case "EARTH":
      return <EarthIcon className={className} />;
    case "AIR":
      return <AirIcon className={className} />;
    case "STEAM":
    case "VAPOR":
      return <SteamIcon className={className} />;
    case "MAGMA":
      return <MagmaIcon className={className} />;
    default:
      return <AetherIcon className={className} />;
  }
}

export const ELEMENT_THEMES: Record<
  string,
  {
    border: string;
    glow: string;
    bg: string;
    accent: string;
    icon: string;
    badge: string;
  }
> = {
  FIRE: {
    border: "border-red-500/60 hover:border-red-400",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.25)]",
    bg: "from-red-950/40 via-zinc-900 to-black",
    accent: "text-red-400",
    icon: "🔥",
    badge: "bg-red-950/80 text-red-300 border-red-700/50",
  },
  WATER: {
    border: "border-cyan-500/60 hover:border-cyan-400",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.25)]",
    bg: "from-cyan-950/40 via-zinc-900 to-black",
    accent: "text-cyan-400",
    icon: "💧",
    badge: "bg-cyan-950/80 text-cyan-300 border-cyan-700/50",
  },
  EARTH: {
    border: "border-emerald-500/60 hover:border-emerald-400",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.25)]",
    bg: "from-emerald-950/40 via-zinc-900 to-black",
    accent: "text-emerald-400",
    icon: "🌿",
    badge: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
  },
  AIR: {
    border: "border-amber-400/60 hover:border-amber-300",
    glow: "shadow-[0_0_15px_rgba(251,191,36,0.25)]",
    bg: "from-amber-950/40 via-zinc-900 to-black",
    accent: "text-amber-400",
    icon: "⚡",
    badge: "bg-amber-950/80 text-amber-300 border-amber-700/50",
  },
  STEAM: {
    border: "border-purple-400/70 hover:border-purple-300",
    glow: "shadow-[0_0_20px_rgba(192,132,252,0.35)]",
    bg: "from-purple-950/50 via-zinc-900 to-cyan-950/40",
    accent: "text-purple-300",
    icon: "💨",
    badge: "bg-purple-950/80 text-purple-200 border-purple-500/60",
  },
  VAPOR: {
    border: "border-purple-400/70 hover:border-purple-300",
    glow: "shadow-[0_0_20px_rgba(192,132,252,0.35)]",
    bg: "from-purple-950/50 via-zinc-900 to-cyan-950/40",
    accent: "text-purple-300",
    icon: "💨",
    badge: "bg-purple-950/80 text-purple-200 border-purple-500/60",
  },
  MAGMA: {
    border: "border-orange-500/70 hover:border-orange-400",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.35)]",
    bg: "from-orange-950/50 via-zinc-900 to-red-950/40",
    accent: "text-orange-400",
    icon: "🌋",
    badge: "bg-orange-950/80 text-orange-200 border-orange-500/60",
  },
  AETHER: {
    border: "border-fuchsia-400/80 hover:border-fuchsia-300",
    glow: "shadow-[0_0_25px_rgba(232,121,249,0.45)]",
    bg: "from-fuchsia-950/50 via-purple-900/40 to-cyan-950/40",
    accent: "text-fuchsia-300",
    icon: "✦",
    badge: "bg-fuchsia-950/80 text-fuchsia-200 border-fuchsia-500/60",
  },
};

export const RARITY_THEMES: Record<
  CardRarity,
  {
    label: string;
    badge: string;
    border: string;
    glow: string;
    cardBg: string;
    isLegendary?: boolean;
    isEpic?: boolean;
    isCommon?: boolean;
    color: string;
  }
> = {
  COMMON: {
    label: "Común",
    badge: "text-zinc-400 bg-zinc-800/90 border-zinc-700/80",
    border: "border-zinc-700/70 hover:border-zinc-500",
    glow: "shadow-lg shadow-black/80", // Piedra mate oscura
    cardBg: "from-[#181a26] via-[#12131d] to-[#0b0c13]",
    isCommon: true,
    color: "text-zinc-400 border-zinc-700 bg-zinc-800/80",
  },
  UNCOMMON: {
    label: "Poco común",
    badge: "text-emerald-300 bg-emerald-950/90 border-emerald-600/70",
    border: "border-emerald-600/60 hover:border-emerald-400",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    cardBg: "from-[#0f241d] via-[#0a1813] to-[#06100c]",
    color: "text-emerald-400 border-emerald-600 bg-emerald-950/70",
  },
  RARE: {
    label: "Rara",
    badge: "text-cyan-200 bg-cyan-950/90 border-cyan-500/70 font-semibold",
    border: "border-cyan-500/80 hover:border-cyan-300",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.35)]",
    cardBg: "from-[#0c2238] via-[#081624] to-[#040e17]",
    color: "text-cyan-400 border-cyan-600 bg-cyan-950/70",
  },
  EPIC: {
    label: "Épica",
    badge: "text-purple-200 bg-purple-950/90 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)] font-bold",
    border: "border-purple-500/90 hover:border-purple-300 ring-1 ring-purple-500/40",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.45)]",
    cardBg: "from-[#240e3b] via-[#170926] to-[#0c0414]",
    isEpic: true,
    color: "text-purple-300 border-purple-500 bg-purple-950/70",
  },
  LEGENDARY: {
    label: "★ Legendaria",
    badge: "text-amber-200 bg-gradient-to-r from-amber-950 to-yellow-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] font-extrabold",
    border: "border-amber-400 ring-2 ring-amber-400/50 hover:border-yellow-200",
    glow: "shadow-[0_0_35px_rgba(245,158,11,0.6)]",
    cardBg: "from-[#332005] via-[#211402] to-[#120a01]",
    isLegendary: true,
    color: "text-amber-300 border-amber-500 bg-amber-950/70",
  },
};

export const RARITY_LABELS = RARITY_THEMES;


function resolveArtwork(card: CardData): string {
  if (card.image_url && card.image_url.startsWith("/")) {
    return card.image_url;
  }
  const el = card.element?.toUpperCase();
  if (el === "FIRE") return "/cards/ignis-sprite.png";
  if (el === "WATER") return "/cards/aqua-nymph.png";
  if (el === "EARTH") return "/cards/earth.svg";
  if (el === "AIR") return "/cards/air.svg";
  if (el === "STEAM" || el === "VAPOR") return "/cards/primordial-vapor.png";
  return card.image_url || "/cards/aether.svg";
}

export interface CardItemProps {
  card: CardData;
  onClick?: () => void;
  selectedSlot?: "A" | "B" | null;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  draggable?: boolean;
  onQuickTap?: (card: CardData) => void;
  onLongPress?: (card: CardData) => void;
  onDragEndToSlot?: (card: CardData, targetSlot: "A" | "B") => void;
  onDragEndToDrawer?: (card: CardData) => void;
  actionButton?: React.ReactNode;
}

export function CardItem({
  card,
  onClick,
  selectedSlot,
  disabled = false,
  size = "md",
  draggable = false,
  onQuickTap,
  onLongPress,
  onDragEndToSlot,
  onDragEndToDrawer,
  actionButton,
}: CardItemProps) {
  const theme = ELEMENT_THEMES[card.element] || ELEMENT_THEMES.AETHER;
  const rarity = RARITY_LABELS[card.rarity as CardRarity] || RARITY_LABELS.COMMON;
  const artwork = resolveArtwork(card);

  const isSmall = size === "sm";
  const isLarge = size === "lg";

  // Encapsulated gesture detection hook
  const {
    handleClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleDragStart,
    handleDragEnd,
  } = useCardGestures({
    card,
    onClick,
    onQuickTap,
    onLongPress,
    onDragEndToSlot,
    onDragEndToDrawer,
  });

  return (
    <motion.article
      drag={draggable && !disabled}
      dragSnapToOrigin={true}
      dragElastic={0}
      dragMomentum={false}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -4 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      whileDrag={{ scale: 1.08, zIndex: 99999, cursor: "grabbing" }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 select-none touch-none ${
        rarity.border
      } ${rarity.glow} ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : draggable
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-pointer"
      } ${
        selectedSlot
          ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#0A0C18] scale-[1.03] shadow-[0_0_25px_#00e5ff]"
          : ""
      } ${
        isSmall
          ? "w-36 h-52 sm:w-40 sm:h-56"
          : isLarge
          ? "w-60 h-84 sm:w-68 sm:h-96"
          : "w-44 h-64 sm:w-48 sm:h-70"
      } bg-[#0A0C18] shadow-2xl`}
    >
      {/* FULL-ART CARD ARTWORK: Fills the entire card face edge-to-edge */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artwork}
        alt={card.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 pointer-events-none"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `/cards/${card.element.toLowerCase()}.svg`;
        }}
      />

      {/* Top & Bottom Vignettes for maximum text contrast and depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/90" />

      {/* Foil / Holographic Sheen effects across full artwork */}
      {rarity.isLegendary && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-amber-300/25 to-transparent animate-[pulse_3s_ease-in-out_infinite] mix-blend-color-dodge" />
      )}
      {rarity.isEpic && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-purple-400/20 to-transparent animate-[pulse_4s_ease-in-out_infinite] mix-blend-screen" />
      )}

      {/* Selected Slot Indicator */}
      {selectedSlot && (
        <div className="absolute top-2.5 right-2.5 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 font-black text-black text-xs shadow-[0_0_15px_#00e5ff] animate-pulse">
          {selectedSlot}
        </div>
      )}

      {/* MINIMALIST FLOATING HEADER: Element Rune Orb & Rarity Pill */}
      <div className="relative z-10 flex items-center justify-between p-2 sm:p-2.5 pointer-events-none">
        {/* Element Rune Bubble */}
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-black/60 border ${theme.badge} shadow-md`}
        >
          <ElementIcon element={card.element} className="w-3 h-3" />
          <span>{card.element}</span>
        </div>

        {/* Rarity Jewel */}
        <div
          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 border ${rarity.badge} shadow-md`}
        >
          {rarity.label}
        </div>
      </div>

      {/* Center Token ID badge (discreet) */}
      {card.token_id !== undefined && card.token_id !== null && (
        <div className="relative z-10 self-end mr-2 -mt-1 pointer-events-none">
          <span className="font-mono text-[9px] font-bold text-zinc-300/80 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/5">
            #{card.token_id.toString()}
          </span>
        </div>
      )}

      {/* BOTTOM GLASS PLAQUE: Card Name & Punchy Combat Jewels */}
      <div className="relative z-10 p-1.5 sm:p-2">
        <div className="rounded-xl border border-white/10 bg-black/75 p-2 backdrop-blur-md shadow-2xl flex flex-col gap-1.5">
          {/* Card Name */}
          <h4
            className="font-black text-white tracking-tight line-clamp-1 text-xs sm:text-[13px] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            title={card.name}
          >
            {card.name}
          </h4>

          {/* Combat Badges (ATK / DEF / Speed) */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/10">
            {/* ATK Ruby Jewel */}
            <div
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-950/80 border border-red-500/50 py-0.5 px-1 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
              title={`Ataque: ${card.atk}`}
            >
              <SwordIcon className="w-3 h-3 text-red-400 shrink-0" />
              <span className="font-mono font-black text-red-100 text-xs sm:text-[13px] leading-none">
                {card.atk}
              </span>
            </div>

            {/* DEF Sapphire Jewel */}
            <div
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 py-0.5 px-1 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
              title={`Defensa: ${card.def}`}
            >
              <ShieldIcon className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="font-mono font-black text-cyan-100 text-xs sm:text-[13px] leading-none">
                {card.def}
              </span>
            </div>

            {/* SPD Spark (if present) */}
            {card.speed !== undefined && (
              <div
                className="flex items-center justify-center gap-0.5 rounded-lg bg-amber-950/80 border border-amber-500/40 py-0.5 px-1.5 text-amber-300 font-mono text-[10px] font-bold"
                title={`Velocidad: ${card.speed}`}
              >
                <span>⚡</span>
                <span>{card.speed}</span>
              </div>
            )}
          </div>

          {/* Optional Action Button for custom integrations (e.g. Deck Builder) */}
          {actionButton && (
            <div className="pt-1 pointer-events-auto">
              {actionButton}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

