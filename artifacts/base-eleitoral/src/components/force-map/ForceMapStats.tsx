import { maricaDistricts, maricaNeighborhoods, rjCities, rjRegions } from "@/services/operational";
import type { ForceNode } from "./types";

export function ForceMapStats({ nodes, levels }: { nodes: ForceNode[]; levels: ForceNode[][] }) {
  const active = nodes.filter((node) => node.status === "Ativo").length;
  const alerts = nodes.filter((node) => node.status === "Atenção" || node.status === "Crítico").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Cidades do RJ" value={rjCities.length.toString()} helper={`${rjRegions.length} regiões oficiais`} />
      <SummaryCard label="Bairros de Maricá" value={maricaNeighborhoods.length.toString()} helper={`${maricaDistricts.length} distritos automáticos`} />
      <SummaryCard label="Camadas do fluxo" value={levels.length.toString()} helper={`${active} blocos operacionais ativos`} />
      <SummaryCard label="Pontos de atenção" value={alerts.toString()} helper="Alertas aparecem quando houver risco" />
    </div>
  );
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="premium-card rounded-lg p-4">
      <div className="text-2xl font-extrabold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-2 text-xs font-semibold text-slate-500">{helper}</div>
    </div>
  );
}
