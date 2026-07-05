// Tipos baseados no OpenAPI da ProductClientHub.API

export type UserRole = "client" | "worker";

// ---- Requests ----

export interface RequestLoginJason {
  email: string;
  password: string;
}

export interface RequestClientJason {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RequestWorkerJason {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// ---- Responses ----

export interface ResponseClientJason {
  id: string;
  name: string;
  email: string;
  token: string;
  refreshToken: string;
}

export interface ResponseWorkerJason {
  id: string;
  name: string;
  email: string;
  token: string;
  refreshToken: string;
}

export type ResponseAuthJason = ResponseClientJason | ResponseWorkerJason;

export interface ResponseErrorMessagesJason {
  errors: string[];
}

// Usuário autenticado guardado no contexto da aplicação
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
