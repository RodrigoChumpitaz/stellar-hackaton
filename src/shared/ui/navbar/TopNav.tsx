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
}: {
  activeTab: "forge" | "catalog" | "rules";
  onTabChange: (tab: "forge" | "catalog" | "rules") => void;
}) {
  const wallet = useWallet();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
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
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain drop-shadow-[0_0_8px_#00e5ff]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="text-cyan-400 font-bold text-base sm:text-lg pointer-events-none">✦</span>
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
              onClick={() => onTabChange("catalog")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-zinc-800 text-cyan-300"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BookIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Catálogo</span>
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
                {/* Balance Pill (Clickable) */}
                <button
                  type="button"
                  onClick={() => setIsAccountDrawerOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
                  title="Ver detalles de saldo"
                >
                  <span className="text-[10px] text-zinc-500">XLM:</span>
                  <span className="font-bold text-cyan-400">
                    {wallet.xlmBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </span>
                </button>

                {/* Account / Profile Chip (Clickable to open AccountDetailsDrawer) */}
                <button
                  type="button"
                  onClick={() => setIsAccountDrawerOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 active:scale-95 transition-all cursor-pointer min-h-[36px]"
                  title="Abrir perfil de jugador"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-xs font-semibold">
                    {wallet.publicKey
                      ? abbreviate(wallet.publicKey)
                      : wallet.smartAccountId
                        ? abbreviate(wallet.smartAccountId)
                        : "Conectado"}
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
      />

      {/* Mobile-First Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#0A0C18]/95 border-t border-zinc-800/90 backdrop-blur-xl flex items-center justify-around py-2 px-3 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={() => onTabChange("forge")}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "forge" ? "text-cyan-400 font-bold" : "text-zinc-500"
          }`}
        >
          <FireIcon className={`w-5 h-5 ${activeTab === "forge" ? "text-cyan-400" : "text-zinc-500"}`} />
          <span className="text-[10px]">La Forja</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("catalog")}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "catalog" ? "text-cyan-400 font-bold" : "text-zinc-500"
          }`}
        >
          <BookIcon className={`w-5 h-5 ${activeTab === "catalog" ? "text-cyan-400" : "text-zinc-500"}`} />
          <span className="text-[10px]">Catálogo</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("rules")}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "rules" ? "text-cyan-400 font-bold" : "text-zinc-500"
          }`}
        >
          <ZapIcon className={`w-5 h-5 ${activeTab === "rules" ? "text-cyan-400" : "text-zinc-500"}`} />
          <span className="text-[10px]">Reglas</span>
        </button>
      </nav>
    </>
  );
}
