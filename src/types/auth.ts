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
  pixKey?: string;
  pixKeyType?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RequestWorkerJason {
  name: string;
  email: string;
  personType?: string; // "Fisica" | "Juridica" (novo no back-end; PF continua sendo o fluxo padrão)
  cpf: string;
  cnpj?: string;
  phone: string;
  categoryIds: string[];
  description?: string;
  pixKey?: string;
  pixKeyType?: string;
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
  message?: string;
}

export interface ResponseWorkerJason {
  id: string;
  name: string;
  email: string;
  token: string;
  refreshToken: string;
  message?: string;
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

export interface RequestDeleteAccountJason {
  password: string;
}

export interface RequestVerifyEmailJason {
  email: string;
  userType: UserRole;
  code: string;
}

export interface RequestResendVerificationJason {
  email: string;
  userType: UserRole;
}

export interface RequestForgotPasswordJason {
  email: string;
  userType: UserRole;
}

export interface RequestResetPasswordJason {
  token: string;
  newPassword: string;
  confirmPassword: string;
}