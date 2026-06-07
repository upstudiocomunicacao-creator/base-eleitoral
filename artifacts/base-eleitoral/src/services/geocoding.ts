import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { isMapboxConfigured, mapboxAccessToken } from "@/lib/mapbox";
import { buildFullAddress, buildShortAddress, type AddressLike } from "@/utils/address";
import { detectGeographicPrecision, precisionConfidence } from "@/utils/geographicPrecision";

export type GeocodingTableName = "leaders" | "supporters" | "electoral_zones" | "field_agenda" | "demands";
export type GeocodingStatus = "pending" | "success" | "approximate" | "failed" | "manual" | "skipped";
export type GeocodingSource = "manual" | "mock" | "mapbox" | "google" | "cep" | "bairro" | "cidade";
export type GeocodingProvider = "mock" | "mapbox" | "google";

export type Coordinates = {
  latitude: number;
  longitude: number;
  geocoding_status: GeocodingStatus;
  geocoding_source: GeocodingSource;
  geocoding_confidence: number;
  geocoding_error?: string | null;
  geographic_precision?: string;
};

export type GeocodingRecord = AddressLike & {
  id: string;
  tableName: GeocodingTableName;
  typeLabel: string;
  title: string;
  latitude?: number | null;
  longitude?: number | null;
  geographic_precision?: string | null;
  geocoding_status?: string | null;
  geocoding_source?: string | null;
  geocoding_confidence?: number | null;
  geocoding_last_attempt_at?: string | null;
  geocoding_error?: string | null;
};

export type BulkGeocodingResult = {
  total: number;
  success: number;
  approximate: number;
  failed: number;
  skipped: number;
  errors: string[];
};

type MapboxGeocodingResponse = {
  message?: string;
  features?: Array<{
    center?: [number, number];
    relevance?: number;
    place_name?: string;
  }>;
};

const tableLabels: Record<GeocodingTableName, string> = {
  leaders: "Liderança",
  supporters: "Apoiador",
  electoral_zones: "Zona",
  field_agenda: "Agenda",
  demands: "Demanda",
};

export function isGeocodingSupabaseReady() {
  return isSupabaseConfigured;
}

export { buildFullAddress, detectGeographicPrecision };

export function getGeocodingProvider(): GeocodingProvider {
  const provider = String(import.meta.env.VITE_GEOCODING_PROVIDER || "mock").toLowerCase();
  if (provider === "mapbox") return "mapbox";
  if (provider === "google") return "google";
  if (provider === "mock") return isMapboxConfigured ? "mapbox" : "mock";
  return isMapboxConfigured ? "mapbox" : "mock";
}

export function getGeocodingProviderLabel() {
  const provider = getGeocodingProvider();
  if (provider === "mapbox") return "Mapbox real";
  if (provider === "google") return "Google Maps";
  return "Mock";
}

export function isRealGeocodingReady() {
  const provider = getGeocodingProvider();
  return provider === "mapbox" ? isMapboxConfigured : provider === "google";
}

export async function geocodeAddress(record: AddressLike): Promise<Coordinates> {
  const provider = getGeocodingProvider();
  if (provider === "mock") return mockGeocodeAddress(buildFullAddress(record), record.neighborhood ?? "", record.city ?? "", record.state ?? "RJ");
  if (provider === "mapbox") return geocodeAddressWithMapbox(record);
  if (provider === "google") {
    throw new Error("Provider ainda não configurado. Use VITE_GEOCODING_PROVIDER=mock por enquanto.");
  }
  throw new Error(`Provider de geocodificação inválido: ${provider}`);
}

