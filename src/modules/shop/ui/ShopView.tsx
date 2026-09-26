"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card } from "@/modules/cards/domain/types";
import type { ShopCategory, BoosterPackDefinition, SingleCardListing, CatalystItem } from "../domain/shop-types";
import { BOOSTER_PACKS, DAILY_SINGLES, CATALYST_ITEMS } from "../domain/shop-catalog";
import { purchaseBoosterPack, purchaseSingleCard, purchaseCatalyst } from "../application/shop-service";
import { ShopItemCard } from "./ShopItemCard";
import { PackOpeningModal } from "./PackOpeningModal";
import { SparklesIcon, FireIcon } from "@/shared/ui/icons/Elements";

interface ShopViewProps {
  xlmBalance: number;
  isConnected: boolean;
  onOpenConnect: () => void;
  onFundFriendbot?: () => Promise<boolean>;
  onCardsPurchased: (cards: Card[]) => void;
  onGoToForge?: () => void;
  onGoToDecks?: () => void;
}

export function ShopView({
  xlmBalance,
  isConnected,
  onOpenConnect,
  onFundFriendbot,
  onCardsPurchased,
  onGoToForge,
  onGoToDecks,
}: ShopViewProps) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("PACKS");
  const [localXlm, setLocalXlm] = useState<number>(xlmBalance);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pack Opening Modal State
  const [openingPack, setOpeningPack] = useState<BoosterPackDefinition | null>(null);
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>();
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);

  // Sync balance if prop changes
  const effectiveXlm = Math.max(0, localXlm !== xlmBalance && xlmBalance > 0 ? xlmBalance : localXlm);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleFundFriendbot = async () => {
    if (isFunding) return;
    setIsFunding(true);
    try {
      if (onFundFriendbot) {
        const ok = await onFundFriendbot();
        if (ok) {
          showToast("¡Cuenta fondeada con +10,000 XLM en Stellar Testnet!");
          return;
        }
      }
      // Demo / Offline fallback: fund 10,000 XLM locally
      setLocalXlm((prev) => prev + 10000);
      showToast("¡Recarga de +10,000 XLM completada con éxito!");
    } catch {
      setLocalXlm((prev) => prev + 10000);
      showToast("¡Recarga de +10,000 XLM completada!");
    } finally {
      setIsFunding(false);
    }
  };

  // Comprar Sobre
  const handleBuyPack = async (pack: BoosterPackDefinition) => {
    if (!isConnected) {
      onOpenConnect();
      return;
    }

    setIsProcessing(true);
    try {
      const res = await purchaseBoosterPack(pack, effectiveXlm);
      if (!res.success) {
        showToast(res.error || "No se pudo realizar la compra");
        return;
      }

      setLocalXlm((prev) => Math.max(0, prev - res.deductedXlm));
      setOpeningPack(pack);
      setOpenedCards(res.cards || []);
      setLastTxHash(res.txHash);
      setIsPackModalOpen(true);

      // Inyectar de inmediato a la colección
      if (res.cards && res.cards.length > 0) {
        onCardsPurchased(res.cards);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Comprar Carta Individual
  const handleBuySingle = async (single: SingleCardListing) => {
    if (!isConnected) {
      onOpenConnect();
      return;
    }

    setIsProcessing(true);
    try {
      const res = await purchaseSingleCard(single, effectiveXlm);
      if (!res.success) {
        showToast(res.error || "No se pudo realizar la compra");
        return;
      }

      setLocalXlm((prev) => Math.max(0, prev - res.deductedXlm));
      if (res.cards && res.cards.length > 0) {
        onCardsPurchased(res.cards);
        showToast(`¡Has adquirido "${single.card.name}"! La carta ya está en tu colección.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Comprar Catalizador
  const handleBuyCatalyst = async (catalyst: CatalystItem) => {
    if (!isConnected) {
      onOpenConnect();
      return;
    }

    setIsProcessing(true);
    try {
      const res = await purchaseCatalyst(catalyst, effectiveXlm);
      if (!res.success) {
        showToast(res.error || "No se pudo realizar la compra");
        return;
      }

      setLocalXlm((prev) => Math.max(0, prev - res.deductedXlm));
      showToast(`¡"${catalyst.name}" añadido a tu alijo alquímico!`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl border border-cyan-400 bg-[#0c1228]/95 px-5 py-3 shadow-2xl shadow-cyan-950/80 text-xs font-bold text-white backdrop-blur-md"
          >
            <span className="text-cyan-400 text-base">✨</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner & Player Wallet Status */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#0c1126] via-[#121633] to-[#0a0d1e] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-lg border border-cyan-500/40">
                🏪
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Bazar Astral de Runas
              </h2>
              <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/40">
                MERCADO TCG
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Adquiere sobres de refuerzo con apertura interactiva, recluta criaturas legendarias del mercado diario o sintetiza catalizadores para La Forja.
            </p>
          </div>

          {/* Wallet Balance Card in Shop */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-auto rounded-2xl border border-cyan-500/30 bg-[#080b18]/80 p-4 shadow-lg flex items-center justify-between sm:justify-start gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  Tu Saldo Stellar
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black font-mono text-white">
                    {effectiveXlm.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-xs font-bold text-cyan-400">XLM</span>
                </div>
              </div>

              {/* Friendbot Recharge Button */}
              {isConnected ? (
                <button
                  type="button"
                  disabled={isFunding}
                  onClick={handleFundFriendbot}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/60 px-3 py-2 text-[11px] font-bold text-cyan-300 transition-all cursor-pointer"
                  title="Recargar saldo de prueba gratuito en Stellar Testnet"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{isFunding ? "Fondeando..." : "+10,000 XLM"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConnect}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3.5 py-2 text-xs font-bold text-black shadow-md cursor-pointer hover:brightness-110"
                >
                  Conectar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-4">
          <button
            type="button"
            onClick={() => setActiveCategory("PACKS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "PACKS"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-950/60"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <span>📦</span>
            <span>Sobres y Cofres ({BOOSTER_PACKS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("SINGLES")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "SINGLES"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-950/60"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <span>🎴</span>
            <span>Mercado Diario de Singles ({DAILY_SINGLES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("CATALYSTS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "CATALYSTS"
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-950/60"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <span>🔮</span>
            <span>Catalizadores de Forja ({CATALYST_ITEMS.length})</span>
          </button>
        </div>
      </section>

      {/* Grid of Catalog Items according to Category */}
      <section>
        {activeCategory === "PACKS" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {BOOSTER_PACKS.map((pack) => (
              <ShopItemCard
                key={pack.id}
                item={pack}
                userXlm={effectiveXlm}
                isProcessing={isProcessing}
                onPurchase={() => handleBuyPack(pack)}
              />
            ))}
          </div>
        )}

        {activeCategory === "SINGLES" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DAILY_SINGLES.map((single) => (
              <ShopItemCard
                key={single.id}
                item={single}
                userXlm={effectiveXlm}
                isProcessing={isProcessing}
                onPurchase={() => handleBuySingle(single)}
              />
            ))}
          </div>
        )}

        {activeCategory === "CATALYSTS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CATALYST_ITEMS.map((cat) => (
              <ShopItemCard
                key={cat.id}
                item={cat}
                userXlm={effectiveXlm}
                isProcessing={isProcessing}
                onPurchase={() => handleBuyCatalyst(cat)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Cinematic Pack Opening Modal */}
      <PackOpeningModal
        isOpen={isPackModalOpen}
        pack={openingPack}
        cards={openedCards}
        txHash={lastTxHash}
        onClose={() => {
          setIsPackModalOpen(false);
          setOpeningPack(null);
        }}
        onClaimAndGoToDecks={() => {
          setIsPackModalOpen(false);
          setOpeningPack(null);
          if (onGoToDecks) onGoToDecks();
        }}
        onClaimAndGoToForge={() => {
          setIsPackModalOpen(false);
          setOpeningPack(null);
          if (onGoToForge) onGoToForge();
        }}
      />
    </div>
  );
}
