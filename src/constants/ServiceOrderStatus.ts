// Valores de status definidos por nós (front) na ausência de um enum
// documentado pela API. Repassar essa lista pro backend confirmar/implementar
// exatamente esses nomes.
export const SERVICE_ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DISPUTED: "DISPUTED",
} as const;