export const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export const isMapboxConfigured = Boolean(mapboxAccessToken);

export const mapboxStyle = "mapbox://styles/mapbox/light-v11";

export const mapCenters = {
  state: { longitude: -42.8186, latitude: -22.9196, zoom: 8.2 },
  city: { longitude: -42.8186, latitude: -22.9196, zoom: 11.2 },
} as const;
