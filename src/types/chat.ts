// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Chat) + no que
// o backend confirmou por fora sobre o hub SignalR (/hubs/chat).

export interface RequestSendMessageJason {
  content: string;
}

export interface ResponseChatMessageJason {
  id: string;
  serviceOrderId: string;
  senderId: string;
  senderRole: string | null; // "Client" | "Worker"
  type: string | null; // provável: "text" | "image" | "video" | "audio" | "file"
  content: string | null;
  mediaUrl: string | null;
  mediaContentType: string | null;
  mediaFileName: string | null;
  mediaSizeBytes: number | null;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface ResponseChatMessagesJason {
  items: ResponseChatMessageJason[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ResponseReceiptJason {
  serviceOrderId: string;
  affected: number;
  at: string;
}

export interface ResponseUnreadPerOrderJason {
  serviceOrderId: string;
  count: number;
}

export interface ResponseUnreadCountsJason {
  total: number;
  perOrder: ResponseUnreadPerOrderJason[] | null;
}

// Payload do evento TypingChanged, confirmado com o backend (não documentado
// no Swagger porque SignalR não é REST).
export interface TypingChangedPayload {
  serviceOrderId: string;
  senderRole: string; // "Client" | "Worker"
  isTyping: boolean;
}

export interface DeliveredOrReadPayload {
  serviceOrderId: string;
  at: string;
}

// Formato de erro do hub, confirmado com o backend: toda HubException vem
// com esse JSON como texto da mensagem de erro.
export interface HubErrorPayload {
  message: string;
  kind: "forbidden" | "notFound" | "validation" | "unauthorized" | "unknown" | string;
  isBug: boolean;
}