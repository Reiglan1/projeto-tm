import { WalletBalance } from "@/types/wallet";

export const BALANCE_KEYS = [
  "availableBalance",
  "balance",
  "currentBalance",
  "amount",
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// A API não documenta os nomes dos campos, então tentamos alguns nomes
// plausíveis antes de desistir.
export function pickBalanceNumber(
  record: WalletBalance,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") return value;
  }
  return null;
}