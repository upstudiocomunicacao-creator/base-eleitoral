import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2 } from "lucide-react";
import { mapboxAccessToken, mapboxStyle, mapCenters } from "@/lib/mapbox";
import type { MapHeatmapLayerType, MapPoint, MapScope } from "@/services/mapData";
import type { RealMapMode } from "./MapLayerControls";
import { MapboxClusterLayer } from "./MapboxClusterLayer";
import { MapboxHeatmapLayer } from "./MapboxHeatmapLayer";
import { MapboxPinsLayer } from "./MapboxPinsLayer";

type Props = {
  scope: MapScope;
  points: MapPoint[];
  mode: RealMapMode;
  heatmapLayer: MapHeatmapLayerType;
  onSelect: (point: MapPoint) => void;
};

export function MapboxMap({ scope, points, mode, heatmapLayer, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const center = mapCenters[scope];
  const bounds = useMemo(() => buildBounds(points), [points]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxAccessToken;
    setMapError(null);

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapboxStyle,
      center: [center.longitude, center.latitude],
      zoom: center.zoom,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    const forceResize = () => {
      try {
        map.resize();
      } catch {
        // Mapbox may already be disposed during route changes in dev.
      }
    };

    const resizeObserver = new ResizeObserver(() => forceResize());
    resizeObserver.observe(containerRef.current);

    const resizeTimers = [
      window.setTimeout(forceResize, 120),
      window.setTimeout(forceResize, 450),
      window.setTimeout(forceResize, 1200),
    ];

    map.on("load", () => {
      setMapReady(true);
      forceResize();
    });
    map.on("idle", forceResize);
    map.on("error", (event) => {
      const message = event.error?.message || "Falha ao carregar tiles/estilo do Mapbox.";
      setMapError(message);
    });
    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      resizeTimers.forEach((timer) => window.clearTimeout(timer));
      try {
        map.remove();
      } catch {
        // In dev/HMR, Mapbox can be torn down after React already detached DOM nodes.
      }
      mapRef.current = null;
      setMapReady(false);
      setMapError(null);
    };
  }, [center.latitude, center.longitude, center.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    if (bounds) {
      map.fitBounds(bounds, { padding: 72, maxZoom: scope === "city" ? 13.8 : 10.6, duration: 900 });
    } else {
      map.easeTo({ center: [center.longitude, center.latitude], zoom: center.zoom, duration: 700 });
    }
  }, [bounds, center.latitude, center.longitude, center.zoom, mapReady, scope]);

  return (
    <div className="relative h-[620px] min-h-[620px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {!mapReady ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Carregando mapa real
          </div>
        </div>
      ) : null}
      {mapError ? (
        <div className="absolute inset-x-4 top-4 z-30 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 shadow-lg">
          Não foi possível carregar completamente o mapa real: {mapError}
        </div>
      ) : null}
      <MapboxPinsLayer map={mapRef.current} points={points} visible={mapReady && mode === "pins"} onSelect={onSelect} />
      <MapboxHeatmapLayer map={mapRef.current} points={points} layerType={heatmapLayer} visible={mapReady && mode === "heatmap"} />
      <MapboxClusterLayer map={mapRef.current} points={points} visible={mapReady && mode === "cluster"} onSelect={onSelect} />
    </div>
  );
}

function buildBounds(points: MapPoint[]) {
  if (!points.length) return null;
  const bounds = new mapboxgl.LngLatBounds();
  points.forEach((point) => bounds.extend([point.longitude, point.latitude]));
  return bounds;
}
