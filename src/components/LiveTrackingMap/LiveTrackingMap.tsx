import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface LatLng {
  lat: number;
  lng: number;
}

interface LiveTrackingMapProps {
  workerPosition: LatLng | null;
  destinationPosition?: LatLng | null;
  workerLabel?: string;
  destinationLabel?: string;
  className?: string;
}

// Marcadores customizados no estilo da marca (preto + amarelo), em vez dos
// pinos padrão do Mapbox.
function createWorkerMarkerEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "34px";
  el.style.height = "34px";
  el.style.borderRadius = "9999px";
  el.style.background = "#0A0A0A";
  el.style.border = "3px solid #F5C518";
  el.style.boxShadow = "0 2px 8px rgba(0,0,0,.35)";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  const dot = document.createElement("div");
  dot.style.width = "8px";
  dot.style.height = "8px";
  dot.style.borderRadius = "9999px";
  dot.style.background = "#F5C518";
  el.appendChild(dot);
  return el;
}

function createDestinationMarkerEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "16px";
  el.style.height = "16px";
  el.style.borderRadius = "9999px 9999px 9999px 0";
  el.style.background = "#0A0A0A";
  el.style.transform = "rotate(45deg)";
  el.style.border = "2px solid #FAF7F1";
  el.style.boxShadow = "0 2px 6px rgba(0,0,0,.35)";
  return el;
}

export default function LiveTrackingMap({
  workerPosition,
  destinationPosition,
  workerLabel = "Profissional",
  destinationLabel = "Destino",
  className = "",
}: LiveTrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const workerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Cria o mapa uma única vez.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter = workerPosition ?? destinationPosition ?? { lat: -14.235, lng: -51.9253 };

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      // Mapbox usa [longitude, latitude], ao contrário de Leaflet/Google.
      center: [initialCenter.lng, initialCenter.lat],
      zoom: 14,
      scrollZoom: false,
      attributionControl: true,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      workerMarkerRef.current = null;
      destinationMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza/cria o marcador do profissional.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!workerPosition) {
      workerMarkerRef.current?.remove();
      workerMarkerRef.current = null;
      return;
    }

    if (!workerMarkerRef.current) {
      workerMarkerRef.current = new mapboxgl.Marker({ element: createWorkerMarkerEl() })
        .setLngLat([workerPosition.lng, workerPosition.lat])
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setText(workerLabel))
        .addTo(map);
    } else {
      workerMarkerRef.current.setLngLat([workerPosition.lng, workerPosition.lat]);
    }
  }, [workerPosition, workerLabel]);

  // Atualiza/cria o marcador do destino.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!destinationPosition) {
      destinationMarkerRef.current?.remove();
      destinationMarkerRef.current = null;
      return;
    }

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new mapboxgl.Marker({ element: createDestinationMarkerEl() })
        .setLngLat([destinationPosition.lng, destinationPosition.lat])
        .setPopup(new mapboxgl.Popup({ offset: 14 }).setText(destinationLabel))
        .addTo(map);
    } else {
      destinationMarkerRef.current.setLngLat([destinationPosition.lng, destinationPosition.lat]);
    }
  }, [destinationPosition, destinationLabel]);

  // Enquadra os dois pontos (ou centraliza no único disponível) sempre que
  // alguma posição muda.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const points = [workerPosition, destinationPosition].filter(
      (p): p is LatLng => Boolean(p)
    );
    if (points.length === 0) return;

    if (points.length === 1) {
      map.easeTo({ center: [points[0].lng, points[0].lat], zoom: 15, duration: 600 });
      return;
    }

    const bounds = points.reduce(
      (acc, p) => acc.extend([p.lng, p.lat]),
      new mapboxgl.LngLatBounds([points[0].lng, points[0].lat], [points[0].lng, points[0].lat])
    );
    map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 600 });
  }, [workerPosition, destinationPosition]);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
