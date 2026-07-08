import api from "./api";
import { normalizeError } from "./apiError";
import { ResponseAllClientsJason } from "@/types/client";

export interface GetClientsParams {
  page?: number;
  pageSize?: number;
}

// Ao contrário de /api/workers, esse endpoint não tem parâmetro de busca
// (search) — só paginação.
export async function getClients(
  params: GetClientsParams = {}
): Promise<ResponseAllClientsJason> {
  try {
    const { data } = await api.get<ResponseAllClientsJason>("/api/clients", {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 9,
      },
    });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}