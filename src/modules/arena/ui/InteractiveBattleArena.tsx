"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card } from "@/modules/cards/domain/types";
import { CardItem, ElementIcon, ELEMENT_THEMES } from "@/modules/cards/ui/CardItem";
import { SwordIcon, ShieldIcon, ZapIcon, SparklesIcon, FireIcon } from "@/shared/ui/icons/Elements";
import { forgeElement, forgeRarity, calculateTierOutcome, rarityToTier, getTierIndex } from "@/modules/forge/domain/forge-rules";
import { CARD_TIERS } from "@/modules/cards/domain/constants";
import { useInteractiveBattle } from "./hooks/useInteractiveBattle";
import { COMBAT_CONFIG } from "../domain/combat-rules";

interface InteractiveBattleArenaProps {
  playerName: string;
  playerAvatar: string;
  playerDeck: Card[];
  botRival: {
    name: string;
    title: string;
    avatar: string;
    element: string;
    atk: number;
    def: number;
    speed: number;
    deckPower: number;
  };
  onClose: () => void;
  onBurnAndMint?: (burnedA: Card, burnedB: Card, mintedCard: Card) => void;
  onWinXlmReward?: (amount: number) => void;
}

export function InteractiveBattleArena({
  playerName,
  playerAvatar,
  playerDeck,
  botRival,
  onClose,
  onBurnAndMint,
  onWinXlmReward,
}: InteractiveBattleArenaProps) {
  const {
    player,
    bot,
    round,
    phase,
    isActing,
    hand,
    botIntent,
    canForge,
    forgeSlotA,
    forgeSlotB,
    isForgeOpen,
    forgedCardInBattleState,
    forgeSuccessMsg,
    floatingTexts,
    combatLogs,
    playAttackCard,
    playDefendCard,
    selectCardForForge,
    setIsForgeOpen,
    executeInBattleForge,
    endPlayerTurn,
    initBattle,
  } = useInteractiveBattle({
    playerName,
    playerAvatar,
    playerDeck,
    botRival,
    onBurnAndMint,
    onVictoryReward: onWinXlmReward,
  });

  const [selectedCardForAction, setSelectedCardForAction] = useState<Card | null>(null);

  const isPlayerTurn = phase === "player_turn" && !isActing;

  // Outcome preview for tactical in-battle forge
  const expectedElement =
    forgeSlotA && forgeSlotB ? forgeElement(forgeSlotA.element, forgeSlotB.element) : null;
  const expectedRarity =
    forgeSlotA && forgeSlotB ? forgeRarity(forgeSlotA.rarity, forgeSlotB.rarity) : null;
  const expectedTier =
    forgeSlotA && forgeSlotB && expectedRarity
      ? CARD_TIERS[
          Math.max(
            getTierIndex(
              calculateTierOutcome(
                forgeSlotA.tier || rarityToTier(forgeSlotA.rarity),
                forgeSlotB.tier || rarityToTier(forgeSlotB.rarity),
                0.0 // Previsualizar éxito de fusión en combate
              ).resultingTier
            ),
            getTierIndex(rarityToTier(expectedRarity)),
            getTierIndex(forgeSlotA.tier || rarityToTier(forgeSlotA.rarity)),
            getTierIndex(forgeSlotB.tier || rarityToTier(forgeSlotB.rarity))
          )
        ]
      : null;
  const expectedTheme = expectedElement
    ? ELEMENT_THEMES[expectedElement] || ELEMENT_THEMES.AETHER
    : null;

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0F1326] via-[#0A0D1B] to-[#060812] p-3.5 sm:p-5 shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-white select-none max-h-[92vh] flex flex-col justify-between overflow-y-auto">
      {/* Floating Damage & Action Text Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {floatingTexts.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: -30, scale: 1.25 }}
              exit={{ opacity: 0, y: -60, scale: 0.9 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`absolute font-black text-xl sm:text-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] ${
                f.color === "red"
                  ? "text-red-400"
                  : f.color === "cyan"
                  ? "text-cyan-400"
                  : f.color === "amber"
                  ? "text-amber-300"
                  : f.color === "purple"
                  ? "text-purple-300"
                  : "text-emerald-400"
              }`}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* TOP HEADER: RONDA, ESTADO DE FORJA & RETIRADA                             */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-purple-950/80 border border-purple-500/50 px-2.5 py-0.5 text-xs font-black font-mono text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            RONDA {round}
          </span>

          {round <= COMBAT_CONFIG.FORGE_MAX_ROUND ? (
            <span className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-purple-950/80 border border-amber-500/40 px-2 py-0.5 text-[11px] font-bold text-amber-300 animate-pulse">
              <FireIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Forja Activa (Ronda {round}/2) · +25% Bono</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
              🔒 Forja Cerrada (Límite Ronda 2)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-red-400 px-2.5 py-1 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-red-500/40 transition-all cursor-pointer font-semibold"
        >
          🏳️ Retirarse
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: ESTACIÓN DEL BOT RIVAL (SUPERIOR)                              */}
      {/* ========================================================================= */}
      <div className="mt-3 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/20 via-zinc-900/40 to-black/60 p-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Bot Profile */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-red-950/80 border border-red-500/40 text-2xl shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              {bot.avatar}
              {bot.shield > 0 && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-950 border border-cyan-400 text-[9px] font-black text-cyan-300">
                  🛡️
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-red-300">{bot.name}</h3>
                <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  {botRival.element}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">{botRival.title}</p>
            </div>
          </div>

          {/* Bot HP Bar & Shield Counter */}
          <div className="flex flex-col gap-1 w-full sm:w-56">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400 text-[11px]">Salud Rival</span>
              <div className="flex items-center gap-2">
                {bot.shield > 0 && (
                  <span className="text-cyan-400 font-bold text-xs">🛡️ +{bot.shield}</span>
                )}
                <span className="font-black text-red-400 text-xs">
                  {bot.hp} / {bot.maxHp} HP
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full"
                animate={{ width: `${Math.max(0, (bot.hp / bot.maxHp) * 100)}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Bot Announced Intent Box */}
        <div className="mt-2 flex items-center justify-between rounded-xl border border-red-500/20 bg-black/40 px-3 py-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-xs">
              {botIntent.type === "attack" ? "⚔️" : botIntent.type === "defend" ? "🛡️" : "🔥"}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
              Intención del Rival:
            </span>
            <span className="text-xs font-semibold text-red-300">{botIntent.name}</span>
            <span className="hidden sm:inline text-[11px] text-zinc-400">· {botIntent.description}</span>
          </div>

          <div className="text-[11px] font-mono font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-md">
            {botIntent.type === "defend" ? `+${botIntent.value} DEF` : `${botIntent.value} DMG`}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: ZONA CENTRAL DE BATALLA / BARRA DE ACCIÓN SELECCIONADA         */}
      {/* ========================================================================= */}
      <div className="my-2.5 flex flex-col gap-2 shrink-0">
        {/* If a card is selected, show prominent action bar */}
        {selectedCardForAction && !isForgeOpen && isPlayerTurn ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/90 via-zinc-900/90 to-purple-950/90 p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎴</span>
              <div>
                <span className="text-xs font-bold text-white block">{selectedCardForAction.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  ATK: {selectedCardForAction.atk} · DEF: {selectedCardForAction.def} · {selectedCardForAction.element}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={player.energy < 1}
                onClick={() => {
                  playAttackCard(selectedCardForAction);
                  setSelectedCardForAction(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <SwordIcon className="w-3.5 h-3.5" />
                <span>Atacar (1⚡)</span>
              </button>

              <button
                type="button"
                disabled={player.energy < 1}
                onClick={() => {
                  playDefendCard(selectedCardForAction);
                  setSelectedCardForAction(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <ShieldIcon className="w-3.5 h-3.5" />
                <span>Defender (1⚡)</span>
              </button>

              {round <= COMBAT_CONFIG.FORGE_MAX_ROUND && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgeOpen(true);
                    selectCardForForge(selectedCardForAction);
                    setSelectedCardForAction(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 px-3 py-1.5 text-xs font-bold text-purple-100 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <FireIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>Poner en Forja</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedCardForAction(null)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-2 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Deseleccionar carta"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ) : (
          /* Normal Central Row: Battle Ticker + Forja Táctica Button */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            {combatLogs.length > 0 ? (
              <div className="w-full sm:flex-1 rounded-xl border border-zinc-800/80 bg-black/50 px-3 py-1.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 truncate text-zinc-300">
                  <span className="text-cyan-400">⚡</span>
                  <span className="truncate">{combatLogs[0].text}</span>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 ml-2">Ronda {combatLogs[0].round}</span>
              </div>
            ) : (
              <div className="w-full sm:flex-1 text-[11px] text-zinc-500 font-mono">
                Selecciona una carta de tu mano para jugar tu turno.
              </div>
            )}

            {/* Tactical Forge Trigger Button */}
            <button
              type="button"
              disabled={round > COMBAT_CONFIG.FORGE_MAX_ROUND || player.energy < 2}
              onClick={() => setIsForgeOpen(true)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl py-2 px-3.5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                round <= COMBAT_CONFIG.FORGE_MAX_ROUND && player.energy >= 2
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:brightness-110 active:scale-95"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <FireIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>🔥 Forja Táctica</span>
              <span className="rounded-md bg-black/40 px-1.5 py-0.2 text-[10px] font-mono text-purple-200">
                2⚡
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: ESTACIÓN DEL JUGADOR & CRISTALES DE ENERGÍA                     */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-zinc-900/40 to-black/60 p-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Player Profile & Energy Crystals */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-2xl shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              {player.avatar}
              {player.shield > 0 && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-950 border border-cyan-400 text-[9px] font-black text-cyan-300">
                  🛡️
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-cyan-300">{player.name}</h3>
                <span className="rounded-md bg-cyan-950 border border-cyan-500/40 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                  TÚ
                </span>
              </div>

              {/* Energy Crystals Row */}
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
                  Energía:
                </span>
                {Array.from({ length: player.maxEnergy }).map((_, idx) => {
                  const hasEnergy = idx < player.energy;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.15 }}
                      className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-black transition-all ${
                        hasEnergy
                          ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-black shadow-[0_0_10px_rgba(0,229,255,0.7)]"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-600"
                      }`}
                    >
                      ⚡
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Player HP Bar & Shield Counter */}
          <div className="flex flex-col gap-1 w-full sm:w-56">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400 text-[11px]">Tu Salud</span>
              <div className="flex items-center gap-2">
                {player.shield > 0 && (
                  <span className="text-cyan-400 font-bold text-xs">🛡️ +{player.shield}</span>
                )}
                <span className="font-black text-cyan-400 text-xs">
                  {player.hp} / {player.maxHp} HP
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full"
                animate={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 4: MANO DE CARTAS INTERACTIVA                                     */}
      {/* ========================================================================= */}
      <div className="mt-3 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎴 Tu Mano de Combate</span>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">({hand.length} Cartas)</span>
          </span>

          <span className="text-[11px] text-zinc-500">
            {selectedCardForAction ? "Carta seleccionada arriba" : "Toca una carta para elegir Atacar, Defender o Forjar"}
          </span>
        </div>

        {/* Hand Cards Grid - Centered items with direct CardItem styling */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {hand.map((card, idx) => {
            const isSelected = selectedCardForAction?.id === card.id;
            const isQueuedForForge = forgeSlotA?.id === card.id || forgeSlotB?.id === card.id;

            return (
              <div key={`${card.id}-${idx}`} className="flex justify-center">
                <div
                  onClick={() => {
                    if (isForgeOpen) {
                      selectCardForForge(card);
                    } else {
                      setSelectedCardForAction(isSelected ? null : card);
                    }
                  }}
                  className="cursor-pointer transition-transform duration-200"
                >
                  <CardItem
                    card={card}
                    size="sm"
                    variant="compact"
                    disabled={!isPlayerTurn}
                    className={`transition-all duration-200 ${
                      isQueuedForForge
                        ? "!ring-4 !ring-purple-400 !shadow-[0_0_20px_rgba(168,85,247,0.7)] scale-[1.03]"
                        : isSelected
                        ? "!ring-4 !ring-cyan-400 !shadow-[0_0_20px_rgba(0,229,255,0.7)] scale-[1.03] -translate-y-2"
                        : "hover:-translate-y-1"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 5: BARRA DE ACCIÓN INFERIOR (TERMINAR TURNO)                       */}
      {/* ========================================================================= */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-zinc-400 font-mono">
          {phase === "player_turn" ? (
            <span>Tu turno · {player.energy}⚡ restante</span>
          ) : (
            <span className="text-amber-400 animate-pulse">⚔️ El rival está calculando su ataque...</span>
          )}
        </div>

        <button
          type="button"
          disabled={!isPlayerTurn}
          onClick={endPlayerTurn}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
        >
          <span>Terminar Turno</span>
          <span>➔</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL OVERLAY: ALTAR DE FORJA EN COMBATE (ESTILO LA FORJA DE RUNAS)      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isForgeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl rounded-3xl border border-purple-500/50 bg-gradient-to-b from-[#13112a] via-[#0E0C20] to-[#080714] p-4 sm:p-6 shadow-[0_0_60px_rgba(168,85,247,0.35)] text-white my-auto"
            >
              {/* Decorative Ambient Altar Lighting */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute inset-x-0 -bottom-10 flex justify-center [perspective:900px]">
                  <div className="h-56 w-[90%] rounded-full border border-purple-500/20 bg-gradient-to-t from-purple-950/30 to-cyan-950/10 [transform:rotateX(65deg)] shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-pulse" />
                </div>
              </div>

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-purple-500/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 via-purple-600/30 to-cyan-500/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-xl">
                    🔥
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        La Forja de Runas en Batalla
                      </h3>
                      <span className="rounded-full bg-amber-950/80 border border-amber-500/50 px-2 py-0.2 text-[10px] font-extrabold text-amber-300">
                        +25% BONO TÁCTICO
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Ronda {round}/2 · Combina 2 runas de tu mano para sintetizar una criatura híbrida en combate.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsForgeOpen(false)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  ✕ Volver al Combate
                </button>
              </div>

              {/* Main Altar Bench: Pedestal A + Fusion Core + Pedestal B */}
              <div className="relative z-10 my-4 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6">
                {/* Slot A Pedestal */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-300">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40 text-[10px]">
                      A
                    </span>
                    <span>Ranura A {forgeSlotA ? `· ${forgeSlotA.element}` : ""}</span>
                  </div>

                  <div className="relative flex h-[230px] w-40 sm:h-[250px] sm:w-44 items-center justify-center rounded-2xl border border-red-500/40 bg-[#160d22]/90 p-2 shadow-xl">
                    {forgeSlotA ? (
                      <div className="relative flex flex-col items-center justify-center w-full h-full">
                        <CardItem card={forgeSlotA} size="sm" variant="compact" />
                        <button
                          type="button"
                          onClick={() => selectCardForForge(forgeSlotA)}
                          className="absolute -top-2 -right-2 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-red-950 border border-red-500 text-white text-xs font-bold shadow-lg hover:scale-110 cursor-pointer"
                          title="Quitar de ranura A"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-zinc-500 text-center p-2">
                        <span className="text-3xl opacity-40">🎴</span>
                        <span className="text-[11px] font-semibold">Toca una carta de abajo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Central Fusion Core with Prediction */}
                <div className="flex flex-col items-center justify-center gap-2.5 my-2 md:my-0 px-2">
                  {expectedElement && expectedTier && expectedTheme ? (
                    <div className="flex items-center gap-2 rounded-full border border-purple-500/60 bg-purple-950/90 px-3.5 py-1 text-xs font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 mr-0.5">
                        Resultado:
                      </span>
                      <ElementIcon element={expectedElement} className="w-3.5 h-3.5" />
                      <span className={expectedTheme.accent}>{expectedElement}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-amber-300 font-mono">Rango {expectedTier}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-400 font-mono bg-black/40 border border-zinc-800 rounded-full px-3 py-1">
                      Selecciona 2 cartas para predecir la fusión
                    </div>
                  )}

                  {/* Pulsing Alchemical Crystal Orb */}
                  <div className="relative flex items-center justify-center h-20 w-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-purple-500/30 to-cyan-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="h-14 w-14 rounded-full border-2 border-purple-400/50 bg-gradient-to-br from-purple-950 to-indigo-950 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                      <span className="text-2xl animate-spin" style={{ animationDuration: "12s" }}>
                        🔮
                      </span>
                    </div>
                  </div>

                  {/* Synthesis Button */}
                  <button
                    type="button"
                    disabled={!forgeSlotA || !forgeSlotB || player.energy < 2 || isActing}
                    onClick={executeInBattleForge}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
                  >
                    <FireIcon className="w-3.5 h-3.5 text-black" />
                    <span>Sintetizar en Combate (2⚡)</span>
                  </button>

                  <span className="text-[10px] text-zinc-400 text-center font-mono">
                    Quema atómica: ambas cartas se consumen y la nueva se conserva.
                  </span>
                </div>

                {/* Slot B Pedestal */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px]">
                      B
                    </span>
                    <span>Ranura B {forgeSlotB ? `· ${forgeSlotB.element}` : ""}</span>
                  </div>

                  <div className="relative flex h-[230px] w-40 sm:h-[250px] sm:w-44 items-center justify-center rounded-2xl border border-cyan-500/40 bg-[#0d1426]/90 p-2 shadow-xl">
                    {forgeSlotB ? (
                      <div className="relative flex flex-col items-center justify-center w-full h-full">
                        <CardItem card={forgeSlotB} size="sm" variant="compact" />
                        <button
                          type="button"
                          onClick={() => selectCardForForge(forgeSlotB)}
                          className="absolute -top-2 -right-2 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500 text-white text-xs font-bold shadow-lg hover:scale-110 cursor-pointer"
                          title="Quitar de ranura B"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-zinc-500 text-center p-2">
                        <span className="text-3xl opacity-40">🎴</span>
                        <span className="text-[11px] font-semibold">Toca una 2da carta</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lower Section: Hand Picker with Full CardItem Artwork */}
              <div className="relative z-10 pt-3 border-t border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎴 Cartas en tu Mano</span>
                    <span className="text-[11px] text-zinc-400 font-normal">
                      (Toca una carta para colocarla en la ranura vacía)
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-items-center">
                  {hand.map((card, idx) => {
                    const isA = forgeSlotA?.id === card.id;
                    const isB = forgeSlotB?.id === card.id;
                    const isSlotted = isA || isB;

                    return (
                      <div
                        key={`${card.id}-${idx}`}
                        onClick={() => selectCardForForge(card)}
                        className="relative cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 flex justify-center"
                      >
                        <CardItem
                          card={card}
                          size="sm"
                          variant="compact"
                          className={`transition-all duration-200 ${
                            isSlotted
                              ? isA
                                ? "!ring-4 !ring-red-400 !shadow-[0_0_20px_rgba(239,68,68,0.7)] scale-[1.03]"
                                : "!ring-4 !ring-cyan-400 !shadow-[0_0_20px_rgba(0,229,255,0.7)] scale-[1.03]"
                              : "hover:scale-[1.02]"
                          }`}
                        />

                        {isSlotted && (
                          <div
                            className={`absolute -top-2 inset-x-0 mx-auto w-fit rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase shadow-lg ${
                              isA
                                ? "bg-red-950 text-red-300 border border-red-500"
                                : "bg-cyan-950 text-cyan-300 border border-cyan-500"
                            }`}
                          >
                            {isA ? "✓ Ranura A" : "✓ Ranura B"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {forgeSuccessMsg && (
                <p className="mt-3 text-xs font-bold text-emerald-400 text-center animate-pulse">
                  ✓ {forgeSuccessMsg}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL / PANTALLA: VICTORIA                                                */}
      {/* ========================================================================= */}
      {phase === "victory" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-amber-400/60 bg-gradient-to-b from-[#1c1808] via-[#120f04] to-black p-6 sm:p-7 text-center shadow-[0_0_50px_rgba(245,158,11,0.5)]"
          >
            <span className="text-5xl block mb-2 animate-bounce">🏆</span>
            <h2 className="text-2xl font-black text-amber-300 tracking-tight">¡Victoria en la Arena!</h2>
            <p className="text-xs text-zinc-300 mt-1">
              Has superado al {bot.name} con destreza táctica en Stellar Testnet.
            </p>

            {/* Stellar Testnet XLM Reward Badge */}
            <div className="my-4 rounded-2xl border border-amber-400/40 bg-amber-950/40 p-4">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block">
                Recompensa Stellar Testnet Pool
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                +{COMBAT_CONFIG.VICTORY_XLM_REWARD.toFixed(2)} XLM
              </div>
              <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono">+150 XP de Aether</span>
            </div>

            {/* Preserved Forged Card Notice */}
            {forgedCardInBattleState && (
              <div className="mb-4 rounded-xl border border-purple-500/40 bg-purple-950/30 p-3 text-left">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                  ✨ Carta Forjada Conservada
                </span>
                <p className="text-xs font-semibold text-white mt-0.5">
                  Has forjado a <strong className="text-purple-300">{forgedCardInBattleState.name}</strong> en combate. Se ha añadido permanentemente a tu colección tras quemar las 2 cartas base.
                </p>
              </div>
            )}

            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={initBattle}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
              >
                Jugar Otra Partida
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 py-2.5 text-xs font-black text-black shadow-lg transition-all cursor-pointer"
              >
                Volver a la Arena
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / PANTALLA: DERROTA                                                 */}
      {/* ========================================================================= */}
      {phase === "defeat" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-red-500/60 bg-gradient-to-b from-[#1a0808] via-[#0f0404] to-black p-6 sm:p-7 text-center shadow-[0_0_50px_rgba(239,68,68,0.4)]"
          >
            <span className="text-5xl block mb-2">💥</span>
            <h2 className="text-2xl font-black text-red-400 tracking-tight">Derrota Táctica</h2>
            <p className="text-xs text-zinc-300 mt-1">
              El {bot.name} resistió tu estrategia.
            </p>

            <div className="my-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 text-left text-xs text-zinc-400 leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">💡 Consejo Táctico Elemental:</span>
              Aprovecha las ventajas elementales contra el rival y utiliza la Forja Táctica durante las 2 primeras rondas para obtener una carta híbrida con estadísticas potenciadas.
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={initBattle}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Reintentar Duelo
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
              >
                Volver a la Arena
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
