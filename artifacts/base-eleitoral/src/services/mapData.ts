import { getDashboardDataset } from "./dashboard";
import { hasValidCoordinates } from "@/utils/coordinates";
import { calculateHeatmapWeight } from "@/utils/heatmapWeights";
import { filterMapPoints } from "@/utils/mapFilters";

export type MapPointType = "leaders" | "supporters" | "electoral_zones" | "demands" | "field_agenda";
export type MapHeatmapLayerType = "supporters" | "leaders" | "validated_votes" | "demands" | "undecided" | "opportunity";
export type MapScope = "state" | "city";

export type MapDataFilters = {
  city?: string;
  neighborhood?: string;
  type?: string;
  status?: string;
  priority?: string;
  leader?: string;
  responsible?: string;
  precision?: string;
  geocodingSource?: string;
  period?: string;
};

export type MapPoint = {
  id: string;
  type: MapPointType;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  neighborhood: string;
  city: string;
  state: string;
  status: string;
  priority: string;
  responsible: string;
  geographicPrecision: string;
  geocodingSource: string;
  weight: number;
  sourceTable: MapPointType;
  originalRecord: Record<string, unknown>;
};

export type MapData = {
  points: MapPoint[];
  withoutCoordinates: Array<{ id: string; type: MapPointType; title: string; city: string; neighborhood: string }>;
  summary: Awaited<ReturnType<typeof getMapSummary>>;
};

export async function getMapPoints(filters: MapDataFilters = {}): Promise<MapPoint[]> {
  const dataset = await getDashboardDataset();
  const points: MapPoint[] = [
    ...dataset.leaders.map((record) => toPoint("leaders", record, record.full_name, record.leader_type, record.status, getLeaderPriority(record), record.internal_responsible ?? "")),
    ...dataset.supporters.map((record) => toPoint("supporters", record, record.full_name, record.person_type, record.political_status, record.political_status, record.internal_responsible ?? "")),
    ...dataset.electoralZones.map((record) => toPoint("electoral_zones", record, record.voting_place, `Zona ${record.zone_number}${record.section_number ? ` · Seção ${record.section_number}` : ""}`, record.status, record.priority, record.regional_responsible ?? "")),
    ...dataset.demands.map((record) => toPoint("demands", record, record.title, record.category, record.status, record.priority, record.internal_responsible ?? "")),
    ...dataset.fieldAgenda.map((record) => toPoint("field_agenda", record, record.title, record.action_type, record.status, record.priority, record.internal_responsible ?? "")),
  ].filter((point): point is MapPoint => Boolean(point));

  return filterMapPoints(points, filters);
}

export async function getRJMapData(filters: MapDataFilters = {}): Promise<MapData> {
  const points = filterPointsByBounds(await getMapPoints(filters), "state");
  const withoutCoordinates = await getRecordsWithoutCoordinates(filters);
  return { points, withoutCoordinates, summary: buildMapSummary(points, withoutCoordinates) };
}

export async function getMaricaMapData(filters: MapDataFilters = {}): Promise<MapData> {
  const scopedFilters = { ...filters, city: filters.city && filters.city !== "todos" ? filters.city : "Maricá" };
  const points = filterPointsByBounds(await getMapPoints(scopedFilters), "city");
  const withoutCoordinates = await getRecordsWithoutCoordinates(scopedFilters);
  return { points, withoutCoordinates, summary: buildMapSummary(points, withoutCoordinates) };
}

export async function getLeadersMapPoints(filters: MapDataFilters = {}) {
  return getMapPoints({ ...filters, type: "leaders" });
}

export async function getSupportersMapPoints(filters: MapDataFilters = {}) {
  return getMapPoints({ ...filters, type: "supporters" });
}

export async function getElectoralZonesMapPoints(filters: MapDataFilters = {}) {
  return getMapPoints({ ...filters, type: "electoral_zones" });
}

export async function getDemandMapPoints(filters: MapDataFilters = {}) {
  return getMapPoints({ ...filters, type: "demands" });
}

export async function getFieldAgendaMapPoints(filters: MapDataFilters = {}) {
  return getMapPoints({ ...filters, type: "field_agenda" });
}

export async function getHeatmapData(layerType: MapHeatmapLayerType, filters: MapDataFilters = {}) {
  return (await getMapPoints(filters))
    .filter((point) => shouldUsePointForHeatmap(point, layerType))
    .map((point) => ({ ...point, weight: calculateHeatmapWeight(point, layerType) }));
}

