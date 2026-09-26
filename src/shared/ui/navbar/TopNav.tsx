"use client";

import { useState } from "react";
import { useWallet, ConnectWalletModal, AccountDetailsDrawer } from "@/modules/wallet";
import { FireIcon, BookIcon, ZapIcon, SparklesIcon } from "@/shared/ui/icons/Elements";

function abbreviate(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function TopNav({
  activeTab,
  onTabChange,
  isConnectModalOpen: controlledModalOpen,
  onConnectModalChange,
  playerName,
  playerAvatar,
  onOpenProfile,
}: {
  activeTab: "forge" | "decks" | "arena" | "shop" | "rules";
  onTabChange: (tab: "forge" | "decks" | "arena" | "shop" | "rules") => void;
  isConnectModalOpen?: boolean;
  onConnectModalChange?: (open: boolean) => void;
  playerName?: string;
  playerAvatar?: string;
  onOpenProfile?: () => void;
}) {
  const wallet = useWallet();
  const [internalConnectOpen, setInternalConnectOpen] = useState(false);
  const isConnectModalOpen = controlledModalOpen !== undefined ? controlledModalOpen : internalConnectOpen;
  const setIsConnectModalOpen = onConnectModalChange || setInternalConnectOpen;
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0B0D19]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-600/30 p-1 ring-1 ring-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cards/crystal-logo.png"
                alt="Stellar Runes Logo"
                className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-[0_0_10px_#00e5ff]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-sm sm:text-lg">
                  STELLAR RUNES
                </span>
                <span className="hidden sm:inline-block rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 ring-1 ring-cyan-500/40">
                  AETHER TCG
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 hidden sm:block">
                Forja Generativa · Stellar Odyssey Perú 2026
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 ring-1 ring-zinc-800">
            <button
              type="button"
              onClick={() => onTabChange("forge")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "forge"
                  ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(123,43,249,0.4)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FireIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>La Forja</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("decks")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "decks"
                  ? "bg-zinc-800 text-cyan-300 font-bold ring-1 ring-cyan-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>🎴</span>
              <span>Mis mazos</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("arena")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "arena"
                  ? "bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>⚔️</span>
              <span>Combate</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("shop")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "shop"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>🏪</span>
              <span>Tienda</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("rules")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "rules"
                  ? "bg-zinc-800 text-cyan-300"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ZapIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Reglas</span>
            </button>
          </nav>

          {/* Wallet & Network Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Network Badge */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Testnet
            </div>

            {/* Wallet Actions */}
            {!wallet.isConnected ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(true)}
                  disabled={wallet.isConnecting}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 sm:px-4 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 min-h-[40px]"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-black" />
                  <span>{wallet.isConnecting ? "Conectando..." : "Conectar"}</span>
                  <span className="hidden sm:inline">{!wallet.isConnecting && " Wallet"}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Balance Pill (Clickable -> Opens AccountDetailsDrawer) */}
                <button
                  type="button"
                  onClick={() => setIsAccountDrawerOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
                  title="Ver detalles de saldo y cuenta"
                >
                  <span className="text-[10px] text-zinc-500">XLM:</span>
                  <span className="font-bold text-cyan-400">
                    {wallet.xlmBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </span>
                </button>

                {/* Account / Profile Chip (Clickable -> Opens AccountDetailsDrawer) */}
                <button
                  type="button"
                  onClick={() => setIsAccountDrawerOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 active:scale-95 transition-all cursor-pointer min-h-[36px]"
                  title="Abrir perfil de invocador"
                >
                  <span className="text-base leading-none">
                    {playerAvatar || "✦"}
                  </span>
                  <span className="font-semibold text-xs text-white max-w-[110px] truncate">
                    {playerName || (wallet.publicKey ? abbreviate(wallet.publicKey) : "Invocador")}
                  </span>
                  <span className="text-[10px] text-cyan-400/80 ml-0.5">▼</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Connect Wallet Modal / Mobile Bottom Sheet */}
      <ConnectWalletModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      {/* Player Account Details Sheet */}
      <AccountDetailsDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        playerName={playerName}
        playerAvatar={playerAvatar}
        onOpenEditProfile={onOpenProfile}
      />

      {/* Mobile-First Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#0A0C18]/95 border-t border-zinc-800/90 backdrop-blur-xl flex items-center justify-around py-2 px-2 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={() => onTabChange("forge")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "forge" ? "text-cyan-400 font-bold" : "text-zinc-500"
          }`}
        >
          <FireIcon className={`w-5 h-5 ${activeTab === "forge" ? "text-cyan-400" : "text-zinc-500"}`} />
          <span className="text-[9px]">La Forja</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("decks")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "decks" ? "text-cyan-400 font-bold" : "text-zinc-500"
          }`}
        >
          <span className="text-lg leading-none">🎴</span>
          <span className="text-[9px]">Mis mazos</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("arena")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "arena" ? "text-cyan-400 font-bold" : "text-zinc-500"
          }`}
        >
          <span className="text-lg leading-none">⚔️</span>
          <span className="text-[9px]">Combate</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("shop")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "shop" ? "text-amber-400 font-bold" : "text-zinc-500"
          }`}
        >
          <span className="text-lg leading-none">🏪</span>
          <span className="text-[9px]">Tienda</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("rules")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "rules" ? "text-cyan-400 font-bold" : "text-zinc-500"
          }`}
        >
          <ZapIcon className={`w-5 h-5 ${activeTab === "rules" ? "text-cyan-400" : "text-zinc-500"}`} />
          <span className="text-[9px]">Reglas</span>
        </button>
      </nav>
    </>
  );
}
