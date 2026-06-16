/**
 * @file src/components/wallet/AccountCard.tsx
 */

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { supportedNetworks } from "@/config/appkit";

// Generate a unique background color from the wallet address
function avatarColor(address: string): string {
  const hue = parseInt(address.slice(2, 8), 16) % 360;
  return `hsl(${hue}, 60%, 50%)`;
}

// Return the CSS modifier for the chain dot
function chainDotClass(chainId: number): string {
  const map: Record<number, string> = {
    1: "ethereum",
    137: "polygon",
    10: "optimism",
    42161: "arbitrum",
    56: "bsc",
  };
  return map[chainId] ? `account-card__dot--${map[chainId]}` : "";
}

export function AccountCard() {
  const { address, isConnected, chainId, balance, openModal, disconnect } =
    useWallet();
  const [copied, setCopied] = useState(false);

  if (!isConnected || !address) return null;

  const network = supportedNetworks.find((n) => n.id === chainId);

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Avatar shows first 4 hex chars of the address
  const avatarLabel = address.slice(2, 6).toUpperCase();

  // console.log(Number(balance?.formatted ?? 0));

  return (
    <div className="account-card" role="region" aria-label="Wallet info">
      {/* Network badge */}
      <div className="account-card__network-row">
        <div className="account-card__network">
          <span
            className={`account-card__dot ${chainDotClass(chainId)}`}
            aria-hidden="true"
          />
          {network?.name ?? `Chain ${chainId}`}
        </div>
      </div>

      {/* Avatar + address */}
      <div className="account-card__identity">
        <div
          className="wallet-avatar"
          style={{ background: avatarColor(address) }}
          aria-hidden="true"
        >
          {avatarLabel}
        </div>

        <div className="account-card__address-group">
          <p className="account-card__address-label">Wallet</p>
          <p className="account-card__address" title={address}>
            {address.slice(0, 6)}…{address.slice(-4)}
          </p>
          <button
            className={`copy-btn${copied ? " copy-btn--copied" : ""}`}
            onClick={handleCopy}
            aria-label={copied ? "Copied!" : "Copy full address"}
          >
            {copied ? (
              <>
                <span className="copy-btn__check" aria-hidden="true">
                  ✓
                </span>
                Copied
              </>
            ) : (
              <>
                <span aria-hidden="true">⎘</span>
                Copy address
              </>
            )}
          </button>
        </div>
      </div>

      {/* Balance */}
      {balance && (
        <div className="account-card__balance-row">
          <p className="account-card__balance-label">Balance</p>
          <p className="account-card__balance">
            {Number(balance.formatted).toFixed(4)}
            <span className="account-card__balance-symbol">
              {balance.symbol}
            </span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="account-card__actions">
        <button
          className="account-card__btn account-card__btn--secondary"
          onClick={() => openModal("Networks")}
        >
          Switch Network
        </button>
        <button
          className="account-card__btn account-card__btn--danger"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
