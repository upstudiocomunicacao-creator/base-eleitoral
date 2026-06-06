import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Flame,
  Layers,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RadioTower,
  Route,
  Search,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
  Vote,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { RealMapContainer } from "@/components/maps/RealMapContainer";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MapDataFilters } from "@/services/mapData";
import { cityTerritories, enrichTerritory, formatPercent, heatModes, stateTerritories } from "./territoryData";
import type { EnrichedTerritoryRecord, HeatMode, MapViewMode, TerritoryPriority, TerritoryScope, TerritoryStatus } from "./types";

type Filters = {
  area: string;
  region: string;
  status: string;
  priority: string;
  leaders: string;
  supporters: string;
  votes: string;
  responsible: string;
  period: string;
  zone: string;
  section: string;
  precision: string;
};

type RankingGroup = {
  title: string;
  description: string;
  icon: LucideIcon;
  records: EnrichedTerritoryRecord[];
  value: (record: EnrichedTerritoryRecord) => string;
};

const all = "todos";
const emptyFilters: Filters = {
  area: all,
  region: all,
  status: all,
  priority: all,
  leaders: all,
  supporters: all,
  votes: all,
  responsible: all,
  period: all,
  zone: all,
  section: all,
  precision: all,
};

const viewModes: Array<{ key: MapViewMode; label: string; icon: LucideIcon }> = [
  { key: "estrategico", label: "Mapa estrat\u00e9gico", icon: Navigation },
  { key: "heatmap", label: "Heatmap", icon: Flame },
  { key: "pins", label: "Pins", icon: MapPin },
];

