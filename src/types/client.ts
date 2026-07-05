// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Clients)

export interface ResponseClientDetailJason {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface RequestUpdateClientJason {
  name: string;
  phone: string;
}