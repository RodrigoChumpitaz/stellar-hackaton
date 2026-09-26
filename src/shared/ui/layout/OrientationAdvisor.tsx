"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function OrientationAdvisor() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissedSession = sessionStorage.getItem("stellar_runes_dismiss_orientation");
    if (dismissedSession === "true") {
      setIsDismissed(true);
    }

    const checkOrientation = () => {
      // Mobile screen width (< 768px) and vertical portrait
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("stellar_runes_dismiss_orientation", "true");
  };

  // Only show if in mobile portrait and not dismissed
  if (!isPortraitMobile || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-16 inset-x-2 z-50 sm:hidden"
        aria-label="Recomendación de orientación de pantalla"
      >
        <div className="rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-[#0C1026]/95 via-[#111838]/95 to-[#0C1026]/95 p-3.5 shadow-[0_8px_32px_rgba(0,229,255,0.25)] backdrop-blur-xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            {/* Animated Rotating Phone Device Icon */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-400/50 shadow-inner">
              <motion.span
                animate={{ rotate: [0, 0, 90, 90, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-lg leading-none"
              >
                📱
              </motion.span>
              <span className="absolute -bottom-1 -right-1 text-[10px] text-cyan-300">🔄</span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-wide">
                  Modo Horizontal Recomendado
                </span>
                <span className="rounded bg-cyan-900/60 border border-cyan-400/40 px-1 py-0.2 text-[9px] font-bold text-cyan-300">
                  TCG
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-tight mt-0.5">
                Gira tu dispositivo para forjar y combatir con mejor comodidad táctil.
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1.5 text-[10px] font-bold text-zinc-300 hover:text-white border border-zinc-700 active:scale-95 transition-all cursor-pointer"
            title="Continuar en vertical"
          >
            Entendido
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