export function TerritoryMapPage({ scope }: { scope: TerritoryScope }) {
  const isState = scope === "state";
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [activeLayer, setActiveLayer] = useState<HeatMode>(isState ? "forca" : "apoiadores");
  const [viewMode, setViewMode] = useState<MapViewMode>("estrategico");
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<EnrichedTerritoryRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const records = useMemo(() => (isState ? stateTerritories : cityTerritories).map(enrichTerritory), [isState]);
  const options = useMemo(() => buildOptions(records), [records]);
  const filtered = useMemo(() => records.filter((item) => matches(item, filters)), [records, filters]);
  const summary = useMemo(() => buildSummary(filtered, scope), [filtered, scope]);
  const rankings = useMemo(() => buildRankingGroups(filtered, scope), [filtered, scope]);
  const realMapFilters = useMemo(() => buildRealMapFilters(filters, scope), [filters, scope]);

  const openDetails = (record: EnrichedTerritoryRecord) => {
    setSelected(record);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isState ? "Mapa RJ" : "Mapa Maric\u00e1"}
        title={isState ? "Leitura territorial do Rio de Janeiro" : "Mapa estrat\u00e9gico de Maric\u00e1"}
        description={
          isState
            ? "Leitura por município, com intensidade territorial, ranking estratégico e camada Mapbox/PostGIS preparada."
            : "Leitura por bairro, rua, zona e potencial eleitoral, com heatmap, geocodificação e dados de campo."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline"><Layers className="h-4 w-4" /> Visual estratégico</Button>
            <Button variant="outline"><Route className="h-4 w-4" /> Pronto para mapa real</Button>
          </div>
        }
      />

      <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
        <CardContent className="flex flex-col gap-2 p-4 text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold">
            <MapPin className="h-4 w-4" />
            Dados geográficos preparados para mapa real.
          </div>
          <span className="text-xs font-semibold text-emerald-700">Use a tela Geocodificação para gerar latitude/longitude antes da camada Mapbox.</span>
        </CardContent>
      </Card>

      <TerritoryStatsCards scope={scope} summary={summary} />
      <MapFilters scope={scope} filters={filters} setFilters={setFilters} options={options} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <RealMapContainer
            scope={scope}
            filters={realMapFilters}
            fallback={(
              <div className="space-y-4">
                <MapLayerToggle
                  scope={scope}
                  activeLayer={activeLayer}
                  setActiveLayer={setActiveLayer}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  zoom={zoom}
                  setZoom={setZoom}
                />
                <MockMapContainer
                  scope={scope}
                  records={filtered}
                  activeLayer={activeLayer}
                  viewMode={viewMode}
                  zoom={zoom}
                  selected={selected}
                  onSelect={openDetails}
                />
              </div>
            )}
          />
          {!isState ? <HeatmapLayerMock records={filtered} activeLayer={activeLayer} onSelect={openDetails} /> : null}
          <StrategicMapPanel scope={scope} records={filtered} onSelect={openDetails} />
        </div>

        <aside className="space-y-4">
          <MapLegend activeLayer={activeLayer} />
          <TerritoryRanking groups={rankings} onSelect={openDetails} />
        </aside>
      </section>

      <TerritoryDetailDrawer
        scope={scope}
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

function buildRealMapFilters(filters: Filters, scope: TerritoryScope): MapDataFilters {
  const active = (value: string) => value && value !== all ? value : undefined;
  const mapFilters: MapDataFilters = {
    city: scope === "state" ? active(filters.area) : "Maricá",
    neighborhood: scope === "city" ? active(filters.area) : undefined,
    status: active(filters.status),
    priority: active(filters.priority),
    responsible: active(filters.responsible),
    precision: active(filters.precision),
    period: active(filters.period),
    zone: scope === "city" ? active(filters.zone) : undefined,
    section: scope === "city" ? active(filters.section) : undefined,
  };

  return Object.fromEntries(Object.entries(mapFilters).filter(([, value]) => value !== undefined)) as MapDataFilters;
}

function TerritoryStatsCards({ scope, summary }: { scope: TerritoryScope; summary: ReturnType<typeof buildSummary> }) {
  const isState = scope === "state";
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard label={isState ? "Munic\u00edpios com atua\u00e7\u00e3o" : "Bairros mapeados"} value={summary.activeAreas} icon={MapPin} tone="blue" />
      <MetricCard label={isState ? "Munic\u00edpios sem atua\u00e7\u00e3o" : "Bairros sem cobertura"} value={summary.inactiveAreas} icon={AlertTriangle} tone="amber" />
      <MetricCard label={isState ? "Lideran\u00e7as no RJ" : "Lideran\u00e7as em Maric\u00e1"} value={summary.leaders} icon={RadioTower} tone="indigo" />
      <MetricCard label={isState ? "Apoiadores no RJ" : "Apoiadores em Maric\u00e1"} value={summary.supporters} icon={Users} tone="emerald" />
      <MetricCard label="Votos declarados" value={summary.declaredVotes} icon={Vote} tone="violet" />
      <MetricCard label="Votos validados" value={summary.validatedVotes} icon={CheckCircle2} tone="green" />
      <MetricCard label={isState ? "Cobertura estadual" : "Cobertura municipal"} value={formatPercent(summary.coverage)} icon={BarChart3} tone="cyan" />
      <MetricCard label={isState ? "Munic\u00edpios priorit\u00e1rios" : "Bairros priorit\u00e1rios"} value={summary.priorityAreas} icon={Target} tone="orange" />
      <MetricCard label={isState ? "Munic\u00edpios cr\u00edticos" : "Bairros cr\u00edticos"} value={summary.criticalAreas} icon={Zap} tone="red" />
      <MetricCard label="Crescimento semanal" value={`+${summary.weeklyGrowth}`} icon={TrendingUp} tone="emerald" />
    </section>
  );
}

