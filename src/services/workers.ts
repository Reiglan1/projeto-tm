import api from "./api";
import { normalizeError } from "./apiError";
import {
  RequestLocationConsentJason,
  RequestWorkerLocationJason,
  ResponseAllWorkersJason,
  ResponseLocationConsentJason,
  ResponseWorkerDetailJason,
} from "@/types/worker";

export interface GetWorkersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  // Busca por proximidade: os 3 juntos habilitam o filtro por raio no back-end
  // e passam a preencher `distanceKm` em cada profissional retornado.
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export async function getWorkers(
  params: GetWorkersParams = {}
): Promise<ResponseAllWorkersJason> {
  try {
    const { data } = await api.get<ResponseAllWorkersJason>("/api/workers", {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 9,
        search: params.search || undefined,
        sortBy: params.sortBy || undefined,
        lat: params.lat,
        lng: params.lng,
        radiusKm: params.radiusKm,
      },
    });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getWorkerById(id: string): Promise<ResponseWorkerDetailJason> {
  try {
    const { data } = await api.get<ResponseWorkerDetailJason>(`/api/workers/${id}`);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

// ---- Compartilhamento de localização (profissional) ----
// Fluxo: o profissional consente (scope) antes do app começar a enviar
// atualizações de latitude/longitude periodicamente.

export async function setWorkerLocationConsent(
  payload: RequestLocationConsentJason
): Promise<ResponseLocationConsentJason> {
  try {
    const { data } = await api.post<ResponseLocationConsentJason>(
      "/api/workers/me/location/consent",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function revokeWorkerLocationConsent(): Promise<void> {
  try {
    await api.delete("/api/workers/me/location/consent");
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function sendWorkerLocation(
  payload: RequestWorkerLocationJason
): Promise<void> {
  try {
    await api.post("/api/workers/me/location", payload);
  } catch (error) {
    throw normalizeError(error);
  }
}
