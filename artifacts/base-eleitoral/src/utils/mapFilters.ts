import type { MapPoint, MapDataFilters } from "@/services/mapData";

export function filterMapPoints(points: MapPoint[], filters: MapDataFilters) {
  return points.filter((point) => {
    if (!matches(filters.city, point.city)) return false;
    if (!matches(filters.neighborhood, point.neighborhood)) return false;
    if (!matches(filters.type, point.type)) return false;
    if (!matches(filters.status, point.status)) return false;
    if (!matches(filters.priority, point.priority)) return false;
    if (!matches(filters.responsible, point.responsible)) return false;
    if (!matches(filters.precision, point.geographicPrecision)) return false;
    if (!matches(filters.geocodingSource, point.geocodingSource)) return false;
    if (!matches(filters.zone, point.originalRecord.zone_number)) return false;
    if (!matches(filters.section, point.originalRecord.section_number)) return false;
    return true;
  });
}

export function buildMapFilterOptions(points: MapPoint[]) {
  return {
    cities: unique(points.map((point) => point.city)),
    neighborhoods: unique(points.map((point) => point.neighborhood)),
    statuses: unique(points.map((point) => point.status)),
    priorities: unique(points.map((point) => point.priority)),
    responsibles: unique(points.map((point) => point.responsible)),
    precisions: unique(points.map((point) => point.geographicPrecision)),
    sources: unique(points.map((point) => point.geocodingSource)),
  };
}

function matches(filter: string | undefined, value: unknown) {
  return !filter || filter === "todos" || normalize(filter) === normalize(value);
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function normalize(value: unknown) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
