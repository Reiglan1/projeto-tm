import { useEffect, useRef, useState } from "react";
import {
  setWorkerLocationConsent,
  revokeWorkerLocationConsent,
  sendWorkerLocation,
} from "@/services/workers";
import { ensureLocationConnectionStarted, sendLocationUpdate } from "@/services/locationHub";

const MIN_REST_SEND_INTERVAL_MS = 15000;

export type ShareLocationStatus =
  | "idle"
  | "requesting"
  | "sharing"
  | "denied"
  | "unavailable"
  | "unsupported"
  | "error";

function describeGeoError(code: number): ShareLocationStatus {
  // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
  if (code === 1) return "denied";
  if (code === 2) return "unavailable";
  return "error";
}

/**
 * Enquanto `active` for true, observa a posição do navegador e envia
 * atualizações pro back-end de duas formas, conforme especificado pelo
 * back-end:
 *  1. Via SignalR (`UpdateLocation`), em toda atualização de posição —
 *     é o caminho principal de tempo real.
 *  2. Via `POST /api/workers/me/location`, limitado a 1 a cada
 *     MIN_REST_SEND_INTERVAL_MS — mantém a posição sincronizada em segundo
 *     plano (é o que a busca por proximidade e o fallback REST usam).
 *
 * O pedido de permissão de localização ao navegador é disparado
 * imediatamente, sem esperar nenhuma chamada de API nossa terminar primeiro
 * — o registro de consentimento roda em paralelo, best-effort.
 *
 * Em desktops/VMs sem GPS, a primeira tentativa (alta precisão) pode falhar
 * com POSITION_UNAVAILABLE — nesse caso tentamos de novo com baixa precisão
 * (geralmente localização por IP/Wi-Fi, mais tolerante nesses ambientes).
 */
export function useShareLocation(serviceOrderId: string | undefined, active: boolean) {
  const [status, setStatus] = useState<ShareLocationStatus>("idle");
  const watchIdRef = useRef<number | null>(null);
  const lastRestSendAtRef = useRef(0);
  const fellBackRef = useRef(false);

  useEffect(() => {
    if (!active || !serviceOrderId) {
      setStatus("idle");
      return;
    }

    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    fellBackRef.current = false;
    setStatus("requesting");
    const orderId = serviceOrderId;

    // Best-effort: registra o consentimento no back-end, mas não bloqueia
    // (nem é bloqueado por) o pedido de localização ao navegador.
    // "WhileInUse" == compartilha só enquanto o app está em uso (valor
    // esperado pelo back-end; ver documentação do endpoint de consentimento).
    setWorkerLocationConsent({ scope: "WhileInUse" }).catch((err) => {
      console.warn("[useShareLocation] falha ao registrar consentimento:", err);
    });

    ensureLocationConnectionStarted().catch((err) => {
      console.warn("[useShareLocation] falha ao conectar no hub de localização:", err);
    });

    function startWatch(highAccuracy: boolean) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (cancelled) return;
          setStatus("sharing");

          const { latitude, longitude } = position.coords;

          // Caminho principal: SignalR, em toda atualização de posição.
          sendLocationUpdate(orderId, latitude, longitude);

          // Caminho secundário: REST, limitado a 1x a cada 15s, mantém a
          // última posição sincronizada mesmo se o hub cair.
          const now = Date.now();
          if (now - lastRestSendAtRef.current < MIN_REST_SEND_INTERVAL_MS) return;
          lastRestSendAtRef.current = now;

          sendWorkerLocation({ latitude, longitude })
            .then(() => {
              console.info("[useShareLocation] posição enviada via REST com sucesso", {
                lat: latitude,
                lng: longitude,
                at: new Date().toISOString(),
              });
            })
            .catch((err) => {
              console.error("[useShareLocation] falha ao enviar localização via REST:", err);
            });
        },
        (geoError) => {
          if (cancelled) return;

          console.warn(
            `[useShareLocation] geolocation error (code ${geoError.code}): ${geoError.message}`
          );

          // Alta precisão falhou (comum sem GPS) — tenta de novo mais tolerante
          // antes de desistir e mostrar erro pro usuário.
          if (highAccuracy && !fellBackRef.current && geoError.code !== geoError.PERMISSION_DENIED) {
            fellBackRef.current = true;
            startWatch(false);
            return;
          }

          setStatus(describeGeoError(geoError.code));
        },
        {
          enableHighAccuracy: highAccuracy,
          maximumAge: highAccuracy ? 10000 : 60000,
          timeout: highAccuracy ? 12000 : 20000,
        }
      );
    }

    startWatch(true);

    return () => {
      cancelled = true;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      revokeWorkerLocationConsent().catch(() => {
        // Melhor esforço: se a revogação falhar, o consentimento expira
        // naturalmente do lado do back-end.
      });
    };
  }, [serviceOrderId, active]);

  return status;
}
