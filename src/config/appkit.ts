/**
 * @file src/config/appkit.ts
 *
 * Central configuration for Reown AppKit.
 *
 * ─── HOW TO EXTEND ───────────────────────────────────────────────────────────
 * • Add networks: import from "@reown/appkit/networks" and push to `networks`.
 * • Swap adapter: replace WagmiAdapter with EthersAdapter or SolanaAdapter.
 * • Toggle features: edit the `features` object passed to createAppKit().
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createAppKit } from "@reown/appkit/react";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  bsc,
  type AppKitNetwork,
} from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient } from "@tanstack/react-query";

// ─── Environment validation ───────────────────────────────────────────────────

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined;

if (!projectId) {
  throw new Error(
    "[AppKit] VITE_REOWN_PROJECT_ID is not set.\n" +
      "Copy .env.example → .env.local and fill in your project ID from https://dashboard.reown.com",
  );
}

// ─── Networks ─────────────────────────────────────────────────────────────────

/**
 * Ordered list of supported networks.
 * The first network is the default on first connection.
 * Add / remove networks here; the rest of the app adapts automatically.
 */
export const supportedNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  bsc,
];

// ─── App metadata ─────────────────────────────────────────────────────────────

/**
 * Shown inside the wallet connection modal.
 * `url` MUST match your deployment domain for the Verify API to work correctly.
 */
const appUrl =
  (import.meta.env.VITE_APPLICATION_URL as string | undefined) ??
  window.location.origin;

export const appMetadata = {
  name: (import.meta.env.VITE_APP_NAME as string | undefined) ?? "My Web3 App",
  description:
    (import.meta.env.VITE_APP_DESCRIPTION as string | undefined) ??
    "A modular Web3 app",
  url: appUrl,
  icons: [
    (import.meta.env.VITE_APP_ICON as string | undefined) ??
      `${window.location.origin}/icon.png`,
  ],
  // `redirect` governs the trip BACK to this dApp after the wallet signs.
  // Required (WalletConnect 1.9.5+) for reliable behaviour on iOS 17+, where
  // automatic redirect-back is otherwise blocked. `universal` must match the
  // verified domain registered in the Reown dashboard.
  redirect: {
    universal: appUrl,
    native: appUrl,
  },
};

// ─── React Query client ───────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1_000 * 60, // 1 minute
      retry: 2,
    },
  },
});

// ─── Wagmi adapter ───────────────────────────────────────────────────────────

export const wagmiAdapter = new WagmiAdapter({
  networks: supportedNetworks,
  projectId,
  ssr: false,
});

// ─── AppKit initialisation ───────────────────────────────────────────────────
//
// Called ONCE, outside any React component, so it never re-runs on re-render.

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: supportedNetworks,
  projectId,
  metadata: appMetadata,
  features: {
    analytics: false,
    email: false,
    socials: [],
    emailShowWallets: false,
  },
  defaultNetwork: mainnet,
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#0071e3",
    "--w3m-border-radius-master": "10px",
  },
  enableWalletConnect: true,
  enableInjected: true, // ← detects window.ethereum in wallet browsers
  enableEIP6963: true, // ← detects multiple injected wallets
  // ↓ add this — shows QR code as fallback when deep link fails
  enableCoinbase: false,
  allowUnsupportedChain: true,
});
