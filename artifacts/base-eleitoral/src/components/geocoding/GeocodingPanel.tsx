import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Crosshair, DatabaseZap, Edit, Loader2, MapPin, RefreshCw, RotateCcw, SkipForward } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  bulkGeocode,
  geocodeRecord,
  getAllGeocodingRecords,
  getGeocodingStats,
  isGeocodingSupabaseReady,
  markRecordSkipped,
  summarizeGeocodingAddress,
  type GeocodingRecord,
  type GeocodingTableName,
} from "@/services/geocoding";
import { GeocodingReviewDrawer } from "./GeocodingReviewDrawer";
import { GeocodingStatusBadge } from "./GeocodingStatusBadge";

type Filters = {
  type: GeocodingTableName | "all";
  city: string;
  neighborhood: string;
  status: string;
  precision: string;
  source: string;
  onlyErrors: boolean;
  missingCoordinates: boolean;
};

const defaultFilters: Filters = {
  type: "all",
  city: "todos",
  neighborhood: "todos",
  status: "todos",
  precision: "todos",
  source: "todos",
  onlyErrors: false,
  missingCoordinates: false,
};

export function GeocodingPanel() {
  const [records, setRecords] = useState<GeocodingRecord[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getGeocodingStats>> | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selected, setSelected] = useState<GeocodingRecord | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextRecords, nextStats] = await Promise.all([getAllGeocodingRecords(), getGeocodingStats()]);
      setRecords(nextRecords);
      setStats(nextStats);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const options = useMemo(() => ({
    cities: unique(records.map((item) => item.city ?? "")),
    neighborhoods: unique(records.map((item) => item.neighborhood ?? "")),
    statuses: unique(records.map((item) => item.geocoding_status ?? "pending")),
    precisions: unique(records.map((item) => item.geographic_precision ?? "")),
    sources: unique(records.map((item) => item.geocoding_source ?? "")),
  }), [records]);

  const filtered = useMemo(() => records.filter((record) => {
    if (filters.type !== "all" && record.tableName !== filters.type) return false;
    if (!matches(filters.city, record.city)) return false;
    if (!matches(filters.neighborhood, record.neighborhood)) return false;
    if (!matches(filters.status, record.geocoding_status ?? "pending")) return false;
    if (!matches(filters.precision, record.geographic_precision ?? "")) return false;
    if (!matches(filters.source, record.geocoding_source ?? "")) return false;
    if (filters.onlyErrors && record.geocoding_status !== "failed") return false;
    if (filters.missingCoordinates && hasCoordinates(record)) return false;
    return true;
  }), [filters, records]);

  async function runOne(record: GeocodingRecord) {
    setProcessing(record.id);
    try {
      await geocodeRecord(record);
      toast({ title: "Registro geocodificado", description: `${record.title} recebeu coordenadas aproximadas.` });
      await load();
    } catch (err) {
      toast({ title: "Erro ao geocodificar", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }

  async function runBulk() {
    setProcessing("bulk");
    try {
      const result = await bulkGeocode(filters.type, filters);
      toast({
        title: "Geocodificação em lote concluída",
        description: result.errors[0]
          ? `${result.approximate + result.success} processados, ${result.failed} falhas. Primeiro erro: ${result.errors[0]}`
          : `${result.approximate + result.success} processados, ${result.failed} falhas, ${result.skipped} ignorados.`,
      });
      await load();
    } catch (err) {
      toast({ title: "Erro no lote", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }

  async function skip(record: GeocodingRecord) {
    setProcessing(record.id);
    try {
      await markRecordSkipped(record);
      await load();
    } finally {
      setProcessing(null);
    }
  }

  function openReview(record: GeocodingRecord) {
    setSelected(record);
    setReviewOpen(true);
  }

  return (
    <div className="space-y-6">
      {!isGeocodingSupabaseReady() ? <Warning message="Supabase não está configurado. A geocodificação precisa da anon key para salvar coordenadas." /> : null}
      {error ? <Warning danger message={error} /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Com coordenadas" value={stats?.withCoordinates ?? 0} icon={MapPin} tone="green" loading={loading} />
        <MetricCard label="Pendentes" value={stats?.pending ?? 0} icon={RefreshCw} tone="blue" loading={loading} />
        <MetricCard label="Aproximados" value={stats?.approximate ?? 0} icon={Crosshair} tone="amber" loading={loading} />
        <MetricCard label="Com erro" value={stats?.failed ?? 0} icon={AlertTriangle} tone="red" loading={loading} />
        <MetricCard label="Manuais" value={stats?.manual ?? 0} icon={Edit} tone="violet" loading={loading} />
        <MetricCard label="Precisão média" value={`${stats?.averagePrecision ?? 0}%`} icon={CheckCircle2} tone="emerald" loading={loading} />
        <MetricCard label="Cadastros" value={stats?.total ?? 0} icon={DatabaseZap} tone="indigo" loading={loading} />
        <MetricCard label="Prontos para mapa" value={stats?.leaders ?? 0} icon={DatabaseZap} tone="cyan" loading={loading} />
      </section>

      <Card className="premium-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Filtros e ações</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar</Button>
            <Button onClick={runBulk} disabled={processing === "bulk" || loading}>
              {processing === "bulk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
              Geocodificar pendentes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Tipo" value={filters.type} options={[["all", "Todos"], ["leaders", "Cadastros territoriais"]]} onChange={(value) => setFilters({ ...filters, type: value as Filters["type"] })} />
          <Select label="Cidade" value={filters.city} options={options.cities.map((item) => [item, item])} onChange={(value) => setFilters({ ...filters, city: value })} />
          <Select label="Bairro" value={filters.neighborhood} options={options.neighborhoods.map((item) => [item, item])} onChange={(value) => setFilters({ ...filters, neighborhood: value })} />
          <Select label="Status" value={filters.status} options={options.statuses.map((item) => [item, item])} onChange={(value) => setFilters({ ...filters, status: value })} />
          <Select label="Precisão" value={filters.precision} options={options.precisions.map((item) => [item, item])} onChange={(value) => setFilters({ ...filters, precision: value })} />
          <Select label="Fonte" value={filters.source} options={options.sources.map((item) => [item, item])} onChange={(value) => setFilters({ ...filters, source: value })} />
          <label className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-semibold"><input type="checkbox" checked={filters.onlyErrors} onChange={(event) => setFilters({ ...filters, onlyErrors: event.target.checked })} /> Com erro</label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-semibold"><input type="checkbox" checked={filters.missingCoordinates} onChange={(event) => setFilters({ ...filters, missingCoordinates: event.target.checked })} /> Sem coordenadas</label>
        </CardContent>
      </Card>

      <Card className="premium-card overflow-hidden">
        <CardHeader><CardTitle className="text-base">Registros para geocodificação</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="p-4"><Skeleton className="h-72 w-full" /></div> : filtered.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Tipo", "Nome/título", "Endereço", "Bairro", "Cidade", "Precisão", "Status", "Fonte", "Confiança", "Latitude", "Longitude", "Última tentativa", "Ações"].map((head) => <TableHead key={head}>{head}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 100).map((record) => (
                    <TableRow key={`${record.tableName}-${record.id}`}>
                      <TableCell><StatusPill label={record.typeLabel} tone="blue" /></TableCell>
                      <TableCell className="min-w-48 font-bold">{record.title}</TableCell>
                      <TableCell className="min-w-72">{summarizeGeocodingAddress(record)}</TableCell>
                      <TableCell>{record.neighborhood ?? "-"}</TableCell>
                      <TableCell>{record.city ?? "-"}</TableCell>
                      <TableCell>{record.geographic_precision ?? "-"}</TableCell>
                      <TableCell><GeocodingStatusBadge status={record.geocoding_status} /></TableCell>
                      <TableCell>{record.geocoding_source ?? "-"}</TableCell>
                      <TableCell>{record.geocoding_confidence ? `${Math.round(record.geocoding_confidence * 100)}%` : "-"}</TableCell>
                      <TableCell>{record.latitude ?? "-"}</TableCell>
                      <TableCell>{record.longitude ?? "-"}</TableCell>
                      <TableCell>{record.geocoding_last_attempt_at ? new Date(record.geocoding_last_attempt_at).toLocaleString("pt-BR") : "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => void runOne(record)} disabled={processing === record.id}>{processing === record.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}</Button>
                          <Button size="sm" variant="outline" onClick={() => openReview(record)}><Edit className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => void skip(record)}><SkipForward className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => void runOne(record)}><RotateCcw className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : <EmptyState title="Nenhum registro encontrado" description="Ajuste os filtros ou cadastre território em Lideranças." icon={MapPin} />}
        </CardContent>
      </Card>

      <GeocodingReviewDrawer record={selected} open={reviewOpen} onOpenChange={setReviewOpen} onSaved={() => void load()} />
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold">
        <option value="todos">Todos</option>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function Warning({ message, danger = false }: { message: string; danger?: boolean }) {
  return <Card className={`${danger ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"} shadow-sm`}><CardContent className="flex items-start gap-3 p-4"><AlertTriangle className="mt-0.5 h-5 w-5" /><p className="text-sm font-semibold">{message}</p></CardContent></Card>;
}

function hasCoordinates(record: GeocodingRecord) {
  return Number.isFinite(Number(record.latitude)) && Number.isFinite(Number(record.longitude));
}

function matches(filter: string, value?: string | null) {
  return filter === "todos" || normalize(filter) === normalize(value);
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function normalize(value: unknown) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message);
  return "Erro inesperado na geocodificação.";
}
