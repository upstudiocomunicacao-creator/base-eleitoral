import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { BranchConnector, FlowConnector } from "./FlowConnector";
import { FlowNodeCard } from "./FlowNodeCard";
import { forceMapLevels } from "./forceMapData";
import { ForceMapModal } from "./ForceMapModal";
import { ForceMapStats } from "./ForceMapStats";
import type { ForceNode } from "./types";

export function ForceMapPage() {
  const nodes = useMemo(() => forceMapLevels.flat(), []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inteligência Territorial"
        title="Mapa de Força"
        description="Organograma enxuto da campanha: candidato, coordenação geral, coordenações RJ e Maricá, lideranças, votos estimados, custos e leitura territorial."
      />

      <ForceMapStats nodes={nodes} levels={forceMapLevels} />

      <OperationalRules />

      <section className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
        <div className="hidden overflow-x-auto md:block">
          <DesktopFlow levels={forceMapLevels} selectedNodeId={selectedNodeId} onSelect={setSelectedNodeId} />
        </div>

        <div className="md:hidden">
          <MobileFlow levels={forceMapLevels} selectedNodeId={selectedNodeId} onSelect={setSelectedNodeId} />
        </div>
      </section>

      <ForceMapModal
        node={selectedNode}
        open={!!selectedNode}
        onOpenChange={(open) => {
          if (!open) setSelectedNodeId(null);
        }}
      />
    </div>
  );
}

function OperationalRules() {
  const rules = [
    {
      title: "Território obrigatório",
      text: "RJ é analisado por cidade. Maricá é analisada por bairro e distrito.",
    },
    {
      title: "Papel no organograma",
      text: "Cada cadastro entra como coordenação geral, coordenação RJ, coordenação Maricá ou liderança.",
    },
    {
      title: "Estimativa mensal",
      text: "Apoio estimado, votos mínimos e votos máximos são atualizados mês a mês.",
    },
    {
      title: "Centro de custos",
      text: "Custo base, teto e eventual extra permitem comparar eficiência por território.",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {rules.map((rule, index) => (
        <div key={rule.title} className="rounded-lg border border-blue-100 bg-white/85 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-extrabold text-white">{index + 1}</div>
            <div className="text-sm font-extrabold text-slate-950">{rule.title}</div>
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{rule.text}</p>
        </div>
      ))}
    </div>
  );
}

function DesktopFlow({
  levels,
  selectedNodeId,
  onSelect,
}: {
  levels: ForceNode[][];
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}) {
  let nodeIndex = 0;

  return (
    <div className="mx-auto flex min-w-[980px] flex-col items-center rounded-lg bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-7">
      {levels.map((level, levelIndex) => (
        <div key={`desktop-level-${levelIndex}`} className="flex flex-col items-center">
          {levelIndex > 0 ? <FlowConnector branch={level.length > 1} /> : null}
          <div className="relative flex items-stretch justify-center gap-4">
            {level.length > 1 ? <BranchConnector /> : null}
            {level.map((node) => {
              nodeIndex += 1;

              return (
                <div key={node.id} className="relative">
                  {level.length > 1 ? <div className="absolute left-1/2 top-[-22px] h-[22px] border-l-2 border-dashed border-blue-200" /> : null}
                  <FlowNodeCard
                    node={node}
                    index={nodeIndex}
                    selected={selectedNodeId === node.id}
                    onClick={() => onSelect(node.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileFlow({
  levels,
  selectedNodeId,
  onSelect,
}: {
  levels: ForceNode[][];
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}) {
  let nodeIndex = 0;

  return (
    <div className="rounded-lg bg-white px-2 py-2">
      {levels.map((level, levelIndex) => (
        <div key={`mobile-level-${levelIndex}`} className="flex flex-col items-center">
          {levelIndex > 0 ? <FlowConnector /> : null}
          <div className="grid w-full gap-3">
            {level.map((node) => {
              nodeIndex += 1;

              return (
                <FlowNodeCard
                  key={node.id}
                  node={node}
                  index={nodeIndex}
                  selected={selectedNodeId === node.id}
                  onClick={() => onSelect(node.id)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