async function geocodeAddressWithMapbox(record: AddressLike): Promise<Coordinates> {
  if (!isMapboxConfigured) throw new Error("VITE_MAPBOX_ACCESS_TOKEN não configurado.");

  const fullAddress = buildFullAddress(record);
  const fallbackAddress = [record.neighborhood, record.city, record.state ?? "RJ", "Brasil"].filter(Boolean).join(", ");
  const query = fullAddress || fallbackAddress;
  if (!query) throw new Error("Endereço insuficiente para geocodificação.");

  const params = new URLSearchParams({
    access_token: mapboxAccessToken,
    country: "br",
    language: "pt",
    limit: "1",
    proximity: "-42.8186,-22.9196",
  });

  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`);
  const payload = await response.json() as MapboxGeocodingResponse;

  if (!response.ok) {
    throw new Error(payload.message || `Mapbox retornou erro ${response.status}.`);
  }

  const feature = payload.features?.[0];
  const center = feature?.center;
  const longitude = center?.[0];
  const latitude = center?.[1];
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error("Mapbox não encontrou coordenadas para este endereço.");
  }

  const precision = detectGeographicPrecision(record);
  const relevance = clamp(Number(feature?.relevance ?? 0.75), 0.35, 1);
  const confidence = Math.min(1, Math.max(precisionConfidence(precision), relevance));
  const status: GeocodingStatus = confidence >= 0.82 && precision !== "Baixa" && precision !== "Muito baixa" ? "success" : "approximate";

  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    geocoding_status: status,
    geocoding_source: "mapbox",
    geocoding_confidence: Number(confidence.toFixed(2)),
    geographic_precision: precision,
    geocoding_error: null,
  };
}

export function mockGeocodeAddress(_address: string, neighborhood: string, city: string, state = "RJ"): Coordinates {
  const precision = detectGeographicPrecision({ neighborhood, city, state });
  const base = findMockCoordinates(neighborhood, city);
  const confidence = precisionConfidence(precision);
  return {
    latitude: jitter(base.latitude, neighborhood),
    longitude: jitter(base.longitude, city),
    geocoding_status: "approximate",
    geocoding_source: "mock",
    geocoding_confidence: confidence,
    geographic_precision: precision,
    geocoding_error: null,
  };
}

export async function updateRecordCoordinates(tableName: GeocodingTableName, recordId: string, coordinates: Coordinates) {
  const supabase = getSupabaseClient();
  const fullPayload = {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    geographic_precision: coordinates.geographic_precision,
    geocoding_status: coordinates.geocoding_status,
    geocoding_source: coordinates.geocoding_source,
    geocoding_confidence: coordinates.geocoding_confidence,
    geocoding_last_attempt_at: new Date().toISOString(),
    geocoding_error: coordinates.geocoding_error ?? null,
  };

  const { error } = await supabase
    .from(tableName)
    .update(fullPayload as never)
    .eq("id", recordId);

  if (!error) return;
  if (!isMissingGeocodingColumnError(error)) throw error;

  const { error: fallbackError } = await supabase
    .from(tableName)
    .update({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    } as never)
    .eq("id", recordId);

  if (fallbackError) throw fallbackError;
}

export async function markRecordSkipped(record: GeocodingRecord) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(record.tableName).update({
    geocoding_status: "skipped",
    geocoding_last_attempt_at: new Date().toISOString(),
  } as never).eq("id", record.id);
  if (error) throw error;
}

export async function geocodeRecord(record: GeocodingRecord) {
  const coordinates = await geocodeAddress(record);
  await updateRecordCoordinates(record.tableName, record.id, coordinates);
  return coordinates;
}

export async function geocodeLeader(id: string) {
  return geocodeByTableAndId("leaders", id);
}

export async function geocodeSupporter(id: string) {
  return geocodeByTableAndId("supporters", id);
}

export async function geocodeElectoralZone(id: string) {
  return geocodeByTableAndId("electoral_zones", id);
}

export async function geocodeFieldAgenda(id: string) {
  return geocodeByTableAndId("field_agenda", id);
}

export async function geocodeDemand(id: string) {
  return geocodeByTableAndId("demands", id);
}

export async function bulkGeocode(tableName: GeocodingTableName | "all" = "all", filters: Partial<{ city: string; neighborhood: string; status: string }> = {}): Promise<BulkGeocodingResult> {
  const records = (await getPendingGeocodingRecords()).filter((record) =>
    (tableName === "all" || record.tableName === tableName) &&
    (!filters.city || filters.city === "todos" || normalize(record.city) === normalize(filters.city)) &&
    (!filters.neighborhood || filters.neighborhood === "todos" || normalize(record.neighborhood) === normalize(filters.neighborhood)) &&
    (!filters.status || filters.status === "todos" || normalize(record.geocoding_status) === normalize(filters.status))
  );

  const result: BulkGeocodingResult = { total: records.length, success: 0, approximate: 0, failed: 0, skipped: 0, errors: [] };
  for (const record of records) {
    try {
      const coordinates = await geocodeRecord(record);
      result[coordinates.geocoding_status === "success" ? "success" : "approximate"] += 1;
    } catch (error) {
      result.errors.push(`${record.typeLabel} "${record.title}": ${getErrorMessage(error)}`);
      result.failed += 1;
    }
  }
  return result;
}

export async function getGeocodingStats() {
  const records = await getAllGeocodingRecords();
  const withCoordinates = records.filter((item) => hasCoordinates(item));
  const confidenceValues = records.map((item) => Number(item.geocoding_confidence ?? 0)).filter(Boolean);
  return {
    withCoordinates: withCoordinates.length,
    pending: records.filter((item) => !hasCoordinates(item) && statusOf(item) !== "skipped").length,
    approximate: records.filter((item) => statusOf(item) === "approximate").length,
    failed: records.filter((item) => statusOf(item) === "failed").length,
    manual: records.filter((item) => statusOf(item) === "manual").length,
    averagePrecision: confidenceValues.length ? Math.round((confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) * 100) : 0,
    leaders: records.filter((item) => item.tableName === "leaders" && hasCoordinates(item)).length,
    supporters: 0,
    zones: 0,
    demands: 0,
    total: records.length,
  };
}

export async function getPendingGeocodingRecords() {
  return (await getAllGeocodingRecords()).filter((record) => !hasCoordinates(record) || statusOf(record) === "failed");
}

export async function getAllGeocodingRecords(): Promise<GeocodingRecord[]> {
  const leaders = await listTable("leaders");
  return [
    ...leaders.map((item) => normalizeRecord("leaders", item)),
  ];
}

async function geocodeByTableAndId(tableName: GeocodingTableName, id: string) {
  const record = (await getAllGeocodingRecords()).find((item) => item.tableName === tableName && item.id === id);
  if (!record) throw new Error("Registro não encontrado para geocodificação.");
  return geocodeRecord(record);
}

async function listTable(tableName: GeocodingTableName) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(tableName).select("*").limit(1000);
  if (error) throw error;
  return (data ?? []) as Array<Record<string, unknown>>;
}

function normalizeRecord(tableName: GeocodingTableName, item: Record<string, unknown>): GeocodingRecord {
  return {
    id: String(item.id),
    tableName,
    typeLabel: tableLabels[tableName],
    title: String(item.full_name ?? item.contact_name ?? item.voting_place ?? item.title ?? "Sem título"),
    cep: stringOrNull(item.cep),
    street: stringOrNull(item.street),
    number: stringOrNull(item.number),
    complement: stringOrNull(item.complement),
    neighborhood: stringOrNull(item.neighborhood),
    city: stringOrNull(item.city),
    state: stringOrNull(item.state) ?? "RJ",
    latitude: numberOrNull(item.latitude),
    longitude: numberOrNull(item.longitude),
    geographic_precision: stringOrNull(item.geographic_precision),
    geocoding_status: stringOrNull(item.geocoding_status) ?? "pending",
    geocoding_source: stringOrNull(item.geocoding_source),
    geocoding_confidence: numberOrNull(item.geocoding_confidence),
    geocoding_last_attempt_at: stringOrNull(item.geocoding_last_attempt_at),
    geocoding_error: stringOrNull(item.geocoding_error),
  };
}

export function summarizeGeocodingAddress(record: GeocodingRecord) {
  return buildShortAddress(record) || buildFullAddress(record) || "Endereço incompleto";
}

function hasCoordinates(record: GeocodingRecord) {
  return Number.isFinite(Number(record.latitude)) && Number.isFinite(Number(record.longitude));
}

function statusOf(record: GeocodingRecord): GeocodingStatus {
  const status = normalize(record.geocoding_status);
  if (["success", "approximate", "failed", "manual", "skipped"].includes(status)) return status as GeocodingStatus;
  return "pending";
}

function findMockCoordinates(neighborhood: string, city: string) {
  const neighborhoodKey = normalize(neighborhood);
  const cityKey = normalize(city);
  return maricaNeighborhoodCoordinates[neighborhoodKey] ?? cityCoordinates[cityKey] ?? cityCoordinates.marica;
}

function jitter(value: number, seed: string) {
  const offset = (normalize(seed).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 17) / 10000;
  return Number((value + offset).toFixed(6));
}

function stringOrNull(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalize(value: unknown) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isMissingGeocodingColumnError(error: { message?: string; details?: string; hint?: string }) {
  const text = normalize(`${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`);
  return text.includes("geocoding") || text.includes("column") || text.includes("schema cache");
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message);
  return "Erro inesperado.";
}

const maricaNeighborhoodCoordinates: Record<string, { latitude: number; longitude: number }> = {
  centro: { latitude: -22.9196, longitude: -42.8186 },
  aracatiba: { latitude: -22.9325, longitude: -42.8235 },
  flamengo: { latitude: -22.9257, longitude: -42.8314 },
  mumbuca: { latitude: -22.9152, longitude: -42.8298 },
  itapeba: { latitude: -22.9072, longitude: -42.8128 },
  "parque nanci": { latitude: -22.8959, longitude: -42.8069 },
  "barra de marica": { latitude: -22.9574, longitude: -42.8127 },
  jacaroa: { latitude: -22.9403, longitude: -42.7951 },
  "sao jose do imbassai": { latitude: -22.8894, longitude: -42.7848 },
  cordeirinho: { latitude: -22.9504, longitude: -42.7347 },
  jacone: { latitude: -22.9378, longitude: -42.6478 },
  caju: { latitude: -22.9157, longitude: -42.7864 },
  espraiado: { latitude: -22.8665, longitude: -42.7246 },
  guaratiba: { latitude: -22.9584, longitude: -42.7101 },
  inoa: { latitude: -22.8777, longitude: -42.9103 },
  "bosque fundo": { latitude: -22.8872, longitude: -42.8818 },
  "santa paula": { latitude: -22.8891, longitude: -42.8529 },
  itaipuacu: { latitude: -22.9553, longitude: -42.9861 },
  "jardim atlantico": { latitude: -22.9618, longitude: -42.9677 },
  recanto: { latitude: -22.9408, longitude: -42.9444 },
  barroco: { latitude: -22.9287, longitude: -42.9104 },
};

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  marica: { latitude: -22.9196, longitude: -42.8186 },
  niteroi: { latitude: -22.8832, longitude: -43.1034 },
  "sao goncalo": { latitude: -22.8268, longitude: -43.0634 },
  itaborai: { latitude: -22.7448, longitude: -42.8599 },
  "rio de janeiro": { latitude: -22.9068, longitude: -43.1729 },
  saquarema: { latitude: -22.9292, longitude: -42.5099 },
  araruama: { latitude: -22.8729, longitude: -42.3429 },
  "cabo frio": { latitude: -22.8794, longitude: -42.0186 },
  "silva jardim": { latitude: -22.6574, longitude: -42.3961 },
  tangua: { latitude: -22.7423, longitude: -42.7203 },
  "rio bonito": { latitude: -22.7082, longitude: -42.6251 },
  mage: { latitude: -22.6632, longitude: -43.0315 },
};
