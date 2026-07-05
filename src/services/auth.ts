import api from "./api";
import { ApiError, normalizeError } from "./apiError";
import {
  RequestClientJason,
  RequestLoginJason,
  RequestWorkerJason,
  ResponseClientJason,
  ResponseWorkerJason,
} from "@/types/auth";

export { ApiError };

export async function loginClient(
  payload: RequestLoginJason
): Promise<ResponseClientJason> {
  try {
    const { data } = await api.post<ResponseClientJason>(
      "/api/clients/login",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function loginWorker(
  payload: RequestLoginJason
): Promise<ResponseWorkerJason> {
  try {
    const { data } = await api.post<ResponseWorkerJason>(
      "/api/workers/login",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function registerClient(
  payload: RequestClientJason
): Promise<ResponseClientJason> {
  try {
    const { data } = await api.post<ResponseClientJason>(
      "/api/clients/register",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function registerWorker(
  payload: RequestWorkerJason
): Promise<ResponseWorkerJason> {
  try {
    const { data } = await api.post<ResponseWorkerJason>(
      "/api/workers/register",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}