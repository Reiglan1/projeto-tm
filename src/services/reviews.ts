import api from "./api";
import { normalizeError } from "./apiError";
import {
  RequestCreateReviewJason,
  ResponseAllReviewsJason,
  ResponseReviewJason,
} from "@/types/review";

export async function createReview(
  payload: RequestCreateReviewJason
): Promise<ResponseReviewJason> {
  try {
    const { data } = await api.post<ResponseReviewJason>(
      "/api/reviews",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

// A API não documenta um 404 pra "chamado sem avaliações ainda", mas
// tratamos esse caso como "lista vazia" pra não travar a tela.
export async function getReviewsByServiceOrder(
  serviceOrderId: string
): Promise<ResponseReviewJason[]> {
  try {
    const { data } = await api.get<ResponseReviewJason[]>(
      `/api/reviews/service-order/${serviceOrderId}`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) return [];
    throw normalizeError(error);
  }
}

export interface GetReviewsParams {
  page?: number;
  pageSize?: number;
}

export async function getReviewsByWorker(
  workerId: string,
  params: GetReviewsParams = {}
): Promise<ResponseAllReviewsJason> {
  try {
    const { data } = await api.get<ResponseAllReviewsJason>(
      `/api/reviews/worker/${workerId}`,
      { params: { page: params.page ?? 1, pageSize: params.pageSize ?? 10 } }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getReviewsByClient(
  clientId: string,
  params: GetReviewsParams = {}
): Promise<ResponseAllReviewsJason> {
  try {
    const { data } = await api.get<ResponseAllReviewsJason>(
      `/api/reviews/client/${clientId}`,
      { params: { page: params.page ?? 1, pageSize: params.pageSize ?? 10 } }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}