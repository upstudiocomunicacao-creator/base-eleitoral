import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Layers,
  Loader2,
  MapPin,
  Network,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  computeOperationalSummary,
  getMaricaDistrictForNeighborhood,
  getMonthly,
  getRJRegionForCity,
  getRoleLabel,
  getScopeLabel,
  getTerritoryGroup,
  groupTerritoryPerformance,
  maricaDistricts,
  maricaNeighborhoods,
  minimalFields,
  operationalActors,
  operationalMonths,
  rjCities,
  rjRegions,
  type ForceActor,
  type ForceRole,
  type ForceStatus,
  type OperationalScope,
} from "@/services/operational";
import { createLeader, isLeadersSupabaseReady, listLeaders } from "@/services/leaders";
import { listLeaderMonthlyMetrics, upsertLeaderMonthlyMetric } from "@/services/leaderMonthlyMetrics";
import type { Leader, LeaderMonthlyMetric } from "@/types/database";

const statusTone: Record<string, string> = {
  Ativo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ["Atenção"]: "border-amber-200 bg-amber-50 text-amber-700",
  ["Prioritário"]: "border-blue-200 bg-blue-50 text-blue-700",
  Pendente: "border-rose-200 bg-rose-50 text-rose-700",
};

type MonthlyMetricDraft = {
  estimatedSupporters: number;
  minVotes: number;
  maxVotes: number;
  baseCost: number;
  ceilingCost: number;
  extraCost: number;
};

