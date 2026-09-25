"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const wallet = useWallet();
  const [mobileFreighterNotice, setMobileFreighterNotice] = useState(false);

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

  const handleQuickPlay = async () => {
    setMobileFreighterNotice(false);
    await wallet.connectQuickPlay();
    if (!wallet.error) {
      onClose();
    }
  };

  const handlePasskey = async () => {
    setMobileFreighterNotice(false);
    if (!wallet.isPasskeyAvailable) {
      // Fallback gracefully to quickplay if smart-account-kit testnet contracts aren't passed
      await wallet.connectQuickPlay();
      onClose();
      return;
    }
    await wallet.connectPasskey();
    if (!wallet.error) {
      onClose();
    }
  };

  const handleWalletsKit = async () => {
    setMobileFreighterNotice(false);
    await wallet.connect();
    if (!wallet.error) {
      onClose();
    }
  };

  const handleFreighter = async () => {
    if (isMobile) {
      setMobileFreighterNotice(true);
      return;
    }
    setMobileFreighterNotice(false);
    await wallet.connectFreighter();
    if (!wallet.error) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              wallet.clearError();
              setMobileFreighterNotice(false);
              onClose();
            }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet Card */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-zinc-800 bg-[#0B0E1B] p-5 sm:p-6 shadow-2xl shadow-cyan-950/40 text-zinc-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Drag Handle for Mobile */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  ✦
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Acceder a Stellar Runes
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400">
                    Stellar Testnet · Selecciona tu método
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  wallet.clearError();
                  setMobileFreighterNotice(false);
                  onClose();
                }}
                className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Mobile Notice if Freighter clicked on phone */}
            {mobileFreighterNotice && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200"
              >
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">ℹ️</span>
                  <div>
                    <span className="font-semibold">Freighter es una extensión de PC:</span>
                    <p className="text-amber-300/90 text-[11px] mt-0.5">
                      Los navegadores móviles no admiten extensiones. Te recomendamos ingresar con{" "}
                      <strong>Acceso Rápido</strong> (1 toque) o <strong>Passkey</strong>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Notification */}
            {wallet.error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs text-rose-300"
              >
                <span>{wallet.error}</span>
                <button
                  type="button"
                  onClick={() => wallet.clearError()}
                  className="ml-2 text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </motion.div>
            )}

            {/* Auth Options List */}
            <div className="mt-4 space-y-2.5">
              {/* Option 1: Freighter Extension (Recommended) */}
              <button
                type="button"
                disabled={wallet.isConnecting}
                onClick={handleFreighter}
                className="w-full text-left group relative overflow-hidden rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/50 to-blue-950/40 p-3.5 hover:border-cyan-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 text-xl ring-1 ring-cyan-500/40">
                      💻
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                          Freighter Wallet
                        </span>
                        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300 border border-cyan-500/40">
                          RECOMENDADO
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5">
                        Conecta tu billetera oficial. Usa tu clave pública real (G...).
                      </p>
                    </div>
                  </div>
                  <span className="text-cyan-400 font-bold text-lg group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>

              {/* Option 2: Stellar Wallets Kit */}
              <button
                type="button"
                disabled={wallet.isConnecting}
                onClick={handleWalletsKit}
                className="w-full text-left group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 hover:border-zinc-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 text-xl ring-1 ring-zinc-700">
                      🌐
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white group-hover:text-zinc-200 transition-colors">
                          Billeteras Web3
                        </span>
                        <span className="text-[10px] text-zinc-400">Wallets Kit</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                        Conecta Albedo, xBull o LOBSTR desde el navegador.
                      </p>
                    </div>
                  </div>
                  <span className="text-zinc-400 font-bold text-lg group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>

              {/* Option 3: Passkey (Face ID / Fingerprint) */}
              <button
                type="button"
                disabled={wallet.isConnecting}
                onClick={handlePasskey}
                className="w-full text-left group rounded-2xl border border-purple-500/30 bg-purple-950/20 p-3.5 hover:border-purple-400/60 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 text-xl ring-1 ring-purple-500/40">
                      👆
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors">
                          Passkey Biométrico
                        </span>
                        <span className="rounded-full bg-purple-950 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                          Face ID / Huella
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                        Smart Account segura con WebAuthn sin contraseñas.
                      </p>
                    </div>
                  </div>
                  <span className="text-purple-400 font-bold text-lg group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>

              {/* Option 4: Quick Play (Demo Mode / Test Account) */}
              <button
                type="button"
                disabled={wallet.isConnecting}
                onClick={handleQuickPlay}
                className="w-full text-left group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 hover:border-zinc-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800/70 text-zinc-400 text-xl ring-1 ring-zinc-700/60">
                      ⚡
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-zinc-300 group-hover:text-white transition-colors">
                          Acceso de Prueba
                        </span>
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-zinc-700">
                          CUENTA DEMO
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">
                        Crea una cuenta temporal de prueba en Testnet sin requerir wallet.
                      </p>
                    </div>
                  </div>
                  <span className="text-zinc-500 font-bold text-lg group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            </div>

            {/* Connecting State Indicator */}
            {wallet.isConnecting && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-300 animate-pulse">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <span>Conectando y sincronizando con Stellar Testnet...</span>
              </div>
            )}

            {/* Footer Trust Note */}
            <div className="mt-5 text-center text-[11px] text-zinc-400">
              Operando en <strong className="text-emerald-400">Stellar Testnet</strong> · Las cartas y XLM son activos de prueba.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
