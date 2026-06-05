import type { MapPoint, MapHeatmapLayerType } from "@/services/mapData";

export function calculateHeatmapWeight(record: MapPoint, layerType: MapHeatmapLayerType) {
  if (layerType === "supporters") {
    const status = normalize(record.status);
    if (status.includes("confirmado") || status.includes("validado")) return 0.95;
    if (status.includes("simpatizante")) return 0.65;
    if (status.includes("indeciso")) return 0.42;
    if (status.includes("contr")) return 0.1;
    return 0.45;
  }

  if (layerType === "leaders") {
    return clamp((Number(record.originalRecord?.validated_votes ?? 0) / 500) + confidenceBoost(record.originalRecord?.confidence_level), 0.2, 1);
  }

  if (layerType === "validated_votes") {
    return clamp(Number(record.originalRecord?.validated_votes ?? record.originalRecord?.validatedVotes ?? 0) / 600, 0.2, 1);
  }

  if (layerType === "demands") {
    const priority = normalize(record.priority);
    if (priority.includes("crit")) return 1;
    if (priority.includes("alta")) return 0.78;
    if (priority.includes("media")) return 0.52;
    return 0.28;
  }

  if (layerType === "undecided") {
    return normalize(record.status).includes("indeciso") ? 0.82 : 0.22;
  }

  if (layerType === "opportunity") {
    const voters = Number(record.originalRecord?.voters_count ?? 0);
    const validated = Number(record.originalRecord?.validated_votes ?? 0);
    const goal = Number(record.originalRecord?.vote_goal ?? 0);
    const distance = Math.max(goal - validated, 0);
    return clamp((voters / 20000) + (distance / 1000), 0.25, 1);
  }

  return record.weight;
}

function confidenceBoost(value: unknown) {
  const normalized = normalize(value);
  if (normalized.includes("alto")) return 0.35;
  if (normalized.includes("medio")) return 0.22;
  return 0.1;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: unknown) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
