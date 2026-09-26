"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RUNE_AVATARS, getAvatarById } from "../domain/avatars";
import type { PlayerProfile } from "../domain/profile-types";
import { SparklesIcon } from "@/shared/ui/icons/Elements";

interface OnboardingProfileModalProps {
  isOpen: boolean;
  initialProfile: PlayerProfile;
  onSave: (username: string, avatarId: string) => void;
  onClose: () => void;
  isFirstTime?: boolean;
}

export function OnboardingProfileModal({
  isOpen,
  initialProfile,
  onSave,
  onClose,
  isFirstTime = false,
}: OnboardingProfileModalProps) {
  const [username, setUsername] = useState(initialProfile.username);
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialProfile.avatarId || "ignis");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(initialProfile.username);
      setSelectedAvatarId(initialProfile.avatarId || "ignis");
      setError(null);
    }
  }, [isOpen, initialProfile]);

  if (!isOpen) return null;

  const currentAvatar = getAvatarById(selectedAvatarId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = username.trim();

    if (!cleanName) {
      setError("Por favor ingresa un nombre de invocador.");
      return;
    }

    if (cleanName.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    if (cleanName.length > 20) {
      setError("El nombre no puede superar los 20 caracteres.");
      return;
    }

    onSave(cleanName, selectedAvatarId);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        {/* Backdrop click dismiss only if not mandatory first time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isFirstTime ? onClose : undefined}
          className="fixed inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#101428] via-[#0E1022] to-[#0A0C18] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-base shadow-[0_0_12px_rgba(0,229,255,0.3)]">
                ✦
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {isFirstTime ? "Identidad de Invocador" : "Editar Perfil de Invocador"}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {isFirstTime
                    ? "Configura tu nombre y emblema rúnico para comenzar."
                    : "Actualiza tu nombre de batalla y avatar elemental."}
                </p>
              </div>
            </div>

            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Input Name */}
            <div>
              <label htmlFor="invocador-name-input" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Nombre de Invocador
              </label>
              <div className="relative">
                <input
                  id="invocador-name-input"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  maxLength={20}
                  placeholder="Ej. IgnisMaster_99"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-semibold"
                />
                <span className="absolute right-3 top-3 text-[10px] font-mono text-zinc-500">
                  {username.length}/20
                </span>
              </div>
              {error && <p className="mt-1 text-xs text-red-400 font-semibold">{error}</p>}
            </div>

            {/* Avatar Selector Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Elige tu Emblema Rúnico
                </span>
                <span className={`text-[11px] font-black uppercase ${currentAvatar.accentColor}`}>
                  {currentAvatar.title}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {RUNE_AVATARS.map((avatar) => {
                  const isSelected = avatar.id === selectedAvatarId;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl p-2.5 border transition-all cursor-pointer ${
                        isSelected
                          ? `bg-black/80 ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0A0C18] scale-[1.03] ${avatar.borderStyle} ${avatar.badgeStyle}`
                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow-md leading-none mb-1">
                        {avatar.icon}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-white truncate max-w-full">
                        {avatar.name}
                      </span>
                      <span className="text-[9px] font-mono opacity-70">
                        {avatar.element}
                      </span>

                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-black text-[9px] font-black shadow-[0_0_8px_#00e5ff]">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Avatar Lore Box */}
              <div className="mt-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5 flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{currentAvatar.icon}</span>
                <p className="text-[11px] text-zinc-300 italic leading-snug">
                  &ldquo;{currentAvatar.lore}&rdquo;
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
              {!isFirstTime && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2.5 text-xs font-extrabold text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-black" />
                <span>{isFirstTime ? "Guardar y Comenzar" : "Guardar Cambios"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
