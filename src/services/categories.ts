import api from "./api";
import { normalizeError } from "./apiError";
import { ResponseAllCategoriesJason } from "@/types/category";

export async function getCategories(
  page = 1,
  pageSize = 50
): Promise<ResponseAllCategoriesJason> {
  try {
    const { data } = await api.get<ResponseAllCategoriesJason>(
      "/api/categories",
      { params: { page, pageSize } }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}