import api from "./api";
import { normalizeError } from "./apiError";
import {
  RequestClientWithdrawalJason,
  RequestCreateDepositJason,
  ResponseClientWalletJason,
  ResponseClientWithdrawalJason,
  ResponseWalletDepositJason,
} from "@/types/clientWallet";

export async function getClientWallet(): Promise<ResponseClientWalletJason> {
  try {
    const { data } = await api.get<ResponseClientWalletJason>(
      "/api/client-wallet"
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createDeposit(
  payload: RequestCreateDepositJason
): Promise<ResponseWalletDepositJason> {
  try {
    const { data } = await api.post<ResponseWalletDepositJason>(
      "/api/client-wallet/deposits",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function requestClientWithdrawal(
  payload: RequestClientWithdrawalJason
): Promise<ResponseClientWithdrawalJason> {
  try {
    const { data } = await api.post<ResponseClientWithdrawalJason>(
      "/api/client-wallet/withdrawals",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getClientWithdrawals(): Promise<ResponseClientWithdrawalJason[]> {
  try {
    const { data } = await api.get<ResponseClientWithdrawalJason[]>(
      "/api/client-wallet/withdrawals"
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw normalizeError(error);
  }
}