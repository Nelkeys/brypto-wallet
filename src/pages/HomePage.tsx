/**
 * @file src/pages/HomePage.tsx
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
          {isConnected ? (
            <>
              You&rsquo;re in.{" "}
              <span className="page__title-accent">Let&rsquo;s go.</span>
            </>
          ) : (
            <>
              Your wallet,{" "}
              <span className="page__title-accent">your rules.</span>
            </>
          )}
        </h1>

        <p className="page__subtitle">
          {isConnected
            ? "Your wallet is connected and ready. Manage assets, switch networks, or explore."
            : "Connect any wallet in seconds. Works on iOS, Android, and desktop — no extensions needed."}
        </p>

        {!isConnected && (
          <div className="page__badges">
            <span className="page__badge">
              <span className="page__badge-dot" aria-hidden="true" />
              WalletConnect v2
            </span>
            <span className="page__badge">
              <span className="page__badge-dot" aria-hidden="true" />
              5 networks
            </span>
            <span className="page__badge">
              <span className="page__badge-dot" aria-hidden="true" />
              Non-custodial
            </span>
          </div>
        )}
      </section>

      <AccountCard />
    </main>
  );
}