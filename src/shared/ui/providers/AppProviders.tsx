"use client";

import { WalletProvider } from "@/modules/wallet";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
