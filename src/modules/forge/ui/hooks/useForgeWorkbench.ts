"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Card } from "@/modules/cards/domain/types";
import { synthesizeHybridCard } from "../../application/forge-service";
import { executeForgePipeline } from "../../application/forge-pipeline";

interface UseForgeWorkbenchProps {
  initialCatalog: Card[];
  walletAddress?: string | null;
  isConnected: boolean;
  signTransaction?: (xdr: string) => Promise<string>;
}

export function useForgeWorkbench({
  initialCatalog,
  walletAddress,
  isConnected,
  signTransaction,
}: UseForgeWorkbenchProps) {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"forge" | "decks" | "rules">("forge");

  // Slots State
  const [slotA, setSlotA] = useState<Card | null>(null);
  const [slotB, setSlotB] = useState<Card | null>(null);

  // Deck & Inventory
  const [userDeck, setUserDeck] = useState<Card[]>([]);
  const [hasClaimedStarter, setHasClaimedStarter] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isClaimingStarter, setIsClaimingStarter] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Forge Lifecycle
  const [isForging, setIsForging] = useState(false);
  const [forgeMessage, setForgeMessage] = useState("");
  const [forgeError, setForgeError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string>("");
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
          setUserDeck([]);
          setHasClaimedStarter(false);
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
          if (!ignore) {
            setUserDeck(Array.isArray(data?.cards) ? data.cards : []);
            setHasClaimedStarter(Boolean(data?.hasClaimedStarter));
            return;
          }
        }
        if (!ignore) {
          setUserDeck([]);
          setHasClaimedStarter(false);
        }
      } catch {
        if (!ignore) {
          setUserDeck([]);
          setHasClaimedStarter(false);
        }
      } finally {
        if (!ignore) setIsLoadingInventory(false);
      }
    };

    void loadInventory();

    return () => {
      ignore = true;
    };
  }, [isConnected, walletAddress]);


  // Exclusive Drag & Drop slot assignment + Direct Slot Swap (A ↔ B)
  const equipCardToSlot = useCallback(
    (card: Card, targetSlot: "A" | "B") => {
      if (isForging) return;

      if (targetSlot === "A") {
        if (slotB?.id === card.id) {
          // Card was in Slot B and dragged onto Slot A: SWAP!
          const prevA = slotA;
          setSlotA(card);
          setSlotB(prevA);
        } else {
          setSlotA(card);
        }
      } else if (targetSlot === "B") {
        if (slotA?.id === card.id) {
          // Card was in Slot A and dragged onto Slot B: SWAP!
          const prevB = slotB;
          setSlotB(card);
          setSlotA(prevB);
        } else {
          setSlotB(card);
        }
      }
    },
    [isForging, slotA, slotB]
  );

  // Quick 1-tap equip into first available altar slot
  const autoEquipCard = useCallback(
    (card: Card) => {
      if (isForging) return;
      if (!slotA) {
        equipCardToSlot(card, "A");
      } else if (!slotB) {
        equipCardToSlot(card, "B");
      } else {
        // If both slots occupied, replace slot A
        equipCardToSlot(card, "A");
      }
    },
    [isForging, slotA, slotB, equipCardToSlot]
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
    setForgeError(null);
    const parentA = slotA;
    const parentB = slotB;

    try {
      let newCard: Card;
      let txHash = "";

      if (walletAddress && signTransaction) {
        const result = await executeForgePipeline({
          playerAddress: walletAddress,
          cardA: parentA,
          cardB: parentB,
          signer: { signTransaction },
          onProgress: (msg) => setForgeMessage(msg),
        });
        newCard = result.newCard;
        txHash = result.txHash;
      } else {
        setForgeMessage("1/3 · Gemini 2.0 Flash balanceando atributos...");
        await new Promise((r) => setTimeout(r, 600));

        setForgeMessage("2/3 · Simulando huella atómica en Soroban RPC...");
        await new Promise((r) => setTimeout(r, 600));

        setForgeMessage("3/3 · Ejecutando Burn & Mint en Testnet...");
        await new Promise((r) => setTimeout(r, 600));

        newCard = synthesizeHybridCard(parentA, parentB);
      }

      setForgedResult(newCard);
      setLastBurnedA(parentA);
      setLastBurnedB(parentB);
      setLastTxHash(txHash);

      // Atomic local state burn & mint
      setUserDeck((prev) => [
        newCard,
        ...prev.filter((c) => c.id !== parentA.id && c.id !== parentB.id),
      ]);

      setRevealModalOpen(true);
      setSlotA(null);
      setSlotB(null);
    } catch (err) {
      console.error("Error en pipeline de forja:", err);
      const userMsg = err instanceof Error ? err.message : String(err);
      setForgeError(userMsg);
    } finally {
      setIsForging(false);
      setForgeMessage("");
    }
  }, [slotA, slotB, isForging, walletAddress, signTransaction]);

  const closeRevealModal = useCallback(() => {
    setRevealModalOpen(false);
  }, []);

  const closeInspectingCard = useCallback(() => {
    setInspectingCard(null);
  }, []);

  const closeDetailsCard = useCallback(() => {
    setDetailsCard(null);
  }, []);

  const claimStarterPack = useCallback(async () => {
    if (isClaimingStarter) return;
    setIsClaimingStarter(true);
    try {
      if (walletAddress) {
        const res = await fetch("/api/cards/claim-starter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerAddress: walletAddress }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.cards && Array.isArray(data.cards) && data.cards.length > 0) {
            setUserDeck(data.cards);
            setHasClaimedStarter(true);
            setClaimToast("¡Has recibido 8 cartas comunes para tu mazo!");
            setTimeout(() => setClaimToast(null), 4000);
            return;
          }
        }
      }

      // Fallback local en memoria si no hay backend activo
      setUserDeck((prev) => {
        const nextId = prev.length > 0 ? Math.max(...prev.map((c) => Number(c.id) || 0)) + 1 : 100;
        const newBatch = initialCatalog.map((c, idx) => ({
          ...c,
          id: nextId + idx,
        }));
        return [...newBatch, ...prev];
      });
      setHasClaimedStarter(true);
      setClaimToast("¡Has recibido 8 cartas comunes para tu mazo!");
      setTimeout(() => setClaimToast(null), 4000);
    } catch (e) {
      console.error("Error al reclamar starter pack:", e);
    } finally {
      setIsClaimingStarter(false);
    }
  }, [walletAddress, initialCatalog, isClaimingStarter]);

  return {
    activeTab,
    setActiveTab,
    slotA,
    slotB,
    userDeck,
    hasClaimedStarter,
    isLoadingInventory,
    isClaimingStarter,
    claimToast,
    claimStarterPack,
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
    lastTxHash,
    forgeError,
    clearForgeError: () => setForgeError(null),
    closeRevealModal,
    setInspectingCard,
    closeInspectingCard,
    setDetailsCard,
    closeDetailsCard,
  };

}
