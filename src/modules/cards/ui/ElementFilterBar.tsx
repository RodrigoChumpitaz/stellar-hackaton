"use client";

import { FireIcon, WaterIcon, EarthIcon, AirIcon, SparklesIcon } from "@/shared/ui/icons/Elements";

export type FilterElement = "ALL" | "FIRE" | "WATER" | "EARTH" | "AIR" | "HYBRIDS" | string;

export interface ElementCounts {
  ALL?: number;
  FIRE?: number;
  WATER?: number;
  EARTH?: number;
  AIR?: number;
  HYBRIDS?: number;
  [key: string]: number | undefined;
}

interface ElementFilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: any) => void;
  elementCounts: ElementCounts | Record<string, number>;
  className?: string;
}

export function ElementFilterBar({
  activeFilter,
  onFilterChange,
  elementCounts,
  className = "",
}: ElementFilterBarProps) {
  return (
    <div className={`w-full sm:w-auto overflow-x-auto no-scrollbar py-1 -my-1 ${className}`}>
      <div className="flex items-center gap-1.5 min-w-max">
        {/* Todos */}
        <button
          type="button"
          onClick={() => onFilterChange("ALL")}
          className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
            activeFilter === "ALL"
              ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]"
              : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          }`}
        >
          <span>Todos</span>
          <span className="text-[10px] opacity-75">({elementCounts.ALL ?? 0})</span>
        </button>

        {/* Fuego */}
        <button
          type="button"
          onClick={() => onFilterChange("FIRE")}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "FIRE"
              ? "bg-red-500 text-black font-bold shadow-[0_0_10px_rgba(239,68,68,0.4)]"
              : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          }`}
        >
          <FireIcon className="w-3 h-3 text-red-400" />
          <span>Fuego</span>
          <span className="text-[10px] opacity-75">({elementCounts.FIRE ?? 0})</span>
        </button>

        {/* Agua */}
        <button
          type="button"
          onClick={() => onFilterChange("WATER")}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "WATER"
              ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          }`}
        >
          <WaterIcon className="w-3 h-3 text-cyan-400" />
          <span>Agua</span>
          <span className="text-[10px] opacity-75">({elementCounts.WATER ?? 0})</span>
        </button>

        {/* Tierra */}
        <button
          type="button"
          onClick={() => onFilterChange("EARTH")}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "EARTH"
              ? "bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          }`}
        >
          <EarthIcon className="w-3 h-3 text-emerald-400" />
          <span>Tierra</span>
          <span className="text-[10px] opacity-75">({elementCounts.EARTH ?? 0})</span>
        </button>

        {/* Viento */}
        <button
          type="button"
          onClick={() => onFilterChange("AIR")}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "AIR"
              ? "bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(251,191,36,0.4)]"
              : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          }`}
        >
          <AirIcon className="w-3 h-3 text-amber-400" />
          <span>Viento</span>
          <span className="text-[10px] opacity-75">({elementCounts.AIR ?? 0})</span>
        </button>

        {/* Híbridos */}
        <button
          type="button"
          onClick={() => onFilterChange("HYBRIDS")}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "HYBRIDS"
              ? "bg-purple-500 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          }`}
        >
          <SparklesIcon className="w-3 h-3 text-purple-300" />
          <span>Híbridos</span>
          <span className="text-[10px] opacity-75">({elementCounts.HYBRIDS ?? 0})</span>
        </button>
      </div>
    </div>
  );
}
