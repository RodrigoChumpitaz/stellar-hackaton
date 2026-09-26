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
  SparklesIcon,
} from "@/shared/ui/icons/Elements";

import { rarityToTier } from "@/modules/forge/domain/forge-rules";

export type { Card, CardData };

export function ElementIcon({ element, className = "w-3 h-3" }: { element: CardElement | string; className?: string }) {
  switch (element) {
    case "FIRE":
    case "INFERNO":
    case "PLASMA":
    case "SOLAR":
      return <FireIcon className={className} />;
    case "WATER":
    case "TSUNAMI":
    case "GLACIER":
    case "ABYSS":
      return <WaterIcon className={className} />;
    case "EARTH":
    case "STONK":
    case "LIVING_STONE":
    case "OBSIDIAN":
      return <EarthIcon className={className} />;
    case "AIR":
    case "TEMPEST":
    case "CYCLONE":
    case "LIGHTNING":
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
  LIGHTNING: {
    border: "border-yellow-400/70 hover:border-yellow-300",
    glow: "shadow-[0_0_20px_rgba(250,204,21,0.35)]",
    bg: "from-yellow-950/50 via-zinc-900 to-amber-950/40",
    accent: "text-yellow-400",
    icon: "⚡",
    badge: "bg-yellow-950/80 text-yellow-200 border-yellow-500/60",
  },
  NATURE: {
    border: "border-emerald-500/70 hover:border-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
    bg: "from-emerald-950/50 via-zinc-900 to-green-950/40",
    accent: "text-emerald-400",
    icon: "🍃",
    badge: "bg-emerald-950/80 text-emerald-200 border-emerald-500/60",
  },
  ICE: {
    border: "border-sky-400/70 hover:border-sky-300",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
    bg: "from-sky-950/50 via-zinc-900 to-cyan-950/40",
    accent: "text-sky-300",
    icon: "❄️",
    badge: "bg-sky-950/80 text-sky-200 border-sky-500/60",
  },
  SAND: {
    border: "border-amber-600/70 hover:border-amber-500",
    glow: "shadow-[0_0_20px_rgba(217,119,6,0.35)]",
    bg: "from-amber-950/50 via-zinc-900 to-stone-950/40",
    accent: "text-amber-400",
    icon: "⏳",
    badge: "bg-amber-950/80 text-amber-200 border-amber-600/60",
  },
  STONK: {
    border: "border-emerald-400/80 hover:border-emerald-300",
    glow: "shadow-[0_0_25px_rgba(52,211,153,0.45)]",
    bg: "from-emerald-950/60 via-zinc-900 to-teal-950/40",
    accent: "text-emerald-300",
    icon: "📈",
    badge: "bg-emerald-950/90 text-emerald-200 border-emerald-400/60",
  },
  OBSIDIAN: {
    border: "border-purple-600/80 hover:border-purple-500",
    glow: "shadow-[0_0_25px_rgba(147,51,234,0.45)]",
    bg: "from-black via-zinc-950 to-purple-950/40",
    accent: "text-purple-300",
    icon: "🗡️",
    badge: "bg-zinc-950/90 text-purple-200 border-purple-600/60",
  },
  LIVING_STONE: {
    border: "border-stone-400/80 hover:border-stone-300",
    glow: "shadow-[0_0_25px_rgba(168,162,158,0.4)]",
    bg: "from-stone-950/60 via-zinc-900 to-emerald-950/40",
    accent: "text-stone-300",
    icon: "🗿",
    badge: "bg-stone-950/90 text-stone-200 border-stone-500/60",
  },
  INFERNO: {
    border: "border-red-600/90 hover:border-red-500",
    glow: "shadow-[0_0_25px_rgba(220,38,38,0.5)]",
    bg: "from-red-950/70 via-zinc-900 to-black",
    accent: "text-red-400",
    icon: "🔥",
    badge: "bg-red-950/90 text-red-200 border-red-500/70",
  },
  PLASMA: {
    border: "border-violet-500/90 hover:border-violet-400",
    glow: "shadow-[0_0_25px_rgba(139,92,246,0.5)]",
    bg: "from-violet-950/70 via-zinc-900 to-black",
    accent: "text-violet-300",
    icon: "⚡",
    badge: "bg-violet-950/90 text-violet-200 border-violet-500/70",
  },
  TSUNAMI: {
    border: "border-blue-500/90 hover:border-blue-400",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.5)]",
    bg: "from-blue-950/70 via-zinc-900 to-black",
    accent: "text-blue-300",
    icon: "🌊",
    badge: "bg-blue-950/90 text-blue-200 border-blue-500/70",
  },
  GLACIER: {
    border: "border-cyan-300/90 hover:border-cyan-200",
    glow: "shadow-[0_0_25px_rgba(103,232,249,0.5)]",
    bg: "from-cyan-950/70 via-zinc-900 to-black",
    accent: "text-cyan-200",
    icon: "🧊",
    badge: "bg-cyan-950/90 text-cyan-200 border-cyan-400/70",
  },
  TEMPEST: {
    border: "border-teal-400/90 hover:border-teal-300",
    glow: "shadow-[0_0_25px_rgba(45,212,191,0.5)]",
    bg: "from-teal-950/70 via-zinc-900 to-black",
    accent: "text-teal-300",
    icon: "🌪️",
    badge: "bg-teal-950/90 text-teal-200 border-teal-400/70",
  },
  CYCLONE: {
    border: "border-amber-300/90 hover:border-amber-200",
    glow: "shadow-[0_0_25px_rgba(252,211,77,0.5)]",
    bg: "from-amber-950/70 via-zinc-900 to-black",
    accent: "text-amber-200",
    icon: "🌀",
    badge: "bg-amber-950/90 text-amber-200 border-amber-400/70",
  },
  AETHER: {
    border: "border-fuchsia-400/80 hover:border-fuchsia-300",
    glow: "shadow-[0_0_25px_rgba(232,121,249,0.45)]",
    bg: "from-fuchsia-950/50 via-purple-900/40 to-cyan-950/40",
    accent: "text-fuchsia-300",
    icon: "✦",
    badge: "bg-fuchsia-950/80 text-fuchsia-200 border-fuchsia-500/60",
  },
  CELESTIAL: {
    border: "border-yellow-200/90 hover:border-yellow-100",
    glow: "shadow-[0_0_35px_rgba(254,240,138,0.7)]",
    bg: "from-yellow-950/60 via-purple-950 to-indigo-950/60",
    accent: "text-yellow-100",
    icon: "☀️",
    badge: "bg-yellow-950/90 text-yellow-200 border-yellow-400/80",
  },
  VOID: {
    border: "border-indigo-600/90 hover:border-indigo-500",
    glow: "shadow-[0_0_35px_rgba(79,70,229,0.7)]",
    bg: "from-black via-zinc-950 to-indigo-950/50",
    accent: "text-indigo-300",
    icon: "🌌",
    badge: "bg-black text-indigo-200 border-indigo-500/80",
  },
  CHRONOS: {
    border: "border-cyan-400/90 hover:border-cyan-300",
    glow: "shadow-[0_0_35px_rgba(34,211,238,0.7)]",
    bg: "from-cyan-950/60 via-zinc-900 to-indigo-950/60",
    accent: "text-cyan-200",
    icon: "⌛",
    badge: "bg-cyan-950/90 text-cyan-200 border-cyan-400/80",
  },
  COSMOS: {
    border: "border-pink-500/90 hover:border-pink-400",
    glow: "shadow-[0_0_35px_rgba(236,72,153,0.7)]",
    bg: "from-pink-950/60 via-purple-950 to-indigo-950/60",
    accent: "text-pink-200",
    icon: "🌠",
    badge: "bg-pink-950/90 text-pink-200 border-pink-500/80",
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
    glow: "shadow-lg shadow-black/80",
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

/** Estilo visual para los 30 Rangos Alfanuméricos (F- a L+) */
export function getTierBadgeStyle(tierStr?: string): { badge: string; border: string; glow: string; label: string } {
  const tier = (tierStr || "F").toUpperCase();
  if (tier.startsWith("L")) {
    return {
      label: tier,
      badge: "text-fuchsia-100 bg-gradient-to-r from-purple-950 via-indigo-950 to-pink-950 border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.8)] font-black animate-pulse",
      border: "border-fuchsia-400 ring-2 ring-fuchsia-400/50",
      glow: "shadow-[0_0_35px_rgba(232,121,249,0.6)]",
    };
  }
  if (tier.startsWith("SSS")) {
    return {
      label: tier,
      badge: "text-amber-200 bg-gradient-to-r from-amber-950 to-yellow-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)] font-extrabold",
      border: "border-amber-400 ring-2 ring-amber-400/50",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.6)]",
    };
  }
  if (tier.startsWith("SS")) {
    return {
      label: tier,
      badge: "text-rose-200 bg-rose-950/90 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] font-bold",
      border: "border-rose-500 ring-1 ring-rose-500/40",
      glow: "shadow-[0_0_25px_rgba(244,63,94,0.45)]",
    };
  }
  if (tier.startsWith("S")) {
    return {
      label: tier,
      badge: "text-purple-200 bg-purple-950/90 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)] font-bold",
      border: "border-purple-500/90 hover:border-purple-300 ring-1 ring-purple-500/40",
      glow: "shadow-[0_0_25px_rgba(168,85,247,0.45)]",
    };
  }
  if (tier.startsWith("A")) {
    return {
      label: tier,
      badge: "text-cyan-200 bg-cyan-950/90 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] font-bold",
      border: "border-cyan-500/80 hover:border-cyan-300",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.35)]",
    };
  }
  if (tier.startsWith("B")) {
    return {
      label: tier,
      badge: "text-blue-300 bg-blue-950/90 border-blue-500/70 font-semibold",
      border: "border-blue-500/70 hover:border-blue-400",
      glow: "shadow-[0_0_18px_rgba(59,130,246,0.3)]",
    };
  }
  if (tier.startsWith("C")) {
    return {
      label: tier,
      badge: "text-teal-300 bg-teal-950/90 border-teal-500/70 font-semibold",
      border: "border-teal-500/70 hover:border-teal-400",
      glow: "shadow-[0_0_15px_rgba(20,184,166,0.25)]",
    };
  }
  if (tier.startsWith("D")) {
    return {
      label: tier,
      badge: "text-emerald-300 bg-emerald-950/90 border-emerald-600/70 font-semibold",
      border: "border-emerald-600/60 hover:border-emerald-400",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    };
  }
  if (tier.startsWith("E")) {
    return {
      label: tier,
      badge: "text-amber-400 bg-amber-950/80 border-amber-700/70 font-semibold",
      border: "border-amber-700/60 hover:border-amber-500",
      glow: "shadow-[0_0_12px_rgba(217,119,6,0.2)]",
    };
  }
  return {
    label: tier,
    badge: "text-zinc-300 bg-zinc-800/90 border-zinc-700/80 font-bold",
    border: "border-zinc-700/70 hover:border-zinc-500",
    glow: "shadow-lg shadow-black/80",
  };
}

