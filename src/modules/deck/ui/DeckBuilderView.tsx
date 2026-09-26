"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardItem, type CardData } from "@/modules/cards/ui/CardItem";
import { BASE_ELEMENTS } from "@/modules/cards/domain/constants";
import { ElementFilterBar } from "@/modules/cards/ui/ElementFilterBar";
import { CatalogGuideModal } from "@/modules/cards/ui/CatalogGuideModal";
import {
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
  hasClaimedStarter?: boolean;
  onClaimStarter?: () => void;
  isClaimingStarter?: boolean;
  claimToast?: string | null;
  onGoToForge?: () => void;
}

const MAX_DECK_CARDS = 8;
const DECK_NAMES = ["Mazo 1", "Mazo 2", "Mazo 3", "Mazo 4", "Mazo 5"];
const VISIBLE_COLUMNS = 6;

export function DeckBuilderView({
  userCards,
  walletAddress,
  isConnected,
  onQuickTapCard,
  onLongPressCard,
  hasClaimedStarter = false,
  onClaimStarter,
  isClaimingStarter = false,
  claimToast,
  onGoToForge,
}: DeckBuilderViewProps) {
  // Active selected deck tab (0 to 4)
  const [selectedDeckIdx, setSelectedDeckIdx] = useState<number>(0);

  // Carousel offset for showing 6 slots out of 8 (offset: 0, 1, or 2)
  const [carouselOffset, setCarouselOffset] = useState<number>(0);

  // Storage key scoped to wallet or guest demo
  const storageKey = useMemo(() => {
    return `stellar_runes_decks_${walletAddress || "guest"}`;
  }, [walletAddress]);

  // 5 Decks, each storing an array of card IDs
  const [decks, setDecks] = useState<string[][]>([[], [], [], [], []]);
  const [activeCombatDeckIdx, setActiveCombatDeckIdx] = useState<number>(0);
  const [filterElement, setFilterElement] = useState<string>("ALL");
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const [showInfoModal, setShowInfoModal] = useState(false);

  // Synchronize decks with owned cards
  useEffect(() => {
    // If user has 0 cards, decks are completely empty
    if (userCards.length === 0) {
      setDecks([[], [], [], [], []]);
      setActiveCombatDeckIdx(0);
      return;
    }

    const ownedIds = new Set(userCards.map((c) => c.id.toString()));

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.decks) && parsed.decks.length === 5) {
          // Sanitize: retain only card IDs the user actually owns
          const sanitizedDecks = parsed.decks.map((deck: unknown) =>
            Array.isArray(deck)
              ? deck.filter((id) => ownedIds.has(String(id)))
              : []
          );
          setDecks(sanitizedDecks);
          if (typeof parsed.activeDeck === "number") {
            setActiveCombatDeckIdx(parsed.activeDeck);
          }
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Default for fresh collections: empty decks so player has full agency to configure their deck
    setDecks([[], [], [], [], []]);
    setActiveCombatDeckIdx(0);
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

  // Dynamic counts per element category (replicates InventoryDrawer)
  const elementCounts = useMemo(() => {
    const counts = {
      ALL: availableCatalogCards.length,
      FIRE: 0,
      WATER: 0,
      EARTH: 0,
      AIR: 0,
      HYBRIDS: 0,
    };
    for (const card of availableCatalogCards) {
      if (card.element === "FIRE") counts.FIRE++;
      else if (card.element === "WATER") counts.WATER++;
      else if (card.element === "EARTH") counts.EARTH++;
      else if (card.element === "AIR") counts.AIR++;
      else counts.HYBRIDS++;
    }
    return counts;
  }, [availableCatalogCards]);

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

  // Drop card from catalog onto a specific deck slot (0 to 7)
  const handleDropCardToDeckSlot = useCallback(
    (card: CardData, targetIdx: number) => {
      const currentDeck = [...(decks[selectedDeckIdx] || [])];
      const cardIdStr = card.id.toString();

      // If card already in deck, remove from previous slot
      const existingIdx = currentDeck.indexOf(cardIdStr);
      if (existingIdx !== -1) {
        currentDeck.splice(existingIdx, 1);
      }

      // Insert or replace into target slot
      if (targetIdx >= 0 && targetIdx < MAX_DECK_CARDS) {
        if (targetIdx < currentDeck.length) {
          currentDeck[targetIdx] = cardIdStr;
        } else {
          currentDeck.push(cardIdStr);
        }
      } else {
        if (currentDeck.length < MAX_DECK_CARDS) {
          currentDeck.push(cardIdStr);
        }
      }

      const nextDecks = [...decks];
      nextDecks[selectedDeckIdx] = currentDeck.slice(0, MAX_DECK_CARDS);
      persistDecks(nextDecks, activeCombatDeckIdx);
    },
    [decks, selectedDeckIdx, activeCombatDeckIdx, persistDecks]
  );

  // Swap or reorder cards between slots inside the deck
  const handleSwapDeckSlots = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (fromIdx === toIdx) return;
      const currentDeck = [...(decks[selectedDeckIdx] || [])];
      if (fromIdx >= currentDeck.length || toIdx >= MAX_DECK_CARDS) return;

      const temp = currentDeck[fromIdx];
      currentDeck[fromIdx] = currentDeck[toIdx];
      currentDeck[toIdx] = temp;

      // Filter out undefined if swapped with empty slot
      const cleanDeck = currentDeck.filter(Boolean);
      const nextDecks = [...decks];
      nextDecks[selectedDeckIdx] = cleanDeck;
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

  // Visible slot indices for the 6-slot sliding window
  const visibleSlotIndices = useMemo(() => {
    return Array.from({ length: VISIBLE_COLUMNS }, (_, i) => carouselOffset + i);
  }, [carouselOffset]);

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

      {/* Empty Collection Onboarding Hero */}
      {userCards.length === 0 && isConnected && (
        <section className="relative w-full rounded-3xl border border-dashed border-cyan-500/40 bg-gradient-to-b from-[#111428]/95 via-[#0E1022]/95 to-[#0A0C18]/95 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-3xl shadow-[0_0_25px_rgba(0,229,255,0.25)] mb-3 animate-pulse">
            🎁
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ¡Tu Colección de Runas está Vacía!
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
            Para comenzar a construir tus mazos y forjar nuevas runas, reclama tu regalo de bienvenida inicial de 8 Runas Elementales en Stellar Testnet.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onClaimStarter && !hasClaimedStarter ? (
              <button
                type="button"
                onClick={onClaimStarter}
                disabled={isClaimingStarter}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-400 px-6 py-3 text-xs sm:text-sm font-extrabold text-black shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>✨</span>
                <span>{isClaimingStarter ? "Acuñando en Stellar..." : "Reclamar Regalo Inicial (+8 Runas)"}</span>
              </button>
            ) : onGoToForge ? (
              <button
                type="button"
                onClick={onGoToForge}
                className="flex items-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-xs sm:text-sm font-bold text-black shadow-lg transition-all cursor-pointer"
              >
                <span>🔥</span>
                <span>Ir a la Forja</span>
              </button>
            ) : null}
          </div>

          {claimToast && (
            <p className="mt-3 text-xs font-bold text-emerald-300 animate-pulse">
              ✓ {claimToast}
            </p>
          )}
        </section>
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
              Personaliza hasta 5 mazos de 8 cartas. Arrastra cartas del catálogo para equiparlas o deselecciónalas arrastrándolas fuera.
            </p>
          </div>

          {/* 5 Deck Subtabs */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 w-full md:w-auto shrink-0">
            {DECK_NAMES.map((name, idx) => {
              const isSelected = selectedDeckIdx === idx;
              const isCombatActive = activeCombatDeckIdx === idx;
              const count = decks[idx]?.length || 0;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedDeckIdx(idx)}
                  className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl px-1.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(123,43,249,0.35)]"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  {isCombatActive && <span title="Mazo activo para partidas" className="text-[10px] sm:text-xs">⚔️</span>}
                  <span className="hidden sm:inline">{name}</span>
                  <span className="sm:hidden">M{idx + 1}</span>
                  <span className={`text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-mono ${isSelected ? "bg-black/30" : "bg-zinc-800"}`}>
                    {count}/8
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deck Action Bar: Active Deck Status + Combat Metrics + Carousel Navigation */}
        <div className="my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#090C1A]/80 border border-zinc-800/80">
          {/* Active Combat Status Switcher */}
          <div className="flex items-center gap-2">
            {isActiveDeck ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 px-3 py-1.5 text-xs font-extrabold text-emerald-300 shadow-[0_0_15px_rgba(160,250,200,0.2)]">
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

          {/* Current window indicator */}
          <div className="flex items-center gap-2 self-center sm:self-auto font-mono text-xs text-zinc-400">
            <span>Ranuras en pantalla:</span>
            <span className="rounded-lg bg-zinc-800 px-2 py-0.5 text-cyan-400 font-bold">
              {carouselOffset + 1}–{carouselOffset + VISIBLE_COLUMNS} de 8
            </span>
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

        {/* 6 Deck Card Slots Window Flanked by Lateral Buttons */}
        <div className="relative flex items-center justify-between gap-1 sm:gap-3 w-full pt-2">
          {/* Lateral Previous Button */}
          <button
            type="button"
            aria-label="Ver ranuras anteriores"
            disabled={carouselOffset === 0}
            onClick={() => setCarouselOffset((prev) => Math.max(0, prev - 1))}
            className="flex h-14 w-8 sm:h-20 sm:w-11 items-center justify-center rounded-2xl bg-zinc-900/90 hover:bg-cyan-500 hover:text-black border border-zinc-700/80 hover:border-cyan-400 text-zinc-300 font-black text-xl sm:text-2xl shadow-xl transition-all active:scale-95 disabled:opacity-20 disabled:pointer-events-none cursor-pointer shrink-0 z-20"
            title="Ver ranura anterior"
          >
            ‹
          </button>

          {/* 6 Deck Card Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 justify-items-center">
            {visibleSlotIndices.map((slotIdx) => {
              const card = cardsInSelectedDeck[slotIdx];
              return (
                <div
                  key={slotIdx}
                  data-deck-slot={slotIdx}
                  className="w-full flex justify-center"
                >
                  {card ? (
                    <div className="relative group/deckcard flex justify-center w-full max-w-[140px]">
                      <CardItem
                        card={card}
                        size="sm"
                        draggable={true}
                        onDragEndRemoveFromDeck={() => handleRemoveCardFromDeck(card.id)}
                        onDragEndToDeckSlot={(c, targetIdx) => handleSwapDeckSlots(slotIdx, targetIdx)}
                        onQuickTap={onQuickTapCard}
                        onLongPress={onLongPressCard}
                      />
                      {/* Discrete Remove Button at top-right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCardFromDeck(card.id);
                        }}
                        className="absolute -top-1.5 -right-1.5 z-40 flex h-5 w-5 items-center justify-center rounded-full bg-red-950/90 hover:bg-red-800 border border-red-500/70 text-white font-black text-[10px] shadow-md active:scale-90 transition-all cursor-pointer opacity-90 group-hover/deckcard:opacity-100"
                        title="Quitar carta de este mazo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    /* Empty Deck Slot Drop Target - Exactly matches CardItem size="sm" */
                    <div
                      data-deck-slot={slotIdx}
                      className="flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-zinc-800/90 hover:border-cyan-400 hover:ring-2 hover:ring-cyan-500/40 rounded-2xl w-full max-w-[140px] aspect-[5/7] bg-zinc-900/30 transition-all duration-200 cursor-pointer select-none"
                    >
                      <span className="text-xl text-zinc-600 mb-1">🎴</span>
                      <span className="text-[11px] font-bold text-zinc-400">
                        Ranura {slotIdx + 1}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-1 max-w-[95px] leading-tight">
                        Arrastra una runa aquí
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lateral Next Button */}
          <button
            type="button"
            aria-label="Ver siguientes ranuras (ranuras 7 y 8)"
            disabled={carouselOffset >= MAX_DECK_CARDS - VISIBLE_COLUMNS}
            onClick={() => setCarouselOffset((prev) => Math.min(MAX_DECK_CARDS - VISIBLE_COLUMNS, prev + 1))}
            className="flex h-14 w-8 sm:h-20 sm:w-11 items-center justify-center rounded-2xl bg-zinc-900/90 hover:bg-cyan-500 hover:text-black border border-zinc-700/80 hover:border-cyan-400 text-zinc-300 font-black text-xl sm:text-2xl shadow-xl transition-all active:scale-95 disabled:opacity-20 disabled:pointer-events-none cursor-pointer shrink-0 z-20"
            title="Ver siguientes ranuras (7 y 8)"
          >
            ›
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: MI CATÁLOGO DE RUNAS (REPLICA INVENTORY DRAWER)                */}
      {/* ========================================================================= */}
      <section
        data-drop-zone="deck-catalog"
        className="relative w-full rounded-3xl border border-zinc-800/80 bg-[#0E1122]/90 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Top Bar: Title, Count, Info Button & Responsive Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isConnected ? "Mi catálogo de Runas" : "Catálogo de Runas"}
              </h3>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400">
                {filteredCatalog.length}
              </span>

              {/* Information (i) Guide Button */}
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800/90 hover:bg-cyan-950/80 border border-zinc-700 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 transition-all text-xs font-serif font-black shadow-sm active:scale-95 cursor-pointer"
                title="Información y Guía del Catálogo"
              >
                ℹ
              </button>
            </div>
          </div>

          {/* Filter Pills with Horizontal Smooth Scrolling on Mobile & Dynamic Counts */}
          <ElementFilterBar
            activeFilter={filterElement}
            onFilterChange={setFilterElement}
            elementCounts={elementCounts}
          />
        </div>

        {/* Info Modal / Guía del Catálogo */}
        <CatalogGuideModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          destinationLabel="al Mazo de Combate"
        />

        {/* Catalog Cards Grid */}
        <div className="pt-6">
          {filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <span className="text-3xl mb-2">🃏</span>
              <p className="font-bold text-white text-sm">
                No hay runas disponibles en esta categoría
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                {userCards.length === 0
                  ? "Aún no has reclamado tus cartas iniciales. Reclama tu regalo de bienvenida arriba."
                  : "Todas las cartas de este elemento ya están asignadas en este mazo o aún no las has adquirido."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
              {filteredCatalog.map((card) => {
                return (
                  <div key={card.id.toString()} className="flex justify-center">
                    <CardItem
                      card={card}
                      size="sm"
                      draggable={true}
                      onDragEndToDeckSlot={(c, targetIdx) => handleDropCardToDeckSlot(card, targetIdx)}
                      onQuickTap={onQuickTapCard}
                      onLongPress={onLongPressCard}
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
