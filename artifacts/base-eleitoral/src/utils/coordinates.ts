export function hasValidCoordinates(latitude: unknown, longitude: unknown) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function toCoordinate(latitude: unknown, longitude: unknown) {
  if (!hasValidCoordinates(latitude, longitude)) return null;
  return { latitude: Number(latitude), longitude: Number(longitude) };
}

export function formatCoordinate(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(6) : "-";
}
