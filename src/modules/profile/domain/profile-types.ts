export interface RuneAvatar {
  id: string;
  name: string;
  title: string;
  element: string;
  icon: string;
  accentColor: string;
  badgeStyle: string;
  borderStyle: string;
  lore: string;
}

export interface PlayerProfile {
  username: string;
  avatarId: string;
  hasCustomizedName: boolean;
  hasCompletedOnboarding: boolean;
  updatedAt: string;
}
