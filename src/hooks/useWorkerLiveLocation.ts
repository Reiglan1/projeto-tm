import { useEffect, useRef, useState } from "react";
import { getWorkerLiveLocation } from "@/services/serviceOrder";
import { ResponseWorkerLiveLocationJason } from "@/types/serviceOrder";

const POLL_INTERVAL_MS = 10000;

/**
 * Busca a localização ao vivo do profissional em um chamado e mantém
 * atualizada em intervalos regulares enquanto `enabled` for true.
 */
export function useWorkerLiveLocation(serviceOrderId?: string, enabled = true) {
  const [location, setLocation] = useState<ResponseWorkerLiveLocationJason | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          setLocation(data);
          setError(null);
        })
        .catch(() => {
          if (cancelled) return;
          // Falha silenciosa: mantemos a última posição conhecida na tela
          // em vez de substituir o mapa por uma mensagem de erro a cada poll.
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

  return { location, loading, error };
}
