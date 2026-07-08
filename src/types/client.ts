// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Clients)

export interface ResponseClientDetailJason {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  emailVerified: boolean;
  pixKey: string | null;
  pixKeyType: string | null;
  createdAt: string;
}

export interface RequestUpdateClientJason {
  name: string;
  phone: string;
  pixKey?: string;
  pixKeyType?: string;
}

export interface ResponseAllClientsJason {
  items: ResponseClientDetailJason[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}