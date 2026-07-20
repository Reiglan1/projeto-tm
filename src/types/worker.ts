// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Workers)

export interface ResponseWorkerProfessionJason {
  categoryId: string;
  name: string;
}

export interface ResponseWorkerDetailJason {
  id: string;
  name: string;
  email: string;
  personType: string | null;
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
  // Só vem preenchido quando a busca (GET /api/workers) inclui lat/lng.
  distanceKm: number | null;
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

export interface RequestLocationConsentJason {
  scope: string;
}

export interface ResponseLocationConsentJason {
  scope: string | null;
  acceptedAt: string | null;
}

export interface RequestWorkerLocationJason {
  latitude: number;
  longitude: number;
}