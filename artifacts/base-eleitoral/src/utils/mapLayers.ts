import { CalendarDays, Flame, HelpCircle, Landmark, MessageSquareWarning, Target, UserPlus, Users, Vote } from "lucide-react";

export const mapPointLayers = [
  { key: "leaders", label: "Lideranças", icon: Users, color: "#2563eb" },
  { key: "supporters", label: "Apoiadores", icon: UserPlus, color: "#10b981" },
  { key: "electoral_zones", label: "Zonas", icon: Landmark, color: "#7c3aed" },
  { key: "demands", label: "Demandas", icon: MessageSquareWarning, color: "#ef4444" },
  { key: "field_agenda", label: "Agenda", icon: CalendarDays, color: "#f59e0b" },
] as const;

export const heatmapLayers = [
  { key: "supporters", label: "Heatmap apoiadores", icon: UserPlus },
  { key: "leaders", label: "Heatmap lideranças", icon: Users },
  { key: "validated_votes", label: "Votos validados", icon: Vote },
  { key: "demands", label: "Demandas", icon: Flame },
  { key: "undecided", label: "Indecisos", icon: HelpCircle },
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
