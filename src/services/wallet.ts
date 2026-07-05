import api from "./api";
import { normalizeError } from "./apiError";
import {
  RequestWithdrawalJason,
  WalletBalance,
  WithdrawalRecord,
} from "@/types/wallet";

export async function getWalletBalance(): Promise<WalletBalance> {
  try {
    const { data } = await api.get("/api/wallet/me");
    return (data ?? {}) as WalletBalance;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getMyWithdrawals(): Promise<WithdrawalRecord[]> {
  try {
    const { data } = await api.get("/api/wallet/withdrawals/me");

    if (Array.isArray(data)) {
      return data as WithdrawalRecord[];
    }
    if (data && Array.isArray((data as { items?: unknown }).items)) {
      return (data as { items: WithdrawalRecord[] }).items;
    }
    return [];
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function requestWithdrawal(
  payload: RequestWithdrawalJason
): Promise<void> {
  try {
    await api.post("/api/wallet/withdrawals", payload);
  } catch (error) {
    throw normalizeError(error);
  }
}