"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardData } from "../domain/types";
import type { CardRarity } from "../domain/constants";
import { ELEMENT_THEMES, RARITY_LABELS, ElementIcon } from "./CardItem";
import { SwordIcon, ShieldIcon, SparklesIcon } from "@/shared/ui/icons/Elements";

interface CardInspectModalProps {
  card: CardData | null;
  onClose: () => void;
}

export function CardInspectModal({ card, onClose }: CardInspectModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

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
  const rarity = RARITY_LABELS[card.rarity as CardRarity] || RARITY_LABELS.COMMON;
  const artwork = card.image_url || `/cards/${card.element.toLowerCase()}.svg`;

  // Dynamic 3D tilt calculation based on cursor position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 15; // Max 15 deg tilt
    const rotY = ((x - centerX) / centerX) * 15;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
        {/* Backdrop click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Ambient Element Glow */}
        <div
          className={`absolute h-96 w-96 rounded-full opacity-30 blur-[120px] pointer-events-none ${
            card.element === "FIRE"
              ? "bg-red-500"
              : card.element === "WATER"
              ? "bg-cyan-500"
              : card.element === "EARTH"
              ? "bg-emerald-500"
              : card.element === "AIR"
              ? "bg-amber-400"
              : "bg-purple-500"
          }`}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="relative flex flex-col items-center max-w-sm sm:max-w-md w-full z-10"
        >
          {/* Top Controls: Banner & Close */}
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <SparklesIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span>APRECIACIÓN DE RUNA</span>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-lg"
            >
              ✕
            </button>
          </div>

          {/* 3D Tilt Card Frame */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: "transform 0.1s ease-out",
            }}
            className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 p-1.5 w-72 sm:w-80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none bg-gradient-to-b ${theme.bg} ${theme.border} ${theme.glow}`}
          >
            {/* Holographic Glare Overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl opacity-40 mix-blend-color-dodge transition-opacity"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)`,
              }}
            />

            {/* Header Info */}
            <div className="flex items-center justify-between p-3 z-10">
              <span
                className={`flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-bold border ${theme.badge}`}
              >
                <ElementIcon element={card.element} className="w-3.5 h-3.5" />
                <span>{card.element}</span>
              </span>
              <span
                className={`rounded-lg px-2 py-0.5 text-xs font-bold border ${rarity.color}`}
              >
                {rarity.label}
              </span>
            </div>

            {/* High-Res Art */}
            <div className="relative mx-2 aspect-[4/3] overflow-hidden rounded-2xl bg-black/70 ring-1 ring-white/10 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork}
                alt={card.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `/cards/${card.element.toLowerCase()}.svg`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {card.token_id !== undefined && card.token_id !== null && (
                <span className="absolute bottom-2 left-2.5 font-mono text-xs text-zinc-300 font-bold bg-black/80 px-2 py-0.5 rounded backdrop-blur">
                  #{card.token_id.toString()}
                </span>
              )}
            </div>

            {/* Card Information */}
            <div className="p-4 flex flex-col gap-3 z-10">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-white text-lg sm:text-xl tracking-tight">
                    {card.name}
                  </h3>
                  {card.prestige_level !== undefined && card.prestige_level > 0 && (
                    <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/30 border border-amber-400/60 px-2 py-0.5 text-[10px] font-black text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      ★ Ascensión {card.prestige_level}
                    </span>
                  )}
                </div>
                {(card.description || card.lore) && (
                  <p className="mt-1 text-xs text-zinc-300 leading-relaxed italic">
                    &ldquo;{card.description || card.lore}&rdquo;
                  </p>
                )}
              </div>

              {/* 4 Core Combat Stats (ATK, DEF, SPD, Power Score) */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
                <div className="flex flex-col items-center justify-center rounded-xl bg-red-950/40 border border-red-500/30 p-2">
                  <div className="flex items-center gap-1 text-red-400">
                    <SwordIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">ATK</span>
                  </div>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-red-300">
                    {card.atk}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-cyan-950/40 border border-cyan-500/30 p-2">
                  <div className="flex items-center gap-1 text-cyan-400">
                    <ShieldIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">DEF</span>
                  </div>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-cyan-300">
                    {card.def}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-amber-950/40 border border-amber-500/30 p-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    <span className="text-xs">⚡</span>
                    <span className="text-[10px] font-bold">SPD</span>
                  </div>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-amber-300">
                    {card.speed ?? 5}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-purple-950/40 border border-purple-500/30 p-2">
                  <div className="flex items-center gap-1 text-purple-400">
                    <span className="text-xs">🏆</span>
                    <span className="text-[10px] font-bold">PWR</span>
                  </div>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-purple-300">
                    {card.power_score ?? Number((card.atk + card.def + (card.speed ?? 5) * 0.5).toFixed(1))}
                  </span>
                </div>
              </div>

              {/* Tactical Passive Skill */}
              {(card.passive || card.passive_skill) && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <SparklesIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{card.passive?.name || "Habilidad Pasiva"}</span>
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 border border-zinc-700">
                      {card.passive?.trigger || "PASIVA"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-normal">
                    {card.passive?.description || card.passive_skill}
                  </p>
                </div>
              )}

              {/* Tactical Active Skill */}
              {card.active && (
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2.5 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-cyan-200 flex items-center gap-1">
                      <span>🔮</span>
                      <span>{card.active.name}</span>
                    </span>
                    <span className="rounded bg-cyan-900/50 px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/40">
                      Coste: {card.active.energy_cost} Éter
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-normal">
                    {card.active.description}
                  </p>
                </div>
              )}
            </div>
          </div>


          <p className="mt-3 text-[11px] text-zinc-500 font-mono">
            Mueve el cursor o dedo para rotar en 3D · Toca fuera para cerrar
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
