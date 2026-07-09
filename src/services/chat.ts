import api from "./api";
import { normalizeError } from "./apiError";
import {
  RequestSendMessageJason,
  ResponseChatMessageJason,
  ResponseChatMessagesJason,
  ResponseReceiptJason,
  ResponseUnreadCountsJason,
} from "@/types/chat";

export async function sendTextMessage(
  serviceOrderId: string,
  payload: RequestSendMessageJason
): Promise<ResponseChatMessageJason> {
  try {
    const { data } = await api.post<ResponseChatMessageJason>(
      `/api/service-orders/${serviceOrderId}/messages`,
      payload
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export interface GetMessagesParams {
  page?: number;
  pageSize?: number;
}

export async function getMessages(
  serviceOrderId: string,
  params: GetMessagesParams = {}
): Promise<ResponseChatMessagesJason> {
  try {
    const { data } = await api.get<ResponseChatMessagesJason>(
      `/api/service-orders/${serviceOrderId}/messages`,
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function markMessagesRead(
  serviceOrderId: string
): Promise<ResponseReceiptJason> {
  try {
    const { data } = await api.post<ResponseReceiptJason>(
      `/api/service-orders/${serviceOrderId}/messages/read`
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function markMessagesDelivered(
  serviceOrderId: string
): Promise<ResponseReceiptJason> {
  try {
    const { data } = await api.post<ResponseReceiptJason>(
      `/api/service-orders/${serviceOrderId}/messages/delivered`
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function sendMediaMessage(
  serviceOrderId: string,
  file: File,
  caption?: string
): Promise<ResponseChatMessageJason> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);

    const { data } = await api.post<ResponseChatMessageJason>(
      `/api/service-orders/${serviceOrderId}/media`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getUnreadCounts(): Promise<ResponseUnreadCountsJason> {
  try {
    const { data } = await api.get<ResponseUnreadCountsJason>("/api/chat/unread");
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}