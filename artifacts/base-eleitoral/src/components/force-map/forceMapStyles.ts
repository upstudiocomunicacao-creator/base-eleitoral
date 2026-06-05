import type { ForceStatus, ForceTone } from "./types";

export const toneClasses: Record<ForceTone, { gradient: string; soft: string; text: string; border: string }> = {
  blue: {
    gradient: "from-blue-600 to-indigo-800",
    soft: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  emerald: {
    gradient: "from-emerald-600 to-teal-800",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  amber: {
    gradient: "from-amber-500 to-orange-700",
    soft: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  violet: {
    gradient: "from-violet-600 to-indigo-800",
    soft: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  cyan: {
    gradient: "from-cyan-600 to-blue-800",
    soft: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  rose: {
    gradient: "from-rose-600 to-red-800",
    soft: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  slate: {
    gradient: "from-slate-950 to-blue-950",
    soft: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-200",
  },
};

export function getStatusTone(status: ForceStatus) {
  if (status === "Ativo") return "emerald";
  if (status === "Atenção") return "amber";
  if (status === "Crítico") return "red";
  return "blue";
}
