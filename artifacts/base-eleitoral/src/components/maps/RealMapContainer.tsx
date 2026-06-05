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
  type MapHeatmapLayerType,
  type MapPoint,
  type MapPointType,
  type MapScope,
} from "@/services/mapData";
import { filterMapPoints } from "@/utils/mapFilters";
import { getHeatmapLayerLabel, getPointLayerLabel } from "@/utils/mapLayers";
import { MapboxMap } from "./MapboxMap";
import { MapDetailDrawer } from "./MapDetailDrawer";
import { MapLayerControls, type RealMapMode } from "./MapLayerControls";
import { MapLegend } from "./MapLegend";

type Props = {
  scope: MapScope;
  fallback: ReactNode;
};

const allPointTypes: MapPointType[] = ["leaders", "supporters", "electoral_zones", "demands", "field_agenda"];

export function RealMapContainer({ scope, fallback }: Props) {
  const [mode, setMode] = useState<RealMapMode>("pins");
  const [heatmapLayer, setHeatmapLayer] = useState<MapHeatmapLayerType>(scope === "city" ? "supporters" : "validated_votes");
  const [visibleTypes, setVisibleTypes] = useState<MapPointType[]>(allPointTypes);
  const [data, setData] = useState<MapData | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMapboxConfigured || mode === "mock") return;
    let cancelled = false;

    async function loadMapData() {
      setLoading(true);
      setError(null);
      try {
        const response = scope === "city" ? await getMaricaMapData() : await getRJMapData();
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
  }, [mode, scope]);

  const visiblePoints = useMemo(() => {
    if (!data) return [];
    return filterMapPoints(data.points, {}).filter((point) => visibleTypes.includes(point.type));
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
                  description="Gere latitude e longitude no módulo de geocodificação para liberar o mapa real."
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

  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-amber-950">
          <AlertTriangle className="h-4 w-4" />
          {data.withoutCoordinates.length} registros sem coordenadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                <div className="truncate text-sm font-bold text-slate-800">{item.title}</div>
                <div className="text-xs font-semibold text-slate-500">{getPointLayerLabel(item.type)} · {item.neighborhood || item.city || "Sem território"}</div>
              </div>
            ))}
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
