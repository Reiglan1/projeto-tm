import api from "./api";
import { normalizeError } from "./apiError";
import { ResponseAllWorkersJason } from "@/types/worker";

export async function getWorkers(
  page = 1,
  pageSize = 9
): Promise<ResponseAllWorkersJason> {
  try {
    const { data } = await api.get<ResponseAllWorkersJason>("/api/workers", {
      params: { page, pageSize },
    });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}