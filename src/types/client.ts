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

// Endpoint público/seguro (GET /api/clients/{id}/profile) — usado quando um
// worker vê o perfil de um cliente. Diferente do ResponseClientDetailJason,
// não expõe e-mail, telefone, status nem chave Pix.
export interface ResponseClientProfileJason {
  id: string;
  name: string | null;
  memberSince: string;
  averageRating: number;
  reviewCount: number;
}
