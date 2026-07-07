import api from "./api";
import { normalizeError } from "./apiError";
import { ResponseAllWorkersJason } from "@/types/worker";

export interface GetWorkersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
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
      },
    });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}