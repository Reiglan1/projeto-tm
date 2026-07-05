// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Workers)

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
  available24Hours: boolean;
}