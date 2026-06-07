import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  Radar,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isLeadersSupabaseReady, listLeaders } from "@/services/leaders";
import { getMaricaDistrictForNeighborhood, getRJRegionForCity } from "@/services/operational";
import type { Leader } from "@/types/database";

type TerritoryScope = "todos" | "rj" | "marica";
type Priority = "Crítica" | "Alta" | "Média" | "Baixa" | "Manter";

type Filters = {
  search: string;
  scope: TerritoryScope;
  city: string;
  neighborhood: string;
  priority: string;
  status: string;
};

type TerritoryRow = {
  id: string;
  scope: "rj" | "marica";
  territory: string;
  group: string;
  city: string;
  neighborhood: string;
  coordinators: number;
  leaders: number;
  actors: number;
  estimatedSupporters: number;
  declaredVotes: number;
  validatedVotes: number;
  validationRate: number;
  conversionRate: number;
  confidenceIndex: number;
  distanceToDeclared: number;
  priority: Priority;
  status: string;
  linkedNames: string[];
};

const emptyFilters: Filters = {
  search: "",
  scope: "todos",
  city: "todos",
  neighborhood: "todos",
  priority: "todos",
  status: "todos",
};

export default function Comparativo() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  async function loadData() {
    setLoading(true);
    setError(null);

    if (!isLeadersSupabaseReady()) {
      setLeaders([]);
      setError("Supabase não está configurado. Preencha as chaves para carregar a análise territorial.");
      setLoading(false);
      return;
    }

    try {
      setLeaders(await listLeaders());
    } catch (err) {
      setLeaders([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const rows = useMemo(() => buildTerritoryRows(leaders), [leaders]);
  const filteredRows = useMemo(() => rows.filter((row) => matchesFilters(row, filters)), [rows, filters]);
  const summary = useMemo(() => buildSummary(filteredRows), [filteredRows]);
  const options = useMemo(() => buildOptions(rows), [rows]);
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comparativo"
        title="Análise Territorial Enxuta"
        description={`${today} · comparação por cidades do RJ e bairros de Maricá, usando coordenações, lideranças, apoio estimado e votos.`}
        actions={
          <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        }
      />

      {error ? <ConnectionWarning message={error} onRetry={() => void loadData()} /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <MetricCard label="Territórios" value={summary.territories} icon={MapPin} tone="blue" loading={loading} />
        <MetricCard label="Coordenações" value={summary.coordinators} icon={Building2} tone="indigo" loading={loading} />
        <MetricCard label="Lideranças" value={summary.leaders} icon={Users} tone="violet" loading={loading} />
        <MetricCard label="Apoio estim." value={summary.estimatedSupporters} icon={Radar} tone="cyan" loading={loading} />
        <MetricCard label="Declarados" value={summary.declaredVotes} icon={Target} tone="amber" loading={loading} />
        <MetricCard label="Validados" value={summary.validatedVotes} icon={CheckCircle2} tone="green" loading={loading} />
        <MetricCard label="Validação" value={`${summary.validationRate}%`} icon={TrendingUp} tone="emerald" loading={loading} />
        <MetricCard label="Atenção" value={summary.attention} icon={AlertTriangle} tone="red" loading={loading} />
      </section>

      {!loading && !error && rows.length === 0 ? (
        <EmptyState title="Sem dados para comparar" description="Cadastre coordenações e lideranças para gerar análise por cidade, bairro, região e distrito." icon={BarChart3} />
      ) : null}

      <FiltersPanel filters={filters} setFilters={setFilters} options={options} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Apoio estimado x votos" description="Compara base estimada, votos declarados e votos validados" loading={loading} empty={!filteredRows.length}>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={filteredRows.slice(0, 10)} margin={{ top: 10, right: 14, left: -20, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="territory" angle={-35} textAnchor="end" height={74} tick={{ fontSize: 11, fill: "#64748b" }} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip formatter={(value) => Number(value).toLocaleString("pt-BR")} />
                  <Legend />
                  <Bar dataKey="estimatedSupporters" name="Apoio estimado" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="declaredVotes" name="Declarados" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="validatedVotes" name="Validados" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Força territorial" description="Número de coordenações e lideranças por território" loading={loading} empty={!filteredRows.length}>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={filteredRows.slice(0, 10)} margin={{ top: 10, right: 14, left: -20, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="territory" angle={-35} textAnchor="end" height={74} tick={{ fontSize: 11, fill: "#64748b" }} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip formatter={(value) => Number(value).toLocaleString("pt-BR")} />
                  <Legend />
                  <Bar dataKey="coordinators" name="Coordenações" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="leaders" name="Lideranças" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <TerritoryTable loading={loading} rows={filteredRows} />
        </div>

        <aside className="space-y-5">
          <RankingCard title="Prioridade de ação" rows={filteredRows.filter((row) => row.priority !== "Manter").slice(0, 5)} value="priority" />
          <RankingCard title="Maior apoio estimado" rows={[...filteredRows].sort((a, b) => b.estimatedSupporters - a.estimatedSupporters).slice(0, 5)} value="estimatedSupporters" />
          <RankingCard title="Melhor validação" rows={[...filteredRows].filter((row) => row.declaredVotes > 0).sort((a, b) => b.validationRate - a.validationRate).slice(0, 5)} value="validationRate" />
          <FinancePreview summary={summary} />
        </aside>
      </section>

      <StrategicReading rows={filteredRows} loading={loading} />
    </div>
  );
}

function FiltersPanel({ filters, setFilters, options }: { filters: Filters; setFilters: (filters: Filters) => void; options: ReturnType<typeof buildOptions> }) {
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value });

  return (
    <Card className="premium-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-extrabold text-slate-950">Filtros territoriais</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <FilterSelect label="Recorte" value={filters.scope} onChange={(value) => update("scope", value)} options={[["todos", "Todos"], ["rj", "RJ por cidades"], ["marica", "Maricá por bairros"]]} />
        <FilterSelect label="Cidade" value={filters.city} onChange={(value) => update("city", value)} options={options.cities} />
        <FilterSelect label="Bairro" value={filters.neighborhood} onChange={(value) => update("neighborhood", value)} options={options.neighborhoods} />
        <FilterSelect label="Prioridade" value={filters.priority} onChange={(value) => update("priority", value)} options={["Crítica", "Alta", "Média", "Baixa", "Manter"]} />
        <FilterSelect label="Status" value={filters.status} onChange={(value) => update("status", value)} options={options.statuses} />
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Busca</label>
          <Input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Nome, cidade ou bairro" />
        </div>
        <div className="flex items-end lg:col-span-2">
          <Button className="w-full" variant="outline" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TerritoryTable({ loading, rows }: { loading: boolean; rows: TerritoryRow[] }) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-base font-extrabold text-slate-950">Comparativo por território</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Território</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead className="text-right">Coord.</TableHead>
              <TableHead className="text-right">Lid.</TableHead>
              <TableHead className="text-right">Apoio estim.</TableHead>
              <TableHead className="text-right">Declarados</TableHead>
              <TableHead className="text-right">Validados</TableHead>
              <TableHead>Validação</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={10}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <EmptyState title="Nenhum território no recorte" description="Ajuste os filtros ou cadastre novas lideranças." icon={MapPin} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-bold text-slate-950">{row.territory}</div>
                    <div className="text-xs font-medium text-slate-500">{row.scope === "marica" ? "Maricá por bairro" : "RJ por cidade"}</div>
                  </TableCell>
                  <TableCell>{row.group}</TableCell>
                  <TableCell className="text-right font-bold">{row.coordinators}</TableCell>
                  <TableCell className="text-right font-bold">{row.leaders}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.estimatedSupporters)}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.declaredVotes)}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.validatedVotes)}</TableCell>
                  <TableCell>{row.validationRate}%</TableCell>
                  <TableCell><StatusPill label={row.priority} tone={priorityTone(row.priority)} /></TableCell>
                  <TableCell><StatusPill label={row.status} tone={row.status === "Forte" ? "emerald" : row.status === "Atenção" ? "amber" : "blue"} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, loading, empty, children }: { title: string; description: string; loading: boolean; empty: boolean; children: React.ReactNode }) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-base font-extrabold text-slate-950">{title}</CardTitle>
        <p className="text-sm font-medium text-slate-500">{description}</p>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[290px] w-full" /> : empty ? <EmptyState title="Sem dados para o gráfico" description="Cadastre dados no módulo Lideranças." icon={BarChart3} /> : children}
      </CardContent>
    </Card>
  );
}

