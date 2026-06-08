/**
 * @file src/providers/Web3Provider.tsx
 *
 * Wraps the entire app with all Web3 context providers.
 *
 * ─── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 * Keeping providers in one place means future devs only need to touch this
 * file when adding a new provider.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── iOS POPUP FIX ───────────────────────────────────────────────────────────
 * iOS Safari blocks window.open() calls that aren't triggered by a direct
 * user gesture. WalletConnect's deep-link redirect goes through an async chain,
 * so Safari classifies it as a "popup" and blocks it.
 *
 * Fixes applied:
 *  1. AppKit is imported first (side-effect: registers adapters before React renders).
 *  2. `reconnectOnMount` avoids an extra async round-trip on iOS that can
 *     swallow the gesture context.
 *  3. See ConnectButton.tsx — onClick calls openModal() synchronously.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Side-effect import: initialises AppKit / wagmi adapter before any component renders.
import "@/config/appkit";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { wagmiAdapter, queryClient } from "@/config/appkit";
import type { ReactNode } from "react";

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <WagmiProvider config={wagmiAdapter.wagmiConfig as any} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