function MapFilters({ scope, filters, setFilters, options }: { scope: TerritoryScope; filters: Filters; setFilters: (filters: Filters) => void; options: Record<string, string[]> }) {
  const isState = scope === "state";
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value });

  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><SlidersHorizontal className="h-4 w-4 text-blue-600" /> Filtros territoriais</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <FilterSelect label={isState ? "Município" : "Bairro"} value={filters.area} options={options.area} onChange={(value) => update("area", value)} />
        <FilterSelect label="Região" value={filters.region} options={options.region} onChange={(value) => update("region", value)} />
        <FilterSelect label="Status da campanha" value={filters.status} options={options.status} onChange={(value) => update("status", value)} />
        <FilterSelect label="Prioridade" value={filters.priority} options={options.priority} onChange={(value) => update("priority", value)} />
        <FilterSelect label="Faixa de lideranças" value={filters.leaders} options={["Sem liderança", "1 a 3", "4 ou mais"]} onChange={(value) => update("leaders", value)} />
        <FilterSelect label="Faixa de apoiadores" value={filters.supporters} options={["Até 150", "151 a 400", "Acima de 400"]} onChange={(value) => update("supporters", value)} />
        <FilterSelect label="Faixa de votos" value={filters.votes} options={["Até 100", "101 a 300", "Acima de 300"]} onChange={(value) => update("votes", value)} />
        <FilterSelect label={isState ? "Responsável regional" : "Responsável interno"} value={filters.responsible} options={options.responsible} onChange={(value) => update("responsible", value)} />
        <FilterSelect label="Período" value={filters.period} options={["Semana atual", "Últimos 30 dias", "Ciclo completo"]} onChange={(value) => update("period", value)} />
        {!isState ? <FilterSelect label="Zona eleitoral" value={filters.zone} options={options.zone} onChange={(value) => update("zone", value)} /> : null}
        {!isState ? <FilterSelect label="Seção eleitoral" value={filters.section} options={options.section} onChange={(value) => update("section", value)} /> : null}
        {!isState ? <FilterSelect label="Precisão geográfica" value={filters.precision} options={options.precision} onChange={(value) => update("precision", value)} /> : null}
        <div className="flex items-end">
          <Button className="w-full" variant="outline" onClick={() => setFilters(emptyFilters)}><Search className="h-4 w-4" /> Limpar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MapLayerToggle({
  scope,
  activeLayer,
  setActiveLayer,
  viewMode,
  setViewMode,
  zoom,
  setZoom,
}: {
  scope: TerritoryScope;
  activeLayer: HeatMode;
  setActiveLayer: (mode: HeatMode) => void;
  viewMode: MapViewMode;
  setViewMode: (mode: MapViewMode) => void;
  zoom: number;
  setZoom: (value: number) => void;
}) {
  const layerOptions = heatModes.filter((mode) => scope === "city" || ["forca", "apoiadores", "liderancas", "votos", "oportunidade", "sem_cobertura"].includes(mode.key));

  return (
    <Card className="premium-card overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Camadas de leitura</div>
          <Tabs value={activeLayer} onValueChange={(mode) => setActiveLayer(mode as HeatMode)}>
            <TabsList className="grid h-auto grid-cols-2 gap-1 bg-slate-100 p-1 sm:grid-cols-3 xl:grid-cols-6">
              {layerOptions.map((mode) => <TabsTrigger key={mode.key} value={mode.key} className="text-xs">{mode.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Visual</div>
            <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              {viewModes.map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setViewMode(key)} className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-bold transition ${viewMode === key ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Zoom visual</div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <Button size="icon" variant="ghost" onClick={() => setZoom(Math.max(0.85, Number((zoom - 0.08).toFixed(2))))}><Minus className="h-4 w-4" /></Button>
              <span className="w-12 text-center text-xs font-extrabold text-slate-700">{Math.round(zoom * 100)}%</span>
              <Button size="icon" variant="ghost" onClick={() => setZoom(Math.min(1.2, Number((zoom + 0.08).toFixed(2))))}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MockMapContainer({
  scope,
  records,
  activeLayer,
  viewMode,
  zoom,
  selected,
  onSelect,
}: {
  scope: TerritoryScope;
  records: EnrichedTerritoryRecord[];
  activeLayer: HeatMode;
  viewMode: MapViewMode;
  zoom: number;
  selected: EnrichedTerritoryRecord | null;
  onSelect: (record: EnrichedTerritoryRecord) => void;
}) {
  const isState = scope === "state";
  const title = isState ? "Estado do Rio de Janeiro" : "Munic\u00edpio de Maric\u00e1";

  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Navigation className="h-4 w-4 text-blue-600" /> {isState ? "Mapa RJ estratégico" : "Mapa Maricá estratégico"}</CardTitle>
          <StatusPill label="Sem API externa" tone="blue" />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="relative min-h-[620px] overflow-hidden rounded-xl border border-blue-100 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,0.20),transparent_28%),radial-gradient(circle_at_78%_10%,rgba(16,185,129,0.18),transparent_25%),linear-gradient(135deg,#eff6ff,#f8fafc_44%,#ecfeff)] p-4 shadow-inner">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(37,99,235,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.09)_1px,transparent_1px)] [background-size:38px_38px]" />
          <div className="absolute -left-10 top-24 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="absolute bottom-2 right-4 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute left-[10%] top-[11%] h-[73%] w-[78%] rounded-[42%_58%_49%_51%/54%_36%_64%_46%] border border-blue-200/70 bg-white/28 shadow-inner" />
          <div className="absolute left-[20%] top-[20%] h-[58%] w-[56%] rounded-[48%_42%_52%_36%/44%_52%_34%_58%] border border-emerald-200/70 bg-emerald-50/25" />
          <div className="absolute left-[16%] top-[36%] h-[3px] w-[66%] rotate-[-8deg] rounded-full bg-blue-500/20" />
          <div className="absolute left-[30%] top-[22%] h-[3px] w-[46%] rotate-[24deg] rounded-full bg-emerald-500/20" />
          <div className="absolute left-[12%] top-[70%] h-[3px] w-[58%] rotate-[10deg] rounded-full bg-violet-500/18" />
          {viewMode === "heatmap" ? <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_25%_35%,rgba(239,68,68,0.22),transparent_18%),radial-gradient(circle_at_64%_52%,rgba(245,158,11,0.24),transparent_18%),radial-gradient(circle_at_44%_78%,rgba(37,99,235,0.16),transparent_20%)]" /> : null}

          <div className="absolute left-5 top-5 z-20 max-w-[calc(100%-40px)] rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{title}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xl font-extrabold text-slate-950">{records.length} {isState ? "munic\u00edpios" : "bairros"}</span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{layerName(activeLayer)}</span>
            </div>
          </div>

          <div className="absolute inset-0 z-20 transition-transform duration-300" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
            {records.map((record) => viewMode === "pins"
              ? <TerritoryPin key={record.id} record={record} activeLayer={activeLayer} selected={selected?.id === record.id} onSelect={onSelect} />
              : <TerritoryBubble key={record.id} record={record} activeLayer={activeLayer} selected={selected?.id === record.id} compact={viewMode === "heatmap"} onSelect={onSelect} />
            )}
          </div>

          {!records.length ? (
            <div className="relative z-30 flex min-h-[560px] items-center justify-center">
              <EmptyState title="Nenhum territ\u00f3rio encontrado" description="Ajuste os filtros para ampliar a leitura territorial." icon={MapPin} />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function TerritoryBubble({ record, activeLayer, selected, compact, onSelect }: { record: EnrichedTerritoryRecord; activeLayer: HeatMode; selected: boolean; compact: boolean; onSelect: (record: EnrichedTerritoryRecord) => void }) {
  const intensity = record.heat[activeLayer];
  const size = compact ? Math.max(58, Math.min(126, 48 + intensity * 0.75)) : Math.max(80, Math.min(154, 64 + intensity * 0.82));
  const color = heatColor(intensity);
  return (
    <button type="button" onClick={() => onSelect(record)} className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white/92 p-2 text-center shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur transition duration-200 hover:z-40 hover:-translate-y-[calc(50%+5px)] hover:shadow-xl ${selected ? "z-40 border-blue-500 ring-4 ring-blue-100" : "z-30 border-white/85"}`} style={{ left: `${record.position.x}%`, top: `${record.position.y}%`, width: size, minHeight: size }}>
      <span className="absolute inset-0 rounded-full opacity-15" style={{ background: color }} />
      <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full ring-4 ring-white" style={{ background: priorityColor(record.priority) }} />
      <span className="relative block">
        <span className="block truncate text-xs font-extrabold text-slate-950">{record.name}</span>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{record.validatedVotes.toLocaleString("pt-BR")} votos</span>
        {!compact ? <span className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: priorityColor(record.priority) }}>{record.priority}</span> : null}
      </span>
    </button>
  );
}

function TerritoryPin({ record, activeLayer, selected, onSelect }: { record: EnrichedTerritoryRecord; activeLayer: HeatMode; selected: boolean; onSelect: (record: EnrichedTerritoryRecord) => void }) {
  const color = heatColor(record.heat[activeLayer]);
  return (
    <button type="button" onClick={() => onSelect(record)} className={`absolute z-30 -translate-x-1/2 -translate-y-full rounded-xl border bg-white/94 px-3 py-2 text-left shadow-[0_14px_34px_rgba(15,23,42,0.16)] backdrop-blur transition hover:-translate-y-[calc(100%+5px)] hover:shadow-xl ${selected ? "border-blue-500 ring-4 ring-blue-100" : "border-white/85"}`} style={{ left: `${record.position.x}%`, top: `${record.position.y}%` }}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm" style={{ background: color }}><MapPin className="h-4 w-4" /></span>
        <span className="min-w-0">
          <span className="block max-w-[120px] truncate text-xs font-extrabold text-slate-950">{record.name}</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{record.leaders} lid. / {record.supporters} apo.</span>
        </span>
      </div>
    </button>
  );
}

function HeatmapLayerMock({ records, activeLayer, onSelect }: { records: EnrichedTerritoryRecord[]; activeLayer: HeatMode; onSelect: (record: EnrichedTerritoryRecord) => void }) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-base"><Flame className="h-4 w-4 text-orange-600" /> Mapa de calor por bairro</CardTitle></CardHeader>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => {
          const intensity = record.heat[activeLayer];
          return (
            <button key={record.id} type="button" onClick={() => onSelect(record)} className="overflow-hidden rounded-xl border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md">
              <div className="h-2" style={{ background: heatColor(intensity) }} />
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between gap-3"><span className="truncate font-bold text-slate-900">{record.name}</span><span className="text-sm font-extrabold text-slate-700">{intensity}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${intensity}%`, background: heatColor(intensity) }} /></div>
                <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-400"><span>{heatLabel(intensity)}</span><span>{record.geoPrecision}</span></div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function MapLegend({ activeLayer }: { activeLayer: HeatMode }) {
  const items = [
    ["Alta intensidade", "70%+", "#ef4444"],
    ["M\u00e9dia intensidade", "45% a 69%", "#f59e0b"],
    ["Baixa intensidade", "20% a 44%", "#2563eb"],
    ["Sem intensidade", "0% a 19%", "#94a3b8"],
  ];
  return (
    <Card className="premium-card">
      <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm"><Layers className="h-4 w-4 text-blue-600" /> Legenda do mapa</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3"><div className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Camada ativa</div><div className="mt-1 text-sm font-extrabold text-slate-900">{layerName(activeLayer)}</div></div>
        {items.map(([label, value, color]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-white p-2 shadow-sm">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: color }} /><span className="text-sm font-bold text-slate-700">{label}</span></div>
            <span className="text-xs font-extrabold text-slate-400">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StrategicMapPanel({ scope, records, onSelect }: { scope: TerritoryScope; records: EnrichedTerritoryRecord[]; onSelect: (record: EnrichedTerritoryRecord) => void }) {
  const sorted = [...records].sort((a, b) => b.opportunity - a.opportunity).slice(0, 6);
  const isState = scope === "state";
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">Painel de leitura estrat\u00e9gica</CardTitle></CardHeader>
      <CardContent className="grid gap-3 p-4 md:grid-cols-2">
        {sorted.map((record) => (
          <button key={record.id} type="button" onClick={() => onSelect(record)} className="rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md">
            <div className="mb-2 flex items-center justify-between gap-2"><span className="font-extrabold text-slate-950">{record.name}</span><PriorityBadge priority={record.priority} /></div>
            <p className="text-sm font-medium leading-6 text-slate-600">{record.analysis}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <MiniStat label={isState ? "Lid." : "Lid."} value={record.leaders.toString()} />
              <MiniStat label="Cobertura" value={formatPercent(record.coverage)} />
              <MiniStat label="Oportun." value={`${record.opportunity}%`} />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function TerritoryRanking({ groups, onSelect }: { groups: RankingGroup[]; onSelect: (record: EnrichedTerritoryRecord) => void }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.title} className="premium-card">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm"><group.icon className="h-4 w-4 text-blue-600" /> {group.title}</CardTitle><p className="text-xs font-medium text-slate-400">{group.description}</p></CardHeader>
          <CardContent className="space-y-2">
            {group.records.length ? group.records.slice(0, 5).map((item, index) => (
              <button key={`${group.title}-${item.id}`} type="button" onClick={() => onSelect(item)} className="flex w-full items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 text-left shadow-sm transition hover:border-blue-100 hover:shadow-md">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-600">{index + 1}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-900">{item.name}</div><div className="truncate text-xs font-semibold text-slate-400">{item.region}</div></div>
                <div className="text-right text-sm font-extrabold text-slate-900">{group.value(item)}</div>
              </button>
            )) : <div className="text-sm font-medium text-slate-400">Sem dados neste recorte</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TerritoryDetailDrawer({ scope, open, record, onOpenChange }: { scope: TerritoryScope; open: boolean; record: EnrichedTerritoryRecord | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-slate-50 p-0 sm:max-w-2xl">
        {record ? (
          <div className="space-y-5 p-5">
            <SheetHeader className="rounded-xl border border-white bg-white p-5 text-left shadow-sm">
              <SheetTitle className="text-2xl">{record.name}</SheetTitle>
              <SheetDescription>{record.type} - {record.region} - {record.responsible}</SheetDescription>
              <div className="flex flex-wrap gap-2 pt-2"><PriorityBadge priority={record.priority} /><StatusBadge status={record.status} /><CoverageBadge value={record.coverage} /></div>
            </SheetHeader>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailMetric label="Lideran\u00e7as" value={record.leaders.toLocaleString("pt-BR")} />
              <DetailMetric label="Apoiadores" value={record.supporters.toLocaleString("pt-BR")} />
              <DetailMetric label="Validados" value={record.validatedVotes.toLocaleString("pt-BR")} />
              <DetailMetric label="At\u00e9 a meta" value={record.distanceToTarget.toLocaleString("pt-BR")} />
            </div>
            <Card className="premium-card">
              <CardHeader><CardTitle className="text-base">Resumo territorial</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <InfoBlock title="For\u00e7a e cobertura" rows={[
                  ["Apoiadores estimados", record.estimatedSupporters.toLocaleString("pt-BR")],
                  ["Votos declarados", record.declaredVotes.toLocaleString("pt-BR")],
                  ["Meta", record.target.toLocaleString("pt-BR")],
                  ["Dist\u00e2ncia at\u00e9 a meta", record.distanceToTarget.toLocaleString("pt-BR")],
                  ["Cobertura", formatPercent(record.coverage)],
                  ["For\u00e7a territorial", `${record.territorialStrength}%`],
                ]} />
                <InfoBlock title={scope === "state" ? "Atua\u00e7\u00e3o municipal" : "Zonas e se\u00e7\u00f5es"} rows={[
                  [scope === "state" ? "Bairros/\u00e1reas" : "Zonas", scope === "state" ? record.areas.join(", ") : record.zones.join(", ")],
                  ["Se\u00e7\u00f5es", record.sections.length ? record.sections.join(", ") : "A definir"],
                  ["Locais de vota\u00e7\u00e3o", record.votingPlaces.length ? record.votingPlaces.join(", ") : "A definir"],
                  ["Demandas", record.demands.toLocaleString("pt-BR")],
                  ["Indecisos", record.undecided.toLocaleString("pt-BR")],
                  ["Precis\u00e3o m\u00e9dia", `${record.averagePrecision}%`],
                ]} />
              </CardContent>
            </Card>
            <Card className="premium-card overflow-hidden">
              <CardHeader><CardTitle className="text-base">Prévia de localização territorial</CardTitle></CardHeader>
              <CardContent>
                <div className="relative min-h-[190px] overflow-hidden rounded-xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#ecfdf5)] p-5 shadow-inner">
                  <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
                  <div className="absolute left-[18%] top-[24%] h-24 w-24 rounded-full bg-blue-300/35 blur-xl" />
                  <div className="absolute right-[14%] top-[20%] h-28 w-28 rounded-full bg-emerald-300/35 blur-xl" />
                  <div className="relative grid gap-3 sm:grid-cols-3"><MapStat label="Cobertura" value={formatPercent(record.coverage)} /><MapStat label="Calor" value={`${record.heat.apoiadores}%`} /><MapStat label="Meta" value={formatPercent(record.goalProgress)} /></div>
                  <div className="relative mt-4 text-sm font-semibold text-slate-600">{record.notes}</div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <ListCard title="Lideran\u00e7as vinculadas" items={record.leadersLinked.length ? record.leadersLinked : ["Sem lideran\u00e7a vinculada"]} />
              <ListCard title="Pr\u00f3ximas a\u00e7\u00f5es recomendadas" items={record.nextActions} />
              <ListCard title="Observa\u00e7\u00f5es estrat\u00e9gicas" items={[record.analysis, record.notes]} />
              <ListCard title="Camadas técnicas" items={["Mapbox/Google Maps", "Supabase/PostgreSQL/PostGIS", "Heatmap real por CEP, rua e seção"]} />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <div className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
          <option value={all}>Todos</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 px-2 py-2"><div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</div><div className="text-sm font-extrabold text-slate-900">{value}</div></div>;
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"><div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label}</div><div className="mt-1 text-xl font-extrabold text-slate-950">{value}</div></div>;
}

function InfoBlock({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"><div className="mb-3 font-bold text-slate-900">{title}</div><div className="space-y-2">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 text-sm"><span className="font-medium text-slate-500">{label}</span><span className="text-right font-bold text-slate-800">{value}</span></div>)}</div></div>;
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return <Card className="premium-card"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="space-y-2">{items.map((item) => <div key={item} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">{item}</div>)}</CardContent></Card>;
}

function MapStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur"><div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label}</div><div className="mt-1 text-2xl font-extrabold text-slate-950">{value}</div></div>;
}

function PriorityBadge({ priority }: { priority: TerritoryPriority }) {
  const tone = priority === "Cr\u00edtica" ? "red" : priority === "Alta" ? "amber" : priority === "M\u00e9dia" ? "blue" : priority === "Manter" ? "emerald" : "slate";
  return <StatusPill label={priority} tone={tone} />;
}

function StatusBadge({ status }: { status: TerritoryStatus }) {
  const tone = status === "Forte" || status === "Em crescimento" ? "emerald" : status === "Priorit\u00e1rio" ? "blue" : status === "Cr\u00edtico" || status === "Sem lideran\u00e7a" || status === "Baixa cobertura" ? "red" : "slate";
  return <StatusPill label={status} tone={tone} />;
}

function CoverageBadge({ value }: { value: number }) {
  const tone = value >= 4 ? "emerald" : value >= 2 ? "blue" : "amber";
  return <StatusPill label={`${formatPercent(value)} cobertura`} tone={tone} />;
}

function matches(item: EnrichedTerritoryRecord, filters: Filters) {
  if (filters.area !== all && item.name !== filters.area) return false;
  if (filters.region !== all && item.region !== filters.region) return false;
  if (filters.status !== all && item.status !== filters.status) return false;
  if (filters.priority !== all && item.priority !== filters.priority) return false;
  if (filters.responsible !== all && item.responsible !== filters.responsible) return false;
  if (filters.zone !== all && !item.zones.includes(filters.zone)) return false;
  if (filters.section !== all && !item.sections.includes(filters.section)) return false;
  if (filters.precision !== all && item.geoPrecision !== filters.precision) return false;
  if (filters.leaders === "Sem lideran\u00e7a" && item.leaders !== 0) return false;
  if (filters.leaders === "1 a 3" && (item.leaders < 1 || item.leaders > 3)) return false;
  if (filters.leaders === "4 ou mais" && item.leaders < 4) return false;
  if (filters.supporters === "At\u00e9 150" && item.supporters > 150) return false;
  if (filters.supporters === "151 a 400" && (item.supporters < 151 || item.supporters > 400)) return false;
  if (filters.supporters === "Acima de 400" && item.supporters <= 400) return false;
  if (filters.votes === "At\u00e9 100" && item.validatedVotes > 100) return false;
  if (filters.votes === "101 a 300" && (item.validatedVotes < 101 || item.validatedVotes > 300)) return false;
  if (filters.votes === "Acima de 300" && item.validatedVotes <= 300) return false;
  return true;
}

function buildSummary(records: EnrichedTerritoryRecord[], scope: TerritoryScope) {
  const sum = (getter: (record: EnrichedTerritoryRecord) => number) => records.reduce((total, record) => total + getter(record), 0);
  const estimatedElectors = sum((record) => record.estimatedElectors);
  const validatedVotes = sum((record) => record.validatedVotes);
  return {
    activeAreas: scope === "state" ? records.filter((record) => record.campaignActive).length : records.length,
    inactiveAreas: records.filter((record) => !record.campaignActive || record.status === "Sem lideran\u00e7a").length,
    leaders: sum((record) => record.leaders),
    supporters: sum((record) => record.supporters),
    declaredVotes: sum((record) => record.declaredVotes),
    validatedVotes,
    coverage: estimatedElectors > 0 ? (validatedVotes / estimatedElectors) * 100 : 0,
    priorityAreas: records.filter((record) => record.priority === "Alta" || record.priority === "Cr\u00edtica").length,
    criticalAreas: records.filter((record) => record.priority === "Cr\u00edtica" || record.status === "Cr\u00edtico").length,
    weeklyGrowth: sum((record) => record.weeklyGrowth),
  };
}

function buildRankingGroups(records: EnrichedTerritoryRecord[], scope: TerritoryScope): RankingGroup[] {
  const isState = scope === "state";
  return [
    { title: isState ? "Top munic\u00edpios por votos" : "Top bairros por votos", description: "Votos validados no recorte", icon: CheckCircle2, records: sortBy(records, (record) => record.validatedVotes), value: (record) => record.validatedVotes.toLocaleString("pt-BR") },
    { title: isState ? "Top por apoiadores" : "Bairros por apoiadores", description: "Cadastros e base territorial", icon: Users, records: sortBy(records, (record) => record.supporters), value: (record) => record.supporters.toLocaleString("pt-BR") },
    { title: "Maior oportunidade", description: "Muito eleitor e baixa cobertura", icon: Zap, records: sortBy(records, (record) => record.opportunity), value: (record) => `${record.opportunity}%` },
    { title: isState ? "Sem lideran\u00e7a" : "Bairros sem lideran\u00e7a", description: "Primeiro lugar para agir", icon: AlertTriangle, records: sortBy(records.filter((record) => record.leaders === 0 || record.status === "Sem lideran\u00e7a"), (record) => record.opportunity), value: (record) => `${record.supporters} apo.` },
    { title: "Maior dist\u00e2ncia at\u00e9 a meta", description: "Meta menos votos validados", icon: Target, records: sortBy(records, (record) => record.distanceToTarget), value: (record) => record.distanceToTarget.toLocaleString("pt-BR") },
    { title: isState ? "Munic\u00edpios cr\u00edticos" : "Bairros pr\u00f3ximos da meta", description: isState ? "Cobertura baixa e prioridade alta" : "Pouco esfor\u00e7o para fechar meta", icon: TrendingUp, records: isState ? records.filter((record) => record.priority === "Cr\u00edtica" || record.status === "Baixa cobertura") : records.filter((record) => record.distanceToTarget <= 140).sort((a, b) => a.distanceToTarget - b.distanceToTarget), value: (record) => isState ? record.priority : record.distanceToTarget.toLocaleString("pt-BR") },
  ];
}

function buildOptions(records: EnrichedTerritoryRecord[]) {
  const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  return {
    area: unique(records.map((record) => record.name)),
    region: unique(records.map((record) => record.region)),
    status: unique(records.map((record) => record.status)),
    priority: unique(records.map((record) => record.priority)),
    responsible: unique(records.map((record) => record.responsible)),
    zone: unique(records.flatMap((record) => record.zones)),
    section: unique(records.flatMap((record) => record.sections)),
    precision: unique(records.map((record) => record.geoPrecision)),
  };
}

function sortBy(records: EnrichedTerritoryRecord[], getter: (record: EnrichedTerritoryRecord) => number) {
  return [...records].sort((a, b) => getter(b) - getter(a));
}

function layerName(mode: HeatMode) {
  return heatModes.find((item) => item.key === mode)?.label ?? "Camada";
}

function priorityColor(priority: TerritoryPriority) {
  if (priority === "Cr\u00edtica") return "#ef4444";
  if (priority === "Alta") return "#f59e0b";
  if (priority === "M\u00e9dia") return "#2563eb";
  if (priority === "Manter") return "#10b981";
  return "#64748b";
}

function heatColor(value: number) {
  if (value >= 70) return "#ef4444";
  if (value >= 45) return "#f59e0b";
  if (value >= 20) return "#2563eb";
  return "#94a3b8";
}

function heatLabel(value: number) {
  if (value >= 70) return "Alta intensidade";
  if (value >= 45) return "M\u00e9dia intensidade";
  if (value >= 20) return "Baixa intensidade";
  return "Sem intensidade relevante";
}
