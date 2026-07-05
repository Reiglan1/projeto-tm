import { AxiosError } from "axios";
import api from "./api";
import {
  RequestClientJason,
  RequestLoginJason,
  RequestWorkerJason,
  ResponseClientJason,
  ResponseErrorMessagesJason,
  ResponseWorkerJason,
} from "@/types/auth";

// Erro normalizado, sempre com uma lista de mensagens pra exibir pro usuário
export class ApiError extends Error {
  messages: string[];

  constructor(messages: string[]) {
    super(messages[0] ?? "Ocorreu um erro inesperado");
    this.messages = messages;
  }
}

function normalizeError(error: unknown): ApiError {
  const axiosError = error as AxiosError<ResponseErrorMessagesJason>;

  const messages = axiosError?.response?.data?.errors;
  if (messages && messages.length > 0) {
    return new ApiError(messages);
  }

  if (axiosError?.message) {
    return new ApiError([axiosError.message]);
  }

  return new ApiError(["Não foi possível se conectar ao servidor"]);
}

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
