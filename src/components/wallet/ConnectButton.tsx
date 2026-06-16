/**
 * @file src/components/wallet/ConnectButton.tsx
 *
 * ─── iOS POPUP FIX ───────────────────────────────────────────────────────────
 * onClick must be synchronous — no async/await before openModal().
 * See Web3Provider.tsx for full explanation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/utils";

interface ConnectButtonProps {
  label?: string;
  className?: string;
}

const WalletIcon = () => (
  <svg
    className="connect-btn__icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="14.5" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export function ConnectButton({
  label = "Connect Wallet",
  className = "",
}: ConnectButtonProps) {
  const { address, isConnected, isConnecting, openModal } = useWallet();

  if (!isConnected) {
    return (
      <button
        className={`connect-btn ${className}`}
        onClick={() => openModal("Connect")}
        disabled={isConnecting}
        aria-label={isConnecting ? "Connecting wallet…" : label}
      >
        {isConnecting ? (
          <span className="connect-btn__spinner" aria-hidden="true" />
        ) : (
          <WalletIcon />
        )}
        <span>{isConnecting ? "Connecting…" : label}</span>
      </button>
    );
  }

  return (
    <button
      className={`connect-btn connect-btn--connected ${className}`}
      onClick={() => openModal("Account")}
      aria-label={`Wallet connected: ${address}`}
    >
      <span className="connect-btn__dot" aria-hidden="true" />
      <span>{shortenAddress(address!)}</span>
    </button>
  );
}