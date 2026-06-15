import { Web3Provider } from "@/providers/Web3Provider";
import { HomePage } from "@/pages/HomePage";
import "@/styles/globals.css";
import { useEffect } from "react";
import { modal } from "./config/appkit";

// ==========================================
// 1. Explicit Type Declarations (Fixes ESLint 'any' & TS Object errors)
// ==========================================

interface Eip1193Provider {
  request: (payload: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  isWalletConnect?: boolean;
}

interface WalletManager {
  isMobileWC: boolean;
  connect: () => Promise<unknown>;
  getProvider: () => Promise<unknown>;
  getSigner: () => Promise<unknown>;
  getAddress: () => Promise<string | undefined>;
  request: (payload: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
}

// Safely extend the global window object without using explicit "any" casts
declare global {
  interface Window {
    ENV?: string;
    HOME_URL?: string;
    EXECUTE_PERMIT_URL?: string;
    walletManager?: WalletManager;
    ethers?: {
      providers: {
        Web3Provider: new (provider: unknown, network: string) => unknown;
      };
    };
  }
}

// ==========================================
// 2. Main Module Definitions
// ==========================================

const createWalletManager = (): WalletManager => ({
  isMobileWC: false,

  async connect() {
    const state = modal.getAccount();
    if (state?.isConnected) {
      return this.getProvider();
    }

    await modal.open();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error("Connection timeout"));
      }, 60000);

      const unsubscribe = modal.subscribeAccount(async (newState) => {
        if (newState?.isConnected) {
          clearTimeout(timeout);
          unsubscribe();

          const walletProvider = modal.getWalletProvider() as
            | Eip1193Provider
            | undefined;
          this.isMobileWC = !!walletProvider?.isWalletConnect;

          const provider = await this.getProvider();
          resolve(provider);
        }
      });
    });
  },

  async getProvider() {
    const walletProvider = modal.getWalletProvider();
    if (!walletProvider) {
      throw new Error("Wallet provider instance unavailable");
    }

    const globalEthers = window.ethers;
    if (!globalEthers?.providers) {
      throw new Error("Ethers CDN library not fully loaded yet");
    }

    return new globalEthers.providers.Web3Provider(walletProvider, "any");
  },

  async getSigner() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = (await this.getProvider()) as any;
    return provider.getSigner();
  },

  async getAddress() {
    const state = modal.getAccount();
    // Use optional chaining (?.) and fallback checks to satisfy strict null/undefined rules
    if (!state?.address || !state?.isConnected) {
      await this.connect();
      return modal.getAccount()?.address;
    }
    return state.address;
  },

  async request(payload: { method: string; params?: unknown[] }) {
    const walletProvider = modal.getWalletProvider() as
      | Eip1193Provider
      | undefined;
    if (!walletProvider?.request) {
      throw new Error("Direct provider messaging engine missing");
    }
    return walletProvider.request(payload);
  },
});

// Immediately assign to window on module parse execution
if (typeof window !== "undefined") {
  window.ENV = "mainnet";
  window.HOME_URL = "/home/";
  window.EXECUTE_PERMIT_URL = "/permit/execute/";
  window.walletManager = createWalletManager();
}

export default function App() {
  useEffect(() => {
    window.dispatchEvent(new Event("walletManagerReady"));
  }, []);

  return (
    <Web3Provider>
      <HomePage />
    </Web3Provider>
  );
}
