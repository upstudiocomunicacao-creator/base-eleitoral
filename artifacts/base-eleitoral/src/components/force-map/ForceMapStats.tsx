import type { ForceNode } from "./types";

export function ForceMapStats({ nodes, levels }: { nodes: ForceNode[]; levels: ForceNode[][] }) {
  const active = nodes.filter((node) => node.status === "Ativo").length;
  const alerts = nodes.filter((node) => node.status === "Atenção" || node.status === "Crítico").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Blocos estratégicos" value={nodes.length.toString()} />
      <SummaryCard label="Camadas do fluxo" value={levels.length.toString()} />
      <SummaryCard label="Operação ativa" value={active.toString()} />
      <SummaryCard label="Pontos de atenção" value={alerts.toString()} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="premium-card rounded-lg p-4">
      <div className="text-2xl font-extrabold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div>
    </div>
  );
}
