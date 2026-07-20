// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Chatbot)

export interface ChatbotTurnJason {
  role: string; // "user" | "assistant" (definido pelo back-end)
  content: string;
}

export interface RequestChatbotJason {
  message: string;
  history?: ChatbotTurnJason[];
}

export interface ResponseChatbotJason {
  reply: string;
}
