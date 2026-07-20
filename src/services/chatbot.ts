import api from "./api";
import { normalizeError } from "./apiError";
import { RequestChatbotJason, ResponseChatbotJason } from "@/types/chatbot";

export async function sendChatbotMessage(
  payload: RequestChatbotJason
): Promise<ResponseChatbotJason> {
  try {
    const { data } = await api.post<ResponseChatbotJason>(
      "/api/chatbot/message",
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}
