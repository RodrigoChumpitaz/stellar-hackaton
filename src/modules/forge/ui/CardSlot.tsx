"use client";

import { CardItem, type CardData } from "@/modules/cards/ui/CardItem";
import { FireIcon, TrashIcon } from "@/shared/ui/icons/Elements";

interface CardSlotProps {
  slotLabel: "A" | "B";
  card: CardData | null;
  onRemove: () => void;
  isForging: boolean;
  onDragEndToSlot?: (card: CardData, targetSlot: "A" | "B") => void;
}

export function CardSlot({
  slotLabel,
  card,
  onRemove,
  isForging,
  onDragEndToSlot,
}: CardSlotProps) {
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
        className={`relative flex min-h-[300px] w-52 sm:w-60 items-center justify-center rounded-3xl border transition-all duration-300 p-3 shadow-2xl backdrop-blur-md ${
          slotLabel === "A"
            ? "border-red-500/40 bg-[#140e1e]/90 hover:border-red-400/80 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
            : "border-cyan-500/40 bg-[#0e1424]/90 hover:border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        }`}
      >
        {/* Glow ambient background behind slot */}
        <div
          className={`absolute -inset-1 rounded-3xl opacity-40 blur-xl transition-all pointer-events-none ${
            card
              ? slotLabel === "A"
                ? "bg-red-600/50"
                : "bg-cyan-600/50"
              : slotLabel === "A"
              ? "bg-red-950/20"
              : "bg-cyan-950/20"
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
              <CardItem
                card={card}
                size="md"
                draggable={!isForging}
                onDragEndToDrawer={onRemove}
                onDragEndToSlot={onDragEndToSlot}
              />
            </div>

            {/* Discreet Deselect Helper without invasive text */}
            {!isForging && (
              <div className="flex items-center justify-between w-full px-1 pt-1">
                <span className="text-[10px] text-zinc-400 text-center tracking-tight w-full">
                  Arrastra abajo para devolver
                </span>
                <button
                  type="button"
                  aria-label={`Desasignar carta ${card?.name ?? ""}`}
                  onClick={onRemove}
                  className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800/90 hover:bg-red-950 border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer text-xs font-bold"
                  title="Desasignar del altar"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

        ) : (
          /* Empty Slot Drop Target State with Activation Hover */
          <div
            className={`group/slot flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-2xl w-full h-full min-h-[260px] transition-all duration-300 pointer-events-none ${
              slotLabel === "A"
                ? "border-red-500/50 bg-gradient-to-b from-red-950/30 via-red-950/10 to-transparent group-hover/slot:border-red-400 group-hover/slot:bg-red-950/40"
                : "border-cyan-500/50 bg-gradient-to-b from-cyan-950/30 via-cyan-950/10 to-transparent group-hover/slot:border-cyan-400 group-hover/slot:bg-cyan-950/40"
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-inner mb-3 transition-transform duration-300 group-hover/slot:scale-110 ${
                slotLabel === "A"
                  ? "bg-red-900/40 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
                  : "bg-cyan-900/40 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse"
              }`}
            >
              ✦
            </div>
            <p className="text-xs font-bold text-white tracking-wide">
              Ranura {slotLabel} Vacía
            </p>
            <p className="mt-1.5 text-[11px] text-zinc-300 max-w-[145px] leading-snug">
              Arrastra una runa del catálogo aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
