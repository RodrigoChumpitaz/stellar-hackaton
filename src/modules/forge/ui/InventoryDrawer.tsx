"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardItem, type CardData } from "@/modules/cards/ui/CardItem";
import { BASE_ELEMENTS } from "@/modules/cards/domain/constants";
import { ElementFilterBar, type FilterElement } from "@/modules/cards/ui/ElementFilterBar";
import { CatalogGuideModal } from "@/modules/cards/ui/CatalogGuideModal";


interface InventoryDrawerProps {
  cards: CardData[];
  selectedA: CardData | null;
  selectedB: CardData | null;
  onQuickTap: (card: CardData) => void;
  onLongPress: (card: CardData) => void;
  onDragEndToSlot: (card: CardData, targetSlot: "A" | "B") => void;
  isConnected: boolean;
  onClaimStarter?: () => void;
  isClaimingStarter?: boolean;
  claimToast?: string | null;
  hasClaimedStarter?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

export function InventoryDrawer({
  cards,
  selectedA,
  selectedB,
  onQuickTap,
  onLongPress,
  onDragEndToSlot,
  isConnected,
  onClaimStarter,
  isClaimingStarter,
  claimToast,
  hasClaimedStarter = false,
  onDragStart,
  onDragEnd,
  className = "",
}: InventoryDrawerProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const [showInfoModal, setShowInfoModal] = useState(false);

  // Ocultar del mazo de runas cualquier carta actualmente colocada en Ranura A o Ranura B
  const availableCards = useMemo(() => {
    return cards.filter(
      (c) => c.id !== selectedA?.id && c.id !== selectedB?.id
    );
  }, [cards, selectedA, selectedB]);

  const elementCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: availableCards.length,
      FIRE: 0,
      WATER: 0,
      EARTH: 0,
      AIR: 0,
      HYBRIDS: 0,
    };
    for (const c of availableCards) {
      if (counts[c.element] !== undefined) {
        counts[c.element]++;
      }
      if (!BASE_ELEMENTS.includes(c.element as (typeof BASE_ELEMENTS)[number])) {
        counts.HYBRIDS++;
      }
    }
    return counts;
  }, [availableCards]);

  const filteredCards = useMemo(() => {
    if (activeFilter === "ALL") return availableCards;
    if (activeFilter === "HYBRIDS") {
      return availableCards.filter(
        (c) => !BASE_ELEMENTS.includes(c.element as (typeof BASE_ELEMENTS)[number])
      );
    }
    return availableCards.filter((c) => c.element === activeFilter);
  }, [availableCards, activeFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 350, damping: 25 },
    },
  };

  return (
    <section
      data-drop-zone="inventory"
      id="inventory-drawer"
      className={`relative ${className || "z-20"} w-full rounded-3xl border border-zinc-800/80 bg-[#0E1122]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-200`}
    >
      {/* Top Bar: Title, Count, Info Button & Responsive Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isConnected ? "Mi catálogo de Runas" : "Catálogo de Runas"}
            </h3>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400">
              {filteredCards.length}
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

          {isConnected && !hasClaimedStarter && onClaimStarter && (
            <button
              type="button"
              onClick={onClaimStarter}
              disabled={isClaimingStarter}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-600/30 to-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-200 hover:from-purple-600/50 hover:to-cyan-500/40 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Añadir 8 cartas iniciales a tu inventario"
            >
              <span>🎁</span>
              <span>{isClaimingStarter ? "Acuñando..." : "Mazo Inicial (+8)"}</span>
            </button>
          )}
        </div>

        {claimToast && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span>✓</span>
            <span>{claimToast}</span>
          </div>
        )}

        {/* Filter Pills */}
        <ElementFilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          elementCounts={elementCounts}
        />
      </div>

      {/* Info Modal / Guía del Catálogo */}
      <CatalogGuideModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        destinationLabel="a la Forja para sintetizar un nuevo híbrido"
      />

      {/* Cards Grid with Staggered Framer Motion Animation */}
      <div className="pt-6">
        {filteredCards.length === 0 ? (
          cards.length === 0 && !hasClaimedStarter ? (
            /* Cofre de iniciación para cuentas nuevas con 0 cartas */
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-purple-950/10 to-transparent">
              <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 ring-1 ring-cyan-400/40 shadow-[0_0_30px_rgba(0,229,255,0.25)] animate-pulse">
                <span className="text-4xl">🎁</span>
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                ¡Bienvenido a Stellar Runes!
              </h4>
              <p className="mt-1 max-w-md text-xs sm:text-sm text-zinc-300">
                Tu mazo está vacío. Abre tu <strong className="text-cyan-400">Cofre de Iniciación</strong> para recibir
                tus primeras 8 runas elementales (Fuego, Agua, Tierra y Viento) y comenzar a forjar en Soroban Testnet.
              </p>
              {onClaimStarter && (
                <button
                  type="button"
                  onClick={onClaimStarter}
                  disabled={isClaimingStarter}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-400 px-6 py-3 text-sm font-extrabold text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>✨</span>
                  <span>{isClaimingStarter ? "Acuñando tus 8 Runas..." : "Reclamar Cofre Inicial Gratuito (+8 Cartas)"}</span>
                </button>
              )}
            </div>
          ) : availableCards.length === 0 && (selectedA || selectedB) ? (
            /* Todas las cartas del mazo están en el altar de forja */
            <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-950/20">
              <span className="text-3xl mb-2">⚡</span>
              <p className="font-bold text-white text-sm">Tus cartas están en el Altar de Forja</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Has asignado tus cartas a las ranuras de la forja. Arrastra una carta hacia abajo o pulsa &ldquo;Quitar&rdquo; para devolverla al mazo.
              </p>
            </div>
          ) : (
            /* Estado vacío regular (cuando ya reclamó o tras filtrar elemento) */
            <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <span className="text-3xl mb-2">🃏</span>
              <p className="font-bold text-white text-sm">
                {cards.length === 0 ? "Tu mazo no tiene cartas disponibles" : "No hay cartas en esta categoría"}
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                {cards.length === 0
                  ? "Has utilizado tus cartas en la forja. Consigue o forja nuevas runas para continuar."
                  : activeFilter !== "ALL"
                    ? "No posees cartas con el elemento seleccionado. Elige otra categoría o vuelve a 'Todos'."
                    : "Tu inventario está vacío en este momento."}
              </p>
              {activeFilter !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("ALL")}
                  className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-600 transition-all cursor-pointer"
                >
                  Ver todas las cartas
                </button>
              )}
            </div>
          )
        ) : (
          <motion.div
            key={activeFilter}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center"
          >
            <AnimatePresence mode="popLayout">
              {filteredCards.map((card) => (
                <motion.div
                  key={card.id.toString()}
                  layout="position"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                  className="w-full flex justify-center"
                >
                  <CardItem
                    card={card}
                    draggable={true}
                    onQuickTap={onQuickTap}
                    onLongPress={onLongPress}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragEndToSlot={onDragEndToSlot}
                    size="sm"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

