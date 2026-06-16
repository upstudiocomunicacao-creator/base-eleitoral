import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useCampaignSettings } from "@/hooks/useCampaignSettings";
import { listLeaderMonthlyMetrics } from "@/services/leaderMonthlyMetrics";
import { isLeadersSupabaseReady, listLeaders } from "@/services/leaders";
import type { CampaignSettings } from "@/services/campaigns";
import { BranchConnector, FlowConnector } from "./FlowConnector";
import { FlowNodeCard } from "./FlowNodeCard";
import { buildForceMapLevels, forceMapLevels } from "./forceMapData";
import { ForceMapModal } from "./ForceMapModal";
import { ForceMapStats } from "./ForceMapStats";
import type { ForceNode } from "./types";

export function ForceMapPage() {
  const { settings: campaignSettings } = useCampaignSettings();
  const [levels, setLevels] = useState(forceMapLevels);
  const [loading, setLoading] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("Modelo operacional");
  const [error, setError] = useState<string | null>(null);
  const campaignLevels = useMemo(() => applyCampaignSettingsToForceMap(levels, campaignSettings), [levels, campaignSettings]);
  const nodes = useMemo(() => campaignLevels.flat(), [campaignLevels]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  async function loadForceData() {
    setError(null);

    if (!isLeadersSupabaseReady()) {
      setSourceLabel("Modelo demonstrativo");
      setLevels(forceMapLevels);
      setError("Supabase não está configurado. O organograma está usando dados demonstrativos.");
      return;
    }

    setLoading(true);
    try {
      const [leaders, monthlyMetrics] = await Promise.all([listLeaders(), listLeaderMonthlyMetrics()]);
      setLevels(buildForceMapLevels({ leaders, monthlyMetrics }));
      setSourceLabel(leaders.length ? "Dados reais do Supabase" : "Sem cadastros reais ainda");
    } catch (err) {
      setLevels(forceMapLevels);
      setSourceLabel("Modelo demonstrativo");
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados reais do Mapa de Força.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadForceData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inteligência Territorial"
        title="Mapa de Força"
        description="Organograma enxuto da campanha: candidato, coordenação geral, coordenação RJ, bases Maricá, São Gonçalo e Niterói, lideranças, votos estimados, custos e leitura territorial."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-blue-700">{sourceLabel}</span>
            <Button variant="outline" onClick={() => void loadForceData()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
          </div>
        }
      />

      {error ? <ForceMapWarning message={error} /> : null}

      <ForceMapStats nodes={nodes} levels={campaignLevels} />

      <OperationalRules />

      <section className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
        <div className="hidden overflow-x-auto md:block">
          <DesktopFlow levels={campaignLevels} selectedNodeId={selectedNodeId} onSelect={setSelectedNodeId} />
        </div>

        <div className="md:hidden">
          <MobileFlow levels={campaignLevels} selectedNodeId={selectedNodeId} onSelect={setSelectedNodeId} />
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

function applyCampaignSettingsToForceMap(levels: ForceNode[][], campaign: CampaignSettings): ForceNode[][] {
  return levels.map((level) => level.map((node) => {
    if (node.id === "candidato") {
      return {
        ...node,
        title: campaign.candidateName || node.title,
        subtitle: `${campaign.office} - ${campaign.name}`,
        summary: `Visão consolidada da campanha de ${campaign.candidateName} para ${campaign.office}, separando ${campaign.mainState} por cidades e as bases municipais por bairros.`,
      };
    }

    if (node.id === "coordenacao-geral") {
      return {
        ...node,
        title: campaign.generalResponsible || node.title,
        subtitle: "Comando único das coordenações RJ e das bases municipais.",
      };
    }

    return node;
  }));
}

function ForceMapWarning({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <div className="font-extrabold">Mapa de Força em modo demonstrativo</div>
        <div className="text-amber-800">{message}</div>
      </div>
    </div>
  );
}

function OperationalRules() {
  const rules = [
    {
      title: "Território obrigatório",
      text: "RJ é analisado por cidade. Maricá, São Gonçalo e Niterói são analisados por bairro e distrito/região.",
    },
    {
      title: "Papel no organograma",
      text: "Cada cadastro entra como coordenação geral, coordenação RJ, coordenação de base municipal ou liderança.",
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
    <div className="mx-auto flex min-w-[1180px] flex-col items-center rounded-lg bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-7">
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
