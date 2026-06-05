import type { LucideIcon } from "lucide-react";

export type ForceStatus = "Ativo" | "Atenção" | "Crítico" | "Preparado";

export type ForceTone = "blue" | "emerald" | "amber" | "violet" | "cyan" | "rose" | "slate";

export type ForceMetric = {
  label: string;
  value: string;
  helper?: string;
};

export type ForceNode = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: ForceTone;
  count: string;
  countLabel: string;
  status: ForceStatus;
  summary: string;
  metrics: ForceMetric[];
  insights: string[];
  progress?: {
    label: string;
    value: number;
  };
};