export async function getRecordsWithoutCoordinates(filters: MapDataFilters = {}) {
  const dataset = await getDashboardDataset();
  const records = [
    ...dataset.leaders.map((record) => withoutPoint("leaders", record, record.full_name)),
    ...dataset.supporters.map((record) => withoutPoint("supporters", record, record.full_name)),
    ...dataset.electoralZones.map((record) => withoutPoint("electoral_zones", record, record.voting_place)),
    ...dataset.demands.map((record) => withoutPoint("demands", record, record.title)),
    ...dataset.fieldAgenda.map((record) => withoutPoint("field_agenda", record, record.title)),
  ];

  return records
    .filter((item) => !hasValidCoordinates(item.originalRecord.latitude, item.originalRecord.longitude))
    .filter((item) =>
      (!filters.city || filters.city === "todos" || normalize(item.city) === normalize(filters.city)) &&
      (!filters.neighborhood || filters.neighborhood === "todos" || normalize(item.neighborhood) === normalize(filters.neighborhood))
    )
    .map(({ originalRecord: _originalRecord, ...item }) => item);
}

export async function getMapSummary(filters: MapDataFilters = {}) {
  const points = await getMapPoints(filters);
  const withoutCoordinates = await getRecordsWithoutCoordinates(filters);
  return buildMapSummary(points, withoutCoordinates);
}

function buildMapSummary(points: MapPoint[], withoutCoordinates: Array<{ id: string; type: MapPointType; title: string; city: string; neighborhood: string }>) {
  const byNeighborhood = countBy(points, (point) => point.neighborhood || "Não definido");
  const strongest = Object.entries(byNeighborhood).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const opportunity = points
    .filter((point) => point.type === "electoral_zones")
    .sort((a, b) => Number(b.originalRecord.vote_goal ?? 0) - Number(b.originalRecord.validated_votes ?? 0))[0]?.neighborhood ?? "-";

  return {
    totalPoints: points.length,
    leaders: points.filter((point) => point.type === "leaders").length,
    supporters: points.filter((point) => point.type === "supporters").length,
    zones: points.filter((point) => point.type === "electoral_zones").length,
    demands: points.filter((point) => point.type === "demands").length,
    agenda: points.filter((point) => point.type === "field_agenda").length,
    withoutCoordinates: withoutCoordinates.length,
    strongestRegion: strongest,
    opportunityRegion: opportunity,
  };
}

function toPoint(
  type: MapPointType,
  record: Record<string, unknown>,
  title: string,
  subtitle: string,
  status: string,
  priority: string,
  responsible: string,
): MapPoint | null {
  const coordinates = normalizeCoordinates(record.latitude, record.longitude);
  if (!coordinates) return null;
  return {
    id: String(record.id),
    type,
    title,
    subtitle,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    neighborhood: String(record.neighborhood ?? ""),
    city: String(record.city ?? ""),
    state: String(record.state ?? "RJ"),
    status: status || "Não definido",
    priority: priority || "Não definida",
    responsible: responsible || "Não definido",
    geographicPrecision: String(record.geographic_precision ?? "Não definida"),
    geocodingSource: String(record.geocoding_source ?? "manual"),
    weight: 0.5,
    sourceTable: type,
    originalRecord: record,
  };
}


function normalizeCoordinates(latitude: unknown, longitude: unknown) {
  if (!hasValidCoordinates(latitude, longitude)) return null;
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (lat <= -40 && lat >= -45 && lng <= -20 && lng >= -24) {
    return { latitude: lng, longitude: lat };
  }

  return { latitude: lat, longitude: lng };
}

function filterPointsByBounds(points: MapPoint[], scope: MapScope) {
  const bounds = scope === "city" ? maricaBounds : rioStateBounds;
  return points.filter((point) => (
    point.latitude >= bounds.minLat &&
    point.latitude <= bounds.maxLat &&
    point.longitude >= bounds.minLng &&
    point.longitude <= bounds.maxLng
  ));
}

const maricaBounds = {
  minLat: -23.08,
  maxLat: -22.76,
  minLng: -43.08,
  maxLng: -42.55,
};

const rioStateBounds = {
  minLat: -23.45,
  maxLat: -20.7,
  minLng: -44.95,
  maxLng: -40.7,
};
function withoutPoint(type: MapPointType, record: Record<string, unknown>, title: string) {
  return {
    id: String(record.id),
    type,
    title,
    city: String(record.city ?? ""),
    neighborhood: String(record.neighborhood ?? ""),
    originalRecord: record,
  };
}

function shouldUsePointForHeatmap(point: MapPoint, layerType: MapHeatmapLayerType) {
  if (layerType === "supporters") return point.type === "supporters";
  if (layerType === "leaders") return point.type === "leaders";
  if (layerType === "validated_votes") return point.type === "leaders" || point.type === "electoral_zones";
  if (layerType === "demands") return point.type === "demands";
  if (layerType === "undecided") return point.type === "supporters";
  if (layerType === "opportunity") return point.type === "electoral_zones";
  return true;
}

function getLeaderPriority(record: { validated_votes: number; declared_votes: number; confidence_level: string }) {
  if (record.declared_votes > 0 && record.validated_votes / record.declared_votes < 0.3) return "Atenção";
  return record.confidence_level;
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function normalize(value: unknown) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

