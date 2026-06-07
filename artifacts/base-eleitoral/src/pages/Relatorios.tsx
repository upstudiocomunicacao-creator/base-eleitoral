import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Map,
  MapPin,
  PieChart as PieChartIcon,
  Printer,
  RefreshCw,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { canViewSensitiveData } from "@/lib/permissions";
import {
  buildReportsDashboardData,
  emptyReportFilters,
  filterReportDataset,
  generateReportPreview,
  getReportsDashboardData,
  isReportsSupabaseReady,
  type ReportDefinition,
  type ReportFilters,
  type ReportPreviewData,
  type ReportsDashboardData,
} from "@/services/reportGenerator";
import { listReportHistory, registerReportHistory } from "@/services/reports";
import { exportReportCsv } from "@/utils/exportCsv";
import { exportReportExcel } from "@/utils/exportExcel";
import { exportReportPdf } from "@/utils/exportPdf";
import type { DashboardDataset } from "@/services/dashboard";

const iconByReport: Record<string, typeof BarChart3> = {
  geral: BarChart3,
  lideranca: Users,
  bairro: MapPin,
  municipio: Map,
  votos: TrendingUp,
  metas: Target,
  custos: FileSpreadsheet,
  regioes: AlertTriangle,
  calor: PieChartIcon,
  oportunidade: Sparkles,
  semanal: FileSpreadsheet,
};

