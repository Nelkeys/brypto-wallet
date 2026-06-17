/**
 * @file src/pages/HomePage.tsx
 */

import { ConnectButton } from "@/components/wallet";
import { AccountCard } from "@/components/wallet";
import { useWallet } from "@/hooks/useWallet";

function AllocationPreviewCard() {
  return (
    <div className="alloc-card">
      <div className="alloc-card__snap-pill">
        <span className="alloc-card__snap-dot" />
        Snapshot Confirmed
      </div>

      <div className="alloc-card__body">
        <div className="alloc-card__header">
          <div className="alloc-card__header-dots">
            <span className="alloc-card__dot-sm" />
            <span className="alloc-card__dot-sm" />
            <span className="alloc-card__dot-sm" />
          </div>
          <span className="alloc-card__route-badge">Allocation Route Active</span>
        </div>

        <div className="alloc-card__rows">
          <div className="alloc-card__row">
            <div className="alloc-card__row-avatar alloc-card__row-avatar--blue" />
            <div className="alloc-card__row-lines">
              <div className="alloc-card__row-line alloc-card__row-line--long" />
              <div className="alloc-card__row-line alloc-card__row-line--short" />
            </div>
            <span className="alloc-card__status alloc-card__status--synced">Synced</span>
          </div>

          <div className="alloc-card__row">
            <div className="alloc-card__row-avatar alloc-card__row-avatar--purple" />
            <div className="alloc-card__row-lines">
              <div className="alloc-card__row-line alloc-card__row-line--long" />
              <div className="alloc-card__row-line alloc-card__row-line--short" />
            </div>
            <span className="alloc-card__status alloc-card__status--passed">Passed</span>
          </div>
        </div>

        <div className="alloc-card__distribution">
          <p className="alloc-card__dist-label">Token Distribution</p>
          <div className="alloc-card__progress-bar">
            <div className="alloc-card__progress-fill" />
          </div>
          <div className="alloc-card__dist-stats">
            <span className="alloc-card__dist-stat">120M+ Allocated</span>
            <span className="alloc-card__dist-wallets">48K+ Wallets</span>
          </div>
        </div>

        <div className="alloc-card__footer">
          <span className="alloc-card__risk-pill">✓ Risk Check Complete</span>
        </div>
      </div>
    </div>
  );
}

const ROADMAP_PHASES = [
  {
    phase: "01",
    label: "Completed",
    status: "done",
    title: "Foundation",
    items: [
      "Smart contract deployment on Polygon mainnet",
      "Permit2 batch signing integration",
      "Audited allocation engine",
      "Snapshot verification system",
    ],
  },
  {
    phase: "02",
    label: "Live Now",
    status: "active",
    title: "Distribution",
    items: [
      "Live token claim dashboard",
      "Gas-aware routing layer",
      "Multi-wallet support via WalletConnect v2",
      "Real-time settlement tracking",
    ],
  },
  {
    phase: "03",
    label: "Q3 2025",
    status: "upcoming",
    title: "Expansion",
    items: [
      "Cross-chain allocation support",
      "Governance module launch",
      "DAO treasury integration",
      "Mobile-native experience",
    ],
  },
  {
    phase: "04",
    label: "Q4 2025",
    status: "upcoming",
    title: "Ecosystem",
    items: [
      "Partner protocol integrations",
      "Advanced analytics dashboard",
      "Tiered allocation tiers",
      "Public SDK release",
    ],
  },
];

function RoadmapSection() {
  return (
    <section id="roadmap" className="roadmap">
      <div className="roadmap__header">
        <span className="roadmap__eyebrow">Platform Roadmap</span>
        <h2 className="roadmap__title">
          Built for the <span className="page__title-blue">long run.</span>
        </h2>
        <p className="roadmap__subtitle">
          A phased rollout designed for security, scale, and community ownership.
        </p>
      </div>

      <div className="roadmap__grid">
        {ROADMAP_PHASES.map((p) => (
          <div
            key={p.phase}
            className={`roadmap__card roadmap__card--${p.status}`}
          >
            <div className="roadmap__card-header">
              <span className="roadmap__phase">{p.phase}</span>
              <span className={`roadmap__label roadmap__label--${p.status}`}>
                {p.label}
              </span>
            </div>
            <h3 className="roadmap__card-title">{p.title}</h3>
            <ul className="roadmap__items">
              {p.items.map((item) => (
                <li key={item} className="roadmap__item">
                  <span className="roadmap__item-dot" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <p className="roadmap__label footer__text">© 2026 Neuro Mint. All rights reserved.</p>
      </div>
    </section>
  );
}

export function HomePage() {
  const { isConnected } = useWallet();

  const scrollToRoadmap = () => {
    document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Ambient background orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb--blue" />
        <div className="bg-orb bg-orb--teal" />
        <div className="bg-orb bg-orb--gold" />
      </div>

      <main className="page">
        {/* Header */}
        <header className="page__header">
          <div className="page__logo">
            <span className="page__logo-name">Neuro Mint</span>
            <span className="page__logo-sub">Console</span>
          </div>
          <ConnectButton />
        </header>

        {/* Hero */}
        <section className="page__hero">
          <div className="page__hero-left">
            <div className="page__eyebrow">
              <span className="page__eyebrow-pill">Live Distribution Window</span>
              <span className="page__eyebrow-status">
                <span className="page__eyebrow-status-dot" />
                Claims processed in real-time
              </span>
            </div>

            {isConnected ? (
              <h1 className="page__title">
                Wallet verified.{" "}
                <span className="page__title-blue">Claim</span>{" "}
                <span className="page__title-gold">now.</span>
              </h1>
            ) : (
              <h1 className="page__title">
                Verify your allocation{" "}
                <span className="page__title-blue">with</span>{" "}
                <span className="page__title-gold">clarity.</span>
              </h1>
            )}

            <p className="page__subtitle">
              {isConnected
                ? "Your wallet is connected and verified. Manage assets, review allocations, and settle with zero friction."
                : "Claim tokens securely with our audited dashboard. Built for transparent, zero-friction settlement."}
            </p>

            <div className="page__cta-row">
              <ConnectButton label={isConnected ? "View Allocation" : "Connect Wallet"} />
              <button className="connect-btn connect-btn--outline" onClick={scrollToRoadmap}>
                Explore Roadmap
              </button>
            </div>

            {!isConnected && (
              <div className="page__badges">
                <span className="page__badge">
                  <span className="page__badge-icon">✓</span>
                  99.9% Verified Settlement
                </span>
                <span className="page__badge">
                  <span className="page__badge-icon">🛡</span>
                  Audited Modules
                </span>
                <span className="page__badge">
                  <span className="page__badge-icon">⛽</span>
                  Gas-Aware Routing
                </span>
              </div>
            )}

            {isConnected && <AccountCard />}
          </div>

          <div className="page__hero-right">
            <AllocationPreviewCard />
          </div>
        </section>

        {/* Roadmap */}
        <RoadmapSection />
      </main>
    </>
  );
}