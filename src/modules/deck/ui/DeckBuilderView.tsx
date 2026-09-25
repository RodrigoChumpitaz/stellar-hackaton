"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardItem, type CardData } from "@/modules/cards/ui/CardItem";
import { BASE_ELEMENTS } from "@/modules/cards/domain/constants";
import {
  FireIcon,
  WaterIcon,
  EarthIcon,
  AirIcon,
  SparklesIcon,
  SwordIcon,
  ShieldIcon,
  ZapIcon,
} from "@/shared/ui/icons/Elements";

interface DeckBuilderViewProps {
  userCards: CardData[];
  walletAddress?: string | null;
  isConnected: boolean;
  onQuickTapCard?: (card: CardData) => void;
  onLongPressCard?: (card: CardData) => void;
}

const MAX_DECK_CARDS = 8;
const DECK_NAMES = ["Mazo 1", "Mazo 2", "Mazo 3", "Mazo 4", "Mazo 5"];

export function DeckBuilderView({
  userCards,
  walletAddress,
  isConnected,
  onQuickTapCard,
  onLongPressCard,
}: DeckBuilderViewProps) {
  // Active selected deck tab (0 to 4)
  const [selectedDeckIdx, setSelectedDeckIdx] = useState<number>(0);

  // Storage key scoped to wallet or guest demo
  const storageKey = useMemo(() => {
    return `stellar_runes_decks_${walletAddress || "guest"}`;
  }, [walletAddress]);

  // 5 Decks, each storing an array of card IDs
  const [decks, setDecks] = useState<string[][]>([[], [], [], [], []]);
  const [activeCombatDeckIdx, setActiveCombatDeckIdx] = useState<number>(0);
  const [filterElement, setFilterElement] = useState<string>("ALL");
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Load decks from localStorage or initialize with starter cards
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.decks) && parsed.decks.length === 5) {
          setDecks(parsed.decks);
          if (typeof parsed.activeDeck === "number") {
            setActiveCombatDeckIdx(parsed.activeDeck);
          }
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Default: populate Mazo 1 with up to 8 available user cards
    if (userCards.length > 0) {
      const initialDeck1 = userCards.slice(0, MAX_DECK_CARDS).map((c) => c.id.toString());
      setDecks([initialDeck1, [], [], [], []]);
      setActiveCombatDeckIdx(0);
    }
  }, [storageKey, userCards]);

  // Save changes to localStorage
  const persistDecks = useCallback(
    (newDecks: string[][], newActiveIdx: number) => {
      setDecks(newDecks);
      setActiveCombatDeckIdx(newActiveIdx);
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ decks: newDecks, activeDeck: newActiveIdx })
        );
      } catch {
        // Ignore quota errors
      }
    },
    [storageKey]
  );

  // Cards currently in the selected deck
  const currentDeckCardIds = decks[selectedDeckIdx] || [];

  const cardsInSelectedDeck = useMemo(() => {
    const cardMap = new Map<string, CardData>();
    for (const c of userCards) {
      cardMap.set(c.id.toString(), c);
    }
    return currentDeckCardIds
      .map((id) => cardMap.get(id))
      .filter((c): c is CardData => Boolean(c));
  }, [userCards, currentDeckCardIds]);

  // Cards available in catalog (excluding those already in the selected deck)
  const availableCatalogCards = useMemo(() => {
    const inDeckSet = new Set(currentDeckCardIds);
    return userCards.filter((c) => !inDeckSet.has(c.id.toString()));
  }, [userCards, currentDeckCardIds]);

  // Filtered catalog cards
  const filteredCatalog = useMemo(() => {
    if (filterElement === "ALL") return availableCatalogCards;
    if (filterElement === "HYBRIDS") {
      return availableCatalogCards.filter(
        (c) => !BASE_ELEMENTS.includes(c.element as (typeof BASE_ELEMENTS)[number])
      );
    }
    return availableCatalogCards.filter((c) => c.element === filterElement);
  }, [availableCatalogCards, filterElement]);

  // Calculate combat stats of selected deck
  const deckStats = useMemo(() => {
    let atk = 0;
    let def = 0;
    let speed = 0;
    for (const c of cardsInSelectedDeck) {
      atk += c.atk;
      def += c.def;
      speed += c.speed ?? 10;
    }
    return { atk, def, speed };
  }, [cardsInSelectedDeck]);

  // Add card to currently selected deck
  const handleAddCardToDeck = useCallback(
    (card: CardData) => {
      const currentDeck = decks[selectedDeckIdx] || [];
      if (currentDeck.length >= MAX_DECK_CARDS) {
        setSaveToast("Este mazo ya tiene el límite máximo de 8 cartas.");
        setTimeout(() => setSaveToast(null), 2500);
        return;
      }
      if (currentDeck.includes(card.id.toString())) return;

      const newDeck = [...currentDeck, card.id.toString()];
      const nextDecks = [...decks];
      nextDecks[selectedDeckIdx] = newDeck;
      persistDecks(nextDecks, activeCombatDeckIdx);
    },
    [decks, selectedDeckIdx, activeCombatDeckIdx, persistDecks]
  );

  // Remove card from currently selected deck
  const handleRemoveCardFromDeck = useCallback(
    (cardId: string | number) => {
      const currentDeck = decks[selectedDeckIdx] || [];
      const newDeck = currentDeck.filter((id) => id !== cardId.toString());
      const nextDecks = [...decks];
      nextDecks[selectedDeckIdx] = newDeck;
      persistDecks(nextDecks, activeCombatDeckIdx);
    },
    [decks, selectedDeckIdx, activeCombatDeckIdx, persistDecks]
  );

  // Set selected deck as the active combat deck
  const handleSetActiveCombatDeck = useCallback(() => {
    persistDecks(decks, selectedDeckIdx);
    setSaveToast(`¡${DECK_NAMES[selectedDeckIdx]} establecido como tu Mazo Activo para JcJ / JcB!`);
    setTimeout(() => setSaveToast(null), 3000);
  }, [decks, selectedDeckIdx, persistDecks]);

  const isActiveDeck = activeCombatDeckIdx === selectedDeckIdx;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full select-none">
      {/* Toast Alert */}
      {saveToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl border border-cyan-500/50 bg-[#0E1122]/95 px-4 py-2.5 text-xs font-bold text-cyan-200 shadow-2xl backdrop-blur-md"
        >
          <span>✨</span>
          <span>{saveToast}</span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 1: CONFIGURAR MAZO                                                */}
      {/* ========================================================================= */}
      <section className="relative w-full rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#111428]/90 via-[#0E1022]/90 to-[#0A0C18]/95 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header & Subtabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 text-sm">
                🎴
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Configurar Mazo
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              Personaliza hasta 5 mazos de 8 cartas. Solo 1 mazo estará activo para las batallas JcJ y JcB.
            </p>
          </div>

          {/* 5 Deck Subtabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {DECK_NAMES.map((name, idx) => {
              const isSelected = selectedDeckIdx === idx;
              const isCombatActive = activeCombatDeckIdx === idx;
              const count = decks[idx]?.length || 0;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedDeckIdx(idx)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer min-w-max ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(123,43,249,0.35)]"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  {isCombatActive && <span title="Mazo activo para partidas">⚔️</span>}
                  <span>{name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/30" : "bg-zinc-800"}`}>
                    {count}/8
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deck Action Bar: Active Deck Status + Combat Metrics */}
        <div className="my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#090C1A]/80 border border-zinc-800/80">
          {/* Active Combat Status Switcher */}
          <div className="flex items-center gap-2">
            {isActiveDeck ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 px-3 py-1.5 text-xs font-extrabold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>⚔️ Mazo Activo para Partidas (JcJ / JcB)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSetActiveCombatDeck}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-cyan-500 hover:text-black border border-zinc-700 hover:border-cyan-400 px-3.5 py-1.5 text-xs font-extrabold text-zinc-200 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span>🗡️</span>
                <span>Establecer como Mazo Activo</span>
              </button>
            )}
          </div>

          {/* Aggregate Combat Stats */}
          <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs">
            <span className="flex items-center gap-1 text-red-400 font-bold" title="Ataque Total del Mazo">
              <SwordIcon className="w-3.5 h-3.5" />
              <span>ATK: {deckStats.atk}</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 text-cyan-400 font-bold" title="Defensa Total del Mazo">
              <ShieldIcon className="w-3.5 h-3.5" />
              <span>DEF: {deckStats.def}</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 text-amber-300 font-bold" title="Velocidad Total">
              <ZapIcon className="w-3.5 h-3.5" />
              <span>SPD: {deckStats.speed}</span>
            </span>
          </div>
        </div>

        {/* 8 Deck Card Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 justify-items-center pt-2">
          {Array.from({ length: MAX_DECK_CARDS }).map((_, slotIdx) => {
            const card = cardsInSelectedDeck[slotIdx];
            return (
              <div
                key={slotIdx}
                className="w-full flex flex-col items-center"
              >
                {card ? (
                  <div className="relative group/deckcard w-full flex justify-center">
                    <CardItem
                      card={card}
                      size="sm"
                      onQuickTap={onQuickTapCard}
                      onLongPress={onLongPressCard}
                    />
                    {/* Discrete Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCardFromDeck(card.id)}
                      className="absolute -top-2 -right-2 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-red-950/90 hover:bg-red-800 border border-red-500/60 text-white font-bold text-xs shadow-lg active:scale-90 transition-all cursor-pointer"
                      title="Quitar carta de este mazo"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  /* Empty Deck Slot Placeholder */
                  <div className="flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-zinc-800/90 hover:border-cyan-500/50 rounded-2xl w-36 h-52 sm:w-40 sm:h-56 bg-zinc-900/30 transition-all duration-200">
                    <span className="text-xl text-zinc-600 mb-1">🎴</span>
                    <span className="text-[11px] font-bold text-zinc-400">
                      Ranura {slotIdx + 1}
                    </span>
                    <span className="text-[10px] text-zinc-600 mt-1 max-w-[100px] leading-tight">
                      Vacía
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: CATÁLOGO DE RUNAS (Para armar y agregar al mazo)                */}
      {/* ========================================================================= */}
      <section className="relative w-full rounded-3xl border border-zinc-800/80 bg-[#0E1122]/90 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header & Element Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Catálogo de Runas Disponibles
              </h3>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-400">
                {filteredCatalog.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Pulsa <strong className="text-cyan-300">&ldquo;+ Añadir&rdquo;</strong> en cualquier runa para incluirla en el {DECK_NAMES[selectedDeckIdx]}.
            </p>
          </div>

          {/* Filter Pills with Horizontal Smooth Scrolling on Mobile */}
          <div className="w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1.5 min-w-max">
              <button
                type="button"
                onClick={() => setFilterElement("ALL")}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filterElement === "ALL"
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterElement("FIRE")}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filterElement === "FIRE"
                    ? "bg-red-500 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <FireIcon className="w-3 h-3 text-red-400" />
                <span>Fuego</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterElement("WATER")}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filterElement === "WATER"
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <WaterIcon className="w-3 h-3 text-cyan-400" />
                <span>Agua</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterElement("EARTH")}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filterElement === "EARTH"
                    ? "bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <EarthIcon className="w-3 h-3 text-emerald-400" />
                <span>Tierra</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterElement("AIR")}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filterElement === "AIR"
                    ? "bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <AirIcon className="w-3 h-3 text-amber-400" />
                <span>Viento</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterElement("HYBRIDS")}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filterElement === "HYBRIDS"
                    ? "bg-purple-500 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <SparklesIcon className="w-3 h-3 text-purple-300" />
                <span>Híbridos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Catalog Cards Grid */}
        <div className="pt-6">
          {filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <span className="text-3xl mb-2">🃏</span>
              <p className="font-bold text-white text-sm">
                No hay runas disponibles en esta categoría
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                Todas las cartas de este elemento ya están asignadas en este mazo o aún no las has adquirido.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
              {filteredCatalog.map((card) => {
                const isDeckFull = cardsInSelectedDeck.length >= MAX_DECK_CARDS;
                return (
                  <div key={card.id.toString()} className="flex flex-col items-center gap-2">
                    <CardItem
                      card={card}
                      size="sm"
                      onQuickTap={onQuickTapCard}
                      onLongPress={onLongPressCard}
                      actionButton={
                        <button
                          type="button"
                          disabled={isDeckFull}
                          onClick={() => handleAddCardToDeck(card)}
                          className="w-full py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/40 text-cyan-200 hover:text-white text-[11px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isDeckFull ? "Mazo Lleno (8/8)" : "+ Añadir al Mazo"}
                        </button>
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
