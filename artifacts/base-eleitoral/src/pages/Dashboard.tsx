import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart2,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  computeDashboard,
  getDashboardDataset,
  getFilteredDataset,
  isDashboardSupabaseReady,
  type DashboardComputed,
  type DashboardDataset,
  type DashboardFilters,
  type PriorityRegion,
} from "@/services/dashboard";

const emptyFilters: DashboardFilters = {
  state: "todos",
  city: "todos",
  neighborhood: "todos",
  period: "todos",
  leaderId: "todos",
  responsible: "todos",
  politicalStatus: "todos",
  priority: "todos",
};

const statCards = [
  { key: "totalLeaders", label: "Cadastros", icon: Users, tone: "blue" },
  { key: "coordinatorsRJ", label: "Coord. RJ", icon: Building2, tone: "indigo" },
  { key: "coordinatorsMarica", label: "Coord. Maricá", icon: MapPin, tone: "emerald" },
  { key: "territorialLeaders", label: "Lideranças", icon: ShieldCheck, tone: "cyan" },
  { key: "estimatedSupporters", label: "Apoio estim.", icon: BarChart2, tone: "violet" },
  { key: "minVotes", label: "Votos mín.", icon: CheckCircle2, tone: "green" },
  { key: "maxVotes", label: "Votos máx.", icon: Star, tone: "amber" },
  { key: "ceilingCost", label: "Custo teto", icon: CircleDollarSign, tone: "orange" },
  { key: "costPerMinVote", label: "Custo/voto", icon: TrendingUp, tone: "cyan" },
  { key: "municipalitiesWithAction", label: "Cidades RJ", icon: Building2, tone: "indigo" },
  { key: "coveredNeighborhoods", label: "Bairros Maricá", icon: MapPin, tone: "rose" },
  { key: "priorityRegions", label: "Prioritárias", icon: AlertTriangle, tone: "red" },
] as const;

type TooltipPayload = {
  color?: string;
  name: string;
  value: number;
};

type FilterOptions = {
  states: string[];
  cities: string[];
  neighborhoods: string[];
  leaders: Array<[string, string]>;
  responsibles: string[];
  politicalStatus: string[];
  priorities: string[];
};

