import { AxiosError } from "axios";
import api from "./api";
import { normalizeError } from "./apiError";
import { PaymentRecord, RequestInitiatePaymentJason } from "@/types/payment";

export async function getPaymentByServiceOrder(
  serviceOrderId: string
): Promise<PaymentRecord | null> {
  try {
    const { data } = await api.get(
      `/api/payments/service-order/${serviceOrderId}`
    );

    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }

    return data as PaymentRecord;
  } catch (error) {
    const axiosError = error as AxiosError;
    // A API não documenta um 404 pra "ainda não iniciou pagamento", mas
    // tratamos esse caso como "nenhum registro" pra não travar a tela.
    if (axiosError?.response?.status === 404) {
      return null;
    }
    throw normalizeError(error);
  }
}

export async function initiatePayment(
  payload: RequestInitiatePaymentJason
): Promise<PaymentRecord> {
  try {
    const { data } = await api.post("/api/payments", payload);
    return (data ?? {}) as PaymentRecord;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function confirmPayment(paymentId: string): Promise<PaymentRecord> {
  try {
    const { data } = await api.post(`/api/payments/${paymentId}/confirm`);
    return (data ?? {}) as PaymentRecord;
  } catch (error) {
    throw normalizeError(error);
  }
}