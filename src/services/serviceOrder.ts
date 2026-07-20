import api from "./api";
import { normalizeError } from "./apiError";
import {
  RequestCancelServiceOrderJason,
  RequestCreateServiceOrderJason,
  RequestUpdateServiceOrderStatusJason,
  ResponseAllServiceOrdersJason,
  ResponseServiceOrderJason,
  ResponseWorkerLiveLocationJason,
} from "@/types/serviceOrder";

export interface GetServiceOrdersParams {
  page?: number;
  pageSize?: number;
  clientId?: string;
  workerId?: string;
  status?: string;
}

export async function getServiceOrders(
  params: GetServiceOrdersParams
): Promise<ResponseAllServiceOrdersJason> {
  try {
    const { data } = await api.get<ResponseAllServiceOrdersJason>(
      "/api/service-orders",
      { params }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createServiceOrder(
  payload: RequestCreateServiceOrderJason
): Promise<ResponseServiceOrderJason> {
  try {
    const { data } = await api.post<ResponseServiceOrderJason>(
      "/api/service-orders",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getServiceOrderById(
  id: string
): Promise<ResponseServiceOrderJason> {
  try {
    const { data } = await api.get<ResponseServiceOrderJason>(
      `/api/service-orders/${id}`
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function cancelServiceOrder(
  id: string,
  payload: RequestCancelServiceOrderJason
): Promise<ResponseServiceOrderJason> {
  try {
    const { data } = await api.patch<ResponseServiceOrderJason>(
      `/api/service-orders/${id}/cancel`,
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateServiceOrderStatus(
  id: string,
  payload: RequestUpdateServiceOrderStatusJason
): Promise<ResponseServiceOrderJason> {
  try {
    const { data } = await api.patch<ResponseServiceOrderJason>(
      `/api/service-orders/${id}/status`,
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

// Posição do profissional em tempo real durante um chamado em rota
// (usada pra mostrar no mapa da tela de acompanhamento).
export async function getWorkerLiveLocation(
  serviceOrderId: string
): Promise<ResponseWorkerLiveLocationJason> {
  try {
    const { data } = await api.get<ResponseWorkerLiveLocationJason>(
      `/api/service-orders/${serviceOrderId}/worker-location`
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}