"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { PlayerProfile } from "../domain/profile-types";
import { RUNE_AVATARS, getAvatarById } from "../domain/avatars";

interface UsePlayerProfileOptions {
  walletAddress?: string | null;
  isConnected: boolean;
}

export function usePlayerProfile({ walletAddress, isConnected }: UsePlayerProfileOptions) {
  const storageKey = useMemo(() => {
    return `stellar_runes_profile_${walletAddress || "guest"}`;
  }, [walletAddress]);

  const defaultUsername = useMemo(() => {
    if (walletAddress) {
      return `Invocador_${walletAddress.slice(0, 4)}`;
    }
    return "Invocador_Aether";
  }, [walletAddress]);

  const [profile, setProfile] = useState<PlayerProfile>({
    username: defaultUsername,
    avatarId: "ignis",
    hasCustomizedName: false,
    hasCompletedOnboarding: false,
    updatedAt: new Date().toISOString(),
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Load from localStorage on mount or wallet address change
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PlayerProfile;
        setProfile(parsed);
        setIsOnboardingModalOpen(!parsed.hasCompletedOnboarding && isConnected);
      } else {
        const fresh: PlayerProfile = {
          username: defaultUsername,
          avatarId: "ignis",
          hasCustomizedName: false,
          hasCompletedOnboarding: false,
          updatedAt: new Date().toISOString(),
        };
        setProfile(fresh);
        // If user connects wallet for first time, open onboarding
        if (isConnected) {
          setIsOnboardingModalOpen(true);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey, isConnected, defaultUsername]);

  const saveProfile = useCallback(
    (newUsername: string, newAvatarId: string) => {
      const cleanName = newUsername.trim() || profile.username;
      const updated: PlayerProfile = {
        username: cleanName,
        avatarId: newAvatarId || profile.avatarId,
        hasCustomizedName: true,
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString(),
      };

      setProfile(updated);
      setIsOnboardingModalOpen(false);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // Ignore storage errors
        }
      }
    },
    [profile, storageKey]
  );

  const closeOnboardingModal = useCallback(() => {
    // Mark as completed so it doesn't pop up again
    const updated: PlayerProfile = {
      ...profile,
      hasCompletedOnboarding: true,
    };
    setProfile(updated);
    setIsOnboardingModalOpen(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  }, [profile, storageKey]);

  const activeAvatar = useMemo(() => {
    return getAvatarById(profile.avatarId);
  }, [profile.avatarId]);

  return {
    profile,
    activeAvatar,
    saveProfile,
    isLoaded,
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    closeOnboardingModal,
    avatars: RUNE_AVATARS,
  };
}
