"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card, CardData } from "@/modules/cards/domain/types";
import { DEFAULT_ARENA_DECK } from "../domain/combat-rules";
import { SwordIcon, ShieldIcon, ZapIcon, SparklesIcon } from "@/shared/ui/icons/Elements";
import { BotBattleModal } from "./BotBattleModal";

interface ArenaLobbyViewProps {
  userCards: CardData[];
  walletAddress?: string | null;
  isConnected: boolean;
  playerName: string;
  playerAvatar: string;
  onGoToDecks?: () => void;
  onOpenConnect?: () => void;
  onBurnAndMint?: (burnedA: Card, burnedB: Card, mintedCard: Card) => void;
  onWinXlmReward?: (amount: number) => void;
}

export function ArenaLobbyView({
  userCards,
  walletAddress,
  isConnected,
  playerName,
  playerAvatar,
  onGoToDecks,
  onOpenConnect,
  onBurnAndMint,
  onWinXlmReward,
}: ArenaLobbyViewProps) {
  // Direct Duel & Custom Room State
  const [createdRoom, setCreatedRoom] = useState<{ code: string; createdAt: Date } | null>(null);
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [rivalPublicKey, setRivalPublicKey] = useState("");
  const [rivalError, setRivalError] = useState<string | null>(null);
  const [challengeSuccess, setChallengeSuccess] = useState<string | null>(null);

  // Matchmaking state
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);

  // Bot modal state
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  // Calculate deck combat stats
  const activeDeckCards = userCards && userCards.length > 0 ? userCards.slice(0, 8) : DEFAULT_ARENA_DECK;
  const deckAtk = activeDeckCards.reduce((acc, c) => acc + (c.atk || 0), 0);
  const deckDef = activeDeckCards.reduce((acc, c) => acc + (c.def || 0), 0);
  const deckSpeed = activeDeckCards.reduce((acc, c) => acc + (c.speed || 5), 0);
  const deckPower = Number((deckAtk + deckDef + deckSpeed * 0.5).toFixed(1));

  // Room Creation Handlers
  const handleCreateRoom = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `AETHER-${randomPart}`;
    setCreatedRoom({ code: newCode, createdAt: new Date() });
    setChallengeSuccess(`¡Sala ${newCode} creada con éxito!`);
    setTimeout(() => setChallengeSuccess(null), 4000);
  };

  const handleCloseRoom = () => {
    setCreatedRoom(null);
    setRivalPublicKey("");
    setRivalError(null);
    setChallengeSuccess(null);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinRoomCode.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError("Ingresa un código de sala.");
      return;
    }
    if (cleanCode.length < 5) {
      setJoinError("El código de sala no es válido (ej: AETHER-9K2L).");
      return;
    }
    setJoinError(null);
    setCreatedRoom({ code: cleanCode, createdAt: new Date() });
    setChallengeSuccess(`¡Te has unido a la sala ${cleanCode}!`);
    setJoinRoomCode("");
    setTimeout(() => setChallengeSuccess(null), 4000);
  };

  const handleCopyRoomCode = async () => {
    if (!createdRoom) return;
    try {
      await navigator.clipboard.writeText(createdRoom.code);
      setChallengeSuccess(`¡Código ${createdRoom.code} copiado!`);
      setTimeout(() => setChallengeSuccess(null), 3000);
    } catch {
      setChallengeSuccess(`Código: ${createdRoom.code}`);
    }
  };

  // Handle direct challenge submission inside the room
  const handleSendChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = rivalPublicKey.trim();

    if (!cleanKey) {
      setRivalError("Ingresa la clave pública Stellar de tu conocido.");
      return;
    }

    if (!cleanKey.startsWith("G") || cleanKey.length !== 56) {
      setRivalError("La clave debe comenzar con 'G' y tener 56 caracteres válidos.");
      return;
    }

    if (cleanKey === walletAddress) {
      setRivalError("No puedes desafiar a tu propia clave pública.");
      return;
    }

    setRivalError(null);
    setChallengeSuccess(`¡Invitación enviada a ${cleanKey.slice(0, 4)}…${cleanKey.slice(-4)} para unirse a la sala ${createdRoom?.code}!`);
    setTimeout(() => setChallengeSuccess(null), 5000);
  };

  const handleCopyInviteLink = async () => {
    const codeParam = createdRoom ? createdRoom.code : walletAddress || "demo";
    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/?room=${codeParam}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setChallengeSuccess("¡Enlace de invitación copiado al portapapeles!");
      setTimeout(() => setChallengeSuccess(null), 4000);
    } catch {
      setChallengeSuccess("Enlace listo para compartir.");
    }
  };

  // Toggle quick matchmaking search
  const handleToggleMatchmaking = () => {
    if (isSearchingMatch) {
      setIsSearchingMatch(false);
      setSearchTimer(0);
    } else {
      setIsSearchingMatch(true);
      setSearchTimer(0);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* ========================================================================= */}
      {/* SECCIÓN 1: CABECERA DE LA ARENA & MAZO DE COMBATE EQUIPADO                */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#111428]/90 via-[#0E1022]/90 to-[#0A0C18]/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600/30 via-purple-600/30 to-cyan-500/30 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,229,255,0.25)] text-2xl sm:text-3xl">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Arena de Combate
                </h1>
                <span className="rounded-full bg-cyan-950/80 border border-cyan-400/50 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300">
                  SALA DE ESPERA
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Desafía a otros invocadores en Stellar Testnet, busca partidas abiertas o entrena con bots.
              </p>
            </div>
          </div>

          {/* Player Profile Badge */}
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2.5 sm:px-4">
            <span className="text-2xl leading-none">{playerAvatar}</span>
            <div>
              <span className="text-xs font-black text-white block">{playerName}</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {walletAddress ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}` : "Modo Invitado"}
              </span>
            </div>
          </div>
        </div>

        {/* Active Combat Deck Summary Strip */}
        <div className="mt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-black/40 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-lg">
              🎴
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-white text-sm">Mazo de Combate Activo</h4>
                <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.2 rounded-md">
                  {activeDeckCards.length}/8 Cartas
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs font-mono">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <SwordIcon className="w-3 h-3" />
                  <span>ATK: {deckAtk}</span>
                </span>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <ShieldIcon className="w-3 h-3" />
                  <span>DEF: {deckDef}</span>
                </span>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <ZapIcon className="w-3 h-3" />
                  <span>SPD: {deckSpeed}</span>
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-purple-300 font-black">
                  Poder Total: {deckPower}
                </span>
              </div>
            </div>
          </div>

          {onGoToDecks && (
            <button
              type="button"
              onClick={onGoToDecks}
              className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer shrink-0"
            >
              Configurar Mazo ➔
            </button>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: TRES MODOS DE JUEGO / SALA DE ESPERA                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* MODO 1: DESAFÍO DIRECTO / CREAR SALA */}
        <div className={`rounded-3xl border ${createdRoom ? "border-purple-500/50 bg-gradient-to-b from-[#18112e]/90 to-[#0A0C18]/95 shadow-[0_0_25px_rgba(168,85,247,0.2)]" : "border-zinc-800/80 bg-gradient-to-b from-[#111428]/80 to-[#0A0C18]/90 shadow-xl"} p-5 sm:p-6 flex flex-col justify-between transition-all`}>
          {!createdRoom ? (
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 text-lg shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                  ⚔️
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-base">Duelo Directo</h3>
                  <span className="text-[11px] text-purple-300 font-semibold">Sala Privada</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Crea una sala de combate exclusiva para invitar a un rival conocido o únete a una partida con código.
              </p>

              {/* Botón Crear Sala */}
              <button
                type="button"
                onClick={handleCreateRoom}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-sm">➕</span>
                <span>Crear Sala de Combate</span>
              </button>

              {/* O Unirse con Código */}
              <form onSubmit={handleJoinRoom} className="mt-5 pt-4 border-t border-zinc-800/80">
                <label htmlFor="join-room-input" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  ¿Tienes un código de sala?
                </label>
                <div className="flex gap-2">
                  <input
                    id="join-room-input"
                    type="text"
                    value={joinRoomCode}
                    onChange={(e) => {
                      setJoinRoomCode(e.target.value.toUpperCase());
                      if (joinError) setJoinError(null);
                    }}
                    placeholder="Ej: AETHER-9K2L"
                    maxLength={14}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs font-mono uppercase text-white placeholder-zinc-600 focus:border-purple-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-purple-500/40 bg-purple-950/60 hover:bg-purple-900/80 px-3.5 py-2 text-xs font-bold text-purple-200 transition-colors cursor-pointer shrink-0"
                  >
                    Unirse
                  </button>
                </div>
                {joinError && <p className="mt-1 text-xs text-red-400 font-semibold">{joinError}</p>}
              </form>

              {challengeSuccess && (
                <p className="mt-3 text-xs font-bold text-emerald-400 text-center animate-pulse">
                  ✓ {challengeSuccess}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/90 border border-purple-400/50 text-purple-300 text-lg shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                    👑
                  </span>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Sala de Espera</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Sala Activa</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseRoom}
                  className="text-xs text-zinc-400 hover:text-red-400 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 transition-colors cursor-pointer"
                  title="Cerrar y salir de la sala"
                >
                  ✕ Salir
                </button>
              </div>

              {/* Código de Sala Destacado */}
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 p-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">Código de Combate</span>
                  <span className="text-base font-black font-mono tracking-widest text-white">{createdRoom.code}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRoomCode}
                  className="rounded-xl border border-purple-400/40 bg-purple-900/50 hover:bg-purple-800/60 px-3 py-1.5 text-xs font-bold text-purple-200 transition-colors cursor-pointer"
                >
                  Copiar
                </button>
              </div>

              {/* Esperando rival status */}
              <div className="flex items-center justify-around py-3 px-2 rounded-xl bg-black/40 border border-zinc-800/80 mb-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{playerAvatar}</span>
                  <span className="text-[10px] font-bold text-zinc-300 max-w-[80px] truncate">{playerName}</span>
                  <span className="text-[9px] text-purple-400 font-semibold">Anfitrión</span>
                </div>
                <div className="text-zinc-600 font-black text-sm animate-pulse">VS</div>
                <div className="flex flex-col items-center opacity-60">
                  <span className="text-2xl">⏳</span>
                  <span className="text-[10px] font-medium text-zinc-400">Esperando...</span>
                  <span className="text-[9px] text-zinc-500">Rival</span>
                </div>
              </div>

              {/* Invitar por Clave Pública Stellar */}
              <form onSubmit={handleSendChallenge} className="space-y-2">
                <label htmlFor="rival-public-key-input" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Invitar por Clave Pública Stellar (`G...`)
                </label>
                <div className="flex gap-2">
                  <input
                    id="rival-public-key-input"
                    type="text"
                    value={rivalPublicKey}
                    onChange={(e) => {
                      setRivalPublicKey(e.target.value);
                      if (rivalError) setRivalError(null);
                    }}
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:border-purple-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg cursor-pointer shrink-0 transition-colors"
                  >
                    Invitar
                  </button>
                </div>
                {rivalError && <p className="text-xs text-red-400 font-semibold">{rivalError}</p>}
              </form>

              {/* Copiar enlace directo */}
              <div className="mt-3 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700 py-2 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                >
                  <span>🔗</span>
                  <span>Copiar Enlace de la Sala</span>
                </button>
              </div>

              {challengeSuccess && (
                <p className="mt-2.5 text-xs font-bold text-emerald-400 text-center animate-pulse">
                  ✓ {challengeSuccess}
                </p>
              )}
            </div>
          )}
        </div>

        {/* MODO 2: MATCHMAKING ABIERTO (SALA PÚBLICA) */}
        <div className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#111428]/80 to-[#0A0C18]/90 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-lg shadow-[0_0_12px_rgba(0,229,255,0.3)]">
                📡
              </span>
              <div>
                <h3 className="font-extrabold text-white text-base">Matchmaking Abierto</h3>
                <span className="text-[11px] text-cyan-300 font-semibold">Cola de Emparejamiento Rápido</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Ingresa a la sala general para buscar un adversario con mazo de poder similar conectado en la red Stellar Testnet.
            </p>

            {/* Radar Search Animation */}
            {isSearchingMatch ? (
              <div className="my-5 flex flex-col items-center justify-center p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60"></span>
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-black text-lg font-black shadow-[0_0_15px_#00e5ff]">
                    ⚔️
                  </span>
                </div>
                <span className="mt-3 text-xs font-bold text-cyan-300 animate-pulse">
                  Buscando rival en Stellar Testnet...
                </span>
                <span className="text-[10px] font-mono text-zinc-400 mt-1">
                  Poder objetivo: ~{deckPower} PWR
                </span>
              </div>
            ) : (
              <div className="my-5 flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center">
                <span className="text-3xl mb-1.5 opacity-60">🌐</span>
                <span className="text-xs font-bold text-zinc-300">Sala en Espera</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 max-w-[180px]">
                  Presiona el botón para unirte al emparejamiento.
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleMatchmaking}
            className={`w-full py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md active:scale-95 ${
              isSearchingMatch
                ? "bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            }`}
          >
            {isSearchingMatch ? "Cancelar Búsqueda" : "Buscar Partida Rápida"}
          </button>
        </div>

        {/* MODO 3: ENTRENAMIENTO CONTRA BOT GUARDIÁN */}
        <div className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#111428]/80 to-[#0A0C18]/90 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-lg shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                🤖
              </span>
              <div>
                <h3 className="font-extrabold text-white text-base">Guardián de Aether</h3>
                <span className="text-[11px] text-amber-300 font-semibold">Entrenamiento con Bot</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              ¿Quieres probar tu mazo inmediatamente? Lanza un duelo simulado contra la IA guardiana de los elementos sin esperas.
            </p>

            <div className="my-4 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span>🔥</span>
                  <span>Guardián Ignis</span>
                </span>
                <span className="font-mono font-bold text-red-400">38 PWR</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span>❄️</span>
                  <span>Autómata Glaciar</span>
                </span>
                <span className="font-mono font-bold text-sky-400">42 PWR</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span>🌿</span>
                  <span>Titán Tectónico</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">45 PWR</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBotModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 font-black text-xs text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>🎮</span>
            <span>Jugar contra Bot</span>
          </button>
        </div>
      </div>

      {/* Bot Battle Modal */}
      <BotBattleModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
        playerDeck={activeDeckCards}
        playerName={playerName}
        playerAvatar={playerAvatar}
        onBurnAndMint={onBurnAndMint}
        onWinXlmReward={onWinXlmReward}
      />
    </div>
  );
}
