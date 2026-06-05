import type { LucideIcon } from "lucide-react";

export type TerritoryScope = "state" | "city";
export type TerritoryPriority = "Baixa" | "M\u00e9dia" | "Alta" | "Cr\u00edtica" | "Manter";
export type TerritoryStatus = "Forte" | "Em crescimento" | "Baixa cobertura" | "Sem lideran\u00e7a" | "Priorit\u00e1rio" | "Cr\u00edtico";
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
  type: "Munic\u00edpio" | "Bairro";
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
  geoPrecision: "Alta" | "M\u00e9dia alta" | "M\u00e9dia" | "Baixa" | "Muito baixa";
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
