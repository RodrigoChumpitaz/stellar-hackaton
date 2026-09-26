"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardData } from "../domain/types";
import { CardItem } from "./CardItem";
import { SparklesIcon } from "@/shared/ui/icons/Elements";

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
          className="relative flex flex-col items-center w-full max-w-[330px] sm:max-w-[420px] md:max-w-[450px] z-10"
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

          {/* 3D Tilt Card Frame - Reusing unified modular CardItem in detailed mode */}
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

          <p className="mt-3 text-[11px] text-zinc-500 font-mono">
            Mueve el cursor o dedo para rotar en 3D · Toca fuera para cerrar
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
