import type { AddressLike } from "./address";

export type GeographicPrecision = "Alta" | "Média alta" | "Média" | "Baixa" | "Muito baixa";

export function detectGeographicPrecision(record: AddressLike): GeographicPrecision {
  const hasStreet = filled(record.street);
  const hasNumber = filled(record.number);
  const hasNeighborhood = filled(record.neighborhood);
  const hasCity = filled(record.city);
  const hasState = filled(record.state);
  const hasCep = filled(record.cep);

  if (hasStreet && hasNumber && hasNeighborhood && hasCity && hasState) return "Alta";
  if (hasCep && hasStreet && hasNeighborhood && hasCity) return "Média alta";
  if (hasStreet && hasNeighborhood && hasCity) return "Média";
  if (hasNeighborhood && hasCity && hasState) return "Baixa";
  return "Muito baixa";
}

export function precisionConfidence(precision: string) {
  const normalized = normalize(precision);
  if (normalized.includes("alta") && !normalized.includes("media")) return 0.92;
  if (normalized.includes("media alta")) return 0.82;
  if (normalized.includes("media")) return 0.68;
  if (normalized.includes("baixa") && !normalized.includes("muito")) return 0.48;
  return 0.28;
}

function filled(value?: string | null) {
  return Boolean(value && value.trim());
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
