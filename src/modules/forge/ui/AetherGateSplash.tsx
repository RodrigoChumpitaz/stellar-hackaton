"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { FireIcon, BookIcon, ZapIcon, SparklesIcon } from "@/shared/ui/icons/Elements";

const AetherCrystal = dynamic(
  () => import("./AetherCrystal"),
  {
    ssr: false,
    loading: () => (
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-cyan-500/10 flex items-center justify-center animate-pulse">
        <span className="text-3xl">💎</span>
      </div>
    ),
  }
);

interface AetherGateSplashProps {
  onOpenConnect: () => void;
  onExploreCatalog?: () => void;
  onExploreRules?: () => void;
}

export function AetherGateSplash({
  onOpenConnect,
  onExploreCatalog,
  onExploreRules,
}: AetherGateSplashProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#0F1326] via-[#0A0D1D] to-[#060814] p-6 sm:p-12 shadow-[0_0_50px_rgba(0,229,255,0.08)] backdrop-blur-2xl">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-gradient-to-b from-cyan-500/20 via-purple-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-purple-700/15 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
          </span>
          <span className="tracking-wide uppercase text-[11px] font-bold">
            Santuario Elemental · Soroban Testnet
          </span>
        </div>

        {/* 3D Crystal Hero Showcase */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/15 blur-2xl transform scale-125" />
          <AetherCrystal energyLevel={85} className="w-36 h-36 sm:w-44 sm:h-44" />
        </div>

        {/* Title & Lore */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Despierta las Runas en{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            La Forja de Aether
          </span>
        </h1>

        <p className="mt-3 sm:mt-4 text-xs sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
          Para forjar cartas y acceder a tu mazo de runas debes sincronizar tu billetera.
          Al ingresar recibirás un <strong className="text-cyan-300 font-semibold">Cofre de Iniciación Gratuito</strong> con
          8 runas elementales para comenzar tu viaje en Stellar Odyssey.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-6 sm:mt-8 w-full max-w-sm">
          <button
            type="button"
            onClick={onOpenConnect}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-indigo-600 px-6 py-4 text-sm sm:text-base font-extrabold text-white shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer min-h-[52px]"
          >
            <SparklesIcon className="w-5 h-5 text-cyan-200" />
            <span>Conectar Billetera para Entrar</span>
          </button>
          <p className="mt-2 text-[11px] text-zinc-400">
            Soporta Freighter, Wallets Kit, Passkeys biométricas y Acceso de Prueba.
          </p>
        </div>

        {/* 3 Pillars / Feature Cards */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full text-left">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <ZapIcon className="w-4 h-4" />
              <h3 className="text-xs sm:text-sm font-bold text-white">Forja Atómica Soroban</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Quema 2 runas elementales para acuñar un NFT híbrido con atributos calculados y verificados on-chain.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-purple-400">
              <FireIcon className="w-4 h-4" />
              <h3 className="text-xs sm:text-sm font-bold text-white">Alquimia Elemental</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Combina Fuego, Agua, Tierra y Viento para desbloquear arquetipos superiores como Magma, Vapor y Tormenta.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <span className="text-sm">🎁</span>
              <h3 className="text-xs sm:text-sm font-bold text-white">Cofre de Iniciación</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
              Todo nuevo jugador puede reclamar gratis su primer lote de 8 cartas comunes directamente a su cuenta.
            </p>
          </div>
        </div>

        {/* Secondary exploration links */}
        {(onExploreCatalog || onExploreRules) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {onExploreCatalog && (
              <button
                type="button"
                onClick={onExploreCatalog}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
              >
                <span>🎴</span>
                <span>Explorar Mis Mazos y Catálogo</span>
              </button>
            )}
            {onExploreRules && (
              <button
                type="button"
                onClick={onExploreRules}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
              >
                <ZapIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Matriz Determinista de Fusión</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
