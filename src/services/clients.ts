import api from "./api";
import { normalizeError } from "./apiError";
import { ResponseAllClientsJason, ResponseClientProfileJason } from "@/types/client";

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

// Endpoint público/seguro pro perfil de um cliente (usado quando um worker
// visualiza o perfil). Não expõe e-mail, telefone, status nem chave Pix —
// diferente de getClientProfile em services/profile.ts, que é pro próprio
// cliente ver/editar os dados completos e agora retorna 403 pra terceiros.
export async function getClientPublicProfile(
  id: string
): Promise<ResponseClientProfileJason> {
  try {
    const { data } = await api.get<ResponseClientProfileJason>(
      `/api/clients/${id}/profile`
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}