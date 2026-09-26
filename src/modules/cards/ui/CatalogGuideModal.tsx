"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CatalogGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationLabel?: string;
}

export function CatalogGuideModal({
  isOpen,
  onClose,
  destinationLabel = "al altar o mazo",
}: CatalogGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-[#0E1122] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h4 className="font-bold text-white text-base">Guía del Catálogo de Runas</h4>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-7 w-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3.5 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold text-sm">👆</span>
                <div>
                  <strong className="text-white block">Tocar carta:</strong>
                  Abre la inspección interactiva en 3D con estadísticas completas y habilidades.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold text-sm">🎴</span>
                <div>
                  <strong className="text-white block">Arrastrar carta:</strong>
                  Arrastra cualquier runa disponible para equiparla {destinationLabel}.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
