import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Eye,
  Filter,
  Flag,
  Landmark,
  Loader2,
  MapPin,
  MapPinned,
  Radar,
  RefreshCw,
  Route,
  Target,
  TrendingUp,
  Users,
  Vote,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  buildComparisonComputed,
  getElectoralComparisonData,
  isElectoralComparisonSupabaseReady,
  type ComparisonComputed,
  type RegionalComparisonRow,
} from "@/services/electoralComparison";

type Filters = {
  state: string;
  city: string;
  neighborhood: string;
  zone: string;
  section: string;
  votingPlace: string;
  leader: string;
  responsible: string;
  priority: string;
  votersRange: string;
  coverageRange: string;
  validatedRange: string;
  distanceRange: string;
  status: string;
  period: string;
};

const emptyFilters: Filters = {
  state: "todos",
  city: "todos",
  neighborhood: "todos",
  zone: "todos",
  section: "todos",
  votingPlace: "todos",
  leader: "todos",
  responsible: "todos",
  priority: "todos",
  votersRange: "todos",
  coverageRange: "todos",
  validatedRange: "todos",
  distanceRange: "todos",
  status: "todos",
  period: "todos",
};

type TooltipPayload = {
  color?: string;
  name: string;
  value: number;
};

export default function Comparativo() {
  const [data, setData] = useState<ComparisonComputed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<RegionalComparisonRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  async function loadComparison() {
    setLoading(true);
    setError(null);

    if (!isElectoralComparisonSupabaseReady()) {
      setData(null);
      setError("Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar o comparativo real.");
      setLoading(false);
      return;
    }

    try {
      setData(await getElectoralComparisonData());
    } catch (err) {
      setData(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadComparison();
  }, []);

  const filteredRows = useMemo(() => data ? data.rows.filter((row) => matchesFilters(row, filters)) : [], [data, filters]);
  const computed = useMemo(() => data ? buildComparisonComputed(filteredRows, data.warnings) : null, [data, filteredRows]);
  const options = useMemo(() => buildOptions(data?.rows ?? []), [data]);

  function openDetails(record: RegionalComparisonRow) {
    setSelected(record);
    setDetailsOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comparativo Eleitoral"
        title="Central de Decisão Territorial"
        description={`${filteredRows.length} regiões no recorte atual - cruzamento real entre eleitores, lideranças, apoiadores, prospecção, demandas, agenda e zonas.`}
        actions={
          <Button variant="outline" onClick={() => void loadComparison()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        }
      />

      {error ? <ConnectionWarning message={error} onRetry={() => void loadComparison()} /> : null}
      {computed?.warnings.length ? <WarningsPanel warnings={computed.warnings} /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <MetricCard label="Eleitores" value={computed?.summary.mappedVoters ?? 0} icon={Users} tone="blue" loading={loading} />
        <MetricCard label="Lideranças" value={computed?.summary.leaders ?? 0} icon={Radar} tone="indigo" loading={loading} />
        <MetricCard label="Apoiadores" value={computed?.summary.registeredSupporters ?? 0} icon={Route} tone="emerald" loading={loading} />
        <MetricCard label="Estimados" value={computed?.summary.estimatedSupporters ?? 0} icon={BarChart3} tone="violet" loading={loading} />
        <MetricCard label="Declarados" value={computed?.summary.declaredVotes ?? 0} icon={Vote} tone="amber" loading={loading} />
        <MetricCard label="Validados" value={computed?.summary.validatedVotes ?? 0} icon={CheckCircle2} tone="green" loading={loading} />
        <MetricCard label="Meta total" value={computed?.summary.voteGoal ?? 0} icon={Target} tone="indigo" loading={loading} />
        <MetricCard label="Distância" value={computed?.summary.distanceToGoal ?? 0} icon={Flag} tone="orange" loading={loading} />
        <MetricCard label="Cobertura" value={`${computed?.summary.coverage ?? 0}%`} icon={TrendingUp} tone="cyan" loading={loading} />
        <MetricCard label="Validação" value={`${computed?.summary.validationRate ?? 0}%`} icon={Zap} tone="green" loading={loading} />
        <MetricCard label="Alta prioridade" value={computed?.summary.highPriorityNeighborhoods ?? 0} icon={AlertTriangle} tone="red" loading={loading} />
        <MetricCard label="Zonas atenção" value={computed?.summary.attentionZones ?? 0} icon={Landmark} tone="rose" loading={loading} />
        <MetricCard label="Sem liderança" value={computed?.summary.regionsWithoutLeader ?? 0} icon={MapPinned} tone="orange" loading={loading} />
        <MetricCard label="Meta próxima" value={computed?.summary.regionsNearGoal ?? 0} icon={Target} tone="emerald" loading={loading} />
      </section>

      {!loading && !error && filteredRows.length === 0 ? (
        <EmptyState title="Sem dados suficientes neste módulo" description="Cadastre zonas, lideranças, apoiadores, demandas ou agenda para alimentar o comparativo." icon={BarChart3} />
      ) : null}

      <FiltersPanel filters={filters} setFilters={setFilters} options={options} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <ExecutiveCharts computed={computed} loading={loading} />
          <ComparativeTable loading={loading} data={filteredRows} onOpen={openDetails} />
        </div>
        <aside className="space-y-4">
          <PriorityRanking title="Top 5 bairros críticos" icon={AlertTriangle} data={computed?.rankings.criticalNeighborhoods ?? []} valueLabel="prioridade" />
          <PriorityRanking title="Top 5 zonas com oportunidade" icon={Landmark} data={computed?.rankings.opportunityZones ?? []} valueLabel="oportunidade" />
          <PriorityRanking title="Muitos eleitores, poucos cadastros" icon={Users} data={computed?.rankings.lowCadastroRegions ?? []} valueLabel="lacuna" />
          <PriorityRanking title="Regiões sem liderança" icon={MapPinned} data={computed?.rankings.regionsWithoutLeader ?? []} valueLabel="eleitores" />
          <PriorityRanking title="Demandas abertas por bairro" icon={Flag} data={computed?.rankings.openDemandRegions ?? []} valueLabel="demandas" />
          <PriorityRanking title="Bairros próximos da meta" icon={Target} data={computed?.rankings.nearGoalRegions ?? []} valueLabel="distância" />
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <AnalysisPanel data={filteredRows} onOpen={openDetails} />
        <OpportunityPanel data={filteredRows} onOpen={openDetails} />
      </section>

      <RegionDetailSheet
        open={detailsOpen}
        record={selected}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}

function FiltersPanel({ filters, setFilters, options }: { filters: Filters; setFilters: (filters: Filters) => void; options: ReturnType<typeof buildOptions> }) {
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value });

  return (
    <Card className="premium-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4 text-blue-600" /> Filtros avançados</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <FilterSelect label="Estado" value={filters.state} onChange={(value) => update("state", value)} options={options.states} />
        <FilterSelect label="Cidade" value={filters.city} onChange={(value) => update("city", value)} options={options.cities} />
        <FilterSelect label="Bairro" value={filters.neighborhood} onChange={(value) => update("neighborhood", value)} options={options.neighborhoods} />
        <FilterSelect label="Zona eleitoral" value={filters.zone} onChange={(value) => update("zone", value)} options={options.zones} />
        <FilterSelect label="Seção eleitoral" value={filters.section} onChange={(value) => update("section", value)} options={options.sections} />
        <FilterSelect label="Local de votação" value={filters.votingPlace} onChange={(value) => update("votingPlace", value)} options={options.votingPlaces} />
        <FilterSelect label="Liderança vinculada" value={filters.leader} onChange={(value) => update("leader", value)} options={options.leaders} />
        <FilterSelect label="Responsável" value={filters.responsible} onChange={(value) => update("responsible", value)} options={options.responsibles} />
        <FilterSelect label="Prioridade" value={filters.priority} onChange={(value) => update("priority", value)} options={["Crítica", "Alta", "Média", "Baixa", "Manter"]} />
        <FilterSelect label="Status" value={filters.status} onChange={(value) => update("status", value)} options={options.statuses} />
        <FilterSelect label="Faixa de eleitores" value={filters.votersRange} onChange={(value) => update("votersRange", value)} options={[["ate-8000", "Até 8.000"], ["8001-15000", "8.001 a 15.000"], ["acima-15000", "Acima de 15.000"]]} />
        <FilterSelect label="Faixa de cobertura" value={filters.coverageRange} onChange={(value) => update("coverageRange", value)} options={[["baixa", "Baixa"], ["media", "Média"], ["alta", "Alta"]]} />
        <FilterSelect label="Votos validados" value={filters.validatedRange} onChange={(value) => update("validatedRange", value)} options={[["ate-100", "Até 100"], ["101-300", "101 a 300"], ["acima-300", "Acima de 300"]]} />
        <FilterSelect label="Distância até meta" value={filters.distanceRange} onChange={(value) => update("distanceRange", value)} options={[["ate-120", "Até 120"], ["121-400", "121 a 400"], ["acima-400", "Acima de 400"]]} />
        <FilterSelect label="Período" value={filters.period} onChange={(value) => update("period", value)} options={[["todos", "Todos"]]} />
        <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Busca rápida</label>
          <Input placeholder="Use os filtros acima para refinar a decisão" disabled />
        </div>
        <div className="flex items-end">
          <Button className="w-full" variant="outline" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ExecutiveCharts({ computed, loading }: { computed: ComparisonComputed | null; loading: boolean }) {
  const charts = computed?.charts;
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title="Eleitores x votos validados por bairro" loading={loading} empty={!charts?.votersVsValidated.length}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={charts?.votersVsValidated ?? []} margin={{ top: 10, right: 12, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 11, fill: "#64748b" }} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Bar dataKey="eleitores" name="Eleitores" fill="#dbeafe" radius={[6, 6, 0, 0]} />
            <Bar dataKey="validados" name="Validados" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Declarados x validados" loading={loading} empty={!charts?.declaredVsValidated.length}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={charts?.declaredVsValidated ?? []} margin={{ top: 10, right: 12, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 11, fill: "#64748b" }} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Bar dataKey="declarados" name="Declarados" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="validados" name="Validados" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cobertura da campanha por bairro" loading={loading} empty={!charts?.coverageByNeighborhood.length}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={charts?.coverageByNeighborhood ?? []} layout="vertical" margin={{ left: 4, right: 18 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tickFormatter={(value) => `${value}%`} />
            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip content={<ChartTooltip suffix="%" />} />
            <Bar dataKey="cobertura" name="Cobertura" fill="#06b6d4" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distância até a meta por região" loading={loading} empty={!charts?.distanceToGoal.length}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={charts?.distanceToGoal ?? []} layout="vertical" margin={{ left: 4, right: 18 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="distancia" name="Distância" fill="#f59e0b" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ranking de oportunidade eleitoral" loading={loading} empty={!charts?.opportunityRanking.length}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={charts?.opportunityRanking ?? []} layout="vertical" margin={{ left: 4, right: 18 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip content={<ChartTooltip suffix="%" />} />
            <Bar dataKey="oportunidade" name="Oportunidade" fill="#ef4444" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribuição de prioridade" loading={loading} empty={!charts?.priorityDistribution.length}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={charts?.priorityDistribution ?? []} dataKey="value" nameKey="name" outerRadius={92} innerRadius={54} paddingAngle={3}>
              {(charts?.priorityDistribution ?? []).map((entry, index) => <Cell key={entry.name} fill={["#ef4444", "#f59e0b", "#2563eb", "#94a3b8", "#10b981"][index] ?? "#64748b"} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ComparativeTable({ loading, data, onOpen }: { loading: boolean; data: RegionalComparisonRow[]; onOpen: (record: RegionalComparisonRow) => void }) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader><CardTitle className="text-base">Tabela comparativa principal</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["Bairro / Região", "Cidade", "Zona", "Seções", "Locais", "Eleitores", "Lideranças", "Apoiadores", "Estimados", "Prospecções", "Indecisos", "Demandas", "Ações", "Declarados", "Validados", "Meta", "Distância", "Cobertura", "Validação", "Confiança", "Oportunidade", "Força", "Prioridade", "Status", "Ações"].map((head) => <TableHead key={head} className="whitespace-nowrap">{head}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 25 }).map((__, cellIndex) => <TableCell key={cellIndex}><Skeleton className="h-7 w-full rounded-lg" /></TableCell>)}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={25} className="p-6"><EmptyState title="Sem regiões no recorte" description="Ajuste filtros ou cadastre dados territoriais." icon={BarChart3} /></TableCell></TableRow>
              ) : data.map((record) => (
                <TableRow key={record.id} className="cursor-pointer" onClick={() => onOpen(record)}>
                  <TableCell className="min-w-48 font-extrabold text-slate-900">{record.neighborhood}</TableCell>
                  <TableCell>{record.city}</TableCell>
                  <TableCell>{record.zones.join(", ") || "-"}</TableCell>
                  <TableCell>{record.sections.join(", ") || "-"}</TableCell>
                  <TableCell className="min-w-44">{record.votingPlaces.slice(0, 2).join(", ") || "-"}</TableCell>
                  <TableCell>{formatNumber(record.voters)}</TableCell>
                  <TableCell>{record.leaders}</TableCell>
                  <TableCell>{record.registeredSupporters}</TableCell>
                  <TableCell>{formatNumber(record.estimatedSupporters)}</TableCell>
                  <TableCell>{record.activeProspects}</TableCell>
                  <TableCell>{record.undecided}</TableCell>
                  <TableCell>{record.openDemands}</TableCell>
                  <TableCell>{record.plannedActions}</TableCell>
                  <TableCell>{formatNumber(record.declaredVotes)}</TableCell>
                  <TableCell className="font-extrabold text-blue-700">{formatNumber(record.validatedVotes)}</TableCell>
                  <TableCell>{formatNumber(record.voteGoal)}</TableCell>
                  <TableCell>{formatNumber(record.distanceToGoal)}</TableCell>
                  <TableCell>{record.coverage}%</TableCell>
                  <TableCell>{record.validationRate}%</TableCell>
                  <TableCell>{record.confidenceIndex}%</TableCell>
                  <TableCell><StatusPill label={record.opportunity} tone={opportunityTone(record.opportunity)} /></TableCell>
                  <TableCell><StatusPill label={record.territorialStrength} tone={strengthTone(record.territorialStrength)} /></TableCell>
                  <TableCell><StatusPill label={record.priority} tone={priorityTone(record.priority)} /></TableCell>
                  <TableCell><StatusPill label={record.status} tone={statusTone(record.status)} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onOpen(record); }}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityRanking({ title, icon: Icon, data, valueLabel }: { title: string; icon: typeof AlertTriangle; data: RegionalComparisonRow[]; valueLabel: string }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4 text-blue-600" /> {title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {data.length === 0 ? <p className="text-sm font-medium text-slate-500">Sem dados suficientes.</p> : data.slice(0, 5).map((item) => (
          <button key={`${title}-${item.id}`} type="button" className="w-full rounded-lg bg-slate-50 p-3 text-left hover:bg-blue-50">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-slate-900">{item.neighborhood}</div>
                <div className="text-xs font-semibold text-slate-500">Zona {item.zones.join(", ") || "-"} · {item.city}</div>
              </div>
              <StatusPill label={item.priority} tone={priorityTone(item.priority)} />
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-wide text-blue-700">{valueLabel}: {rankingValue(item, valueLabel)}</div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function AnalysisPanel({ data, onOpen }: { data: RegionalComparisonRow[]; onOpen: (record: RegionalComparisonRow) => void }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">Análise automática por região</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {data.slice(0, 6).map((item) => (
          <button key={item.id} type="button" onClick={() => onOpen(item)} className="rounded-lg border border-slate-100 bg-white p-4 text-left shadow-sm hover:bg-blue-50">
            <div className="mb-2 flex items-center justify-between gap-2"><strong className="text-slate-900">{item.neighborhood}</strong><StatusPill label={item.priority} tone={priorityTone(item.priority)} /></div>
            <p className="text-sm font-medium leading-6 text-slate-600">{item.strategicAnalysis}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function OpportunityPanel({ data, onOpen }: { data: RegionalComparisonRow[]; onOpen: (record: RegionalComparisonRow) => void }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">Oportunidades de ação</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 7).map((item) => (
          <button key={item.id} type="button" onClick={() => onOpen(item)} className="flex w-full items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-left hover:bg-blue-50">
            <div>
              <div className="font-bold text-slate-900">{item.neighborhood}</div>
              <div className="text-xs font-semibold text-slate-500">{item.opportunity} oportunidade · {item.territorialStrength}</div>
            </div>
            <div className="text-right text-sm font-extrabold text-blue-700">{item.opportunityScore}%</div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function RegionDetailSheet({ open, record, onOpenChange }: { open: boolean; record: RegionalComparisonRow | null; onOpenChange: (open: boolean) => void }) {
  if (!record) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-slate-50 p-0 sm:max-w-3xl">
        <div className="space-y-5 p-5">
          <SheetHeader className="rounded-lg border bg-white p-5 text-left shadow-sm">
            <SheetTitle className="text-2xl">{record.neighborhood}</SheetTitle>
            <SheetDescription>{record.city} / {record.state} · zonas {record.zones.join(", ") || "não vinculadas"}</SheetDescription>
            <div className="flex flex-wrap gap-2 pt-2"><StatusPill label={record.priority} tone={priorityTone(record.priority)} /><StatusPill label={record.opportunity} tone={opportunityTone(record.opportunity)} /><StatusPill label={record.territorialStrength} tone={strengthTone(record.territorialStrength)} /></div>
          </SheetHeader>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailMetric label="Eleitores" value={formatNumber(record.voters)} />
            <DetailMetric label="Validados" value={formatNumber(record.validatedVotes)} />
            <DetailMetric label="Meta" value={formatNumber(record.voteGoal)} />
            <DetailMetric label="Distância" value={formatNumber(record.distanceToGoal)} />
          </div>

          <Card className="premium-card">
            <CardHeader><CardTitle className="text-base">Resumo da região</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <InfoBlock title="Dados eleitorais" rows={[["Cobertura", `${record.coverage}%`], ["Taxa de validação", `${record.validationRate}%`], ["Cumprimento da meta", `${record.goalCompletion}%`], ["Potencial não explorado", formatNumber(record.unexploredPotential)]]} />
              <InfoBlock title="Base territorial" rows={[["Lideranças", record.linkedLeaders.join(", ") || "Nenhuma"], ["Apoiadores cadastrados", formatNumber(record.registeredSupporters)], ["Apoiadores estimados", formatNumber(record.estimatedSupporters)], ["Confiança média", `${record.confidenceIndex}%`]]} />
              <InfoBlock title="Operação" rows={[["Prospecção ativa", formatNumber(record.activeProspects)], ["Indecisos", formatNumber(record.undecided)], ["Demandas abertas", formatNumber(record.openDemands)], ["Ações previstas", formatNumber(record.plannedActions)]]} />
              <InfoBlock title="Zonas e locais" rows={[["Zonas", record.zones.join(", ") || "-"], ["Seções", record.sections.join(", ") || "-"], ["Locais de votação", record.votingPlaces.join(", ") || "-"], ["Responsável", record.responsible]]} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="premium-card overflow-hidden">
              <div className="relative min-h-64 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_75%_35%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,#f8fafc,#eef6ff)] p-5">
                <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-blue-700">Área territorial</div>
                <div className="mt-2 text-2xl font-extrabold text-slate-950">{record.neighborhood}</div>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Pronto para leitura territorial com Mapbox/PostGIS.</p>
                <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/80 bg-white/85 p-3 shadow-sm backdrop-blur"><MapPin className="mr-2 inline h-4 w-4 text-blue-600" />{record.city} · {record.votingPlaces[0] || "local ainda não vinculado"}</div>
              </div>
            </Card>
            <ListCard title="Próximas ações recomendadas" items={record.recommendedActions} />
          </div>

          <Card className="premium-card">
            <CardHeader><CardTitle className="text-base">Observações estratégicas</CardTitle></CardHeader>
            <CardContent className="text-sm font-medium leading-6 text-slate-600">{record.strategicAnalysis}</CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ChartCard({ title, loading, empty, children }: { title: string; loading: boolean; empty: boolean; children: ReactNode }) {
  return <Card className="premium-card"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-72 w-full rounded-lg" /> : empty ? <EmptyState title="Sem dados suficientes" description="O gráfico será preenchido com registros reais." icon={BarChart3} /> : children}</CardContent></Card>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[] | Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="todos">Todos</option>
        {options.map((option) => {
          const optionValue = Array.isArray(option) ? option[0] : option;
          const optionLabel = Array.isArray(option) ? option[1] : option;
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
        })}
      </select>
    </label>
  );
}

function InfoBlock({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return <div className="rounded-lg bg-slate-50 p-4"><h4 className="mb-3 font-extrabold text-slate-900">{title}</h4><div className="space-y-2">{rows.map(([label, value]) => <div key={label} className="text-sm"><span className="font-bold text-slate-500">{label}: </span><span className="font-semibold text-slate-800">{value}</span></div>)}</div></div>;
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return <Card className="premium-card"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="space-y-2">{items.map((item, index) => <div key={`${item}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{item}</div>)}</CardContent></Card>;
}

function DetailMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-xl font-extrabold text-slate-900">{value}</div><div className="text-xs font-bold uppercase text-slate-400">{label}</div></div>;
}

function ConnectionWarning({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card className="border-red-200 bg-red-50 shadow-sm"><CardContent className="flex flex-col gap-3 p-4 text-red-900 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><div className="font-extrabold">Não foi possível carregar o comparativo</div><p className="text-sm font-medium leading-6">{message}</p></div></div><Button variant="outline" onClick={onRetry}>Tentar novamente</Button></CardContent></Card>;
}

function WarningsPanel({ warnings }: { warnings: string[] }) {
  return <Card className="border-amber-200 bg-amber-50 shadow-sm"><CardContent className="p-4 text-sm font-medium text-amber-900">Algumas tabelas retornaram vazias ou com erro. O comparativo continua funcionando com os dados disponíveis. {warnings.slice(0, 3).join(" | ")}</CardContent></Card>;
}

function ChartTooltip({ active, payload = [], label, suffix = "" }: { active?: boolean; payload?: TooltipPayload[]; label?: string; suffix?: string }) {
  if (!active || !payload.length) return null;
  return <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg"><div className="mb-2 font-semibold text-slate-700">{label}</div>{payload.map((item, index) => <div key={`${item.name}-${index}`} className="flex items-center gap-2"><div className="h-2 w-2 rounded-full" style={{ background: item.color }} /><span className="text-slate-500">{item.name}:</span><span className="font-semibold text-slate-800">{Number(item.value ?? 0).toLocaleString("pt-BR")}{suffix}</span></div>)}</div>;
}

function buildOptions(rows: RegionalComparisonRow[]) {
  return {
    states: unique(rows.map((item) => item.state)),
    cities: unique(rows.map((item) => item.city)),
    neighborhoods: unique(rows.map((item) => item.neighborhood)),
    zones: unique(rows.flatMap((item) => item.zones)),
    sections: unique(rows.flatMap((item) => item.sections)),
    votingPlaces: unique(rows.flatMap((item) => item.votingPlaces)),
    leaders: unique(rows.flatMap((item) => item.linkedLeaders)),
    responsibles: unique(rows.map((item) => item.responsible)),
    statuses: unique(rows.map((item) => item.status)),
  };
}

function matchesFilters(item: RegionalComparisonRow, filters: Filters) {
  const exact = (value: string, filter: string) => filter === "todos" || normalize(value) === normalize(filter);
  if (!exact(item.state, filters.state)) return false;
  if (!exact(item.city, filters.city)) return false;
  if (!exact(item.neighborhood, filters.neighborhood)) return false;
  if (filters.zone !== "todos" && !item.zones.some((value) => exact(value, filters.zone))) return false;
  if (filters.section !== "todos" && !item.sections.some((value) => exact(value, filters.section))) return false;
  if (filters.votingPlace !== "todos" && !item.votingPlaces.some((value) => exact(value, filters.votingPlace))) return false;
  if (filters.leader !== "todos" && !item.linkedLeaders.some((value) => exact(value, filters.leader))) return false;
  if (!exact(item.responsible, filters.responsible)) return false;
  if (!exact(item.priority, filters.priority)) return false;
  if (!exact(item.status, filters.status)) return false;
  if (filters.votersRange === "ate-8000" && item.voters > 8000) return false;
  if (filters.votersRange === "8001-15000" && (item.voters < 8001 || item.voters > 15000)) return false;
  if (filters.votersRange === "acima-15000" && item.voters <= 15000) return false;
  if (filters.coverageRange === "baixa" && item.coverage >= 2) return false;
  if (filters.coverageRange === "media" && (item.coverage < 2 || item.coverage >= 5)) return false;
  if (filters.coverageRange === "alta" && item.coverage < 5) return false;
  if (filters.validatedRange === "ate-100" && item.validatedVotes > 100) return false;
  if (filters.validatedRange === "101-300" && (item.validatedVotes < 101 || item.validatedVotes > 300)) return false;
  if (filters.validatedRange === "acima-300" && item.validatedVotes <= 300) return false;
  if (filters.distanceRange === "ate-120" && item.distanceToGoal > 120) return false;
  if (filters.distanceRange === "121-400" && (item.distanceToGoal < 121 || item.distanceToGoal > 400)) return false;
  if (filters.distanceRange === "acima-400" && item.distanceToGoal <= 400) return false;
  return true;
}

function rankingValue(item: RegionalComparisonRow, label: string) {
  if (label.includes("oportunidade")) return `${item.opportunityScore}%`;
  if (label.includes("lacuna")) return formatNumber(Math.max(item.voters - item.registeredSupporters * 20, 0));
  if (label.includes("eleitores")) return formatNumber(item.voters);
  if (label.includes("demandas")) return item.openDemands;
  if (label.includes("distância")) return `${formatNumber(item.distanceToGoal)} votos`;
  return item.priority;
}

function priorityTone(priority: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const value = normalize(priority);
  if (value.includes("crit")) return "red";
  if (value.includes("alta")) return "amber";
  if (value.includes("media")) return "blue";
  if (value.includes("manter")) return "green";
  return "slate";
}

function opportunityTone(value: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(value);
  if (normalized.includes("crit")) return "red";
  if (normalized.includes("alto")) return "amber";
  if (normalized.includes("medio")) return "blue";
  return "slate";
}

function strengthTone(value: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(value);
  if (normalized.includes("muito")) return "green";
  if (normalized.includes("forte")) return "emerald";
  if (normalized.includes("desenvolvimento")) return "blue";
  return "slate";
}

function statusTone(value: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(value);
  if (normalized.includes("forte")) return "green";
  if (normalized.includes("sem lideranca") || normalized.includes("baixa")) return "red";
  if (normalized.includes("meta")) return "emerald";
  if (normalized.includes("oportunidade")) return "amber";
  return "blue";
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function normalize(value: string | null | undefined) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLowerCase().trim();
}

function formatNumber(value: number) {
  return Number(value ?? 0).toLocaleString("pt-BR");
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message);
  return "Erro inesperado ao conectar com o Supabase.";
}