export default function Operacional() {
  const [month, setMonth] = useState(operationalMonths[0]);
  const [scope, setScope] = useState<OperationalScope>("marica");
  const [actors, setActors] = useState<ForceActor[]>(operationalActors);
  const [loadingRealData, setLoadingRealData] = useState(false);
  const [savingMonthly, setSavingMonthly] = useState(false);
  const [addingActor, setAddingActor] = useState(false);
  const [dataMessage, setDataMessage] = useState("Dados mockados de referência");
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    role: "leader" as ForceRole,
    scope: "marica" as OperationalScope,
    territory: "Centro",
    status: "Ativo",
    estimatedSupporters: "0",
    minVotes: "0",
    maxVotes: "0",
    baseCost: "0",
    ceilingCost: "0",
    extraCost: "0",
  });

  const summary = useMemo(() => computeOperationalSummary(actors, month), [actors, month]);
  const rjPerformance = useMemo(() => groupTerritoryPerformance(actors, month, "rj"), [actors, month]);
  const maricaPerformance = useMemo(() => groupTerritoryPerformance(actors, month, "marica"), [actors, month]);
  const scopedActors = useMemo(() => actors.filter((item) => item.scope === scope), [actors, scope]);
  const mapItems = scope === "marica" ? maricaPerformance : rjPerformance;

  async function loadRealLeaders() {
    if (!isLeadersSupabaseReady()) {
      setActors(operationalActors);
      setDataMessage("Supabase não configurado. Usando dados mockados de referência.");
      return;
    }

    setLoadingRealData(true);
    try {
      const [leaders, monthlyMetrics] = await Promise.all([
        listLeaders(),
        listLeaderMonthlyMetrics().catch(() => [] as LeaderMonthlyMetric[]),
      ]);
      if (!leaders.length) {
        setActors(operationalActors);
        setDataMessage("Nenhuma liderança real encontrada. Usando dados mockados de referência.");
        return;
      }

      setActors(leaders.map((leader) => leaderToOperationalActor(leader, monthlyMetrics)));
      setDataMessage(monthlyMetrics.length ? "Dados reais carregados com centro de custos mensal." : "Dados reais carregados de Lideranças. Custos mensais aguardam o centro de custos.");
    } catch {
      setActors(operationalActors);
      setDataMessage("Não foi possível carregar Lideranças reais. Usando dados mockados de referência.");
    } finally {
      setLoadingRealData(false);
    }
  }

  useEffect(() => {
    void loadRealLeaders();
  }, []);

  async function addActor() {
    if (!draft.name.trim() || !draft.phone.trim() || !draft.territory.trim()) return;
    const isMarica = draft.scope === "marica";
    const minVotes = Number(draft.minVotes) || 0;
    const maxVotes = Number(draft.maxVotes) || minVotes;
    const estimatedSupporters = Number(draft.estimatedSupporters) || Math.max(maxVotes, minVotes);
    const baseCost = Number(draft.baseCost) || 0;
    const ceilingCost = Number(draft.ceilingCost) || baseCost;
    const extraCost = Number(draft.extraCost) || 0;
    const monthly = operationalMonths.map((item) => ({ month: item, estimatedSupporters, minVotes, maxVotes, baseCost, ceilingCost, extraCost }));

    if (!isLeadersSupabaseReady()) {
      setActors((current) => [
        {
          id: `local-${Date.now()}`,
          name: draft.name.trim(),
          phone: draft.phone.trim(),
          role: draft.role,
          scope: draft.scope,
          territory: draft.territory,
          city: isMarica ? "Maricá" : draft.territory,
          neighborhood: isMarica ? draft.territory : undefined,
          region: isMarica ? undefined : getRJRegionForCity(draft.territory),
          district: isMarica ? getMaricaDistrictForNeighborhood(draft.territory) : undefined,
          status: draft.status as ForceActor["status"],
          notes: "Cadastro criado no modo operacional.",
          monthly,
        },
        ...current,
      ]);
      setDataMessage("Cadastro local criado. Configure o Supabase para gravar dados reais.");
      resetDraft();
      return;
    }

    if (maxVotes < minVotes) {
      toast({ title: "Revise os votos", description: "O voto máximo não pode ser menor que o voto mínimo.", variant: "destructive" });
      return;
    }

    if (ceilingCost < baseCost) {
      toast({ title: "Revise os custos", description: "O custo teto não pode ser menor que o custo base.", variant: "destructive" });
      return;
    }

    setAddingActor(true);
    try {
      const savedLeader = await createLeader({
        full_name: draft.name.trim(),
        political_nickname: null,
        phone: draft.phone.trim(),
        email: null,
        leader_type: getLeaderTypeForRole(draft.role),
        status: draft.status,
        neighborhood: isMarica ? draft.territory : "Todos",
        city: isMarica ? "Maricá" : draft.territory,
        state: "RJ",
        territory_region: isMarica ? getMaricaDistrictForNeighborhood(draft.territory) : getRJRegionForCity(draft.territory),
        geographic_precision: "Baixa",
        internal_responsible: "Modo Operacional",
        registered_supporters: estimatedSupporters,
        estimated_direct_supporters: 0,
        estimated_indirect_supporters: 0,
        declared_votes: maxVotes,
        validated_votes: minVotes,
        confidence_level: "Médio",
        estimate_source: "Cadastro operacional",
        proof_type: "Atualização manual",
        last_update: new Date().toISOString().slice(0, 10),
        next_action: "Acompanhar evolução mensal",
        notes: "Cadastro mínimo criado pelo modo operacional.",
      });

      const savedMetric = await upsertLeaderMonthlyMetric({
        leader_id: savedLeader.id,
        month_ref: monthToDate(month),
        estimated_supporters: estimatedSupporters,
        min_votes: minVotes,
        max_votes: maxVotes,
        base_cost: baseCost,
        ceiling_cost: ceilingCost,
        extra_cost: extraCost,
      });

      setActors((current) => [leaderToOperationalActor(savedLeader, [savedMetric]), ...current.filter((item) => item.id !== savedLeader.id)]);
      setDataMessage("Cadastro e métrica mensal salvos no Supabase.");
      toast({ title: "Cadastro salvo", description: "O registro já entrou no modo operacional e nas métricas do mês." });
      resetDraft();
    } catch (error) {
      const description = error instanceof Error ? error.message : "Não foi possível salvar o cadastro operacional.";
      toast({ title: "Não foi possível cadastrar", description, variant: "destructive" });
    } finally {
      setAddingActor(false);
    }
  }

  function resetDraft() {
    setDraft((current) => ({ ...current, name: "", phone: "", estimatedSupporters: "0", minVotes: "0", maxVotes: "0", baseCost: "0", ceilingCost: "0", extraCost: "0" }));
  }

  async function saveMonthlyMetric(actorId: string, values: MonthlyMetricDraft) {
    const actor = actors.find((item) => item.id === actorId);
    if (!actor) return;

    if (values.maxVotes < values.minVotes) {
      toast({ title: "Revise os votos", description: "O voto máximo não pode ser menor que o voto mínimo.", variant: "destructive" });
      return;
    }

    if (values.ceilingCost < values.baseCost) {
      toast({ title: "Revise os custos", description: "O custo teto não pode ser menor que o custo base.", variant: "destructive" });
      return;
    }

    if (actor.id.startsWith("local-")) {
      toast({ title: "Cadastro local", description: "Cadastros temporários precisam ser criados em Lideranças antes de salvar custos mensais." });
      return;
    }

    setSavingMonthly(true);
    try {
      const saved = await upsertLeaderMonthlyMetric({
        leader_id: actor.id,
        month_ref: monthToDate(month),
        estimated_supporters: values.estimatedSupporters,
        min_votes: values.minVotes,
        max_votes: values.maxVotes,
        base_cost: values.baseCost,
        ceiling_cost: values.ceilingCost,
        extra_cost: values.extraCost,
      });

      setActors((current) => current.map((item) => {
        if (item.id !== actor.id) return item;
        return {
          ...item,
          monthly: item.monthly.map((row) => row.month === month ? {
            ...row,
            estimatedSupporters: saved.estimated_supporters,
            minVotes: saved.min_votes,
            maxVotes: saved.max_votes,
            baseCost: Number(saved.base_cost),
            ceilingCost: Number(saved.ceiling_cost),
            extraCost: Number(saved.extra_cost),
          } : row),
        };
      }));

      setDataMessage("Centro de custos mensal salvo com sucesso.");
      toast({ title: "Mês salvo", description: "Votos e custos foram atualizados no Supabase." });
    } catch (error) {
      const description = error instanceof Error
        ? error.message
        : "Confira se o SQL supabase/refresh-leader-monthly-metrics.sql já foi rodado no Supabase.";
      toast({ title: "Não foi possível salvar", description, variant: "destructive" });
    } finally {
      setSavingMonthly(false);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Modo operacional"
        title="Campanha enxuta por território"
        description="Leitura simplificada por cidades do RJ e bairros de Maricá, com mapa de força, votos estimados e centro de custos mensal."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="bg-white" onClick={() => void loadRealLeaders()} disabled={loadingRealData}>
              {loadingRealData ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Atualizar dados
            </Button>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operationalMonths.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
        {dataMessage}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        <MetricCard label="Coord. RJ" value={summary.coordinatorsRJ} icon={Building2} tone="blue" />
        <MetricCard label="Coord. Maricá" value={summary.coordinatorsMarica} icon={MapPin} tone="emerald" />
        <MetricCard label="Lideranças" value={summary.leaders} icon={Users} tone="violet" />
        <MetricCard label="Apoio estimado" value={summary.estimatedSupporters} icon={ClipboardList} tone="blue" />
        <MetricCard label="Votos mín." value={summary.minVotes} icon={Target} tone="green" />
        <MetricCard label="Votos máx." value={summary.maxVotes} icon={TrendingUp} tone="cyan" />
        <MetricCard label="Custo teto" value={currency(summary.ceilingCost + summary.extraCost)} icon={CircleDollarSign} tone="amber" />
      </div>

      <Tabs defaultValue="dashboard" className="space-y-5">
        <TabsList className="grid h-auto grid-cols-2 gap-2 bg-white/80 p-1 shadow-sm md:grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="forca">Mapa de força</TabsTrigger>
          <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
          <TabsTrigger value="mapas">Mapas</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <ChartCard title="Potencial por cidade do RJ" description="Votos mínimos e máximos cadastrados manualmente">
              <TerritoryChart rows={rjPerformance} />
            </ChartCard>
            <ExecutiveReading summary={summary} />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <ChartCard title="Potencial por bairro de Maricá" description="Base eleitoral do domicílio do candidato">
              <TerritoryChart rows={maricaPerformance} />
            </ChartCard>
            <TerritoryStructureCard />
          </div>
          <MinimumDataCard />
        </TabsContent>

        <TabsContent value="forca">
          <ForceMap actors={actors} month={month} />
        </TabsContent>

        <TabsContent value="cadastros">
          <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <CadastroRapido draft={draft} setDraft={setDraft} onAdd={addActor} saving={addingActor} />
            <ActorsTable actors={actors} month={month} />
          </div>
        </TabsContent>

        <TabsContent value="mapas">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="premium-card">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Mapa estratégico enxuto</CardTitle>
                  <p className="text-sm font-medium text-slate-500">Use RJ para cidades e Maricá para bairros.</p>
                </div>
                <Select value={scope} onValueChange={(value) => setScope(value as OperationalScope)}>
                  <SelectTrigger className="w-48 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marica">Maricá por bairros</SelectItem>
                    <SelectItem value="rj">RJ por cidades</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <StrategicBubbleMap scope={scope} rows={mapItems} actors={scopedActors} />
              </CardContent>
            </Card>
            <MapRanking rows={mapItems} scope={scope} />
          </div>
        </TabsContent>

        <TabsContent value="analises">
          <div className="grid gap-5 xl:grid-cols-3">
            <AnalysisCard title="Custo por voto mínimo" value={currency(summary.costPerMinVote)} helper="Custo base + extras dividido pelo piso de votos." />
            <AnalysisCard title="Custo por voto máximo" value={currency(summary.costPerMaxVote)} helper="Teto + extras dividido pelo potencial máximo." />
            <AnalysisCard title="Conversão estimada" value={`${summary.minVoteConversion}% a ${summary.maxVoteConversion}%`} helper="Apoio estimado convertido em votos." />
            <AnalysisCard title="Registros sem mapa" value={summary.withoutCoordinates.toString()} helper="Cadastros que precisam de latitude e longitude." />
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <CorrelationCard actors={actors} month={month} />
            <PriorityCard rows={[...rjPerformance, ...maricaPerformance]} />
          </div>
        </TabsContent>

        <TabsContent value="custos">
          <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
            <MonthlyCostEditor actors={actors} month={month} saving={savingMonthly} onSave={saveMonthlyMetric} />
            <CostsTable actors={actors} month={month} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm font-medium text-slate-500">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TerritoryChart({ rows }: { rows: Array<{ territory: string; minVotes: number; maxVotes: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows.slice(0, 8)} margin={{ left: -20, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="territory" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => Number(value).toLocaleString("pt-BR")} />
        <Bar dataKey="minVotes" name="Mínimo" fill="#2563eb" radius={[6, 6, 0, 0]} />
        <Bar dataKey="maxVotes" name="Máximo" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ExecutiveReading({ summary }: { summary: ReturnType<typeof computeOperationalSummary> }) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Leitura executiva</CardTitle>
        <p className="text-sm font-medium text-slate-500">Resumo do mês selecionado.</p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm font-medium leading-6 text-slate-600">
        <p>A campanha está organizada em {summary.territories} territórios, com leitura separada para RJ e Maricá.</p>
        <p>O apoio entra apenas como número estimado: <strong>{summary.estimatedSupporters.toLocaleString("pt-BR")}</strong> para conversão em voto.</p>
        <p>O piso mensal cadastrado é de <strong>{summary.minVotes.toLocaleString("pt-BR")} votos</strong> e o teto é de <strong>{summary.maxVotes.toLocaleString("pt-BR")} votos</strong>.</p>
        <p>A conversão estimada fica entre <strong>{summary.minVoteConversion}%</strong> e <strong>{summary.maxVoteConversion}%</strong> do apoio informado.</p>
        <p>O custo operacional mensal fica entre <strong>{currency(summary.baseCost)}</strong> e <strong>{currency(summary.ceilingCost + summary.extraCost)}</strong>, com custo por voto máximo estimado em <strong>{currency(summary.costPerMaxVote)}</strong>.</p>
      </CardContent>
    </Card>
  );
}

function MinimumDataCard() {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Campos mínimos de cadastro</CardTitle>
        <p className="text-sm font-medium text-slate-500">O suficiente para mapa, indicadores e custos funcionarem.</p>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {minimalFields.map((field) => (
          <div key={field} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
            {field}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TerritoryStructureCard() {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Base territorial oficial</CardTitle>
        <p className="text-sm font-medium text-slate-500">RJ por regiões e Maricá por distritos.</p>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="text-xs font-black uppercase tracking-[0.12em] text-blue-600">Estado do RJ</div>
          <div className="mt-1 text-2xl font-black text-slate-950">8 regiões · {rjCities.length} cidades</div>
          <div className="mt-3 grid gap-2">
            {rjRegions.map((region) => (
              <div key={region.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700">
                <span>{region.name}</span>
                <span>{region.cities.length}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Maricá</div>
          <div className="mt-1 text-2xl font-black text-slate-950">4 distritos · {maricaNeighborhoods.length} bairros</div>
          <div className="mt-3 grid gap-2">
            {maricaDistricts.map((district) => (
              <div key={district.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700">
                <span>{district.name}</span>
                <span>{district.neighborhoods.length}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ForceMap({ actors, month }: { actors: ForceActor[]; month: string }) {
  const general = actors.filter((item) => item.role !== "leader");
  const leaders = actors.filter((item) => item.role === "leader");

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Organograma territorial simplificado</CardTitle>
        <p className="text-sm font-medium text-slate-500">Candidato → Coordenação Geral → Coordenações RJ/Maricá → Lideranças.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="mx-auto max-w-sm rounded-xl border border-blue-100 bg-blue-50 p-4 text-center shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.12em] text-blue-600">Candidato</div>
          <div className="mt-1 text-xl font-black text-slate-950">Base Eleitoral 360</div>
        </div>
        <Connector />
        <div className="mx-auto max-w-sm rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Coordenação Geral</div>
          <div className="mt-1 text-lg font-black text-slate-950">Comando da campanha</div>
        </div>
        <Connector />
        <div className="grid gap-4 lg:grid-cols-2">
          <CoordinationColumn title="Coordenação RJ" subtitle="Coordenadores por município" actors={general.filter((item) => item.role === "coord_rj")} month={month} />
          <CoordinationColumn title="Coordenação Maricá" subtitle="Coordenadores por bairro" actors={general.filter((item) => item.role === "coord_marica")} month={month} />
        </div>
        <Connector />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leaders.map((item) => <ActorCard key={item.id} actor={item} month={month} compact />)}
        </div>
      </CardContent>
    </Card>
  );
}

function CoordinationColumn({ title, subtitle, actors, month }: { title: string; subtitle: string; actors: ForceActor[]; month: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-lg font-black text-slate-950">{title}</div>
        <div className="text-sm font-semibold text-slate-500">{subtitle}</div>
      </div>
      <div className="space-y-3">
        {actors.map((item) => <ActorCard key={item.id} actor={item} month={month} />)}
      </div>
    </div>
  );
}

function ActorCard({ actor, month, compact = false }: { actor: ForceActor; month: string; compact?: boolean }) {
  const monthly = getMonthly(actor, month);
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-slate-950">{actor.name}</div>
          <div className="text-xs font-bold text-slate-500">{getRoleLabel(actor.role)} - {actor.territory}</div>
          <div className="text-[11px] font-semibold text-slate-400">{getTerritoryGroup(actor)}</div>
        </div>
        <StatusBadge status={actor.status} />
      </div>
      {!compact ? (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <MiniStat label="mín." value={monthly.minVotes} />
          <MiniStat label="máx." value={monthly.maxVotes} />
          <MiniStat label="custo" value={currency(monthly.baseCost)} />
        </div>
      ) : null}
    </div>
  );
}

function CadastroRapido({ draft, setDraft, onAdd, saving }: { draft: Record<string, string>; setDraft: (value: any) => void; onAdd: () => void; saving: boolean }) {
  const territories = draft.scope === "marica" ? maricaNeighborhoods : rjCities;
  const setRole = (value: string) => {
    const nextScope = value === "coord_rj" ? "rj" : value === "coord_marica" ? "marica" : draft.scope;
    setDraft({
      ...draft,
      role: value,
      scope: nextScope,
      territory: nextScope === "marica" ? "Centro" : "Niterói",
    });
  };

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Cadastro mínimo</CardTitle>
        <p className="text-sm font-medium text-slate-500">Focado em mapa, métricas e custos.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field label="Nome"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
        <Field label="Telefone/WhatsApp"><Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <Select value={draft.role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="coord_rj">Coord. RJ</SelectItem>
                <SelectItem value="coord_marica">Coord. Maricá</SelectItem>
                <SelectItem value="leader">Liderança</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Recorte">
            <Select value={draft.scope} onValueChange={(value) => setDraft({ ...draft, scope: value, territory: value === "marica" ? "Centro" : "Niterói", role: value === "marica" && draft.role === "coord_rj" ? "coord_marica" : value === "rj" && draft.role === "coord_marica" ? "coord_rj" : draft.role })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="marica">Maricá</SelectItem>
                <SelectItem value="rj">RJ</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label={draft.scope === "marica" ? "Bairro" : "Cidade"}>
          <Select value={draft.territory} onValueChange={(value) => setDraft({ ...draft, territory: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-80">{territories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
          {draft.scope === "marica"
            ? `Distrito: ${getMaricaDistrictForNeighborhood(draft.territory)}`
            : `Região: ${getRJRegionForCity(draft.territory)}`}
        </div>
        <Field label="Status">
          <Select value={draft.status} onValueChange={(value) => setDraft({ ...draft, status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Atenção">Atenção</SelectItem>
              <SelectItem value="Prioritário">Prioritário</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Apoio estimado">
          <Input type="number" value={draft.estimatedSupporters} onChange={(e) => setDraft({ ...draft, estimatedSupporters: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Votos mín."><Input type="number" value={draft.minVotes} onChange={(e) => setDraft({ ...draft, minVotes: e.target.value })} /></Field>
          <Field label="Votos máx."><Input type="number" value={draft.maxVotes} onChange={(e) => setDraft({ ...draft, maxVotes: e.target.value })} /></Field>
          <Field label="Custo mín."><Input type="number" value={draft.baseCost} onChange={(e) => setDraft({ ...draft, baseCost: e.target.value })} /></Field>
          <Field label="Custo máx."><Input type="number" value={draft.ceilingCost} onChange={(e) => setDraft({ ...draft, ceilingCost: e.target.value })} /></Field>
        </div>
        <Field label="Custo extra eventual"><Input type="number" value={draft.extraCost} onChange={(e) => setDraft({ ...draft, extraCost: e.target.value })} /></Field>
        <Button className="w-full" onClick={onAdd} disabled={saving || !draft.name.trim() || !draft.phone.trim()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Salvar cadastro operacional
        </Button>
      </CardContent>
    </Card>
  );
}

function ActorsTable({ actors, month }: { actors: ForceActor[]; month: string }) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader>
        <CardTitle>Cadastros operacionais</CardTitle>
        <p className="text-sm font-medium text-slate-500">Lista mínima para execução mensal.</p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            <tr>
              {["Nome", "Tipo", "Território", "Região/Distrito", "Status", "Apoio", "Votos mín.", "Votos máx.", "Custo mín.", "Custo máx.", "Mapa"].map((item) => <th key={item} className="px-4 py-3">{item}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {actors.map((actor) => {
              const monthly = getMonthly(actor, month);
              return (
                <tr key={actor.id} className="bg-white">
                  <td className="px-4 py-3 font-black text-slate-900">{actor.name}<div className="text-xs font-semibold text-slate-400">{actor.phone}</div></td>
                  <td className="px-4 py-3 font-bold text-slate-600">{getRoleLabel(actor.role)}</td>
                  <td className="px-4 py-3 font-bold text-slate-600">{actor.territory}<div className="text-xs font-semibold text-slate-400">{getScopeLabel(actor.scope)}</div></td>
                  <td className="px-4 py-3 font-bold text-slate-600">{getTerritoryGroup(actor)}</td>
                  <td className="px-4 py-3"><StatusBadge status={actor.status} /></td>
                  <td className="px-4 py-3 font-bold">{monthly.estimatedSupporters.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 font-bold">{monthly.minVotes.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 font-bold">{monthly.maxVotes.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 font-bold">{currency(monthly.baseCost)}</td>
                  <td className="px-4 py-3 font-bold">{currency(monthly.ceilingCost + monthly.extraCost)}</td>
                  <td className="px-4 py-3">{actor.latitude && actor.longitude ? "Pronto" : "Pendente"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function StrategicBubbleMap({ scope, rows, actors }: { scope: OperationalScope; rows: Array<{ territory: string; maxVotes: number; cost: number; actors: number }>; actors: ForceActor[] }) {
  const maxVotes = Math.max(...rows.map((item) => item.maxVotes), 1);

  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(135deg,#eff6ff,#f8fafc_45%,#ecfdf5)] p-5">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="relative z-10 mb-4 inline-flex rounded-xl border border-white bg-white/85 px-4 py-3 shadow-sm">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{scope === "marica" ? "Município de Maricá" : "Estado do RJ"}</div>
          <div className="text-xl font-black text-slate-950">{rows.length} {scope === "marica" ? "bairros" : "cidades"}</div>
        </div>
      </div>
      <div className="relative z-10 grid min-h-[420px] grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {rows.map((item, index) => {
          const size = 92 + Math.round((item.maxVotes / maxVotes) * 58);
          return (
            <button
              key={item.territory}
              className="place-self-center rounded-full border-2 border-white bg-white/90 p-3 text-center shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              style={{ width: size, height: size }}
            >
              <div className="text-xs font-black text-slate-950">{item.territory}</div>
              <div className="mt-1 text-[11px] font-black uppercase text-blue-600">{item.maxVotes.toLocaleString("pt-BR")} votos</div>
              <Badge className={index < 3 ? "mt-1 bg-emerald-500" : "mt-1 bg-blue-600"}>{item.actors} cad.</Badge>
            </button>
          );
        })}
      </div>
      <div className="relative z-10 mt-4 rounded-lg bg-white/85 p-3 text-xs font-bold text-slate-500">
        {actors.filter((item) => !item.latitude || !item.longitude).length} cadastros ainda precisam de coordenadas para entrar no mapa real.
      </div>
    </div>
  );
}

function MapRanking({ rows, scope }: { rows: Array<{ territory: string; maxVotes: number; cost: number; actors: number }>; scope: OperationalScope }) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Ranking territorial</CardTitle>
        <p className="text-sm font-medium text-slate-500">{getScopeLabel(scope)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.slice(0, 8).map((item, index) => (
          <div key={item.territory} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-black">{index + 1}</div>
              <div>
                <div className="font-black text-slate-950">{item.territory}</div>
                <div className="text-xs font-bold text-slate-400">{item.actors} cadastros</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-blue-600">{item.maxVotes.toLocaleString("pt-BR")}</div>
              <div className="text-xs font-bold text-slate-400">{currency(item.cost)}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MonthlyCostEditor({ actors, month, saving, onSave }: { actors: ForceActor[]; month: string; saving: boolean; onSave: (actorId: string, values: MonthlyMetricDraft) => void }) {
  const firstActorId = actors[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(firstActorId);
  const selected = actors.find((item) => item.id === selectedId) ?? actors[0];
  const monthly = selected ? getMonthly(selected, month) : null;
  const [draft, setDraft] = useState<MonthlyMetricDraft>(() => toMonthlyDraft(monthly));
  const minTotal = draft.baseCost + draft.extraCost;
  const maxTotal = draft.ceilingCost + draft.extraCost;
  const costPerMinVote = draft.minVotes ? Math.round(minTotal / draft.minVotes) : 0;
  const costPerMaxVote = draft.maxVotes ? Math.round(maxTotal / draft.maxVotes) : 0;
  const hasInvalidRange = draft.maxVotes < draft.minVotes || draft.ceilingCost < draft.baseCost;

  useEffect(() => {
    if (!selectedId && firstActorId) setSelectedId(firstActorId);
  }, [firstActorId, selectedId]);

  useEffect(() => {
    setDraft(toMonthlyDraft(monthly));
  }, [selectedId, month, monthly]);

  if (!selected || !monthly) {
    return (
      <Card className="premium-card">
        <CardHeader>
          <CardTitle>Editar mês</CardTitle>
          <p className="text-sm font-medium text-slate-500">Cadastre lideranças para editar custos.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Editar mês</CardTitle>
        <p className="text-sm font-medium text-slate-500">{month} · votos, apoio estimado e centro de custos.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field label="Cadastro">
          <Select value={selected.id} onValueChange={setSelectedId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-80">
              {actors.map((actor) => <SelectItem key={actor.id} value={actor.id}>{actor.name} · {actor.territory}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          {getRoleLabel(selected.role)} · {getTerritoryGroup(selected)}
        </div>
        <Field label="Apoio estimado">
          <Input type="number" min={0} value={draft.estimatedSupporters} onChange={(event) => setDraft({ ...draft, estimatedSupporters: Number(event.target.value || 0) })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Votos mínimos">
            <Input type="number" min={0} value={draft.minVotes} onChange={(event) => setDraft({ ...draft, minVotes: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Votos máximos">
            <Input type="number" min={0} value={draft.maxVotes} onChange={(event) => setDraft({ ...draft, maxVotes: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Custo base">
            <Input type="number" min={0} value={draft.baseCost} onChange={(event) => setDraft({ ...draft, baseCost: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Custo teto">
            <Input type="number" min={0} value={draft.ceilingCost} onChange={(event) => setDraft({ ...draft, ceilingCost: Number(event.target.value || 0) })} />
          </Field>
        </div>
        <Field label="Custo extra eventual">
          <Input type="number" min={0} value={draft.extraCost} onChange={(event) => setDraft({ ...draft, extraCost: Number(event.target.value || 0) })} />
        </Field>
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-center">
          <MiniStat label="total base" value={currency(minTotal)} />
          <MiniStat label="total teto" value={currency(maxTotal)} />
          <MiniStat label="R$/voto mín." value={costPerMinVote ? currency(costPerMinVote) : "-"} />
          <MiniStat label="R$/voto máx." value={costPerMaxVote ? currency(costPerMaxVote) : "-"} />
        </div>
        {hasInvalidRange ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
            Confira os intervalos: voto máximo deve ser maior ou igual ao mínimo, e custo teto deve ser maior ou igual ao custo base.
          </div>
        ) : null}
        <Button className="w-full" onClick={() => onSave(selected.id, draft)} disabled={saving || hasInvalidRange}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleDollarSign className="h-4 w-4" />}
          Salvar mês
        </Button>
        <p className="text-xs font-semibold leading-5 text-slate-500">
          Para gravar no Supabase, rode antes o SQL de centro de custos mensal. Sem isso, a tela mantém a projeção local.
        </p>
      </CardContent>
    </Card>
  );
}

function CostsTable({ actors, month }: { actors: ForceActor[]; month: string }) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader>
        <CardTitle>Centro de custos mensal</CardTitle>
        <p className="text-sm font-medium text-slate-500">Custo base, teto e despesas extras por coordenação/liderança.</p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            <tr>{["Cadastro", "Território", "Base", "Teto", "Extra", "Total mínimo", "Total teto"].map((item) => <th key={item} className="px-4 py-3">{item}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {actors.map((actor) => {
              const monthly = getMonthly(actor, month);
              return (
                <tr key={actor.id} className="bg-white">
                  <td className="px-4 py-3 font-black">{actor.name}</td>
                  <td className="px-4 py-3 font-bold text-slate-600">{actor.territory}</td>
                  <td className="px-4 py-3">{currency(monthly.baseCost)}</td>
                  <td className="px-4 py-3">{currency(monthly.ceilingCost)}</td>
                  <td className="px-4 py-3">{currency(monthly.extraCost)}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">{currency(monthly.baseCost + monthly.extraCost)}</td>
                  <td className="px-4 py-3 font-black text-blue-700">{currency(monthly.ceilingCost + monthly.extraCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CorrelationCard({ actors, month }: { actors: ForceActor[]; month: string }) {
  const rows = actors.map((actor) => {
    const monthly = getMonthly(actor, month);
    return {
      name: actor.territory,
      cost: monthly.ceilingCost + monthly.extraCost,
      votes: monthly.maxVotes,
      efficiency: monthly.maxVotes ? Math.round((monthly.ceilingCost + monthly.extraCost) / monthly.maxVotes) : 0,
    };
  }).sort((a, b) => a.efficiency - b.efficiency).slice(0, 8);

  return (
    <ChartCard title="Correlação custo x votos" description="Menor custo por voto máximo estimado">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows} margin={{ left: -20, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => currency(Number(value))} />
          <Bar dataKey="efficiency" name="R$/voto">
            {rows.map((_, index) => <Cell key={index} fill={index < 3 ? "#10b981" : "#2563eb"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function PriorityCard({ rows }: { rows: Array<{ territory: string; minVotes: number; maxVotes: number; cost: number; actors: number }> }) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Prioridades sugeridas</CardTitle>
        <p className="text-sm font-medium text-slate-500">Territórios com alto potencial e pouca base cadastrada.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows
          .map((item) => ({ ...item, score: Math.round(item.maxVotes / Math.max(item.actors, 1)) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((item) => (
            <div key={item.territory} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-black text-slate-950">{item.territory}</div>
                <Badge variant="outline">Prioridade</Badge>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="cad." value={item.actors} />
                <MiniStat label="pot." value={item.maxVotes} />
                <MiniStat label="Índice" value={item.score} />
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

function AnalysisCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Card className="premium-card">
      <CardContent className="p-5">
        <div className="text-sm font-bold text-slate-500">{title}</div>
        <div className="mt-2 text-3xl font-black text-slate-950">{value}</div>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${statusTone[status] ?? statusTone.Ativo}`}>{status}</span>;
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-white px-2 py-2">
      <div className="text-[10px] font-black uppercase text-slate-400">{label}</div>
      <div className="text-sm font-black text-slate-950">{typeof value === "number" ? value.toLocaleString("pt-BR") : value}</div>
    </div>
  );
}

function Connector() {
  return <div className="mx-auto h-8 w-px bg-gradient-to-b from-blue-200 to-emerald-200" />;
}

function leaderToOperationalActor(leader: Leader, monthlyMetrics: LeaderMonthlyMetric[] = []): ForceActor {
  const city = leader.city || "Maricá";
  const isMarica = normalizeText(city) === "marica";
  const scope: OperationalScope = isMarica ? "marica" : "rj";
  const territory = isMarica ? leader.neighborhood || "Centro" : city;
  const type = normalizeText(leader.leader_type);
  const role: ForceRole = type.includes("coord") ? (isMarica ? "coord_marica" : "coord_rj") : "leader";
  const estimatedSupporters = Number(leader.registered_supporters ?? 0) + Number(leader.estimated_direct_supporters ?? 0) + Number(leader.estimated_indirect_supporters ?? 0);
  const declaredVotes = Number(leader.declared_votes ?? 0);
  const validatedVotes = Number(leader.validated_votes ?? 0);
  const minVotes = validatedVotes || Math.round(declaredVotes * 0.6);
  const maxVotes = declaredVotes || estimatedSupporters;

  const metricsByMonth = monthlyMetrics.filter((item) => item.leader_id === leader.id);

  return {
    id: leader.id,
    name: leader.full_name,
    phone: leader.phone,
    role,
    scope,
    territory,
    city,
    neighborhood: isMarica ? territory : undefined,
    region: isMarica ? undefined : getRJRegionForCity(city),
    district: isMarica ? getMaricaDistrictForNeighborhood(territory) : undefined,
    status: toForceStatus(leader.status),
    latitude: leader.latitude ?? undefined,
    longitude: leader.longitude ?? undefined,
    notes: leader.notes ?? undefined,
    monthly: operationalMonths.map((item) => {
      const metric = metricsByMonth.find((row) => formatMetricMonth(row.month_ref) === item);
      return {
        month: item,
        estimatedSupporters: metric?.estimated_supporters ?? estimatedSupporters,
        minVotes: metric?.min_votes ?? minVotes,
        maxVotes: metric?.max_votes ?? maxVotes,
        baseCost: Number(metric?.base_cost ?? 0),
        ceilingCost: Number(metric?.ceiling_cost ?? 0),
        extraCost: Number(metric?.extra_cost ?? 0),
      };
    }),
  };
}

function getLeaderTypeForRole(role: ForceRole) {
  if (role === "coord_rj") return "Coordenação RJ";
  if (role === "coord_marica") return "Coordenação Maricá";
  return "Liderança";
}

function toMonthlyDraft(monthly: ReturnType<typeof getMonthly> | null): MonthlyMetricDraft {
  return {
    estimatedSupporters: monthly?.estimatedSupporters ?? 0,
    minVotes: monthly?.minVotes ?? 0,
    maxVotes: monthly?.maxVotes ?? 0,
    baseCost: monthly?.baseCost ?? 0,
    ceilingCost: monthly?.ceilingCost ?? 0,
    extraCost: monthly?.extraCost ?? 0,
  };
}

function monthToDate(month: string) {
  const [label, year] = month.split("/");
  const monthIndex = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"].indexOf(normalizeText(label).slice(0, 3));
  const fullYear = 2000 + Number(year || "26");
  return `${fullYear}-${String(Math.max(monthIndex, 0) + 1).padStart(2, "0")}-01`;
}

function formatMetricMonth(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${capitalize(month)}/${String(date.getFullYear()).slice(-2)}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toForceStatus(status: string): ForceStatus {
  const normalized = normalizeText(status);
  if (normalized.includes("atencao")) return "Atenção";
  if (normalized.includes("prior")) return "Prioritário";
  if (normalized.includes("pend") || normalized.includes("validacao")) return "Pendente";
  return "Ativo";
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

