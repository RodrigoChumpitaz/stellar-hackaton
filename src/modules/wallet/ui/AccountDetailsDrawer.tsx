"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../";

interface AccountDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function abbreviate(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

function avatarHue(address: string) {
  if (!address) return 180;
  return [...address].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
}

export function AccountDetailsDrawer({ isOpen, onClose }: AccountDetailsDrawerProps) {
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [fundSuccess, setFundSuccess] = useState(false);

  const activeAddress = wallet.publicKey || wallet.smartAccountId || "";

  const handleCopy = async () => {
    if (!activeAddress) return;
    try {
      await navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(false);
    }
  };

  const handleFriendbot = async () => {
    if (isFunding) return;
    setIsFunding(true);
    setFundSuccess(false);
    try {
      const ok = await wallet.fundWithFriendbot();
      if (ok) {
        setFundSuccess(true);
        setTimeout(() => setFundSuccess(false), 3000);
      }
    } finally {
      setIsFunding(false);
    }
  };

  const handleDisconnect = () => {
    wallet.disconnect();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Bottom Sheet / Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-zinc-800 bg-[#0B0E1B] p-5 sm:p-6 shadow-2xl shadow-cyan-950/40 text-zinc-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Mobile Drag Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700 sm:hidden" />

            {/* Header with Avatar & Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-md border border-white/20 text-white font-bold"
                  style={{
                    background: `linear-gradient(135deg, hsl(${avatarHue(activeAddress)}, 80%, 45%), hsl(${(avatarHue(activeAddress) + 60) % 360}, 80%, 30%))`,
                  }}
                >
                  ✦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      Perfil de Jugador
                    </h3>
                    <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      Testnet
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {wallet.walletType === "QuickPlay"
                      ? "Modo Rápido (Demo Testnet)"
                      : wallet.walletType === "Passkey"
                        ? "Passkey Smart Account"
                        : wallet.walletType || "Billetera Conectada"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar perfil"
              >
                ✕
              </button>
            </div>

            {/* Address Row & Copy Action */}
            <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    Clave Pública Stellar
                  </span>
                  <div className="font-mono text-sm font-semibold text-zinc-200 mt-0.5">
                    {abbreviate(activeAddress)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 active:scale-95 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="text-emerald-300 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Balance Card */}
            <div className="mt-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-zinc-900/70 to-blue-950/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Saldo Disponible</span>
                <span className="text-[11px] font-mono text-cyan-400">Red: Testnet</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {wallet.xlmBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </span>
                <span className="text-sm font-bold text-cyan-400">XLM</span>
              </div>

              {/* Friendbot Funding CTA */}
              <button
                type="button"
                disabled={isFunding}
                onClick={handleFriendbot}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isFunding ? (
                  <>
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                    <span>Inyectando XLM con Friendbot...</span>
                  </>
                ) : fundSuccess ? (
                  <>
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="text-emerald-300">¡Saldo recargado con éxito!</span>
                  </>
                ) : (
                  <>
                    <span>🪙</span>
                    <span>Recargar 10,000 XLM de prueba</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Links */}
            <div className="mt-4 space-y-2">
              <a
                href={`https://stellar.expert/explorer/testnet/account/${activeAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">🔍</span>
                  <span>Ver transacciones en Stellar Expert</span>
                </div>
                <span className="text-zinc-500">↗</span>
              </a>
            </div>

            {/* Disconnect Button */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/30 active:scale-95 transition-all cursor-pointer"
              >
                <span>✕</span>
                <span>Desconectar billetera</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
