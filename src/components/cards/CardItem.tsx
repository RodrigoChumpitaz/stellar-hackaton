"use client";

import { useRef, useCallback } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { CardElement, CardRarity } from "@/lib/cards/constants";
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
} from "@/components/icons/Elements";

export function ElementIcon({ element, className = "w-3 h-3" }: { element: string; className?: string }) {
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

export interface CardData {
  id: string | number;
  name: string;
  element: CardElement;
  rarity: CardRarity;
  atk: number;
  def: number;
  image_url?: string | null;
  lore?: string | null;
  description?: string | null;
  passive_skill?: string | null;
  token_id?: number | bigint | null;
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

export const RARITY_LABELS: Record<CardRarity, { label: string; color: string }> = {
  COMMON: { label: "Común", color: "text-zinc-400 border-zinc-700 bg-zinc-800/80" },
  UNCOMMON: { label: "Poco común", color: "text-emerald-400 border-emerald-600 bg-emerald-950/70" },
  RARE: { label: "Rara", color: "text-cyan-400 border-cyan-600 bg-cyan-950/70" },
  EPIC: { label: "Épica", color: "text-purple-300 border-purple-500 bg-purple-950/70" },
  LEGENDARY: { label: "Legendaria", color: "text-amber-300 border-amber-500 bg-amber-950/70" },
};

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
}: CardItemProps) {
  const theme = ELEMENT_THEMES[card.element] || ELEMENT_THEMES.AETHER;
  const rarity = RARITY_LABELS[card.rarity] || RARITY_LABELS.COMMON;
  const artwork = resolveArtwork(card);

  const isSmall = size === "sm";
  const isLarge = size === "lg";

  // Gesture detection refs
  const pointerStartTimeRef = useRef<number>(0);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasDraggedRef = useRef<boolean>(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartTimeRef.current = Date.now();
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;

    // Start 500ms timer for Long-Press (Details Modal)
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      if (!hasDraggedRef.current) {
        onLongPress?.(card);
      }
    }, 500);
  }, [card, onLongPress]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const dist = Math.hypot(
      e.clientX - pointerStartPosRef.current.x,
      e.clientY - pointerStartPosRef.current.y
    );
    // If pointer moves more than 8px, cancel long-press and mark as drag intention
    if (dist > 8) {
      hasDraggedRef.current = true;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const elapsed = Date.now() - pointerStartTimeRef.current;
    // If not dragged and released before 350ms -> Quick Tap (Fullscreen Appreciation)
    if (!hasDraggedRef.current && elapsed < 350) {
      if (onQuickTap) {
        onQuickTap(card);
      } else if (onClick) {
        onClick();
      }
    }
  }, [card, onClick, onQuickTap]);

  // Framer Motion Drag End detection for Slot A or Slot B
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!onDragEndToSlot) return;

    const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const clientX = info.point.x - scrollX;
    const clientY = info.point.y - scrollY;

    // Check elements under drop point using both viewport client coordinates and point
    const elements = typeof document !== "undefined" && document.elementsFromPoint
      ? [
          ...document.elementsFromPoint(clientX, clientY),
          ...document.elementsFromPoint(info.point.x, info.point.y),
        ]
      : [];
    let targetSlot: "A" | "B" | null = null;

    for (const el of elements) {
      const slotEl = el.closest ? el.closest("[data-drop-slot]") : null;
      const slotAttr = slotEl?.getAttribute("data-drop-slot") || el.getAttribute("data-drop-slot");
      if (slotAttr === "A" || slotAttr === "B") {
        targetSlot = slotAttr as "A" | "B";
        break;
      }
    }

    // Direct bounding rect fallback comparing both client and page coordinates
    if (!targetSlot && typeof document !== "undefined") {
      const slotAElem = document.querySelector('[data-drop-slot="A"]');
      const slotBElem = document.querySelector('[data-drop-slot="B"]');
      if (slotAElem) {
        const rect = slotAElem.getBoundingClientRect();
        const inClient =
          clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
        const inPage =
          info.point.x >= rect.left + scrollX &&
          info.point.x <= rect.right + scrollX &&
          info.point.y >= rect.top + scrollY &&
          info.point.y <= rect.bottom + scrollY;
        if (inClient || inPage) {
          targetSlot = "A";
        }
      }
      if (!targetSlot && slotBElem) {
        const rect = slotBElem.getBoundingClientRect();
        const inClient =
          clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
        const inPage =
          info.point.x >= rect.left + scrollX &&
          info.point.x <= rect.right + scrollX &&
          info.point.y >= rect.top + scrollY &&
          info.point.y <= rect.bottom + scrollY;
        if (inClient || inPage) {
          targetSlot = "B";
        }
      }
    }

    if (targetSlot) {
      onDragEndToSlot(card, targetSlot);
    }
  };

  return (
    <motion.article
      layout
      drag={draggable && !disabled}
      dragSnapToOrigin={true}
      dragElastic={0.35}
      dragMomentum={false}
      onDragStart={() => {
        hasDraggedRef.current = true;
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -4 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileDrag={{ scale: 1.08, zIndex: 60, cursor: "grabbing" }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-colors duration-200 select-none ${
        theme.border
      } ${theme.glow} ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : draggable
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-pointer"
      } ${
        selectedSlot
          ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0A0C18] scale-[1.02]"
          : ""
      } ${isSmall ? "w-40" : isLarge ? "w-64 sm:w-72" : "w-48 sm:w-52"} bg-gradient-to-b ${
        theme.bg
      }`}
    >
      {/* Selected Slot Indicator */}
      {selectedSlot && (
        <div className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 font-extrabold text-black text-[11px] shadow-[0_0_10px_#00e5ff] animate-pulse">
          {selectedSlot}
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between p-2.5 z-10 pointer-events-none">
        <span
          className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${theme.badge}`}
        >
          <ElementIcon element={card.element} className="w-3 h-3" />
          <span>{card.element}</span>
        </span>
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${rarity.color}`}
        >
          {rarity.label}
        </span>
      </div>

      {/* Card Artwork Image Container */}
      <div className="relative mx-2 aspect-[4/3] overflow-hidden rounded-xl bg-black/60 ring-1 ring-white/10 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artwork}
          alt={card.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `/cards/${card.element.toLowerCase()}.svg`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {card.token_id !== undefined && card.token_id !== null && (
          <span className="absolute bottom-1.5 left-2 font-mono text-[10px] text-zinc-300 font-bold bg-black/70 px-1.5 py-0.5 rounded backdrop-blur">
            #{card.token_id.toString()}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col justify-between flex-1 gap-2 z-10 pointer-events-none">
        <div>
          <h4 className="font-bold text-white tracking-tight line-clamp-1 text-sm sm:text-base">
            {card.name}
          </h4>
          {(card.description || card.lore) && (
            <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2 leading-tight italic">
              {card.description || card.lore}
            </p>
          )}
        </div>

        {/* Stats Pill (ATK / DEF) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 rounded-lg bg-red-950/40 border border-red-500/30 px-2 py-1">
            <SwordIcon className="w-3.5 h-3.5 text-red-400" />
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-[10px] text-zinc-400">ATK</span>
              <span className="font-extrabold text-red-300 text-xs sm:text-sm">{card.atk}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 px-2 py-1">
            <ShieldIcon className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-[10px] text-zinc-400">DEF</span>
              <span className="font-extrabold text-cyan-300 text-xs sm:text-sm">{card.def}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
