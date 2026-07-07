import api from "./api";
import { normalizeError } from "./apiError";
import { ResponseAllCategoriesJason } from "@/types/category";

export interface GetCategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getCategories(
  params: GetCategoriesParams = {}
): Promise<ResponseAllCategoriesJason> {
  try {
    const { data } = await api.get<ResponseAllCategoriesJason>(
      "/api/categories",
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 50,
          search: params.search || undefined,
        },
      }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}