export default function Relatorios() {
  const { profile } = useAuth();
  const [data, setData] = useState<ReportsDashboardData | null>(null);
  const [filters, setFilters] = useState<ReportFilters>(emptyReportFilters);
  const [selectedId, setSelectedId] = useState("geral");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyWarning, setHistoryWarning] = useState<string | null>(null);

  const canExportSensitive = canViewSensitiveData(profile);

  async function loadReports() {
    setLoading(true);
    setError(null);
    setHistoryWarning(null);

    if (!isReportsSupabaseReady()) {
      setData(null);
      setError("Supabase não está configurado. Preencha as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar relatórios reais.");
      setLoading(false);
      return;
    }

    try {
      const history = await listReportHistory()
        .then((items) => items.map((item) => ({
          name: item.report_name,
          type: item.report_type,
          filters: summarizeHistoryFilters(item.filters),
          date: new Date(item.created_at).toLocaleDateString("pt-BR"),
          user: item.generated_by ?? "Sistema",
          status: item.status,
        })))
        .catch((err) => {
          setHistoryWarning(`Histórico indisponível: ${getErrorMessage(err)}`);
          return [];
        });

      setData(await getReportsDashboardData(history));
    } catch (err) {
      setData(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  const filteredDataset = useMemo(() => data ? filterReportDataset(data.dataset, filters) : null, [data, filters]);
  const dashboardData = useMemo(() => data && filteredDataset ? buildReportsDashboardData(filteredDataset, data.history, [...data.warnings, ...filteredDataset.warnings]) : null, [data, filteredDataset]);
  const selectedReport = useMemo(() => dashboardData?.definitions.find((item) => item.id === selectedId) ?? dashboardData?.definitions[0] ?? null, [dashboardData, selectedId]);
  const preview = useMemo(() => filteredDataset && selectedReport ? sanitizePreview(generateReportPreview(filteredDataset, selectedReport.id, filters), canExportSensitive) : null, [canExportSensitive, filteredDataset, filters, selectedReport]);
  const visibleReports = useMemo(() => dashboardData?.definitions.filter((item) => filters.tipo === "todos" || item.type === filters.tipo) ?? [], [dashboardData, filters.tipo]);

  async function handleExport(kind: "csv" | "xlsx" | "pdf") {
    if (!preview || !data) return;
    setExporting(kind);
    try {
      if (kind === "csv") exportReportCsv(preview);
      if (kind === "xlsx") await exportReportExcel(preview, filters);
      if (kind === "pdf") await exportReportPdf(preview);

      await registerReportHistory({
        campaignId: data.dataset.campaigns[0]?.id,
        reportName: preview.definition.title,
        reportType: preview.definition.type,
        filters,
        generatedBy: profile?.full_name ?? profile?.email ?? null,
        status: "Gerado",
      }).catch((err) => {
        setHistoryWarning(`Download gerado, mas o histórico não foi salvo: ${getErrorMessage(err)}`);
      });

      toast({ title: "Relatório exportado", description: `${preview.definition.title} foi gerado em ${kind.toUpperCase()}.` });
      void loadReports();
    } catch (err) {
      toast({ title: "Erro na exportação", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setExporting(null);
    }
  }

  const summary = dashboardData?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relatórios"
        title="Central Estratégica de Relatórios"
        description="Relatórios reais com filtros, leitura executiva, histórico e exportação em PDF, Excel e CSV."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadReports()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <PermissionGate module="relatorios" action="export">
              <Button onClick={() => void handleExport("pdf")} disabled={!preview || Boolean(exporting)}>
                {exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Gerar resumo executivo
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {error ? <ConnectionWarning message={error} onRetry={() => void loadReports()} /> : null}
      {historyWarning ? <WarningPanel message={historyWarning} /> : null}
      {dashboardData?.warnings.length ? <WarningPanel message={`Algumas tabelas retornaram vazias ou com restrição. A tela segue com os dados disponíveis. ${dashboardData.warnings.slice(0, 2).join(" | ")}`} /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <MetricCard label="Disponíveis" value={summary?.availableReports ?? 0} icon={FileText} tone="blue" loading={loading} />
        <MetricCard label="Gerados no mês" value={summary?.generatedThisMonth ?? 0} icon={Download} tone="emerald" loading={loading} />
        <MetricCard label="Última atualização" value={summary?.lastUpdate ?? "-"} icon={CalendarDays} tone="indigo" loading={loading} />
        <MetricCard label="Cadastros" value={summary?.analyzedLeaders ?? 0} icon={Users} tone="violet" loading={loading} />
        <MetricCard label="Territórios" value={summary?.analyzedTerritories ?? 0} icon={MapPin} tone="cyan" loading={loading} />
        <MetricCard label="Apoio estimado" value={summary?.estimatedSupporters ?? 0} icon={Users} tone="orange" loading={loading} />
        <MetricCard label="Votos mínimos" value={summary?.analyzedValidatedVotes ?? 0} icon={TrendingUp} tone="green" loading={loading} />
        <MetricCard label="Críticos" value={summary?.criticalIndicators ?? 0} icon={AlertTriangle} tone="red" loading={loading} />
      </section>

      <ReportFilters filters={filters} setFilters={setFilters} options={dashboardData?.options} />

      {!loading && !error && dashboardData && dashboardData.summary.analyzedLeaders === 0 ? (
        <EmptyState title="Sem dados reais para relatórios" description="Cadastre coordenações ou lideranças territoriais para alimentar a central." icon={FileText} />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <div className="space-y-4">
          <ReportLibrary reports={visibleReports} selectedId={selectedId} onSelect={setSelectedId} loading={loading} />
          <QuickReports reports={dashboardData?.definitions ?? []} onSelect={setSelectedId} loading={loading} />
        </div>
        <ReportPreview report={preview} loading={loading} exporting={exporting} onExport={handleExport} />
      </section>

      <HistoryTable history={dashboardData?.history ?? []} loading={loading} />
    </div>
  );
}

function ReportFilters({ filters, setFilters, options }: { filters: ReportFilters; setFilters: (filters: ReportFilters) => void; options?: ReportsDashboardData["options"] }) {
  const update = (key: keyof ReportFilters, value: string) => setFilters({ ...filters, [key]: value });
  return (
    <Card className="premium-card">
      <CardHeader className="pb-3"><CardTitle className="text-base">Filtros globais</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <FilterSelect label="Estado" value={filters.estado} options={options?.states ?? []} onChange={(value) => update("estado", value)} />
        <FilterSelect label="Cidade" value={filters.cidade} options={options?.cities ?? []} onChange={(value) => update("cidade", value)} />
        <FilterSelect label="Bairro" value={filters.bairro} options={options?.neighborhoods ?? []} onChange={(value) => update("bairro", value)} />
        <FilterSelect label="Liderança" value={filters.lideranca} options={options?.leaders ?? []} onChange={(value) => update("lideranca", value)} />
        <FilterSelect label="Responsável" value={filters.responsavel} options={options?.responsibles ?? []} onChange={(value) => update("responsavel", value)} />
        <FilterSelect label="Período" value={filters.periodo} options={["Últimos 7 dias", "Últimos 30 dias", "Ciclo completo"]} onChange={(value) => update("periodo", value)} />
        <FilterSelect label="Prioridade" value={filters.prioridade} options={options?.priorities ?? []} onChange={(value) => update("prioridade", value)} />
        <FilterSelect label="Status" value={filters.status} options={options?.statuses ?? []} onChange={(value) => update("status", value)} />
        <FilterSelect label="Tipo de relatório" value={filters.tipo} options={options?.types ?? []} onChange={(value) => update("tipo", value)} />
        <div className="flex items-end"><Button className="w-full" variant="outline" onClick={() => setFilters(emptyReportFilters)}>Limpar filtros</Button></div>
      </CardContent>
    </Card>
  );
}

function ReportLibrary({ reports, selectedId, onSelect, loading }: { reports: ReportDefinition[]; selectedId: string; onSelect: (id: string) => void; loading: boolean }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">Biblioteca de relatórios</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {loading ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-lg" />) : reports.map((item) => {
          const Icon = iconByReport[item.id] ?? BarChart3;
          const selected = item.id === selectedId;
          return (
            <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={`rounded-lg border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-blue-200 bg-blue-50/70" : "border-slate-100 bg-white"}`}>
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <div className="font-extrabold leading-tight text-slate-950">{item.title}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{item.type} · {item.scope}</div>
                </div>
              </div>
              <p className="min-h-12 text-sm font-medium leading-6 text-slate-600">{item.description}</p>
              <Button type="button" variant="outline" className="mt-3 w-full">Visualizar</Button>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function QuickReports({ reports, onSelect, loading }: { reports: ReportDefinition[]; onSelect: (id: string) => void; loading: boolean }) {
  const quickIds = ["semanal", "metas", "oportunidade", "lideranca"];
  const quick = quickIds.map((id) => reports.find((item) => item.id === id)).filter(Boolean) as ReportDefinition[];
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">Relatórios rápidos</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-lg" />) : quick.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect(item.id)} className="rounded-lg border border-slate-100 bg-white p-4 text-left shadow-sm hover:border-blue-100 hover:shadow-md">
            <div className="font-bold text-slate-900">{item.title}</div>
            <div className="mt-1 text-sm font-medium text-slate-500">{item.description}</div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function ReportPreview({ report, loading, exporting, onExport }: { report: ReportPreviewData | null; loading: boolean; exporting: string | null; onExport: (kind: "csv" | "xlsx" | "pdf") => Promise<void> }) {
  if (loading) return <Card className="premium-card"><CardContent className="space-y-4 p-5"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></CardContent></Card>;
  if (!report) return <EmptyState title="Selecione um relatório" description="A prévia aparece aqui assim que houver dados disponíveis." icon={FileText} />;

  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">{report.definition.title}</CardTitle>
            <p className="mt-1 text-sm font-medium text-slate-500">{report.period} · {report.appliedFilters}</p>
          </div>
          <StatusPill label={report.definition.type} tone={report.definition.type === "Estratégico" ? "red" : report.definition.type === "Operacional" ? "amber" : "blue"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-blue-700">Resumo executivo</div>
          <p className="text-sm font-semibold leading-6 text-slate-700">{report.executiveSummary}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {report.metrics.map((item) => <PreviewMetric key={item.label} label={item.label} value={item.value} />)}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Bloco visual do relatório</CardTitle></CardHeader>
            <CardContent className="h-64">
              {report.chart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.chart} margin={{ left: -20, right: 8, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" angle={-30} textAnchor="end" height={58} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey={getChartPrimaryKey(report.chart)} radius={[6, 6, 0, 0]}>
                      {report.chart.map((item, index) => <Cell key={`${item.name}-${index}`} fill={["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState title="Sem dados para gráfico" description="O bloco visual será preenchido com o recorte atual." icon={BarChart3} />}
            </CardContent>
          </Card>
          <Card className="border border-emerald-100 bg-emerald-50/70 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Leitura estratégica automática</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold leading-6 text-slate-700">{report.strategicReading}</p>
              {report.recommendations.slice(1, 4).map((item) => <div key={item} className="rounded-lg bg-white/80 p-3 text-sm font-semibold text-slate-700">{item}</div>)}
            </CardContent>
          </Card>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <Table>
            <TableHeader><TableRow>{getTableHeaders(report.rows).map((head) => <TableHead key={head}>{head}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {report.rows.slice(0, 8).map((row, index) => (
                <TableRow key={index}>
                  {getTableHeaders(report.rows).map((head) => <TableCell key={head} className={index === 0 && head === getTableHeaders(report.rows)[0] ? "font-bold" : ""}>{String(row[head] ?? "-")}</TableCell>)}
                </TableRow>
              ))}
              {!report.rows.length ? <TableRow><TableCell colSpan={4}>Sem dados para o recorte atual.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <ExportButton label="Exportar PDF" icon={Download} busy={exporting === "pdf"} onClick={() => onExport("pdf")} />
          <ExportButton label="Exportar Excel" icon={FileSpreadsheet} busy={exporting === "xlsx"} onClick={() => onExport("xlsx")} />
          <ExportButton label="Exportar CSV" icon={FileText} busy={exporting === "csv"} onClick={() => onExport("csv")} />
          <Button variant="outline" className="justify-start" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir</Button>
          <Button variant="outline" className="justify-start" onClick={() => void navigator.clipboard?.writeText(report.executiveSummary)}><Share2 className="h-4 w-4" /> Compartilhar resumo</Button>
          <Button variant="outline" className="justify-start" onClick={() => void onExport("pdf")}><Sparkles className="h-4 w-4" /> Resumo executivo</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryTable({ history, loading }: { history: ReportsDashboardData["history"]; loading: boolean }) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">Histórico de relatórios gerados</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>{["Nome do relatório", "Tipo", "Filtros aplicados", "Data", "Usuário", "Status", "Ações"].map((head) => <TableHead key={head}>{head}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {loading ? Array.from({ length: 4 }).map((_, index) => <TableRow key={index}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>) : history.map((item) => (
                <TableRow key={`${item.name}-${item.date}-${item.user}`}>
                  <TableCell className="min-w-[220px] font-bold text-slate-900">{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell className="min-w-[180px]">{item.filters}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.user}</TableCell>
                  <TableCell><StatusPill label={item.status} tone={historyTone(item.status)} /></TableCell>
                  <TableCell><Button size="sm" variant="outline">Visualizar</Button></TableCell>
                </TableRow>
              ))}
              {!loading && !history.length ? <TableRow><TableCell colSpan={7}>Nenhum histórico registrado ainda.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
        <option value="todos">Todos</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"><div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label}</div><div className="mt-1 text-2xl font-extrabold text-slate-950">{formatValue(value)}</div></div>;
}

function ExportButton({ label, icon: Icon, busy, onClick }: { label: string; icon: typeof Download; busy: boolean; onClick: () => void }) {
  return (
    <PermissionGate module="relatorios" action="export">
      <Button variant="outline" className="justify-start" disabled={busy} onClick={onClick}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />} {label}</Button>
    </PermissionGate>
  );
}

function ConnectionWarning({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card className="border-red-200 bg-red-50 shadow-sm"><CardContent className="flex flex-col gap-3 p-4 text-red-900 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><div className="font-extrabold">Não foi possível carregar relatórios</div><p className="text-sm font-medium leading-6">{message}</p></div></div><Button variant="outline" onClick={onRetry}>Tentar novamente</Button></CardContent></Card>;
}

function WarningPanel({ message }: { message: string }) {
  return <Card className="border-amber-200 bg-amber-50 shadow-sm"><CardContent className="p-4 text-sm font-medium text-amber-900">{message}</CardContent></Card>;
}

function sanitizePreview(report: ReportPreviewData, includeSensitive: boolean): ReportPreviewData {
  if (includeSensitive) return report;
  return {
    ...report,
    rows: report.rows.map((row) => {
      const next = { ...row };
      Object.keys(next).forEach((key) => {
        if (normalize(key).includes("telefone")) next[key] = maskPhone(String(next[key]));
        if (normalize(key).includes("email")) next[key] = maskEmail(String(next[key]));
      });
      return next;
    }),
  };
}

function getTableHeaders(rows: Array<Record<string, string | number>>) {
  return Object.keys(rows[0] ?? { Status: "Sem dados" }).slice(0, 8);
}

function getChartPrimaryKey(chart: Array<Record<string, string | number>>) {
  const first = chart[0] ?? {};
  return Object.keys(first).find((key) => key !== "name" && typeof first[key] === "number") ?? "valor";
}

function summarizeHistoryFilters(filters: unknown) {
  if (!filters || typeof filters !== "object") return "Sem filtros";
  return Object.entries(filters as Record<string, unknown>)
    .filter(([, value]) => value && value !== "todos")
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ") || "Todos";
}

function historyTone(status: string) {
  if (status === "Gerado") return "green";
  if (status === "Em processamento") return "blue";
  if (status === "Agendado") return "amber";
  if (status === "Falhou") return "red";
  return "slate";
}

function formatValue(value: string | number) {
  return typeof value === "number" ? value.toLocaleString("pt-BR") : value;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `${value.slice(0, 4)} *****-${digits.slice(-2)}`;
}

function maskEmail(value: string) {
  const [name, domain] = value.split("@");
  if (!domain) return "****";
  return `${name.slice(0, 2)}***@${domain}`;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message);
  return "Erro inesperado ao carregar ou exportar relatório.";
}
