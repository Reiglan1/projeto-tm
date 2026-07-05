import api from "./api";
import { normalizeError } from "./apiError";
import { RequestDeleteAccountJason } from "@/types/auth";
import {
  RequestUpdateClientJason,
  ResponseClientDetailJason,
} from "@/types/client";
import {
  RequestUpdateWorkerJason,
  ResponseWorkerDetailJason,
} from "@/types/worker";

export async function getClientProfile(
  id: string
): Promise<ResponseClientDetailJason> {
  try {
    const { data } = await api.get<ResponseClientDetailJason>(
      `/api/clients/${id}`
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateClientProfile(
  id: string,
  payload: RequestUpdateClientJason
): Promise<ResponseClientDetailJason> {
  try {
    const { data } = await api.put<ResponseClientDetailJason>(
      `/api/clients/${id}`,
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getWorkerProfile(
  id: string
): Promise<ResponseWorkerDetailJason> {
  try {
    const { data } = await api.get<ResponseWorkerDetailJason>(
      `/api/workers/${id}`
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateWorkerProfile(
  id: string,
  payload: RequestUpdateWorkerJason
): Promise<ResponseWorkerDetailJason> {
  try {
    const { data } = await api.put<ResponseWorkerDetailJason>(
      `/api/workers/${id}`,
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteClientAccount(
  payload: RequestDeleteAccountJason
): Promise<void> {
  try {
    await api.delete("/api/clients/me", { data: payload });
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteWorkerAccount(
  payload: RequestDeleteAccountJason
): Promise<void> {
  try {
    await api.delete("/api/workers/me", { data: payload });
  } catch (error) {
    throw normalizeError(error);
  }
}