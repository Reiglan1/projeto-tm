// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Workers)

export interface ResponseWorkerProfessionJason {
  categoryId: string;
  name: string;
}

export interface ResponseWorkerDetailJason {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  verificationStatus: string;
  emailVerified: boolean;
  available24Hours: boolean;
  profilePhotoUrl: string | null;
  description: string | null;
  pixKey: string | null;
  pixKeyType: string | null;
  professions: ResponseWorkerProfessionJason[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ResponseAllWorkersJason {
  items: ResponseWorkerDetailJason[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RequestUpdateWorkerJason {
  name: string;
  phone: string;
  categoryIds: string[];
  description?: string;
  available24Hours: boolean;
  pixKey?: string;
  pixKeyType?: string;
}