"use client";

import { useRef, useCallback } from "react";
import type { PanInfo } from "framer-motion";
import type { CardData } from "../../domain/types";

interface UseCardGesturesOptions {
  card: CardData;
  onClick?: () => void;
  onQuickTap?: (card: CardData) => void;
  onLongPress?: (card: CardData) => void;
  onDragEndToSlot?: (card: CardData, targetSlot: "A" | "B") => void;
}

export function useCardGestures({
  card,
  onClick,
  onQuickTap,
  onLongPress,
  onDragEndToSlot,
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
      // If pointer moves more than 8px, cancel long-press and mark as drag intention
      if (dist > 8) {
        hasDraggedRef.current = true;
        clearLongPressTimer();
      }
    },
    [clearLongPressTimer]
  );

  const handlePointerUp = useCallback(() => {
    clearLongPressTimer();

    const elapsed = Date.now() - pointerStartTimeRef.current;
    // If not dragged and released before 350ms -> Quick Tap (Fullscreen Appreciation)
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
  }, [clearLongPressTimer]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!onDragEndToSlot) return;

      const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      const clientX = info.point.x - scrollX;
      const clientY = info.point.y - scrollY;

      // Check elements under drop point using both viewport client coordinates and point
      const elements =
        typeof document !== "undefined" && document.elementsFromPoint
          ? [
              ...document.elementsFromPoint(clientX, clientY),
              ...document.elementsFromPoint(info.point.x, info.point.y),
            ]
          : [];
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

      // Direct bounding rect fallback comparing both client and page coordinates
      if (!targetSlot && typeof document !== "undefined") {
        const slotAElem = document.querySelector('[data-drop-slot="A"]');
        const slotBElem = document.querySelector('[data-drop-slot="B"]');
        if (slotAElem) {
          const rect = slotAElem.getBoundingClientRect();
          const inClient =
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom;
          const inPage =
            info.point.x >= rect.left + scrollX &&
            info.point.x <= rect.right + scrollX &&
            info.point.y >= rect.top + scrollY &&
            info.point.y <= rect.bottom + scrollY;
          if (inClient || inPage) {
            targetSlot = "A";
          }
        }
        if (!targetSlot && slotBElem) {
          const rect = slotBElem.getBoundingClientRect();
          const inClient =
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom;
          const inPage =
            info.point.x >= rect.left + scrollX &&
            info.point.x <= rect.right + scrollX &&
            info.point.y >= rect.top + scrollY &&
            info.point.y <= rect.bottom + scrollY;
          if (inClient || inPage) {
            targetSlot = "B";
          }
        }
      }

      if (targetSlot) {
        onDragEndToSlot(card, targetSlot);
      }
    },
    [card, onDragEndToSlot]
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
