import { useEffect, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import type { MapHeatmapLayerType, MapPoint } from "@/services/mapData";
import { calculateHeatmapWeight } from "@/utils/heatmapWeights";

type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: Record<string, unknown>;
  }>;
};

type Props = {
  map: mapboxgl.Map | null;
  points: MapPoint[];
  layerType: MapHeatmapLayerType;
  visible: boolean;
};

const sourceId = "base-eleitoral-heatmap-source";
const heatLayerId = "base-eleitoral-heatmap-layer";
const circleLayerId = "base-eleitoral-heatmap-circles";

export function MapboxHeatmapLayer({ map, points, layerType, visible }: Props) {
  const geojson = useMemo<GeoJsonFeatureCollection>(() => ({
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
      properties: {
        id: point.id,
        type: point.type,
        weight: calculateHeatmapWeight(point, layerType),
      },
    })),
  }), [layerType, points]);

  useEffect(() => {
    if (!map || !visible) return;

    const addLayer = () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: "geojson", data: geojson as never });
      } else {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson as never);
      }

      if (!map.getLayer(heatLayerId)) {
        map.addLayer({
          id: heatLayerId,
          type: "heatmap",
          source: sourceId,
          maxzoom: 15,
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 7, 0.85, 13, 2],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 7, 22, 13, 54],
            "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.78, 15, 0.35],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(14,165,233,0)",
              0.2,
              "rgba(59,130,246,0.35)",
              0.45,
              "rgba(16,185,129,0.55)",
              0.7,
              "rgba(245,158,11,0.72)",
              1,
              "rgba(239,68,68,0.9)",
            ],
          },
        });
      }

      if (!map.getLayer(circleLayerId)) {
        map.addLayer({
          id: circleLayerId,
          type: "circle",
          source: sourceId,
          minzoom: 12,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "weight"], 0, 5, 1, 14],
            "circle-color": "#2563eb",
            "circle-opacity": 0.55,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
          },
        });
      }
    };

    if (map.loaded()) addLayer();
    else map.once("load", addLayer);

    return () => {
      try {
        if (map.getLayer(circleLayerId)) map.removeLayer(circleLayerId);
        if (map.getLayer(heatLayerId)) map.removeLayer(heatLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // Mapbox may already have removed style resources during dev teardown.
      }
    };
  }, [geojson, map, visible]);

  return null;
}
