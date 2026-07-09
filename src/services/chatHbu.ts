import * as signalR from "@microsoft/signalr";
import {
  ResponseChatMessageJason,
  TypingChangedPayload,
  DeliveredOrReadPayload,
  HubErrorPayload,
} from "@/types/chat";

let connection: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;

function getToken(): string {
  return (
    (typeof window !== "undefined" && window.localStorage?.getItem("token")) || ""
  );
}

function buildConnection(): signalR.HubConnection {
  const baseUrl = import.meta.env.VITE_API as string;
  return new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/chat`, {
      accessTokenFactory: getToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export function getChatConnection(): signalR.HubConnection {
  if (!connection) {
    connection = buildConnection();
  }
  return connection;
}

export async function ensureChatConnectionStarted(): Promise<void> {
  const conn = getChatConnection();

  if (conn.state === signalR.HubConnectionState.Connected) return;

  if (!startPromise) {
    startPromise = conn.start().catch((error) => {
      startPromise = null;
      throw error;
    });
  }

  return startPromise;
}

export async function stopChatConnection(): Promise<void> {
  if (connection) {
    await connection.stop();
    connection = null;
    startPromise = null;
  }
}

export async function joinConversation(serviceOrderId: string): Promise<void> {
  await ensureChatConnectionStarted();
  await getChatConnection().invoke("JoinConversation", serviceOrderId);
}

// "Digitando" não é crítico: se falhar (rede instável, hub caiu), só ignora
// em silêncio em vez de quebrar a experiência do usuário.
export async function sendTyping(
  serviceOrderId: string,
  isTyping: boolean
): Promise<void> {
  const conn = getChatConnection();
  if (conn.state !== signalR.HubConnectionState.Connected) return;

  try {
    await conn.invoke("Typing", serviceOrderId, isTyping);
  } catch {
    // silencioso, de propósito
  }
}

// Toda HubException do backend vem com esse JSON como texto da mensagem de
// erro. O SignalR às vezes prefixa com "Error: " ou outros detalhes, então
// extraímos só o trecho entre chaves.
export function parseHubError(error: unknown): HubErrorPayload {
  const raw = (error as Error)?.message ?? "";
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    try {
      const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      if (parsed && typeof parsed.message === "string") {
        return {
          message: parsed.message,
          kind: parsed.kind ?? "unknown",
          isBug: Boolean(parsed.isBug),
        };
      }
    } catch {
      // cai no fallback abaixo
    }
  }

  return {
    message: "Não foi possível completar a ação.",
    kind: "unknown",
    isBug: true,
  };
}

export function onReceiveMessage(
  handler: (message: ResponseChatMessageJason) => void
): () => void {
  const conn = getChatConnection();
  conn.on("ReceiveMessage", handler);
  return () => conn.off("ReceiveMessage", handler);
}

export function onTypingChanged(
  handler: (payload: TypingChangedPayload) => void
): () => void {
  const conn = getChatConnection();
  conn.on("TypingChanged", handler);
  return () => conn.off("TypingChanged", handler);
}

export function onMessagesDelivered(
  handler: (payload: DeliveredOrReadPayload) => void
): () => void {
  const conn = getChatConnection();
  conn.on("MessagesDelivered", handler);
  return () => conn.off("MessagesDelivered", handler);
}

export function onMessagesRead(
  handler: (payload: DeliveredOrReadPayload) => void
): () => void {
  const conn = getChatConnection();
  conn.on("MessagesRead", handler);
  return () => conn.off("MessagesRead", handler);
}