function resolveArtwork(card: CardData): string {
  if (card.image_url && card.image_url.startsWith("/")) {
    return card.image_url;
  }
  const el = card.element?.toUpperCase();
  if (el === "FIRE" || el === "INFERNO" || el === "PLASMA") return "/cards/ignis-sprite.png";
  if (el === "WATER" || el === "TSUNAMI" || el === "GLACIER") return "/cards/aqua-nymph.png";
  if (el === "EARTH" || el === "STONK" || el === "OBSIDIAN" || el === "LIVING_STONE") return "/cards/earth.svg";
  if (el === "AIR" || el === "TEMPEST" || el === "CYCLONE") return "/cards/air.svg";
  if (el === "STEAM" || el === "VAPOR") return "/cards/primordial-vapor.png";
  return card.image_url || "/cards/aether.svg";
}

export interface CardItemProps {
  card: CardData;
  onClick?: () => void;
  selectedSlot?: "A" | "B" | null;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "compact" | "detailed";
  className?: string;
  draggable?: boolean;
  onQuickTap?: (card: CardData) => void;
  onLongPress?: (card: CardData) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragEndToSlot?: (card: CardData, targetSlot: "A" | "B") => void;
  onDragEndToDrawer?: (card: CardData) => void;
  onDragEndToDeckSlot?: (card: CardData, slotIdx: number) => void;
  onDragEndRemoveFromDeck?: (card: CardData) => void;
  actionButton?: React.ReactNode;
}

