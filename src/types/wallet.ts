export interface Permit2Token {
  token: string;
  symbol: string;
  amount: string;
  spender: string;
  type: string;
}

export interface ScanResult {
  chain: string;
  native_balance: number;
  tokens: { symbol: string; balance: number; contract: string }[];
  permit2: Permit2Token[];
  has_funds: boolean;
}
