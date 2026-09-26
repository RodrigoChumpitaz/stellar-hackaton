"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { TopNav } from "@/shared/ui/navbar/TopNav";
import { ForgeTable } from "./ForgeTable";
import { InventoryDrawer } from "./InventoryDrawer";
import { AetherGateSplash } from "./AetherGateSplash";
import { useWallet } from "@/modules/wallet";
import { CardItem } from "@/modules/cards/ui/CardItem";
import { BASE_ELEMENTS } from "@/modules/cards/domain/constants";
import { forgeElement } from "../domain/forge-rules";
import type { Card } from "@/modules/cards/domain/types";
import { useForgeWorkbench } from "./hooks/useForgeWorkbench";

import { RevealModal } from "./RevealModal";
import { CardInspectModal } from "@/modules/cards/ui/CardInspectModal";
import { CardDetailsModal } from "@/modules/cards/ui/CardDetailsModal";
import { DeckBuilderView } from "@/modules/deck/ui/DeckBuilderView";

interface ForgeContainerProps {
  initialCatalog: Card[];
}

export function ForgeContainer({ initialCatalog }: ForgeContainerProps) {
  const wallet = useWallet();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const {
    activeTab,
    setActiveTab,
    slotA,
    slotB,
    userDeck,
    hasClaimedStarter,
    isForging,
    forgeMessage,
    forgedResult,
    lastBurnedA,
    lastBurnedB,
    revealModalOpen,
    inspectingCard,
    detailsCard,
    equipCardToSlot,
    autoEquipCard,
    removeCardFromSlot,
    startForge,
    closeRevealModal,
    setInspectingCard,
    closeInspectingCard,
    setDetailsCard,
    closeDetailsCard,
    claimStarterPack,
    isClaimingStarter,
    claimToast,
    lastTxHash,
    forgeError,
    clearForgeError,
  } = useForgeWorkbench({
    initialCatalog,
    walletAddress: wallet.publicKey || wallet.smartAccountId,
    isConnected: wallet.isConnected,
    signTransaction: wallet.signTransaction,
  });

  return (
    <div className="min-h-screen w-full bg-[#0A0C18] flex flex-col">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isConnectModalOpen={isConnectModalOpen}
        onConnectModalChange={setIsConnectModalOpen}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl px-3 sm:px-6 pt-4 sm:pt-8 pb-24 md:pb-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {/* TAB 1: THE FORGE CHAMBER */}
        {activeTab === "forge" && (
          !wallet.isConnected ? (
            <AetherGateSplash
              onOpenConnect={() => setIsConnectModalOpen(true)}
              onExploreCatalog={() => setActiveTab("decks")}
              onExploreRules={() => setActiveTab("rules")}
            />
          ) : (
            <>
              {forgeError && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs sm:text-sm text-red-200">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">⚠️ Error de Forja:</span>
                    <span>{forgeError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearForgeError}
                    className="rounded-lg bg-red-900/60 hover:bg-red-800 px-2 py-1 text-xs text-white cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              <ForgeTable
                cardA={slotA}
                cardB={slotB}
                onRemoveA={() => removeCardFromSlot("A")}
                onRemoveB={() => removeCardFromSlot("B")}
                onStartForge={startForge}
                isForging={isForging}
                forgeStepMessage={forgeMessage}
                onDragEndToSlot={equipCardToSlot}
              />


              <InventoryDrawer
                cards={userDeck}
                selectedA={slotA}
                selectedB={slotB}
                onQuickTap={(card) => setInspectingCard(card)}
                onLongPress={(card) => setDetailsCard(card)}
                onDragEndToSlot={equipCardToSlot}
                isConnected={wallet.isConnected}
                onClaimStarter={claimStarterPack}
                isClaimingStarter={isClaimingStarter}
                claimToast={claimToast}
                hasClaimedStarter={hasClaimedStarter}
              />
            </>
          )
        )}


        {/* TAB 2: MIS MAZOS (CONFIGURAR MAZO Y CATÁLOGO DE RUNAS) */}
        {activeTab === "decks" && (
          <DeckBuilderView
            userCards={userDeck.length > 0 ? userDeck : initialCatalog}
            walletAddress={wallet.publicKey || wallet.smartAccountId}
            isConnected={wallet.isConnected}
            onQuickTapCard={(card) => setInspectingCard(card)}
            onLongPressCard={(card) => setDetailsCard(card)}
          />
        )}

        {/* TAB 3: DETERMINISTIC FORGE RULES MATRIX */}
        {activeTab === "rules" && (
          <section className="rounded-3xl border border-zinc-800 bg-[#0E1122]/80 p-6 sm:p-8 backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Matriz Determinista de Fusión (Soroban Core)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Reglas matemáticas on-chain del Módulo 1 probadas con cobertura total.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/40">
              <table className="w-full text-left text-xs sm:text-sm text-zinc-300">
                <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="p-3">Elemento A \ B</th>
                    {BASE_ELEMENTS.map((b) => (
                      <th key={b} className="p-3">
                        {b}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-mono">
                  {BASE_ELEMENTS.map((a) => (
                    <tr key={a} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-bold text-cyan-400">{a}</td>
                      {BASE_ELEMENTS.map((b) => (
                        <td key={b} className="p-3 font-semibold">
                          {forgeElement(a, b)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Reveal Modal (After Forging) */}
      <RevealModal
        isOpen={revealModalOpen}
        resultCard={forgedResult}
        parentA={lastBurnedA}
        parentB={lastBurnedB}
        txHash={lastTxHash || null}
        onClose={closeRevealModal}
      />

      {/* Card Fullscreen Inspection Modal (Quick Tap) */}
      <CardInspectModal
        card={inspectingCard}
        onClose={closeInspectingCard}
      />

      {/* Card Technical Details Modal (Long-Press 0.5s) */}
      <CardDetailsModal
        card={detailsCard}
        onClose={closeDetailsCard}
      />
    </div>
  );
}
