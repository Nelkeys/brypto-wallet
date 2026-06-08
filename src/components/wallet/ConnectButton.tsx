/**
 * @file src/components/wallet/ConnectButton.tsx
 *
 * Primary wallet connection button.
 *
 * ─── iOS POPUP FIX — READ THIS ───────────────────────────────────────────────
 * iOS Safari requires window.open() (used internally by WalletConnect) to be
 * called within the same call-stack as a user gesture (tap).  Any `await`
 * before open() breaks the gesture chain and Safari silently blocks the popup.
 *
 * Rules for this component and any future connect trigger:
 *  1. onClick must be a plain synchronous arrow function.
 *  2. Call openModal() as the FIRST thing — no awaits before it.
 *  3. Never wrap the button in a <form> with onSubmit — form submissions
 *     are treated differently by WebKit and break the gesture context.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/utils";

interface ConnectButtonProps {
  /** Optional label override when disconnected */
  label?: string;
  className?: string;
}

export function ConnectButton({ label = "Connect Wallet", className = "" }: ConnectButtonProps) {
  const { address, isConnected, isConnecting, openModal } = useWallet();

  // ── Disconnected state ────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <button
        className={`connect-btn ${className}`}
        // ⚠️ Synchronous click — do NOT add async/await here (iOS fix)
        onClick={() => openModal("Connect")}
        disabled={isConnecting}
        aria-label={isConnecting ? "Connecting wallet…" : label}
      >
        {isConnecting ? (
          <span className="connect-btn__spinner" aria-hidden="true" />
        ) : null}
        <span>{isConnecting ? "Connecting…" : label}</span>
      </button>
    );
  }

  // ── Connected state ───────────────────────────────────────────────────────
  return (
    <button
      className={`connect-btn connect-btn--connected ${className}`}
      // ⚠️ Synchronous click — opens Account view (iOS safe)
      onClick={() => openModal("Account")}
      aria-label={`Wallet connected: ${address}`}
    >
      <span className="connect-btn__dot" aria-hidden="true" />
      <span>{shortenAddress(address!)}</span>
    </button>
  );
}
