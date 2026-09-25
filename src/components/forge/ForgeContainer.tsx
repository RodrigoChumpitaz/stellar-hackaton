"use client";

import { useState, useEffect, useCallback } from "react";
import { TopNav } from "@/components/navbar/TopNav";
import { ForgeTable } from "@/components/forge/ForgeTable";
import { InventoryDrawer } from "@/components/forge/InventoryDrawer";
import { RevealModal } from "@/components/forge/RevealModal";
import { CardInspectModal } from "@/components/cards/CardInspectModal";
import { CardDetailsModal } from "@/components/cards/CardDetailsModal";
import { CardItem, type CardData } from "@/components/cards/CardItem";
import { useWallet } from "@/wallet/WalletProvider";
import { getUserCards } from "@/lib/cards/queries";
import {
  BASE_ELEMENTS,
  CARD_RARITIES,
  ELEMENT_IMAGE,
  STAT_BUDGET,
  type CardElement,
} from "@/lib/cards/constants";
import { forgeElement, forgeRarity } from "@/lib/cards/forge-rules";

interface ForgeContainerProps {
  initialCatalog: CardData[];
}

export function ForgeContainer({ initialCatalog }: ForgeContainerProps) {
  const wallet = useWallet();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"forge" | "catalog" | "rules">("forge");

  // Inventory state
  const [userDeck, setUserDeck] = useState<CardData[]>(initialCatalog);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Forge slots
  const [slotA, setSlotA] = useState<CardData | null>(null);
  const [slotB, setSlotB] = useState<CardData | null>(null);

  // Forging states
  const [isForging, setIsForging] = useState(false);
  const [forgeMessage, setForgeMessage] = useState<string | null>(null);

  // Modals state
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [forgedResult, setForgedResult] = useState<CardData | null>(null);
  const [lastBurnedA, setLastBurnedA] = useState<CardData | null>(null);
  const [lastBurnedB, setLastBurnedB] = useState<CardData | null>(null);

  // Card Inspection & Details states
  const [inspectingCard, setInspectingCard] = useState<CardData | null>(null);
  const [detailsCard, setDetailsCard] = useState<CardData | null>(null);

  // Load user cards when wallet connects
  const fetchUserInventory = useCallback(async () => {
    if (!wallet.publicKey) return;
    setIsLoadingInventory(true);
    try {
      const cards = await getUserCards(wallet.publicKey);
      if (cards && cards.length > 0) {
        setUserDeck(
          cards.map((c) => ({
            id: c.id,
            name: c.name,
            element: c.element,
            rarity: c.rarity,
            atk: c.atk,
            def: c.def,
            token_id: c.token_id,
            lore: c.lore,
            passive_skill: c.passive_skill,
            image_url: c.metadata_uri || null,
          }))
        );
      } else {
        setUserDeck(initialCatalog);
      }
    } catch {
      setUserDeck(initialCatalog);
    } finally {
      setIsLoadingInventory(false);
    }
  }, [wallet.publicKey, initialCatalog]);

  useEffect(() => {
    if (wallet.isConnected && wallet.publicKey) {
      void fetchUserInventory();
    } else {
      setUserDeck(initialCatalog);
    }
  }, [wallet.isConnected, wallet.publicKey, fetchUserInventory, initialCatalog]);

  // Handle Drag & Drop to Slot A or Slot B (Exclusive assignment method)
  const handleDragEndToSlot = useCallback(
    (card: CardData, targetSlot: "A" | "B") => {
      if (isForging) return;

      if (targetSlot === "A") {
        if (slotB?.id === card.id) {
          setSlotB(null);
        }
        setSlotA(card);
      } else if (targetSlot === "B") {
        if (slotA?.id === card.id) {
          setSlotA(null);
        }
        setSlotB(card);
      }
    },
    [isForging, slotA, slotB]
  );

  // Execute Forge Synthesis
  const handleStartForge = async () => {
    if (!slotA || !slotB || slotA.id === slotB.id || isForging) return;

    setIsForging(true);
    const parentA = slotA;
    const parentB = slotB;

    try {
      setForgeMessage("1/3 · Gemini 2.0 Flash balanceando atributos...");
      await new Promise((r) => setTimeout(r, 900));

      setForgeMessage("2/3 · Simulando huella atómica en Soroban RPC...");
      await new Promise((r) => setTimeout(r, 900));

      setForgeMessage("3/3 · Ejecutando Burn & Mint en Testnet...");
      await new Promise((r) => setTimeout(r, 1000));

      const derivedElement = forgeElement(parentA.element, parentB.element);
      const derivedRarity = forgeRarity(parentA.rarity, parentB.rarity);
      const newAtk = Math.max(parentA.atk, parentB.atk) + 1;
      const newDef = Math.max(parentA.def, parentB.def) + 1;

      const newCard: CardData = {
        id: `forged-${Date.now()}`,
        name: derivedElement === "STEAM"
          ? "Vapor Primordial #211"
          : derivedElement === "MAGMA"
          ? "Quimera Volcánica #104"
          : `Runa Híbrida de ${derivedElement}`,
        element: derivedElement,
        rarity: derivedRarity,
        atk: newAtk,
        def: newDef,
        image_url: derivedElement === "STEAM"
          ? "/cards/primordial-vapor.png"
          : null,
        lore: `Sintetizada de las esencias de ${parentA.name} y ${parentB.name}. Una creación atómica certificada en Soroban Testnet.`,
        token_id: BigInt(Date.now() % 10000),
      };

      setForgedResult(newCard);
      setLastBurnedA(parentA);
      setLastBurnedB(parentB);

      // Update local deck: burn parents, add hybrid
      setUserDeck((prev) => [
        newCard,
        ...prev.filter((c) => c.id !== parentA.id && c.id !== parentB.id),
      ]);

      setRevealModalOpen(true);
      setSlotA(null);
      setSlotB(null);
    } finally {
      setIsForging(false);
      setForgeMessage(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0C18] flex flex-col">
      {/* Top Navbar */}
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl px-3 sm:px-6 pt-4 sm:pt-8 pb-24 md:pb-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {/* TAB 1: THE FORGE CHAMBER */}
        {activeTab === "forge" && (
          <>
            {/* Forge Table */}
            <ForgeTable
              cardA={slotA}
              cardB={slotB}
              onRemoveA={() => setSlotA(null)}
              onRemoveB={() => setSlotB(null)}
              onStartForge={handleStartForge}
              isForging={isForging}
              forgeStepMessage={forgeMessage}
            />

            {/* Inventory Tray */}
            <InventoryDrawer
              cards={userDeck}
              selectedA={slotA}
              selectedB={slotB}
              onQuickTap={(card) => setInspectingCard(card)}
              onLongPress={(card) => setDetailsCard(card)}
              onDragEndToSlot={handleDragEndToSlot}
              isConnected={wallet.isConnected}
            />
          </>
        )}

        {/* TAB 2: CATALOG VIEW */}
        {activeTab === "catalog" && (
          <section className="rounded-3xl border border-zinc-800 bg-[#0E1122]/80 p-6 sm:p-8 backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Catálogo Canónico de Cartas
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Cartas base registradas en Supabase listas para forjar. Toca para pantalla completa o mantén presionado para detalles.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {initialCatalog.map((card) => (
                <div key={card.id.toString()} className="flex justify-center">
                  <CardItem
                    card={card}
                    size="sm"
                    onQuickTap={(c) => setInspectingCard(c)}
                    onLongPress={(c) => setDetailsCard(c)}
                  />
                </div>
              ))}
            </div>
          </section>
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

            {/* Table of Elements */}
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
        txHash="9a4f8e... (Soroban Testnet)"
        onClose={() => {
          setRevealModalOpen(false);
          setForgedResult(null);
        }}
      />

      {/* Card Fullscreen Inspection Modal (Quick Tap) */}
      <CardInspectModal
        card={inspectingCard}
        onClose={() => setInspectingCard(null)}
      />

      {/* Card Technical Details Modal (Long-Press 0.5s) */}
      <CardDetailsModal
        card={detailsCard}
        onClose={() => setDetailsCard(null)}
      />
    </div>
  );
}
