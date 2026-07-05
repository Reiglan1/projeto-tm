import api from "./api";
import { normalizeError } from "./apiError";
import {
  RequestCreateServiceOrderJason,
  ResponseAllServiceOrdersJason,
  ResponseServiceOrderJason,
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