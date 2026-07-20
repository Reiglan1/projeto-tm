import { useEffect, useRef, useState } from "react";
import {
  setWorkerLocationConsent,
  revokeWorkerLocationConsent,
  sendWorkerLocation,
} from "@/services/workers";

const MIN_SEND_INTERVAL_MS = 15000;

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
 * Enquanto `active` for true, pede consentimento de localização ao
 * profissional, observa a posição do navegador e envia atualizações pro
 * back-end (limitadas a 1 a cada MIN_SEND_INTERVAL_MS pra não spammar).
 * Ao desativar (ou desmontar), revoga o consentimento e para de observar.
 *
 * Em desktops/VMs sem GPS, a primeira tentativa (alta precisão) pode falhar
 * com POSITION_UNAVAILABLE — nesse caso tentamos de novo com baixa precisão
 * (geralmente localização por IP/Wi-Fi, mais tolerante nesses ambientes).
 */
export function useShareLocation(active: boolean) {
  const [status, setStatus] = useState<ShareLocationStatus>("idle");
  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef(0);
  const fellBackRef = useRef(false);

  useEffect(() => {
    if (!active) {
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

    function startWatch(highAccuracy: boolean) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (cancelled) return;
          setStatus("sharing");

          const now = Date.now();
          if (now - lastSentAtRef.current < MIN_SEND_INTERVAL_MS) return;
          lastSentAtRef.current = now;

          sendWorkerLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }).catch(() => {
            // Uma falha isolada de envio não é crítica; a próxima
            // atualização de posição tenta de novo.
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

    setWorkerLocationConsent({ scope: "service_order" })
      .then(() => {
        if (cancelled) return;
        startWatch(true);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

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
  }, [active]);

  return status;
}