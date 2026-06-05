import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { MapPoint } from "@/services/mapData";
import { getPointLayerColor } from "@/utils/mapLayers";

type Props = {
  map: mapboxgl.Map | null;
  points: MapPoint[];
  visible: boolean;
  onSelect: (point: MapPoint) => void;
};

export function MapboxPinsLayer({ map, points, visible, onSelect }: Props) {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    markersRef.current.forEach(safeRemoveMarker);
    markersRef.current = [];

    if (!map || !visible) return;

    const markers = points.map((point) => {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.className =
        "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-200";
      markerElement.style.background = getPointLayerColor(point.type);
      markerElement.title = `${point.title} - ${point.neighborhood || point.city}`;

      const inner = document.createElement("span");
      inner.className = "block h-2.5 w-2.5 rounded-full bg-white";
      markerElement.appendChild(inner);
      markerElement.addEventListener("click", () => onSelect(point));

      return new mapboxgl.Marker({ element: markerElement, anchor: "center" })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map);
    });

    markersRef.current = markers;

    return () => {
      markers.forEach(safeRemoveMarker);
      markersRef.current = [];
    };
  }, [map, onSelect, points, visible]);

  return null;
}

function safeRemoveMarker(marker: mapboxgl.Marker) {
  try {
    const element = marker.getElement();
    if (element.parentNode) marker.remove();
  } catch {
    // Mapbox can remove marker nodes during map teardown before React cleanup runs.
  }
}
