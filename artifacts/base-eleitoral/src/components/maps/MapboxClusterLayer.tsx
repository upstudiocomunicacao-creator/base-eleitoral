import { useEffect, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import type { MapPoint } from "@/services/mapData";
import { getPointLayerColor } from "@/utils/mapLayers";

type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

type GeoJsonFeature<TProperties extends Record<string, unknown> = Record<string, unknown>> = {
  type: "Feature";
  geometry: GeoJsonPoint;
  properties: TProperties;
};

type GeoJsonFeatureCollection<TProperties extends Record<string, unknown> = Record<string, unknown>> = {
  type: "FeatureCollection";
  features: Array<GeoJsonFeature<TProperties>>;
};

type Props = {
  map: mapboxgl.Map | null;
  points: MapPoint[];
  visible: boolean;
  onSelect: (point: MapPoint) => void;
};

const sourceId = "base-eleitoral-cluster-source";
const clustersLayerId = "base-eleitoral-clusters";
const clusterCountLayerId = "base-eleitoral-cluster-count";
const unclusteredLayerId = "base-eleitoral-unclustered";

export function MapboxClusterLayer({ map, points, visible, onSelect }: Props) {
  const geojson = useMemo<GeoJsonFeatureCollection>(() => ({
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
      properties: {
        id: point.id,
        title: point.title,
        type: point.type,
        color: getPointLayerColor(point.type),
      },
    })),
  }), [points]);

  useEffect(() => {
    if (!map || !visible) return;

    const addLayer = () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson as never,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 48,
        });
      } else {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson as never);
      }

      if (!map.getLayer(clustersLayerId)) {
        map.addLayer({
          id: clustersLayerId,
          type: "circle",
          source: sourceId,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": ["step", ["get", "point_count"], "#60a5fa", 12, "#34d399", 35, "#f59e0b", 70, "#ef4444"],
            "circle-radius": ["step", ["get", "point_count"], 22, 12, 28, 35, 36, 70, 44],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 3,
          },
        });
      }

      if (!map.getLayer(clusterCountLayerId)) {
        map.addLayer({
          id: clusterCountLayerId,
          type: "symbol",
          source: sourceId,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 13,
          },
          paint: { "text-color": "#ffffff" },
        });
      }

      if (!map.getLayer(unclusteredLayerId)) {
        map.addLayer({
          id: unclusteredLayerId,
          type: "circle",
          source: sourceId,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ["get", "color"],
            "circle-radius": 9,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2.5,
          },
        });
      }
    };

    if (map.loaded()) addLayer();
    else map.once("load", addLayer);

    const handleClusterClick = (event: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, { layers: [clustersLayerId] });
      const clusterId = features[0]?.properties?.cluster_id;
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
      if (!source || clusterId === undefined) return;
      source.getClusterExpansionZoom(clusterId, (error, zoom) => {
        if (error || zoom == null) return;
        const coordinates = (features[0].geometry as GeoJsonPoint).coordinates;
        map.easeTo({ center: coordinates, zoom });
      });
    };

    const handlePointClick = (event: mapboxgl.MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(event.point, { layers: [unclusteredLayerId] })[0] as unknown as GeoJsonFeature<{ id?: string }> | undefined;
      const id = feature?.properties?.id;
      const point = points.find((item) => item.id === id);
      if (point) onSelect(point);
    };

    map.on("click", clustersLayerId, handleClusterClick);
    map.on("click", unclusteredLayerId, handlePointClick);
    map.on("mouseenter", clustersLayerId, () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", clustersLayerId, () => { map.getCanvas().style.cursor = ""; });
    map.on("mouseenter", unclusteredLayerId, () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", unclusteredLayerId, () => { map.getCanvas().style.cursor = ""; });

    return () => {
      try {
        map.off("click", clustersLayerId, handleClusterClick);
        map.off("click", unclusteredLayerId, handlePointClick);
        if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
        if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
        if (map.getLayer(clustersLayerId)) map.removeLayer(clustersLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // Mapbox may already have removed style resources during dev teardown.
      }
    };
  }, [geojson, map, onSelect, points, visible]);

  return null;
}
