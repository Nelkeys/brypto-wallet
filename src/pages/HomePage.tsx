/**
 * @file src/pages/HomePage.tsx
 * Landing page — demonstrates the wallet components.
 */

import { ConnectButton, AccountCard } from "@/components/wallet";
import { useWallet } from "@/hooks/useWallet";

export function HomePage() {
  const { isConnected } = useWallet();

  return (
    <main className="page">
      <header className="page__header">
        <div className="page__logo">Neuro Mint</div>
        <ConnectButton />
      </header>

      <section className="page__hero">
        <h1 className="page__title">
          {isConnected ? "You're connected 🎉" : "Connect your wallet"}
        </h1>
        <p className="page__subtitle">
          {isConnected
            ? "Interact with any dApp feature below."
            : "Works on iOS, Android, and desktop. Tap to get started."}
        </p>
      </section>

      {/* Show account details only when connected */}
      <AccountCard />

      {/* Add your dApp feature sections below */}
    </main>
  );
}