export function CardItem({
  card,
  onClick,
  selectedSlot,
  disabled = false,
  size = "md",
  variant = "compact",
  className = "",
  draggable = false,
  onQuickTap,
  onLongPress,
  onDragStart,
  onDragEnd,
  onDragEndToSlot,
  onDragEndToDrawer,
  onDragEndToDeckSlot,
  onDragEndRemoveFromDeck,
  actionButton,
}: CardItemProps) {
  const theme = ELEMENT_THEMES[card.element] || ELEMENT_THEMES.AETHER;
  const rarity = RARITY_LABELS[card.rarity as CardRarity] || RARITY_LABELS.COMMON;
  const displayTier = card.tier || rarityToTier(card.rarity as CardRarity);
  const tierStyle = getTierBadgeStyle(displayTier);
  const artwork = resolveArtwork(card);

  const isDetailed = variant === "detailed";
  const isSmall = size === "sm" && !isDetailed;
  const isLarge = size === "lg" && !isDetailed;

  const hasPassive = Boolean(card.passive || card.passive_skill);
  const hasActive = Boolean(card.active);
  const hasSkills = hasPassive || hasActive;

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
    onDragStart,
    onDragEnd,
    onDragEndToSlot,
    onDragEndToDrawer,
    onDragEndToDeckSlot,
    onDragEndRemoveFromDeck,
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
      className={`group relative flex flex-col justify-between overflow-hidden transition-all duration-300 select-none ${
        isDetailed ? "rounded-3xl border-2" : "rounded-2xl border touch-none"
      } ${tierStyle.border || rarity.border} ${tierStyle.glow || rarity.glow} ${
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
        isDetailed
          ? "w-[330px] sm:w-[420px] md:w-[450px] h-[540px] sm:h-[620px] max-h-[85vh] shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
          : isSmall
          ? "w-full max-w-[140px] aspect-[5/7]"
          : isLarge
          ? "w-64 h-88 sm:w-80 sm:h-[450px]"
          : "w-48 h-70 sm:w-60 sm:h-84"
      } bg-[#0A0C18] shadow-2xl ${className}`}
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

      {/* MINIMALIST FLOATING HEADER: Pure Element Icon Orb & 30-Tier Jewel */}
      <div
        className={`relative z-10 flex items-center justify-between pointer-events-none ${
          isDetailed ? "p-3 sm:p-4" : "p-2 sm:p-2.5"
        }`}
      >
        {/* Pure Iconographic Rune Orb */}
        <div
          className={`flex items-center gap-1.5 rounded-full ${
            isDetailed ? "px-3 py-1.5" : "p-1.5"
          } backdrop-blur-md bg-black/75 border ${theme.badge} shadow-lg`}
          title={`Elemento: ${card.element}`}
        >
          <ElementIcon element={card.element} className={isDetailed ? "w-4 h-4" : "w-3.5 h-3.5"} />
          {isDetailed && (
            <span className={`text-xs font-black tracking-wider ${theme.accent}`}>
              {card.element}
            </span>
          )}
        </div>

        {/* 30-Tier Alphanumeric Category Pill (Pure Abecedario) */}
        <div
          className={`flex items-center justify-center rounded-full ${
            isDetailed ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10px] sm:text-[11px]"
          } font-black font-mono uppercase tracking-wider backdrop-blur-md bg-black/80 border ${tierStyle.badge} shadow-md`}
        >
          <span>{isDetailed ? `Rango ${displayTier}` : displayTier}</span>
        </div>
      </div>

      {/* Center Token ID badge (discreet) */}
      {card.token_id !== undefined && card.token_id !== null && !isDetailed && (
        <div className="relative z-10 self-end mr-2 -mt-1 pointer-events-none">
          <span className="font-mono text-[9px] font-bold text-zinc-300/80 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/5">
            #{card.token_id.toString()}
          </span>
        </div>
      )}

      {/* BOTTOM GLASS PLAQUE: Compact for Deck/Catalog, Detailed for Inspection */}
      <div className={`relative z-10 ${isDetailed ? "p-2.5 sm:p-3.5" : "p-1.5 sm:p-2"}`}>
        {isDetailed ? (
          <div className="rounded-2xl border border-white/15 bg-black/80 p-3 sm:p-4 backdrop-blur-xl shadow-2xl flex flex-col gap-2.5">
            {/* Card Name & Token ID & Ascension */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg sm:text-xl tracking-tight drop-shadow-md">
                  {card.name}
                </h3>
                {card.token_id !== undefined && card.token_id !== null && (
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                    #{card.token_id.toString()}
                  </span>
                )}
              </div>
              {card.prestige_level !== undefined && card.prestige_level > 0 && (
                <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/30 border border-amber-400/60 px-2.5 py-0.5 text-[10px] font-black text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  ★ Ascensión {card.prestige_level}
                </span>
              )}
            </div>

            {/* Lore / Description */}
            {(card.description || card.lore) && (
              <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-cyan-400/40 pl-2">
                &ldquo;{card.description || card.lore}&rdquo;
              </p>
            )}

            {/* 4 Core Combat Stats (ATK, DEF, SPD, PWR) */}
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/10">
              {/* ATK */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-red-950/80 border border-red-500/40 p-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                  <SwordIcon className="w-3 h-3" />
                  <span>ATK</span>
                </div>
                <span className="font-mono text-sm sm:text-base font-black text-red-200">
                  {card.atk}
                </span>
              </div>

              {/* DEF */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-500/40 p-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <div className="flex items-center gap-1 text-cyan-400 text-[10px] font-bold">
                  <ShieldIcon className="w-3 h-3" />
                  <span>DEF</span>
                </div>
                <span className="font-mono text-sm sm:text-base font-black text-cyan-200">
                  {card.def}
                </span>
              </div>

              {/* SPD */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-amber-950/80 border border-amber-500/40 p-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                  <span className="text-xs">⚡</span>
                  <span>SPD</span>
                </div>
                <span className="font-mono text-sm sm:text-base font-black text-amber-200">
                  {card.speed ?? 5}
                </span>
              </div>

              {/* PWR */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-purple-950/80 border border-purple-500/40 p-1.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <div className="flex items-center gap-1 text-purple-400 text-[10px] font-bold">
                  <span className="text-xs">🏆</span>
                  <span>PWR</span>
                </div>
                <span className="font-mono text-sm sm:text-base font-black text-purple-200">
                  {card.power_score ?? Number((card.atk + card.def + (card.speed ?? 5) * 0.5).toFixed(1))}
                </span>
              </div>
            </div>

            {/* Tactical Skills Section (Pasiva izquierda, Activa derecha - solo si cuentan con estas) */}
            {hasSkills && (
              <div
                className={`grid gap-2 pt-1 border-t border-white/10 ${
                  hasPassive && hasActive ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                {/* Passive Skill */}
                {hasPassive && (
                  <div className="rounded-xl border border-purple-500/30 bg-purple-950/40 p-2 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] sm:text-[11px] font-bold text-white flex items-center gap-1">
                          <SparklesIcon className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">{card.passive?.name || "Habilidad Pasiva"}</span>
                        </span>
                        <span className="rounded bg-zinc-800 px-1 py-0.2 text-[8px] sm:text-[9px] font-mono text-purple-300 border border-purple-500/40 shrink-0">
                          {card.passive?.trigger || "PASIVA"}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-300 leading-snug">
                        {card.passive?.description || card.passive_skill}
                      </p>
                    </div>
                  </div>
                )}

                {/* Active Skill */}
                {hasActive && card.active && (
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-2 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] sm:text-[11px] font-bold text-cyan-200 flex items-center gap-1">
                          <span className="text-xs shrink-0">🔮</span>
                          <span className="truncate">{card.active.name}</span>
                        </span>
                        <span className="rounded bg-cyan-900/50 px-1 py-0.2 text-[8px] sm:text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/40 shrink-0">
                          {card.active.energy_cost} Éter
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-300 leading-snug">
                        {card.active.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/75 p-2 backdrop-blur-md shadow-2xl flex flex-col gap-1.5">
            {/* Card Name */}
            <h4
              className="font-black text-white tracking-tight line-clamp-1 text-xs sm:text-[13px] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              title={card.name}
            >
              {card.name}
            </h4>

            {/* Progressive Skill Badge (if unlocked) */}
            {(card.skills?.[0] || card.passive_skill) && (
              <div className="flex items-center gap-1 text-[10px] text-purple-300 font-semibold line-clamp-1 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                <span className="text-amber-400">✦</span>
                <span className="truncate">{card.skills?.[0] || card.passive_skill}</span>
              </div>
            )}

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
        )}
      </div>
    </motion.article>
  );
}

