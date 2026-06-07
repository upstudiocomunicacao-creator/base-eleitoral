import { RadioTower, Target, Users, Vote } from "lucide-react";

export const mapPointLayers = [
  { key: "leaders", label: "Cadastros", icon: Users, color: "#2563eb" },
] as const;

export const heatmapLayers = [
  { key: "leaders", label: "Heatmap cadastros", icon: RadioTower },
  { key: "validated_votes", label: "Votos validados", icon: Vote },
  { key: "opportunity", label: "Oportunidade", icon: Target },
] as const;

export function getPointLayerColor(type: string) {
  return mapPointLayers.find((item) => item.key === type)?.color ?? "#64748b";
}

export function getPointLayerLabel(type: string) {
  return mapPointLayers.find((item) => item.key === type)?.label ?? type;
}

export function getHeatmapLayerLabel(type: string) {
  return heatmapLayers.find((item) => item.key === type)?.label ?? type;
}
