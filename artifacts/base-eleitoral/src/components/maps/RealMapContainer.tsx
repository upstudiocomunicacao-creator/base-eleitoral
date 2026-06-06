import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, Loader2, MapPin, Navigation, Route, Zap } from "lucide-react";
import { Link } from "wouter";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isMapboxConfigured } from "@/lib/mapbox";
import {
  getMaricaMapData,
  getRJMapData,
  type MapData,
  type MapDataFilters,
  type MapHeatmapLayerType,
  type MapPoint,
  type MapPointType,
  type MapScope,
} from "@/services/mapData";
import { getHeatmapLayerLabel, getPointLayerColor, getPointLayerLabel } from "@/utils/mapLayers";
import { MapboxMap } from "./MapboxMap";
import { MapDetailDrawer } from "./MapDetailDrawer";
import { MapLayerControls, type RealMapMode } from "./MapLayerControls";
import { MapLegend } from "./MapLegend";

type Props = {
  scope: MapScope;
  fallback: ReactNode;
  filters?: MapDataFilters;
};

const allPointTypes: MapPointType[] = ["leaders", "supporters", "electoral_zones", "demands", "field_agenda"];

export function RealMapContainer({ scope, fallback, filters = {} }: Props) {
  const [mode, setMode] = useState<RealMapMode>("pins");
  const [heatmapLayer, setHeatmapLayer] = useState<MapHeatmapLayerType>(scope === "city" ? "supporters" : "validated_votes");
  const [visibleTypes, setVisibleTypes] = useState<MapPointType[]>(allPointTypes);
  const [data, setData] = useState<MapData | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const activeFilterCount = useMemo(() => countActiveFilters(filters, scope), [filterKey, scope]);

  useEffect(() => {
    if (!isMapboxConfigured || mode === "mock") return;
    let cancelled = false;

    async function loadMapData() {
      setLoading(true);
      setError(null);
      try {
        const activeFilters = JSON.parse(filterKey) as MapDataFilters;
        const response = scope === "city" ? await getMaricaMapData(activeFilters) : await getRJMapData(activeFilters);
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar os dados do mapa.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMapData();
    return () => {
      cancelled = true;
    };
  }, [filterKey, mode, scope]);

  const visiblePoints = useMemo(() => {
    if (!data) return [];
    return data.points.filter((point) => visibleTypes.includes(point.type));
  }, [data, visibleTypes]);

  const summary = data?.summary;
  const title = scope === "city" ? "Mapa real de Maricá" : "Mapa real do Rio de Janeiro";

  const openPoint = (point: MapPoint) => {
    setSelectedPoint(point);
    setDrawerOpen(true);
  };

  if (!isMapboxConfigured) {
    return (
      <div className="space-y-3">
        <MapboxNotice
          title="Mapbox ainda não configurado"
          description="Exibindo o mapa estratégico simulado. Configure VITE_MAPBOX_ACCESS_TOKEN para ativar pins, clusters e mapa de calor real."
          tone="amber"
        />
        {fallback}
      </div>
    );
  }

  if (mode === "mock") {
    return (
      <div className="space-y-3">
        <MapboxNotice
          title="Modo mock estratégico ativo"
          description="Você está vendo o mapa estratégico simulado. Use Pins reais, Mapa de calor ou Clusters para visualizar o mapa Mapbox."
          tone="blue"
        />
        <MapLayerControls
          mode={mode}
          setMode={setMode}
          visibleTypes={visibleTypes}
          setVisibleTypes={setVisibleTypes}
          heatmapLayer={heatmapLayer}
          setHeatmapLayer={setHeatmapLayer}
        />
        {fallback}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <MapboxNotice
          title="Não foi possível carregar o mapa real"
          description={`${error} Exibindo o mapa simulado como fallback.`}
          tone="red"
        />
        {fallback}
      </div>
    );
  }

  return (
    <MapRuntimeErrorBoundary fallback={fallback}>
      <div className="space-y-4">
      <Card className="premium-card overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Navigation className="h-4 w-4 text-blue-600" />
                {title}
              </CardTitle>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Dados reais geocodificados do Supabase com pins, clusterização e heatmap por camada.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilterCount ? (
                <span className="inline-flex h-9 items-center rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-extrabold uppercase tracking-[0.08em] text-blue-700">
                  {activeFilterCount} {activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}
                </span>
              ) : null}
              <Link href="/geocodificacao">
                <Button variant="outline"><MapPin className="h-4 w-4" /> Geocodificar registros</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <MapLayerControls
            mode={mode}
            setMode={setMode}
            visibleTypes={visibleTypes}
            setVisibleTypes={setVisibleTypes}
            heatmapLayer={heatmapLayer}
            setHeatmapLayer={setHeatmapLayer}
          />

          {loading ? (
            <div className="flex min-h-[620px] items-center justify-center rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                Buscando dados geocodificados
              </div>
            </div>
          ) : data && visiblePoints.length ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-3">
                <RealMapSummary summary={summary} mode={mode} heatmapLayer={heatmapLayer} />
                <MapboxMap scope={scope} points={visiblePoints} mode={mode} heatmapLayer={heatmapLayer} onSelect={openPoint} />
              </div>
              <aside className="space-y-3">
                <MapLegend heatmapLayer={heatmapLayer} />
                <WithoutCoordinatesCard data={data} />
              </aside>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                <EmptyState
                  title="Nenhum registro com coordenadas encontrado"
                  description={activeFilterCount ? "Nenhum ponto encontrado para os filtros atuais. Ajuste os filtros territoriais ou limpe a seleção." : "Gere latitude e longitude no módulo de geocodificação para liberar o mapa real."}
                  icon={MapPin}
                />
              </div>
              {data ? <WithoutCoordinatesCard data={data} /> : null}
            </div>
          )}
        </CardContent>
      </Card>

        <MapDetailDrawer
          point={selectedPoint}
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setSelectedPoint(null);
          }}
        />
      </div>
    </MapRuntimeErrorBoundary>
  );
}

