import * as signalR from "@microsoft/signalr";
import {
  LocationUpdatedPayload,
  ArrivalStatusChangedPayload,
} from "@/types/locationTracking";

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
    .withUrl(`${baseUrl}/hubs/location`, {
      accessTokenFactory: getToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export function getLocationConnection(): signalR.HubConnection {
  if (!connection) {
    connection = buildConnection();
  }
  return connection;
}

export async function ensureLocationConnectionStarted(): Promise<void> {
  const conn = getLocationConnection();

  if (conn.state === signalR.HubConnectionState.Connected) return;

  if (!startPromise) {
    startPromise = conn.start().catch((error) => {
      startPromise = null;
      throw error;
    });
  }

  return startPromise;
}

export async function stopLocationConnection(): Promise<void> {
  if (connection) {
    await connection.stop();
    connection = null;
    startPromise = null;
  }
}

// ---- Cliente: acompanhar um chamado ----

export async function joinTracking(serviceOrderId: string): Promise<void> {
  await ensureLocationConnectionStarted();
  await getLocationConnection().invoke("JoinTracking", serviceOrderId);
}

export async function leaveTracking(serviceOrderId: string): Promise<void> {
  const conn = getLocationConnection();
  if (conn.state !== signalR.HubConnectionState.Connected) return;
  try {
    await conn.invoke("LeaveTracking", serviceOrderId);
  } catch {
    // Não crítico: se o hub já caiu, não tem grupo pra sair mesmo.
  }
}

export function onLocationUpdated(
  handler: (payload: LocationUpdatedPayload) => void
): () => void {
  const conn = getLocationConnection();
  conn.on("LocationUpdated", handler);
  return () => conn.off("LocationUpdated", handler);
}

export function onArrivalStatusChanged(
  handler: (payload: ArrivalStatusChangedPayload) => void
): () => void {
  const conn = getLocationConnection();
  conn.on("ArrivalStatusChanged", handler);
  return () => conn.off("ArrivalStatusChanged", handler);
}

// ---- Profissional: enviar posição ----
// Chamado apenas pelo profissional responsável pela OS (o back-end valida isso).

export async function sendLocationUpdate(
  serviceOrderId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  const conn = getLocationConnection();
  if (conn.state !== signalR.HubConnectionState.Connected) return;
  try {
    await conn.invoke("UpdateLocation", serviceOrderId, latitude, longitude);
  } catch (error) {
    console.warn("[locationHub] falha ao enviar UpdateLocation via SignalR:", error);
  }
}