export default function Dashboard() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(emptyFilters);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    if (!isDashboardSupabaseReady()) {
      setDataset(null);
      setError("Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar o dashboard real.");
      setLoading(false);
      return;
    }

    try {
      const data = await getDashboardDataset();
      setDataset(data);
    } catch (err) {
      setDataset(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const filteredDataset = useMemo(() => dataset ? getFilteredDataset(dataset, filters) : null, [dataset, filters]);
  const computed = useMemo(() => filteredDataset ? computeDashboard(filteredDataset) : null, [filteredDataset]);
  const filterOptions = useMemo(() => dataset ? buildFilterOptions(dataset) : emptyFilterOptions(), [dataset]);
  const hasAnyData = dataset ? hasDatasetData(dataset) : false;
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Painel Geral"
        title="Comando Geral"
        description={`${today} · visão executiva enxuta por coordenação, liderança, território, votos e custo estimado.`}
        actions={
          <Button variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        }
      />

      {error ? <ConnectionWarning message={error} onRetry={() => void loadDashboard()} /> : null}
      {dataset?.warnings.length ? <WarningsPanel warnings={dataset.warnings} /> : null}
      {!loading && !error && !hasAnyData ? (
        <EmptyState title="Sem dados suficientes neste módulo." description="Cadastre coordenações e lideranças para alimentar o dashboard geral." icon={BarChart2} />
      ) : null}

      <DashboardFiltersPanel filters={filters} setFilters={setFilters} options={filterOptions} />

      <ExecutivePulse computed={computed} loading={loading} />

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(148px,1fr))]">
        {statCards.map(({ key, label, icon, tone }) => (
          <MetricCard
            key={key}
            label={label}
            icon={icon}
            tone={tone}
            loading={loading}
            value={formatDashboardMetric(key, computed?.summary[key] ?? 0)}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Evolução semanal da força" description="Cadastros de coordenações e lideranças por semana" loading={loading} empty={!computed?.weeklyGrowth.length}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={computed?.weeklyGrowth ?? []} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradLider" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="liderancas" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradLider)" name="Lideranças" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Declarados x validados" description="Comparativo consolidado por fonte" loading={loading} empty={!computed?.voteComparison.length}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={computed?.voteComparison ?? []} margin={{ top: 5, right: 16, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="declarados" name="Declarados" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="validados" name="Validados" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <RankingCard title="Top lideranças" description="Por votos validados" items={computed?.leaderRanking ?? []} loading={loading} colorClass="bg-emerald-500" valueClass="text-emerald-600" />
          <CoverageCard rows={computed?.neighborhoodCoverage ?? []} loading={loading} />
        </div>
        <PriorityRegionsPanel rows={computed?.priorityRegions ?? []} loading={loading} />
      </div>
    </div>
  );
}

function ExecutivePulse({ computed, loading }: { computed: DashboardComputed | null; loading: boolean }) {
  const conversionRate = computed?.summary.estimatedSupporters ? Math.round(((computed?.summary.minVotes ?? 0) / computed.summary.estimatedSupporters) * 100) : 0;
  const coverage = computed?.summary.generalCoverage ?? 0;
  const month = computed?.summary.latestMonth ?? "Cadastro";
  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="premium-card rounded-lg p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <Zap className="h-3.5 w-3.5" />
              Ritmo da campanha
            </div>
            {loading ? <Skeleton className="mt-3 h-8 w-80 rounded-lg" /> : (
              <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                {formatNumber(computed?.summary.minVotes ?? 0)} a {formatNumber(computed?.summary.maxVotes ?? 0)} votos estimados
              </div>
            )}
            <p className="mt-1 text-sm font-medium text-slate-500">
              Recorte {month}. Conversão mínima estimada: {conversionRate}% do apoio cadastrado. Cobertura do teto: {coverage}%.
            </p>
          </div>
          <div className="min-w-44 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Custo por voto</div>
            <div className="mt-1 text-3xl font-extrabold text-blue-900">
              {formatCurrency(computed?.summary.costPerMinVote ?? 0)}
            </div>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" style={{ width: `${Math.min(conversionRate, 100)}%` }} />
        </div>
      </div>

      <div className="premium-card rounded-lg p-5">
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Próxima leitura</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MiniStat label="Cidades RJ" value={computed?.summary.municipalitiesWithAction ?? 0} />
          <MiniStat label="Bairros Maricá" value={computed?.summary.coveredNeighborhoods ?? 0} />
          <MiniStat label="Cadastros" value={computed?.summary.totalLeaders ?? 0} />
          <MiniStat label="Prioridades" value={computed?.summary.priorityRegions ?? 0} />
        </div>
      </div>
    </div>
  );
}

function DashboardFiltersPanel({
  filters,
  setFilters,
  options,
}: {
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  options: FilterOptions;
}) {
  const update = (key: keyof DashboardFilters, value: string) => setFilters({ ...filters, [key]: value });
  return (
    <Card className="premium-card">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <FilterSelect label="Estado" value={filters.state} options={options.states} onChange={(value) => update("state", value)} />
        <FilterSelect label="Cidade" value={filters.city} options={options.cities} onChange={(value) => update("city", value)} />
        <FilterSelect label="Bairro" value={filters.neighborhood} options={options.neighborhoods} onChange={(value) => update("neighborhood", value)} />
        <FilterSelect label="Período" value={filters.period} options={[["todos", "Todos"], ["7", "Últimos 7 dias"], ["30", "Últimos 30 dias"], ["90", "Últimos 90 dias"]]} onChange={(value) => update("period", value)} />
        <FilterSelect label="Cadastro" value={filters.leaderId} options={options.leaders.map((item) => item)} onChange={(value) => update("leaderId", value)} />
        <FilterSelect label="Responsável" value={filters.responsible} options={options.responsibles} onChange={(value) => update("responsible", value)} />
        <FilterSelect label="Tipo de cadastro" value={filters.politicalStatus} options={options.politicalStatus} onChange={(value) => update("politicalStatus", value)} />
        <FilterSelect label="Confiança" value={filters.priority} options={options.priorities} onChange={(value) => update("priority", value)} />
        <div className="flex items-end xl:col-span-8">
          <Button variant="outline" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, loading, empty, children }: { title: string; description: string; loading: boolean; empty: boolean; children: ReactNode }) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="px-6 pb-2 pt-6">
        <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
        <p className="text-xs font-semibold text-slate-400">{description}</p>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {loading ? <Skeleton className="h-72 w-full rounded-lg" /> : empty ? <div className="px-4"><EmptyState title="Sem dados suficientes neste módulo." description="O gráfico será preenchido quando houver registros reais." icon={BarChart2} /></div> : children}
      </CardContent>
    </Card>
  );
}

