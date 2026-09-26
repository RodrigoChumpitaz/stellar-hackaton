"use client";

import { useRef, useCallback } from "react";
import type { PanInfo } from "framer-motion";
import type { CardData } from "../../domain/types";

interface UseCardGesturesOptions {
  card: CardData;
  onClick?: () => void;
  onQuickTap?: (card: CardData) => void;
  onLongPress?: (card: CardData) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragEndToSlot?: (card: CardData, targetSlot: "A" | "B") => void;
  onDragEndToDrawer?: (card: CardData) => void;
  onDragEndToDeckSlot?: (card: CardData, slotIdx: number) => void;
  onDragEndRemoveFromDeck?: (card: CardData) => void;
}

export function useCardGestures({
  card,
  onClick,
  onQuickTap,
  onLongPress,
  onDragStart,
  onDragEnd,
  onDragEndToSlot,
  onDragEndToDrawer,
  onDragEndToDeckSlot,
  onDragEndRemoveFromDeck,
}: UseCardGesturesOptions) {

  const pointerStartTimeRef = useRef<number>(0);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasDraggedRef = useRef<boolean>(false);
  const didTriggerTapRef = useRef<boolean>(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      pointerStartTimeRef.current = Date.now();
      pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
      hasDraggedRef.current = false;
      didTriggerTapRef.current = false;

      clearLongPressTimer();
      // Start 500ms timer for Long-Press (Details Modal)
      longPressTimerRef.current = setTimeout(() => {
        if (!hasDraggedRef.current) {
          onLongPress?.(card);
        }
      }, 500);
    },
    [card, clearLongPressTimer, onLongPress]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const dist = Math.hypot(
        e.clientX - pointerStartPosRef.current.x,
        e.clientY - pointerStartPosRef.current.y
      );
      // If pointer moves more than 4px, cancel long-press and immediately mark drag intent
      if (dist > 4) {
        hasDraggedRef.current = true;
        clearLongPressTimer();
      }
    },
    [clearLongPressTimer]
  );

  const handlePointerUp = useCallback(() => {
    clearLongPressTimer();

    const elapsed = Date.now() - pointerStartTimeRef.current;
    // If not dragged and released before 350ms -> Quick Tap
    if (!hasDraggedRef.current && elapsed < 350) {
      didTriggerTapRef.current = true;
      if (onQuickTap) {
        onQuickTap(card);
      } else if (onClick) {
        onClick();
      }
    }
  }, [card, clearLongPressTimer, onClick, onQuickTap]);

  const handleClick = useCallback(() => {
    if (didTriggerTapRef.current) {
      didTriggerTapRef.current = false;
      return;
    }
    if (!hasDraggedRef.current) {
      if (onQuickTap) {
        onQuickTap(card);
      } else if (onClick) {
        onClick();
      }
    }
  }, [card, onClick, onQuickTap]);

  const handlePointerCancel = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleDragStart = useCallback(() => {
    hasDraggedRef.current = true;
    clearLongPressTimer();
    onDragStart?.();
  }, [clearLongPressTimer, onDragStart]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      try {
        const hasAnyDropHandler =
          onDragEndToSlot ||
          onDragEndToDrawer ||
          onDragEndToDeckSlot ||
          onDragEndRemoveFromDeck;
        if (!hasAnyDropHandler) return;

        const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
        const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
        const clientX = info.point.x - scrollX;
        const clientY = info.point.y - scrollY;

        // 1. UNEQUIP FROM DECK (Mis mazos)
        // Si la carta estaba en el mazo y se arrastra hacia abajo (> 40px) o sobre el catálogo
        if (onDragEndRemoveFromDeck) {
          let inCatalogRect = false;
          if (typeof document !== "undefined") {
            const catalog = document.querySelector('[data-drop-zone="deck-catalog"]');
            if (catalog) {
              const r = catalog.getBoundingClientRect();
              inCatalogRect =
                clientX >= r.left - 20 &&
                clientX <= r.right + 20 &&
                clientY >= r.top - 40;
            }
          }

          if (inCatalogRect || info.offset.y > 40) {
            onDragEndRemoveFromDeck(card);
            return;
          }
        }

        // 2. UNEQUIP FROM FORGE (La Forja)
        // Si la carta estaba en Ranura A o B y se arrastra hacia abajo (> 45px) o sobre el cajón
        if (onDragEndToDrawer) {
          let inDrawerRect = false;
          if (typeof document !== "undefined") {
            const drawer = document.querySelector('[data-drop-zone="inventory"]');
            if (drawer) {
              const r = drawer.getBoundingClientRect();
              inDrawerRect =
                clientX >= r.left - 20 &&
                clientX <= r.right + 20 &&
                clientY >= r.top - 40;
            }
          }

          if (inDrawerRect || info.offset.y > 45) {
            onDragEndToDrawer(card);
            return;
          }
        }

        // 3. Check elements under drop point
        const elements =
          typeof document !== "undefined" && document.elementsFromPoint
            ? [
                ...document.elementsFromPoint(clientX, clientY),
                ...document.elementsFromPoint(info.point.x, info.point.y),
              ]
            : [];

        // 4. FORGE DROP SLOTS (A or B)
        if (onDragEndToSlot) {
          let targetSlot: "A" | "B" | null = null;
          for (const el of elements) {
            const slotEl = el.closest ? el.closest("[data-drop-slot]") : null;
            const slotAttr =
              slotEl?.getAttribute("data-drop-slot") ||
              el.getAttribute("data-drop-slot");
            if (slotAttr === "A" || slotAttr === "B") {
              targetSlot = slotAttr as "A" | "B";
              break;
            }
          }

          // Magnetic tolerance check for Forge Slots (+60px)
          if (!targetSlot && typeof document !== "undefined") {
            const slotAElem = document.querySelector('[data-drop-slot="A"]');
            const slotBElem = document.querySelector('[data-drop-slot="B"]');
            const TOLERANCE = 60;

            let distA = Infinity;
            let distB = Infinity;

            if (slotAElem) {
              const rect = slotAElem.getBoundingClientRect();
              const inClient =
                clientX >= rect.left - TOLERANCE &&
                clientX <= rect.right + TOLERANCE &&
                clientY >= rect.top - TOLERANCE &&
                clientY <= rect.bottom + TOLERANCE;
              if (inClient) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                distA = Math.hypot(clientX - centerX, clientY - centerY);
              }
            }

            if (slotBElem) {
              const rect = slotBElem.getBoundingClientRect();
              const inClient =
                clientX >= rect.left - TOLERANCE &&
                clientX <= rect.right + TOLERANCE &&
                clientY >= rect.top - TOLERANCE &&
                clientY <= rect.bottom + TOLERANCE;
              if (inClient) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                distB = Math.hypot(clientX - centerX, clientY - centerY);
              }
            }

            if (distA < Infinity || distB < Infinity) {
              targetSlot = distA <= distB ? "A" : "B";
            }
          }

          if (targetSlot) {
            onDragEndToSlot(card, targetSlot);
            return;
          }
        }

        // 5. DECK SLOTS (0 to 7) for "Mis mazos"
        if (onDragEndToDeckSlot) {
          let targetDeckSlotIdx: number | null = null;
          for (const el of elements) {
            const slotEl = el.closest ? el.closest("[data-deck-slot]") : null;
            const slotAttr =
              slotEl?.getAttribute("data-deck-slot") ||
              el.getAttribute("data-deck-slot");
            if (slotAttr !== null && slotAttr !== undefined) {
              const parsed = parseInt(slotAttr, 10);
              if (!isNaN(parsed)) {
                targetDeckSlotIdx = parsed;
                break;
              }
            }
          }

          // Magnetic tolerance check for Deck Slots
          if (targetDeckSlotIdx === null && typeof document !== "undefined") {
            const deckSlots = document.querySelectorAll("[data-deck-slot]");
            let bestDist = Infinity;
            deckSlots.forEach((slotNode) => {
              const rect = slotNode.getBoundingClientRect();
              const inClient =
                clientX >= rect.left - 30 &&
                clientX <= rect.right + 30 &&
                clientY >= rect.top - 30 &&
                clientY <= rect.bottom + 30;
              if (inClient) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dist = Math.hypot(clientX - centerX, clientY - centerY);
                if (dist < bestDist) {
                  bestDist = dist;
                  const attr = slotNode.getAttribute("data-deck-slot");
                  if (attr) targetDeckSlotIdx = parseInt(attr, 10);
                }
              }
            });
          }

          if (targetDeckSlotIdx !== null) {
            onDragEndToDeckSlot(card, targetDeckSlotIdx);
            return;
          }
        }
      } finally {
        onDragEnd?.();
      }
    },
    [
      card,
      onDragStart,
      onDragEnd,
      onDragEndToSlot,
      onDragEndToDrawer,
      onDragEndToDeckSlot,
      onDragEndRemoveFromDeck,
    ]
  );


  return {
    handleClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleDragStart,
    handleDragEnd,
  };
}
