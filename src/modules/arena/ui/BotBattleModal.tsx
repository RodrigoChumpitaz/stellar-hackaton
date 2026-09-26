"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card, CardData } from "@/modules/cards/domain/types";
import { SwordIcon, ShieldIcon, ZapIcon } from "@/shared/ui/icons/Elements";
import { InteractiveBattleArena } from "./InteractiveBattleArena";

interface BotBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerDeck: CardData[];
  playerName: string;
  playerAvatar: string;
  onBurnAndMint?: (burnedA: Card, burnedB: Card, mintedCard: Card) => void;
  onWinXlmReward?: (amount: number) => void;
}

interface BotRival {
  name: string;
  title: string;
  avatar: string;
  element: string;
  deckPower: number;
  atk: number;
  def: number;
  speed: number;
}

const BOTS: BotRival[] = [
  {
    name: "Guardián Ignis",
    title: "Centinela de Fuego Líquido",
    avatar: "🔥",
    element: "FIRE",
    deckPower: 38,
    atk: 18,
    def: 12,
    speed: 8,
  },
  {
    name: "Autómata Glaciar",
    title: "Defensor del Hielo Perpetuo",
    avatar: "❄️",
    element: "GLACIER",
    deckPower: 42,
    atk: 14,
    def: 22,
    speed: 6,
  },
  {
    name: "Titán Tectónico",
    title: "Coloso de Granito Viviente",
    avatar: "🌿",
    element: "EARTH",
    deckPower: 45,
    atk: 20,
    def: 18,
    speed: 7,
  },
];

export function BotBattleModal({
  isOpen,
  onClose,
  playerDeck,
  playerName,
  playerAvatar,
  onBurnAndMint,
  onWinXlmReward,
}: BotBattleModalProps) {
  const [selectedBotIdx, setSelectedBotIdx] = useState(0);
  const [isPlayingInteractive, setIsPlayingInteractive] = useState(false);

  // Compute player stats for preview
  const playerAtk = playerDeck.reduce((sum, c) => sum + (c.atk || 0), 0) || 15;
  const playerDef = playerDeck.reduce((sum, c) => sum + (c.def || 0), 0) || 16;
  const playerSpd = playerDeck.reduce((sum, c) => sum + (c.speed || 5), 0) || 20;
  const playerPwr = Number((playerAtk + playerDef + playerSpd * 0.5).toFixed(1));

  const bot = BOTS[selectedBotIdx];

  useEffect(() => {
    if (isOpen) {
      setIsPlayingInteractive(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isPlayingInteractive ? onClose : undefined}
        className="fixed inset-0 pointer-events-auto"
      />

      <div className="relative z-10 w-full flex items-center justify-center my-auto">
        <AnimatePresence mode="wait">
          {isPlayingInteractive ? (
            <motion.div
              key="interactive-arena"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl"
            >
              <InteractiveBattleArena
                playerName={playerName}
                playerAvatar={playerAvatar}
                playerDeck={playerDeck}
                botRival={bot}
                onClose={() => {
                  setIsPlayingInteractive(false);
                  onClose();
                }}
                onBurnAndMint={onBurnAndMint}
                onWinXlmReward={onWinXlmReward}
              />
            </motion.div>
          ) : (
            <motion.div
              key="bot-prep-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className="w-full max-w-xl rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#101428] via-[#0E1022] to-[#0A0C18] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300">
                    🤖
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight">
                      Arena de Combate: Duelo contra Bot IA
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Juega tus cartas, utiliza la Forja Táctica en batalla y gana XLM.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Clash Versus Display */}
              <div className="py-4">
                <div className="grid grid-cols-5 items-center gap-2">
                  {/* Player Side */}
                  <div className="col-span-2 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-3 text-center">
                    <span className="text-3xl leading-none block mb-1">{playerAvatar}</span>
                    <h4 className="font-extrabold text-sm text-cyan-300 truncate">{playerName}</h4>
                    <div className="mt-2 flex flex-col gap-1 text-[11px] font-mono">
                      <span className="text-red-400 font-bold">ATK: {playerAtk}</span>
                      <span className="text-cyan-400 font-bold">DEF: {playerDef}</span>
                      <span className="text-amber-300 font-bold">SPD: {playerSpd}</span>
                      <span className="mt-1 font-black text-purple-300 bg-purple-950/60 rounded px-1.5 py-0.5 border border-purple-500/30">
                        Poder: {playerPwr}
                      </span>
                    </div>
                  </div>

                  {/* VS Emblem */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 font-black text-xs text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                      VS
                    </div>
                  </div>

                  {/* Bot Side */}
                  <div className="col-span-2 rounded-2xl border border-red-500/40 bg-red-950/20 p-3 text-center">
                    <span className="text-3xl leading-none block mb-1">{bot.avatar}</span>
                    <h4 className="font-extrabold text-sm text-red-300 truncate">{bot.name}</h4>
                    <div className="mt-2 flex flex-col gap-1 text-[11px] font-mono">
                      <span className="text-red-400 font-bold">ATK: {bot.atk}</span>
                      <span className="text-cyan-400 font-bold">DEF: {bot.def}</span>
                      <span className="text-amber-300 font-bold">SPD: {bot.speed}</span>
                      <span className="mt-1 font-black text-purple-300 bg-purple-950/60 rounded px-1.5 py-0.5 border border-purple-500/30">
                        Poder: {bot.deckPower}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Select Rival Bot Tabs */}
                <div className="mt-4">
                  <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Selecciona tu Rival IA
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {BOTS.map((b, idx) => (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => setSelectedBotIdx(idx)}
                        className={`rounded-xl p-2 text-left border transition-all cursor-pointer ${
                          selectedBotIdx === idx
                            ? "bg-zinc-800 border-cyan-400 ring-1 ring-cyan-400 text-white"
                            : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{b.avatar}</span>
                          <span className="font-bold text-xs truncate">{b.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                          Poder {b.deckPower} · {b.element}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Rules / Features Banner */}
                <div className="mt-4 rounded-xl border border-zinc-800/80 bg-black/40 p-3 space-y-1 text-xs text-zinc-300">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <span>⚡</span>
                    <span>Combate Táctico por Turnos:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5 pl-1">
                    <li>3 Cristales de Energía Aether por turno.</li>
                    <li>Ataca o defiéndete usando las cartas de tu mazo activo.</li>
                    <li>
                      <strong className="text-purple-300">🔥 Forja en Batalla:</strong> Fusión activa en las rondas 1 y 2 (+25% bono de combate).
                    </li>
                    <li>Gana la partida para reclamar <strong className="text-white">+5.00 XLM</strong> en Stellar Testnet.</li>
                  </ul>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlayingInteractive(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3 text-xs font-black text-black shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <SwordIcon className="w-4 h-4 text-black" />
                  <span>Entrar a la Arena de Combate</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