function RankingCard({ title, description, items, loading, colorClass, valueClass }: { title: string; description: string; items: Array<{ nome: string; valor: number }>; loading: boolean; colorClass: string; valueClass: string }) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100 px-6 pb-4 pt-6">
        <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
        <p className="text-xs font-semibold text-slate-400">{description}</p>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {loading ? <SkeletonList /> : items.length === 0 ? <EmptyState title="Sem dados suficientes" description="Cadastre registros para alimentar este ranking." icon={Users} /> : (
          <div className="space-y-1">
            {items.slice(0, 6).map((item, index) => {
              const max = items[0].valor || 1;
              const percentage = Math.round((item.valor / max) * 100);
              return (
                <div key={`${item.nome}-${index}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex justify-between">
                      <span className="truncate text-sm font-medium text-slate-700">{item.nome}</span>
                      <span className={`ml-2 shrink-0 text-sm font-bold ${valueClass}`}>{formatNumber(item.valor)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CoverageCard({ rows, loading }: { rows: Array<{ nome: string; cobertura: number; apoiadores: number; liderancas: number; eleitores: number }>; loading: boolean }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">Ranking territorial por validação</CardTitle><p className="text-xs font-semibold text-slate-400">Cidades do RJ e bairros de Maricá por força validada</p></CardHeader>
      <CardContent className="space-y-3">
        {loading ? <SkeletonList /> : rows.length === 0 ? <EmptyState title="Sem cobertura calculada" description="Cadastre coordenações e lideranças para alimentar esta leitura." icon={MapPin} /> : rows.slice(0, 6).map((row) => (
          <div key={row.nome} className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-bold text-slate-800">{row.nome}</div>
              <div className="text-sm font-extrabold text-blue-700">{row.cobertura}%</div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(row.cobertura, 100)}%` }} />
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-500">{row.liderancas} cadastros · {formatNumber(row.apoiadores)} apoios estim. · {formatNumber(row.eleitores)} eleitores ref.</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PriorityRegionsPanel({ rows, loading }: { rows: PriorityRegion[]; loading: boolean }) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-base">Regiões prioritárias</CardTitle>
        <p className="text-xs font-semibold text-slate-400">Calculado por cadastros, apoio estimado, votos, validação e confiança.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <SkeletonList /> : rows.length === 0 ? <EmptyState title="Sem regiões prioritárias" description="O painel será calculado quando houver dados territoriais." icon={MapPin} /> : rows.map((row) => (
          <div key={`${row.name}-${row.city}`} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-extrabold text-slate-950">{row.name}</div>
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{row.city}</div>
              </div>
              <StatusPill label={row.priority} tone={priorityTone(row.priority)} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold text-slate-600">
              <MiniStat label="Eleitores" value={row.estimatedVoters} />
              <MiniStat label="Cadastros" value={row.leaders} />
              <MiniStat label="Apoio estim." value={row.supporters} />
              <MiniStat label="Validados" value={row.validatedVotes} />
            </div>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{row.reading}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function WarningsPanel({ warnings }: { warnings: string[] }) {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4 text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <div className="font-extrabold">Alguns módulos retornaram sem dados</div>
          <p className="text-sm font-medium leading-6">O dashboard continua funcionando. Verifique RLS/policies caso algum bloco esteja zerado inesperadamente.</p>
          <div className="mt-2 space-y-1 text-xs font-semibold">{warnings.slice(0, 4).map((item) => <div key={item}>{item}</div>)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionWarning({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4 text-red-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-extrabold">Não foi possível carregar o Dashboard</div>
            <p className="text-sm font-medium leading-6">{message}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onRetry}>Tentar novamente</Button>
      </CardContent>
    </Card>
  );
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-lg font-extrabold leading-none text-slate-950">{formatNumber(value)}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</div>
    </div>
  );
}

function SkeletonList() {
  return <div className="space-y-4">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-10 w-full rounded-lg" />)}</div>;
}

function ChartTooltip({ active, payload = [], label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <div className="mb-2 font-semibold text-slate-700">{label}</div>
      {payload.map((item, index) => (
        <div key={`${item.name}-${index}`} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          <span className="text-slate-500">{item.name}:</span>
          <span className="font-semibold text-slate-800">{Number(item.value ?? 0).toLocaleString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
}

function buildFilterOptions(dataset: DashboardDataset) {
  return {
    states: unique(dataset.leaders.map((item) => item.state)),
    cities: unique([...dataset.leaders.map((item) => item.city), ...dataset.municipalities.map((item) => item.name)]),
    neighborhoods: unique([...dataset.leaders.map((item) => item.neighborhood), ...dataset.neighborhoods.map((item) => item.name)]),
    leaders: dataset.leaders.map((item) => [item.id, item.full_name] as [string, string]),
    responsibles: unique(dataset.leaders.map((item) => item.internal_responsible)),
    politicalStatus: unique(dataset.leaders.map((item) => item.leader_type)),
    priorities: unique(dataset.leaders.map((item) => item.confidence_level)),
  };
}

function emptyFilterOptions() {
  return { states: [], cities: [], neighborhoods: [], leaders: [], responsibles: [], politicalStatus: [], priorities: [] };
}

function hasDatasetData(dataset: DashboardDataset) {
  return Boolean(dataset.leaders.length || dataset.municipalities.length || dataset.neighborhoods.length);
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function priorityTone(priority: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(priority);
  if (normalized.includes("crit")) return "red";
  if (normalized.includes("alta")) return "amber";
  if (normalized.includes("media")) return "blue";
  return "slate";
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatNumber(value: number) {
  return Number(value ?? 0).toLocaleString("pt-BR");
}

function formatCurrency(value: number) {
  return Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatDashboardMetric(key: string, value: number | string) {
  if (key === "ceilingCost" || key === "costPerMinVote") return formatCurrency(Number(value));
  return value;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return "Erro inesperado ao conectar com o Supabase.";
}
