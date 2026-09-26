"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardData } from "../domain/types";
import { CardItem } from "./CardItem";
import { SparklesIcon, ZapIcon } from "@/shared/ui/icons/Elements";

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

  const hasPassive = Boolean(card.passive || card.passive_skill);
  const hasActive = Boolean(card.active);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto">
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
          className={`absolute h-[450px] w-[450px] rounded-full opacity-25 blur-[140px] pointer-events-none ${
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

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="relative flex flex-col items-center w-full max-w-5xl z-10 my-auto"
        >
          {/* Top Controls: Banner & Close */}
          <div className="w-full flex items-center justify-between mb-4 px-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <SparklesIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span>APRECIACIÓN DE RUNA</span>
              <span className="text-zinc-500">·</span>
              <span className="font-mono text-zinc-300">{card.name}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title="Cerrar apreciación"
            >
              ✕
            </button>
          </div>

          {/* Tri-Column Layout: [Pasivas Izquierda] | [Carta 3D Centro] | [Activas Derecha] */}
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-center gap-5 sm:gap-6">
            
            {/* ========================================================================= */}
            {/* PANEL IZQUIERDO: HABILIDADES PASIVAS                                      */}
            {/* ========================================================================= */}
            <div className="order-2 lg:order-1 w-full lg:w-72 xl:w-80 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  <SparklesIcon className="w-3.5 h-3.5 text-purple-300" />
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-300">
                    Habilidades Pasivas
                  </h4>
                  <span className="text-[10px] text-zinc-400">Efectos innatos y auras</span>
                </div>
              </div>

              {hasPassive ? (
                <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-[#160e28]/95 to-[#0f091c]/95 p-4 shadow-xl shadow-purple-950/40 backdrop-blur-md flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
                    <span className="text-xs sm:text-sm font-black text-purple-200 flex items-center gap-1.5">
                      <span>✨</span>
                      <span>{card.passive?.name || "Sintonía Elemental"}</span>
                    </span>
                    <span className="rounded-md bg-purple-950 border border-purple-400/60 px-2 py-0.5 text-[9px] font-mono font-bold text-purple-300">
                      {card.passive?.trigger || "ESTÁTICA"}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {card.passive?.description || card.passive_skill}
                  </p>

                  <div className="mt-1 pt-2 border-t border-purple-500/15 flex items-center gap-1.5 text-[10px] text-purple-400/80 font-mono">
                    <span>✦</span>
                    <span>Se activa permanentemente sin consumir energía.</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#0d0f1e]/60 p-4 text-center flex flex-col items-center justify-center gap-1.5">
                  <span className="text-2xl opacity-40">🔮</span>
                  <span className="text-xs font-bold text-zinc-400">Sin Pasiva Innata</span>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Las habilidades pasivas se obtienen mediante síntesis de rango superior en La Forja.
                  </p>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* PANEL CENTRAL: CARTA 3D FLOTANTE E INTERACTIVA                           */}
            {/* ========================================================================= */}
            <div className="order-1 lg:order-2 flex flex-col items-center shrink-0">
              <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  transition: "transform 0.1s ease-out",
                }}
                className="relative"
              >
                {/* Holographic Glare Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-3xl opacity-40 mix-blend-color-dodge transition-opacity z-30"
                  style={{
                    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)`,
                  }}
                />

                <CardItem card={card} variant="detailed" />
              </div>

              <p className="mt-3 text-[11px] text-zinc-500 font-mono text-center">
                Mueve el cursor o dedo para rotar en 3D · Toca fuera para cerrar
              </p>
            </div>

            {/* ========================================================================= */}
            {/* PANEL DERECHO: HABILIDADES ACTIVAS                                        */}
            {/* ========================================================================= */}
            <div className="order-3 lg:order-3 w-full lg:w-72 xl:w-80 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                  <ZapIcon className="w-3.5 h-3.5 text-cyan-300" />
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                    Habilidades Activas
                  </h4>
                  <span className="text-[10px] text-zinc-400">Poderes de combate</span>
                </div>
              </div>

              {hasActive && card.active ? (
                <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-[#0c162c]/95 to-[#080d1c]/95 p-4 shadow-xl shadow-cyan-950/40 backdrop-blur-md flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
                    <span className="text-xs sm:text-sm font-black text-cyan-200 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>{card.active.name}</span>
                    </span>
                    <span className="rounded-md bg-cyan-950 border border-cyan-400/60 px-2 py-0.5 text-[9px] font-mono font-black text-cyan-300 shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                      {card.active.energy_cost}⚡ Éter
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {card.active.description}
                  </p>

                  <div className="mt-1 pt-2 border-t border-cyan-500/15 flex items-center gap-1.5 text-[10px] text-cyan-400/80 font-mono">
                    <span>⚡</span>
                    <span>Requiere {card.active.energy_cost} cristal(es) de energía Aether en tu turno.</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#0d0f1e]/60 p-4 text-center flex flex-col items-center justify-center gap-1.5">
                  <span className="text-2xl opacity-40">⚡</span>
                  <span className="text-xs font-bold text-zinc-400">Sin Habilidad Activa</span>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Las habilidades activas de invocador se despiertan en criaturas de Rango S o Ascensión.
                  </p>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
