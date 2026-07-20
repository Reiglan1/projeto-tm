// Tipos baseados na documentação que o back-end passou sobre o hub SignalR
// de rastreamento (/hubs/location).

export interface LocationUpdatedPayload {
  serviceOrderId: string;
  latitude: number;
  longitude: number;
  lastLocationAt: string;
}

export interface ArrivalStatusChangedPayload {
  serviceOrderId: string;
  arrivedAt: string;
}
