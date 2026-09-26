"use client";

import { useState, useRef, useCallback } from "react";
import { FireIcon } from "@/shared/ui/icons/Elements";

interface ForgeIgniteButtonProps {
  canForge: boolean;
  isForging: boolean;
  forgeStepMessage?: string | null;
  onIgnite: () => void;
  onProgressChange?: (progress: number) => void;
  cardsCount?: number;
}

export function ForgeIgniteButton({
  canForge,
  isForging,
  forgeStepMessage,
  onIgnite,
  onProgressChange,
  cardsCount = 0,
}: ForgeIgniteButtonProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateProgress = useCallback(
    (progress: number) => {
      setHoldProgress(progress);
      onProgressChange?.(progress);
    },
    [onProgressChange]
  );

  const startHold = useCallback(() => {
    if (!canForge) return;
    updateProgress(0);
    const startTime = Date.now();
    const duration = 1100; // 1.1s hold duration

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      updateProgress(progress);

      if (progress >= 100) {
        if (holdIntervalRef.current) {
          clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
        updateProgress(0);
        onIgnite();
      }
    }, 25);
  }, [canForge, onIgnite, updateProgress]);

  const cancelHold = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    updateProgress(0);
  }, [updateProgress]);

  return (
    <div className="relative w-full sm:w-auto flex flex-col items-center">
      <button
        type="button"
        aria-busy={isForging}
        aria-label={canForge ? "Forjar Runa Híbrida" : isForging ? "Forjando carta elemental" : "Forja inactiva, selecciona 2 cartas"}
        onClick={() => {
          if (canForge && holdProgress === 0) {
            onIgnite();
          }
        }}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        disabled={!canForge}
        className={`relative overflow-hidden w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all duration-300 select-none ${
          canForge
            ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(123,43,249,0.5)] hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-cyan-400/60"
            : isForging
            ? "bg-purple-950/80 text-purple-300 border border-purple-500/50 cursor-wait shadow-inner"
            : "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
        }`}
      >
        {/* Long-Press Filling Gauge overlay */}
        {canForge && holdProgress > 0 && (
          <div
            className="absolute inset-y-0 left-0 bg-white/30 backdrop-blur-sm transition-all duration-75 pointer-events-none"
            style={{ width: `${holdProgress}%` }}
          />
        )}

        {isForging ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span>{forgeStepMessage || "Canalizando..."}</span>
          </>
        ) : canForge ? (
          <>
            <FireIcon className="w-4 h-4 text-amber-300" />
            <span>
              {holdProgress > 0
                ? `Canalizando ${holdProgress}%`
                : "✦ Forjar Runa Híbrida"}
            </span>
          </>
        ) : (
          <span>{cardsCount === 1 ? "Selecciona 1 runa más" : "Selecciona 2 runas"}</span>
        )}
      </button>

      {canForge && (
        <span className="mt-1.5 text-[10px] text-zinc-400 font-mono">
          Presiona o mantén presionado para forjar
        </span>
      )}
    </div>
  );
}
