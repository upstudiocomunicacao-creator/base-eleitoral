import type { LucideIcon } from "lucide-react";

export type TerritoryScope = "state" | "city";
export type TerritoryPriority = "Baixa" | "Média" | "Alta" | "Crítica" | "Manter";
export type TerritoryStatus = "Forte" | "Em crescimento" | "Baixa cobertura" | "Sem liderança" | "Prioritário" | "Crítico";
export type HeatMode = "forca" | "apoiadores" | "liderancas" | "votos" | "indecisos" | "demandas" | "oportunidade" | "sem_cobertura";
export type MapViewMode = "estrategico" | "heatmap" | "pins";

export type MapLayerOption = {
  key: HeatMode;
  label: string;
  icon: LucideIcon;
};

export type TerritoryRecord = {
  id: number;
  name: string;
  region: string;
  type: "Município" | "Bairro";
  status: TerritoryStatus;
  priority: TerritoryPriority;
  responsible: string;
  leaders: number;
  supporters: number;
  estimatedSupporters: number;
  declaredVotes: number;
  validatedVotes: number;
  target: number;
  estimatedElectors: number;
  undecided: number;
  demands: number;
  confidence: number;
  weeklyGrowth: number;
  campaignActive: boolean;
  zones: string[];
  sections: string[];
  votingPlaces: string[];
  areas: string[];
  leadersLinked: string[];
  nextActions: string[];
  notes: string;
  geoPrecision: "Alta" | "Média alta" | "Média" | "Baixa" | "Muito baixa";
  position: { x: number; y: number };
};

export type EnrichedTerritoryRecord = TerritoryRecord & {
  coverage: number;
  goalProgress: number;
  distanceToTarget: number;
  territorialStrength: number;
  opportunity: number;
  averagePrecision: number;
  heat: Record<HeatMode, number>;
  analysis: string;
};
