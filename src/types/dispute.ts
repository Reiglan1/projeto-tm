// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Disputes)
// A API não documenta um schema de resposta pra esses endpoints (só "200 OK"
// sem body), então as funções do service tratam como sucesso sem retorno.

export interface RequestOpenDisputeJason {
  reason: string;
}