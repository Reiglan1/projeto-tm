// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Categories)

export interface ResponseCategoryJason {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface ResponseAllCategoriesJason {
  items: ResponseCategoryJason[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}