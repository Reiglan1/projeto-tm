import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Ícones customizados (evita o bug clássico do Leaflet com bundlers, que
// quebra o caminho dos PNGs padrão) — usamos divIcon com HTML/CSS no
// estilo visual do Three Minds em vez dos pinos genéricos do Leaflet.
const workerIcon = L.divIcon({
  className: "",
  html: `<div style="width:34px;height:34px;border-radius:9999px;background:#0A0A0A;border:3px solid #F5C518;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;">
    <div style="width:8px;height:8px;border-radius:9999px;background:#F5C518;"></div>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px 9999px 9999px 0;background:#0A0A0A;transform:rotate(45deg);border:2px solid #FAF7F1;box-shadow:0 2px 6px rgba(0,0,0,.35);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 14],
});

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

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
  }, [map, points]);

  return null;
}

export default function LiveTrackingMap({
  workerPosition,
  destinationPosition,
  workerLabel = "Profissional",
  destinationLabel = "Destino",
  className = "",
}: LiveTrackingMapProps) {
  const points = [workerPosition, destinationPosition].filter(
    (p): p is LatLng => Boolean(p)
  );

  const center = points[0] ?? { lat: -14.235, lng: -51.9253 }; // fallback: centro do Brasil

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      scrollWheelZoom={false}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {workerPosition && (
        <Marker position={[workerPosition.lat, workerPosition.lng]} icon={workerIcon}>
          <Popup>{workerLabel}</Popup>
        </Marker>
      )}

      {destinationPosition && (
        <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={destinationIcon}>
          <Popup>{destinationLabel}</Popup>
        </Marker>
      )}

      <FitBounds points={points} />
    </MapContainer>
  );
}