function countActiveFilters(filters: MapDataFilters, scope: MapScope) {
  return Object.entries(filters).filter(([key, value]) => {
    if (!value || value === "todos") return false;
    if (scope === "city" && key === "city" && value === "Maricá") return false;
    return true;
  }).length;
}

function RealMapSummary({ summary, mode, heatmapLayer }: { summary: MapData["summary"] | undefined; mode: RealMapMode; heatmapLayer: MapHeatmapLayerType }) {
  const cards = [
    ["Pontos no mapa", summary?.totalPoints ?? 0, MapPin],
    ["Lideranças", summary?.leaders ?? 0, Database],
    ["Apoiadores", summary?.supporters ?? 0, Database],
    ["Zonas", summary?.zones ?? 0, Route],
    ["Demandas", summary?.demands ?? 0, AlertTriangle],
    ["Sem coordenadas", summary?.withoutCoordinates ?? 0, AlertTriangle],
    ["Região forte", summary?.strongestRegion ?? "-", Zap],
    ["Oportunidade", summary?.opportunityRegion ?? "-", Zap],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, Icon]) => (
        <div key={label as string} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label as string}</div>
              <div className="mt-1 text-xl font-extrabold text-slate-950">{String(value)}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-[0.08em] text-blue-500">Camada ativa</div>
        <div className="mt-1 text-xl font-extrabold text-blue-950">{mode === "heatmap" ? getHeatmapLayerLabel(heatmapLayer) : mode}</div>
      </div>
    </div>
  );
}

function WithoutCoordinatesCard({ data }: { data: MapData }) {
  const items = data.withoutCoordinates.slice(0, 6);
  const grouped = groupMissingCoordinates(data.withoutCoordinates);
  const totalKnown = data.summary.totalPoints + data.withoutCoordinates.length;
  const readiness = totalKnown ? Math.round((data.summary.totalPoints / totalKnown) * 100) : 100;

  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm text-amber-950">
            <AlertTriangle className="h-4 w-4" />
            {data.withoutCoordinates.length} registros sem coordenadas
          </CardTitle>
          <span className="rounded-full border border-amber-200 bg-white px-2 py-1 text-[11px] font-black text-amber-900">
            {readiness}% pronto
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {grouped.map((item) => (
                <div key={item.type} className="flex items-center justify-between rounded-lg bg-white/85 px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: getPointLayerColor(item.type) }} />
                    <span className="text-xs font-extrabold text-slate-700">{getPointLayerLabel(item.type)}</span>
                  </div>
                  <span className="text-sm font-black text-amber-950">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                  <div className="truncate text-sm font-bold text-slate-800">{item.title}</div>
                  <div className="text-xs font-semibold text-slate-500">{getPointLayerLabel(item.type)} · {item.neighborhood || item.city || "Sem território"}</div>
                </div>
              ))}
            </div>
            {data.withoutCoordinates.length > items.length ? (
              <p className="text-xs font-bold text-amber-800">Mais {data.withoutCoordinates.length - items.length} registro(s) aguardando geocodificação.</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-semibold text-amber-800">Todos os registros carregados possuem latitude e longitude.</p>
        )}
        <Link href="/geocodificacao">
          <Button className="w-full" variant="outline"><MapPin className="h-4 w-4" /> Abrir geocodificação</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function groupMissingCoordinates(items: MapData["withoutCoordinates"]) {
  const counts = items.reduce<Record<MapPointType, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {} as Record<MapPointType, number>);

  return (Object.entries(counts) as Array<[MapPointType, number]>)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

function MapboxNotice({ title, description, tone }: { title: string; description: string; tone: "amber" | "blue" | "red" }) {
  const toneClass = {
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
    red: "border-red-200 bg-red-50 text-red-950",
  }[tone];

  return (
    <Card className={`${toneClass} shadow-sm`}>
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold">
            <AlertTriangle className="h-4 w-4" />
            {title}
          </div>
          <p className="mt-1 text-xs font-semibold opacity-80">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

class MapRuntimeErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Erro ao carregar o mapa real.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Mapbox runtime error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-3">
          <MapboxNotice
            title="Mapa real pausado"
            description={`${this.state.message} Exibindo o mapa estratégico simulado enquanto ajustamos os dados.`}
            tone="red"
          />
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
}

