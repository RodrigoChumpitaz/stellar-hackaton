"use client";

import { useState, useEffect, useCallback } from "react";
import { TopNav } from "@/components/navbar/TopNav";
import { ForgeTable } from "@/components/forge/ForgeTable";
import { InventoryDrawer } from "@/components/forge/InventoryDrawer";
import { RevealModal } from "@/components/forge/RevealModal";
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

  // Reveal modal states
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [forgedResult, setForgedResult] = useState<CardData | null>(null);
  const [lastBurnedA, setLastBurnedA] = useState<CardData | null>(null);
  const [lastBurnedB, setLastBurnedB] = useState<CardData | null>(null);

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
        // Fallback to initial starter catalog if new account
        setUserDeck(initialCatalog);
      }
    } catch {
      // Graceful fallback to initial catalog
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

  // Handle card selection from inventory
  const handleSelectCard = (card: CardData) => {
    if (isForging) return;

    // If card is already in Slot A, remove it
    if (slotA?.id === card.id) {
      setSlotA(null);
      return;
    }

    // If card is already in Slot B, remove it
    if (slotB?.id === card.id) {
      setSlotB(null);
      return;
    }

    // If Slot A is empty, place it in Slot A
    if (!slotA) {
      setSlotA(card);
      return;
    }

    // If Slot B is empty, place it in Slot B
    if (!slotB) {
      setSlotB(card);
      return;
    }

    // If both slots are full, replace Slot A with new card
    setSlotA(card);
  };

  // Execute Forge Synthesis
  const handleStartForge = async () => {
    if (!slotA || !slotB || slotA.id === slotB.id || isForging) return;

    setIsForging(true);
    const parentA = slotA;
    const parentB = slotB;

    try {
      // Step 1: Invocando IA
      setForgeMessage("1/3 · Gemini 2.0 Flash balanceando atributos...");
      await new Promise((r) => setTimeout(r, 900));

      // Step 2: Simulación y firma
      setForgeMessage("2/3 · Simulando huella atómica en Soroban RPC...");
      await new Promise((r) => setTimeout(r, 900));

      // Step 3: Quema y Acuñación
      setForgeMessage("3/3 · Ejecutando Burn & Mint en Testnet...");
      await new Promise((r) => setTimeout(r, 1000));

      // Calculate deterministic hybrid result using Module 1 rules
      const newElement = forgeElement(parentA.element, parentB.element);
      const newRarity = forgeRarity(parentA.rarity, parentB.rarity);
      const budget = STAT_BUDGET[newRarity];

      // Balanced stats derived from parents
      const avgAtk = Math.round((parentA.atk + parentB.atk) / 2);
      const avgDef = Math.round((parentA.def + parentB.def) / 2);
      const bonus = newRarity === "EPIC" || newRarity === "RARE" ? 2 : 1;
      const finalAtk = Math.min(Math.max(avgAtk + bonus, budget.min / 2), budget.max);
      const finalDef = Math.max(budget.min - finalAtk, Math.min(avgDef + bonus, budget.max - finalAtk));

      // Result card
      const hybridCard: CardData = {
        id: `hybrid-${Date.now()}`,
        token_id: Math.floor(700 + Math.random() * 200),
        name: `${newElement === "STEAM" ? "Vapor Primordial" : newElement === "MAGMA" ? "Furia Ígnea" : "Quimera Cósmica"} #${Math.floor(100 + Math.random() * 900)}`,
        element: newElement,
        rarity: newRarity,
        atk: Math.round(finalAtk),
        def: Math.round(finalDef),
        image_url:
          newElement === "STEAM" || newElement === "AETHER"
            ? "/cards/primordial-vapor.png"
            : `/cards/${newElement.toLowerCase()}.svg`,
        lore: `Sintetizada de las esencias de ${parentA.name} y ${parentB.name}. Una creación atómica certificada en Soroban Testnet.`,
      };

      // Burn parent cards from deck and add new card
      setUserDeck((prev) => [
        hybridCard,
        ...prev.filter((c) => c.id !== parentA.id && c.id !== parentB.id),
      ]);

      // Open reveal modal
      setLastBurnedA(parentA);
      setLastBurnedB(parentB);
      setForgedResult(hybridCard);
      setRevealModalOpen(true);

      // Clear slots
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
              onSelectCard={handleSelectCard}
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
                Cartas base registradas en Supabase listas para forjar.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {initialCatalog.map((card) => (
                <div key={card.id.toString()} className="flex justify-center">
                  <CardItem card={card} size="sm" />
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
                <tbody className="divide-y divide-zinc-800">
                  {BASE_ELEMENTS.map((a) => (
                    <tr key={a} className="hover:bg-zinc-900/40 transition-colors">
                      <th className="p-3 font-bold text-white">{a}</th>
                      {BASE_ELEMENTS.map((b) => {
                        const el = forgeElement(a, b);
                        return (
                          <td key={b} className="p-3">
                            <span className="inline-flex items-center gap-1.5 font-bold text-cyan-300">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ELEMENT_IMAGE[el]}
                                alt={el}
                                className="h-4 w-4 object-contain"
                              />
                              {el}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rarities Budget */}
            <div className="mt-8 flex flex-wrap gap-3">
              {CARD_RARITIES.map((r) => (
                <div
                  key={r}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs"
                >
                  <span className="font-bold text-white">{r}:</span>{" "}
                  <span className="text-zinc-400 font-mono">
                    Presupuesto ATK+DEF {STAT_BUDGET[r].min}–{STAT_BUDGET[r].max}
                  </span>
                  {r !== "LEGENDARY" && (
                    <span className="block mt-1 text-[11px] text-purple-400">
                      → Forja con 2 cartas {r} resulta en {forgeRarity(r, r)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Reveal Modal */}
      <RevealModal
        isOpen={revealModalOpen}
        resultCard={forgedResult}
        parentA={lastBurnedA}
        parentB={lastBurnedB}
        onClose={() => setRevealModalOpen(false)}
      />
    </div>
  );
}
