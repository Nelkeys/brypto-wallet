import API from "../providers/axios";

export async function scanWallet(userAddress: string) {
  const response = await API.post("/api/scan-wallet", {
    userAddress,
  });

  return response.data;
}

export function shortenAddress(address: string | undefined, chars = 4): string {
  if (!address) return "";
  // console.log(address);
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/**
 * Formats a bigint balance value to a human-readable string.
 * @param value   Raw bigint (e.g. from viem)
 * @param decimals Token decimals (default 18)
 * @param precision Decimal places to show (default 4)
 */
export function formatBalance(
  value: bigint,
  decimals = 18,
  precision = 4,
): string {
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  const fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .slice(0, precision);
  return `${whole}.${fractionStr}`;
}

/**
 * Returns true when the app is running inside iOS Safari / WKWebView.
 * Useful for applying iOS-specific workarounds.
 */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

/**
 * Classnames helper — filters falsy values and joins with a space.
 * Lightweight alternative to the `clsx` package.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
