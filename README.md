# Web3 App — Reown AppKit + Vite + pnpm

A modular, production-ready Web3 boilerplate built with:
- **[Reown AppKit](https://docs.reown.com/appkit/react/core/installation)** — wallet modal & connection
- **[Wagmi v2](https://wagmi.sh/)** — React hooks for Ethereum
- **[Viem](https://viem.sh/)** — TypeScript Ethereum utilities
- **[TanStack Query](https://tanstack.com/query)** — async state management
- **[Vite](https://vitejs.dev/)** — build tool
- **[pnpm](https://pnpm.io/)** — package manager

---

## Quick Start

```bash
# 1. Clone and install
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Fill in VITE_REOWN_PROJECT_ID from https://dashboard.reown.com

# 3. Run dev server
pnpm dev
```

---

## Project Structure

```
src/
├── config/
│   └── appkit.ts          ← ⭐ All AppKit/Wagmi config lives here
│
├── providers/
│   └── Web3Provider.tsx   ← Wraps app with WagmiProvider + QueryClientProvider
│
├── hooks/
│   └── useWallet.ts       ← Central wallet hook (address, balance, openModal…)
│
├── components/
│   └── wallet/
│       ├── ConnectButton.tsx  ← Connect / Account button
│       ├── AccountCard.tsx    ← Connected wallet info card
│       └── index.ts           ← Barrel export
│
├── pages/
│   └── HomePage.tsx       ← Landing page (add your pages here)
│
├── lib/
│   └── utils.ts           ← Shared helpers (shortenAddress, formatBalance…)
│
└── styles/
    └── globals.css        ← Design tokens + component styles
```

### Adding a new network

Edit `src/config/appkit.ts`:

```ts
import { optimism } from "@reown/appkit/networks";

export const supportedNetworks = [mainnet, arbitrum, base, polygon, optimism];
```

That's it — the modal and network switcher update automatically.

---

## 🍎 iOS Safari Wallet Popup Fix

**Why Android works but iOS doesn't** is one of the most common Web3 gotchas.

### Root Cause

iOS Safari enforces a strict **user-gesture requirement** for `window.open()`. WalletConnect uses `window.open()` internally to deep-link into wallet apps (MetaMask, Rainbow, etc.). Safari classifies any `window.open()` that isn't called synchronously within the same call-stack as a user tap as an unauthorized popup — and silently blocks it.

Any `await` before `modal.open()` breaks this chain:

```ts
// ❌ This breaks on iOS — await yields control, losing the gesture context
button.onclick = async () => {
  await checkSomething();
  modal.open(); // Safari: "No gesture found — blocked."
};

// ✅ This works — modal.open() is the first thing called
button.onclick = () => {
  modal.open(); // Safari: "Gesture detected — allowed."
};
```

### Fixes Applied in This Codebase

| File | Fix |
|---|---|
| `src/components/wallet/ConnectButton.tsx` | `onClick` is a plain synchronous arrow fn; `openModal()` is the first call |
| `src/hooks/useWallet.ts` | `openModal()` is not async; JSDoc warning prevents future async wrapping |
| `src/providers/Web3Provider.tsx` | `reconnectOnMount` avoids an async round-trip on mount that could interfere |
| `index.html` | `apple-mobile-web-app-capable` reduces WKWebView popup quirks |

### The Golden Rule for Future Devs

> **Never put `await` before `openModal()` (or any wallet action that triggers `window.open`) in an event handler.**

If you need to validate something before connecting, do it *after* the modal opens, or use a two-step flow (validate → enable the button → user taps → modal opens).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_REOWN_PROJECT_ID` | ✅ | From [dashboard.reown.com](https://dashboard.reown.com) |
| `VITE_APP_NAME` | Optional | Shown in wallet modal |
| `VITE_APP_DESCRIPTION` | Optional | Shown in wallet modal |
| `VITE_APP_URL` | Optional | Must match your deployment domain for Verify API |
| `VITE_APP_ICON` | Optional | Shown in wallet modal |

---

## Adding a Router

```bash
pnpm add @tanstack/react-router
# or
pnpm add react-router-dom
```

Then wrap `<HomePage />` in `src/App.tsx` with your router of choice.

---

## Adding a New Wallet Feature

1. Add a new hook in `src/hooks/` (e.g. `useTokenBalance.ts`) using wagmi primitives.
2. Add a new component in `src/components/` that consumes the hook.
3. Drop the component into a page in `src/pages/`.

No changes to `config/appkit.ts` or providers needed.
