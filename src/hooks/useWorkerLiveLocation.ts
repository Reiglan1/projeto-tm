import { useEffect, useRef, useState } from "react";
import { getWorkerLiveLocation } from "@/services/serviceOrder";
import { ResponseWorkerLiveLocationJason } from "@/types/serviceOrder";
import {
  ensureLocationConnectionStarted,
  joinTracking,
  leaveTracking,
  onArrivalStatusChanged,
  onLocationUpdated,
} from "@/services/locationHub";

const POLL_INTERVAL_MS = 10000;

/**
 * Acompanha a localização ao vivo do profissional em um chamado.
 *
 * Caminho principal: conecta no hub SignalR de localização, entra no grupo
 * do chamado (`JoinTracking`) e escuta `LocationUpdated`/`ArrivalStatusChanged`
 * pra atualizar a posição em tempo real.
 *
 * Caminho secundário (fallback REST, conforme documentação do back-end):
 * consulta `GET /api/service-orders/{id}/worker-location` a cada 10s — cobre
 * o intervalo antes do primeiro evento chegar e casos em que o hub cai.
 */
export function useWorkerLiveLocation(serviceOrderId?: string, enabled = true) {
  const [location, setLocation] = useState<ResponseWorkerLiveLocationJason | null>(null);
  const [arrivedAt, setArrivedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fallback REST (poll)
  useEffect(() => {
    if (!serviceOrderId || !enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    function fetchLocation() {
      getWorkerLiveLocation(serviceOrderId!)
        .then((data) => {
          if (cancelled) return;
          console.info("[useWorkerLiveLocation] resposta do fallback REST:", data);
          setLocation((current) => current ?? data); // não sobrescreve dado mais fresco vindo do SignalR
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("[useWorkerLiveLocation] falha ao buscar localização:", err);
          setError("stale");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [serviceOrderId, enabled]);

  // Caminho principal: SignalR
  useEffect(() => {
    if (!serviceOrderId || !enabled) return;

    let cancelled = false;

    ensureLocationConnectionStarted()
      .then(() => {
        if (cancelled) return;
        return joinTracking(serviceOrderId);
      })
      .catch((err) => {
        console.warn("[useWorkerLiveLocation] falha ao conectar/entrar no rastreamento:", err);
      });

    const offLocation = onLocationUpdated((payload) => {
      if (cancelled || payload.serviceOrderId !== serviceOrderId) return;
      console.info("[useWorkerLiveLocation] LocationUpdated recebido:", payload);
      setLocation({
        available: true,
        latitude: payload.latitude,
        longitude: payload.longitude,
        lastLocationAt: payload.lastLocationAt,
      });
      setError(null);
      setLoading(false);
    });

    const offArrival = onArrivalStatusChanged((payload) => {
      if (cancelled || payload.serviceOrderId !== serviceOrderId) return;
      console.info("[useWorkerLiveLocation] ArrivalStatusChanged recebido:", payload);
      setArrivedAt(payload.arrivedAt);
    });

    return () => {
      cancelled = true;
      offLocation();
      offArrival();
      leaveTracking(serviceOrderId).catch(() => {
        // Best-effort: se o hub já caiu, não tem grupo pra sair mesmo.
      });
    };
  }, [serviceOrderId, enabled]);

  return { location, arrivedAt, loading, error };
}