function RankingCard({ title, rows, value }: { title: string; rows: TerritoryRow[]; value: "priority" | "estimatedSupporters" | "validationRate" }) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-base font-extrabold text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">Sem dados neste recorte.</p>
        ) : rows.map((row, index) => (
          <div key={`${title}-${row.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-slate-500 shadow-sm">{index + 1}</div>
              <div>
                <div className="text-sm font-extrabold text-slate-950">{row.territory}</div>
                <div className="text-xs font-bold text-slate-400">{row.group}</div>
              </div>
            </div>
            <div className="text-right text-sm font-extrabold text-slate-950">
              {value === "priority" ? row.priority : value === "validationRate" ? `${row.validationRate}%` : formatNumber(row.estimatedSupporters)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FinancePreview({ summary }: { summary: ReturnType<typeof buildSummary> }) {
  return (
    <Card className="premium-card border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-950">
          <CircleDollarSign className="h-4 w-4 text-amber-600" />
          Centro de custos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm font-medium text-slate-600">
        <p>A próxima evolução deve gravar custo base, teto e custo extra por coordenação/liderança.</p>
        <div className="grid grid-cols-2 gap-2">
          <MiniMetric label="Base atual" value={`${summary.actors} registros`} />
          <MiniMetric label="Custo por voto" value="Preparado" />
        </div>
      </CardContent>
    </Card>
  );
}

function StrategicReading({ rows, loading }: { rows: TerritoryRow[]; loading: boolean }) {
  const critical = rows.find((row) => row.priority === "Crítica" || row.priority === "Alta");
  const strong = [...rows].sort((a, b) => b.validatedVotes - a.validatedVotes)[0];

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-base font-extrabold text-slate-950">Leitura estratégica automática</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <ReadingBlock
              title={critical ? `${critical.territory} pede prioridade` : "Sem alerta crítico"}
              text={critical ? `${critical.territory} combina ${critical.actors} registro(s), ${formatNumber(critical.estimatedSupporters)} apoiadores estimados e validação de ${critical.validationRate}%. O próximo passo é revisar promessa, validação e vínculo de coordenação.` : "O recorte atual não apresenta prioridade crítica. Mantenha a rotina mensal de atualização de votos e custos."}
            />
            <ReadingBlock
              title={strong ? `${strong.territory} é a base mais validada` : "Base ainda vazia"}
              text={strong ? `${strong.territory} lidera em votos validados no recorte, com ${formatNumber(strong.validatedVotes)} votos validados e ${formatNumber(strong.estimatedSupporters)} apoiadores estimados. Use como referência para comparar custo e conversão.` : "Cadastre lideranças para ativar a análise comparativa."}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ReadingBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="text-sm font-extrabold text-slate-950">{title}</div>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-amber-100 bg-white p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-amber-700">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-950">{value}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] | Array<[string, string]> }) {
  const normalized = normalizeOptions(options);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {normalized.filter(([optionValue]) => optionValue !== "todos").map(([optionValue, optionLabel]) => (
            <SelectItem key={`${label}-${optionValue}`} value={optionValue}>{optionLabel}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ConnectionWarning({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <div className="font-extrabold text-amber-950">Não foi possível carregar o comparativo.</div>
            <div className="mt-1 text-sm font-medium text-amber-800">{message}</div>
          </div>
        </div>
        <Button variant="outline" onClick={onRetry}>Tentar novamente</Button>
      </CardContent>
    </Card>
  );
}

function buildTerritoryRows(leaders: Leader[]): TerritoryRow[] {
  const grouped = new Map<string, TerritoryRow>();

  leaders.forEach((leader) => {
    const scope = normalize(leader.city) === "marica" ? "marica" : "rj";
    const territory = scope === "marica" ? leader.neighborhood || "Sem bairro" : leader.city || "Sem cidade";
    const group = scope === "marica" ? getMaricaDistrictForNeighborhood(territory) : getRJRegionForCity(territory);
    const key = `${scope}-${normalize(territory)}`;
    const isCoordinator = isCoordinatorType(leader.leader_type);
    const estimatedSupporters = Number(leader.estimated_direct_supporters ?? 0) + Number(leader.estimated_indirect_supporters ?? 0) + Number(leader.registered_supporters ?? 0);
    const declaredVotes = Number(leader.declared_votes ?? 0);
    const validatedVotes = Number(leader.validated_votes ?? 0);

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        scope,
        territory,
        group,
        city: leader.city,
        neighborhood: leader.neighborhood,
        coordinators: 0,
        leaders: 0,
        actors: 0,
        estimatedSupporters: 0,
        declaredVotes: 0,
        validatedVotes: 0,
        validationRate: 0,
        conversionRate: 0,
        confidenceIndex: 0,
        distanceToDeclared: 0,
        priority: "Baixa",
        status: "Em leitura",
        linkedNames: [],
      });
    }

    const current = grouped.get(key)!;
    current.coordinators += isCoordinator ? 1 : 0;
    current.leaders += isCoordinator ? 0 : 1;
    current.actors += 1;
    current.estimatedSupporters += estimatedSupporters;
    current.declaredVotes += declaredVotes;
    current.validatedVotes += validatedVotes;
    current.confidenceIndex += confidenceWeight(leader.confidence_level);
    current.linkedNames.push(leader.full_name);
  });

  return Array.from(grouped.values())
    .map((row) => {
      const validationRate = row.declaredVotes ? Math.round((row.validatedVotes / row.declaredVotes) * 100) : 0;
      const conversionRate = row.estimatedSupporters ? Math.round((row.validatedVotes / row.estimatedSupporters) * 100) : 0;
      const confidenceIndex = row.actors ? Math.round(row.confidenceIndex / row.actors) : 0;
      const distanceToDeclared = Math.max(row.declaredVotes - row.validatedVotes, 0);
      const priority = inferPriority({ ...row, validationRate, conversionRate, confidenceIndex, distanceToDeclared });
      const status = inferStatus(priority, validationRate, row.validatedVotes);

      return { ...row, validationRate, conversionRate, confidenceIndex, distanceToDeclared, priority, status };
    })
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || b.validatedVotes - a.validatedVotes);
}

function buildSummary(rows: TerritoryRow[]) {
  const declaredVotes = sum(rows, "declaredVotes");
  const validatedVotes = sum(rows, "validatedVotes");
  const estimatedSupporters = sum(rows, "estimatedSupporters");

  return {
    territories: rows.length,
    coordinators: sum(rows, "coordinators"),
    leaders: sum(rows, "leaders"),
    actors: sum(rows, "actors"),
    estimatedSupporters,
    declaredVotes,
    validatedVotes,
    validationRate: declaredVotes ? Math.round((validatedVotes / declaredVotes) * 100) : 0,
    conversionRate: estimatedSupporters ? Math.round((validatedVotes / estimatedSupporters) * 100) : 0,
    attention: rows.filter((row) => row.priority === "Crítica" || row.priority === "Alta").length,
  };
}

function buildOptions(rows: TerritoryRow[]) {
  return {
    cities: unique(rows.map((row) => row.city)),
    neighborhoods: unique(rows.filter((row) => row.scope === "marica").map((row) => row.neighborhood)),
    statuses: unique(rows.map((row) => row.status)),
  };
}

function matchesFilters(row: TerritoryRow, filters: Filters) {
  const term = normalize(filters.search);
  return (
    (filters.scope === "todos" || row.scope === filters.scope) &&
    (filters.city === "todos" || row.city === filters.city) &&
    (filters.neighborhood === "todos" || row.neighborhood === filters.neighborhood) &&
    (filters.priority === "todos" || row.priority === filters.priority) &&
    (filters.status === "todos" || row.status === filters.status) &&
    (!term || [row.territory, row.group, row.city, row.neighborhood, ...row.linkedNames].some((item) => normalize(item).includes(term)))
  );
}

function inferPriority(row: TerritoryRow): Priority {
  if (row.actors === 0) return "Crítica";
  if (row.declaredVotes >= 200 && row.validationRate < 35) return "Crítica";
  if (row.estimatedSupporters >= 300 && row.validatedVotes < 100) return "Alta";
  if (row.coordinators === 0 && row.estimatedSupporters >= 150) return "Alta";
  if (row.validationRate >= 75 && row.validatedVotes >= 120) return "Manter";
  if (row.validationRate >= 45) return "Baixa";
  return "Média";
}

function inferStatus(priority: Priority, validationRate: number, validatedVotes: number) {
  if (priority === "Crítica") return "Crítico";
  if (priority === "Alta" || priority === "Média") return "Atenção";
  if (validationRate >= 75 || validatedVotes >= 200) return "Forte";
  return "Em desenvolvimento";
}

function isCoordinatorType(type: string) {
  const value = normalize(type);
  return value.includes("coord");
}

function confidenceWeight(confidence: string) {
  const value = normalize(confidence);
  if (value.includes("alto")) return 100;
  if (value.includes("medio") || value.includes("médio")) return 65;
  if (value.includes("baixo")) return 35;
  return 45;
}

function priorityWeight(priority: Priority) {
  if (priority === "Crítica") return 5;
  if (priority === "Alta") return 4;
  if (priority === "Média") return 3;
  if (priority === "Baixa") return 2;
  return 1;
}

function priorityTone(priority: Priority) {
  if (priority === "Crítica") return "red";
  if (priority === "Alta") return "amber";
  if (priority === "Média") return "blue";
  if (priority === "Manter") return "emerald";
  return "slate";
}

function normalizeOptions(options: string[] | Array<[string, string]>): Array<[string, string]> {
  return options.map((item) => Array.isArray(item) ? item : [item, item]);
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim())))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function sum<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("pt-BR");
}

function normalize(value?: string | null) {
  return (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Erro inesperado ao carregar os dados.";
}
