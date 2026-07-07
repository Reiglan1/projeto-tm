import api from "./api";
import { normalizeError } from "./apiError";
import { RequestOpenDisputeJason } from "@/types/dispute";

export async function openDispute(
  paymentId: string,
  payload: RequestOpenDisputeJason
): Promise<void> {
  try {
    await api.post(`/api/disputes/payment/${paymentId}`, payload);
  } catch (error) {
    throw normalizeError(error);
  }
}