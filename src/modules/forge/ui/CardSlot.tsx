"use client";

import { CardItem, type CardData } from "@/modules/cards/ui/CardItem";
import { FireIcon, TrashIcon } from "@/shared/ui/icons/Elements";

interface CardSlotProps {
  slotLabel: "A" | "B";
  card: CardData | null;
  onRemove: () => void;
  isForging: boolean;
}

export function CardSlot({ slotLabel, card, onRemove, isForging }: CardSlotProps) {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Slot Header Label */}
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
            slotLabel === "A"
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
          }`}
        >
          {slotLabel}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Ranura {slotLabel} {card ? `· ${card.element}` : ""}
        </span>
      </div>

      {/* Pedestal Container with Drop-Slot Marker */}
      <div
        data-drop-slot={slotLabel}
        className={`relative flex min-h-[290px] w-52 sm:w-60 items-center justify-center rounded-3xl border transition-all duration-300 p-3 shadow-2xl backdrop-blur-md ${
          slotLabel === "A"
            ? "border-red-500/30 bg-[#120e1c]/80 hover:border-red-500/60"
            : "border-cyan-500/30 bg-[#0e1222]/80 hover:border-cyan-500/60"
        }`}
      >
        {/* Glow ambient background behind slot */}
        <div
          className={`absolute -inset-1 rounded-3xl opacity-30 blur-xl transition-all pointer-events-none ${
            card
              ? slotLabel === "A"
                ? "bg-red-600/40"
                : "bg-cyan-600/40"
              : "bg-transparent"
          }`}
        />

        {card ? (
          <div className="relative flex flex-col items-center gap-2">
            {/* If forging, apply burn disintegration vibration */}
            <div
              className={`transition-all duration-700 ${
                isForging ? "animate-pulse scale-95 opacity-75 blur-[0.5px]" : ""
              }`}
            >
              <CardItem card={card} size="md" />
            </div>

            {/* Burn indicator and Remove button */}
            {!isForging && (
              <div className="flex items-center justify-between w-full px-1 pt-1">
                <span className="text-[10px] text-red-400/90 font-medium flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-800/40">
                  <FireIcon className="w-3 h-3 text-red-400" />
                  <span>Se quemará</span>
                </span>
                <button
                  type="button"
                  aria-label={`Quitar carta ${card?.name ?? ""} de ranura ${slotLabel}`}
                  onClick={onRemove}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800/80 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-red-900/60 hover:text-white transition-colors cursor-pointer"
                >
                  <TrashIcon className="w-3 h-3" />
                  <span>Quitar</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty Slot Drop Target State */
          <div
            className={`flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-2xl w-full h-full min-h-[250px] transition-all duration-300 pointer-events-none ${
              slotLabel === "A"
                ? "border-red-500/40 bg-red-950/10"
                : "border-cyan-500/40 bg-cyan-950/10"
            }`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-inner mb-3 transition-transform duration-300 ${
                slotLabel === "A"
                  ? "bg-red-900/30 text-red-400 border border-red-500/30"
                  : "bg-cyan-900/30 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              ✦
            </div>
            <p className="text-xs font-bold text-zinc-200">
              Ranura {slotLabel} Vacía
            </p>
            <p className="mt-1.5 text-[11px] text-zinc-400 max-w-[140px] leading-tight">
              Arrastra una carta del mazo aquí para asignarla
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
