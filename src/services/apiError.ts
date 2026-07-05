import { AxiosError } from "axios";
import { ResponseErrorMessagesJason } from "@/types/auth";

// Erro normalizado, sempre com uma lista de mensagens pra exibir pro usuário
export class ApiError extends Error {
  messages: string[];

  constructor(messages: string[]) {
    super(messages[0] ?? "Ocorreu um erro inesperado");
    this.messages = messages;
  }
}

export function normalizeError(error: unknown): ApiError {
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