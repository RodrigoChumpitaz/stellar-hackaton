"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Card } from "@/modules/cards/domain/types";
import { synthesizeHybridCard } from "../../application/forge-service";

interface UseForgeWorkbenchProps {
  initialCatalog: Card[];
  walletAddress?: string | null;
  isConnected: boolean;
}

export function useForgeWorkbench({
  initialCatalog,
  walletAddress,
  isConnected,
}: UseForgeWorkbenchProps) {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"forge" | "catalog" | "rules">("forge");

  // Slots State
  const [slotA, setSlotA] = useState<Card | null>(null);
  const [slotB, setSlotB] = useState<Card | null>(null);

  // Deck & Inventory
  const [userDeck, setUserDeck] = useState<Card[]>(initialCatalog);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Forge Lifecycle
  const [isForging, setIsForging] = useState(false);
  const [forgeMessage, setForgeMessage] = useState("");
  const [forgedResult, setForgedResult] = useState<Card | null>(null);
  const [lastBurnedA, setLastBurnedA] = useState<Card | null>(null);
  const [lastBurnedB, setLastBurnedB] = useState<Card | null>(null);
  const [revealModalOpen, setRevealModalOpen] = useState(false);

  // Inspection & Details Modals
  const [inspectingCard, setInspectingCard] = useState<Card | null>(null);
  const [detailsCard, setDetailsCard] = useState<Card | null>(null);

  const prevConnectedRef = useRef(isConnected);

  // Fetch Inventory from Supabase (Read Model)
  useEffect(() => {
    let ignore = false;

    if (!isConnected || !walletAddress) {
      if (prevConnectedRef.current) {
        prevConnectedRef.current = false;
        queueMicrotask(() => {
          setUserDeck(initialCatalog);
        });
      }
      return;
    }

    prevConnectedRef.current = true;

    const loadInventory = async () => {
      await Promise.resolve();
      if (ignore) return;
      setIsLoadingInventory(true);

      try {
        const res = await fetch(`/api/cards?wallet=${encodeURIComponent(walletAddress)}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data?.cards && Array.isArray(data.cards) && data.cards.length > 0) {
            setUserDeck(data.cards);
            return;
          }
        }
        if (!ignore) setUserDeck(initialCatalog);
      } catch {
        if (!ignore) setUserDeck(initialCatalog);
      } finally {
        if (!ignore) setIsLoadingInventory(false);
      }
    };

    void loadInventory();

    return () => {
      ignore = true;
    };
  }, [isConnected, walletAddress, initialCatalog]);

  // Exclusive Drag & Drop slot assignment
  const equipCardToSlot = useCallback(
    (card: Card, targetSlot: "A" | "B") => {
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

  const removeCardFromSlot = useCallback(
    (targetSlot: "A" | "B") => {
      if (isForging) return;
      if (targetSlot === "A") setSlotA(null);
      if (targetSlot === "B") setSlotB(null);
    },
    [isForging]
  );

  // Execute Atomic Forge
  const startForge = useCallback(async () => {
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

      // Delegated to Application Service
      const newCard = synthesizeHybridCard(parentA, parentB);

      setForgedResult(newCard);
      setLastBurnedA(parentA);
      setLastBurnedB(parentB);

      // Atomic local state burn & mint
      setUserDeck((prev) => [
        newCard,
        ...prev.filter((c) => c.id !== parentA.id && c.id !== parentB.id),
      ]);

      setRevealModalOpen(true);
      setSlotA(null);
      setSlotB(null);
    } finally {
      setIsForging(false);
      setForgeMessage("");
    }
  }, [slotA, slotB, isForging]);

  const closeRevealModal = useCallback(() => {
    setRevealModalOpen(false);
  }, []);

  const closeInspectingCard = useCallback(() => {
    setInspectingCard(null);
  }, []);

  const closeDetailsCard = useCallback(() => {
    setDetailsCard(null);
  }, []);

  return {
    activeTab,
    setActiveTab,
    slotA,
    slotB,
    userDeck,
    isLoadingInventory,
    isForging,
    forgeMessage,
    forgedResult,
    lastBurnedA,
    lastBurnedB,
    revealModalOpen,
    inspectingCard,
    detailsCard,
    equipCardToSlot,
    removeCardFromSlot,
    startForge,
    closeRevealModal,
    setInspectingCard,
    closeInspectingCard,
    setDetailsCard,
    closeDetailsCard,
  };
}
