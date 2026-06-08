/**
 * @file src/hooks/useWallet.ts
 *
 * Thin abstraction over wagmi + AppKit modal.
 *
 * ─── WHY USE THIS INSTEAD OF wagmi DIRECTLY? ────────────────────────────────
 * • One import for all wallet state (address, chain, connection status).
 * • openModal() is synchronous — critical for iOS Safari popup fix.
 *   (See iOS note in Web3Provider.tsx for context.)
 * • Hides the modal singleton; components never import `modal` from config.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Usage:
 *   const { address, isConnected, openModal, disconnect } = useWallet();
 */

import { useAccount, useDisconnect, useBalance, useChainId } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import type { AppKitOptions } from "@reown/appkit";

type ModalView = NonNullable<
  Parameters<ReturnType<typeof useAppKit>["open"]>[0]
>["view"];

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting, status } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { open } = useAppKit();

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  /**
   * Opens the AppKit modal.
   *
   * ⚠️  IMPORTANT — iOS Safari rule:
   * Always call `openModal()` directly inside an onClick handler.
   * Do NOT await anything before calling it — that breaks the
   * user-gesture requirement and Safari will block the popup.
   *
   * ✅ Good:
   *   <button onClick={() => openModal()}>Connect</button>
   *
   * ❌ Bad:
   *   <button onClick={async () => { await something(); openModal(); }}>Connect</button>
   */
  function openModal(view?: ModalView) {
    if (view) {
      open({ view });
    } else {
      open();
    }
  }

  return {
    // Account state
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    status,
    chainId,

    // Formatted balance
    balance: balance
      ? { formatted: balance.formatted, symbol: balance.symbol, value: balance.value }
      : null,

    // Actions
    openModal,
    disconnect,
  };
}

// Re-export for convenience — avoids importing AppKitOptions directly in components
export type { AppKitOptions };
