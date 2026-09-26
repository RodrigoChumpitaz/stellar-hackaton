"use client";

import { CardItem, type CardData } from "@/modules/cards/ui/CardItem";

interface CardSlotProps {
  slotLabel: "A" | "B";
  card: CardData | null;
  onRemove: () => void;
  isForging: boolean;
  onDragEndToSlot?: (card: CardData, targetSlot: "A" | "B") => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function CardSlot({
  slotLabel,
  card,
  onRemove,
  isForging,
  onDragEndToSlot,
  onDragStart,
  onDragEnd,
}: CardSlotProps) {
  const isA = slotLabel === "A";

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Slot Header Label */}
      <div className="flex items-center gap-2">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
            isA
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
          }`}
        >
          {slotLabel}
        </span>
        <span className="text-xs font-bold tracking-wide text-zinc-300">
          Ranura {slotLabel} {card ? `· ${card.element}` : ""}
        </span>
      </div>

      {/* Pedestal Container with Drop-Slot Marker - Exactly Equal Dimensions */}
      <div
        data-drop-slot={slotLabel}
        className={`relative flex h-[390px] w-64 sm:h-[430px] sm:w-72 items-center justify-center rounded-3xl border transition-all duration-300 p-3 shadow-2xl backdrop-blur-md ${
          isA
            ? "border-red-500/40 bg-[#140e1e]/90 hover:border-red-400 hover:ring-2 hover:ring-red-500/40 hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] shadow-[0_0_20px_rgba(239,68,68,0.15)]"
            : "border-cyan-500/40 bg-[#0e1424]/90 hover:border-cyan-400 hover:ring-2 hover:ring-cyan-500/40 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        }`}
      >
        {/* Glow ambient background behind slot */}
        <div
          className={`absolute -inset-1 rounded-3xl opacity-40 blur-xl transition-all pointer-events-none ${
            card
              ? isA
                ? "bg-red-600/50"
                : "bg-cyan-600/50"
              : isA
              ? "bg-red-950/20"
              : "bg-cyan-950/20"
          }`}
        />

        {card ? (
          <div className="relative flex flex-col items-center justify-center w-full h-full">
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
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragEndToDrawer={onRemove}
                onDragEndToSlot={onDragEndToSlot}
              />
            </div>

            {/* Discreet Deselect Button floating on top-right */}
            {!isForging && (
              <button
                type="button"
                aria-label={`Desasignar carta ${card?.name ?? ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-2 right-2 z-40 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/90 hover:bg-red-950 border border-zinc-700 hover:border-red-500/60 text-zinc-300 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer text-xs font-bold"
                title="Desasignar del altar"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          /* Empty Slot Drop Target State - Minimalist and welcoming */
          <div
            className={`group/slot flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-2xl w-full h-full transition-all duration-300 pointer-events-none ${
              isA
                ? "border-red-500/40 bg-gradient-to-b from-red-950/20 via-transparent to-transparent group-hover/slot:border-red-400 group-hover/slot:bg-red-950/30"
                : "border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent group-hover/slot:border-cyan-400 group-hover/slot:bg-cyan-950/30"
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl shadow-inner mb-3 transition-transform duration-300 group-hover/slot:scale-110 ${
                isA
                  ? "bg-red-900/30 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                  : "bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
              }`}
            >
              ✦
            </div>
            <p className="text-xs font-semibold text-zinc-300 tracking-wide">
              Arrastra una runa aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
