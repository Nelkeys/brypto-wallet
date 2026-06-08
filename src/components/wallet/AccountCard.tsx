/**
 * @file src/components/wallet/AccountCard.tsx
 *
 * Displays address, network, and balance when a wallet is connected.
 * Falls back to null when disconnected — pair with ConnectButton.
 */

import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/utils";
import { supportedNetworks } from "@/config/appkit";

export function AccountCard() {
  const { address, isConnected, chainId, balance, openModal, disconnect } = useWallet();

  if (!isConnected || !address) return null;

  const network = supportedNetworks.find((n) => n.id === chainId);

  return (
    <div className="account-card" role="region" aria-label="Wallet info">
      {/* Network badge */}
      <div className="account-card__network">
        <span className="account-card__dot" aria-hidden="true" />
        <span>{network?.name ?? `Chain ${chainId}`}</span>
      </div>

      {/* Address */}
      <p className="account-card__address" title={address}>
        {shortenAddress(address)}
      </p>

      {/* Balance */}
      {balance && (
        <p className="account-card__balance">
          {Number(balance.formatted).toFixed(4)} {balance.symbol}
        </p>
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
