import { Layers, MapPin, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { heatmapLayers, mapPointLayers } from "@/utils/mapLayers";
import type { MapHeatmapLayerType, MapPointType } from "@/services/mapData";

export type RealMapMode = "pins" | "heatmap" | "cluster" | "mock";

export function MapLayerControls({
  mode,
  setMode,
  visibleTypes,
  setVisibleTypes,
  heatmapLayer,
  setHeatmapLayer,
}: {
  mode: RealMapMode;
  setMode: (mode: RealMapMode) => void;
  visibleTypes: MapPointType[];
  setVisibleTypes: (types: MapPointType[]) => void;
  heatmapLayer: MapHeatmapLayerType;
  setHeatmapLayer: (layer: MapHeatmapLayerType) => void;
}) {
  const toggleType = (type: MapPointType) => {
    setVisibleTypes(visibleTypes.includes(type) ? visibleTypes.filter((item) => item !== type) : [...visibleTypes, type]);
  };

  return (
    <Card className="border-white/80 bg-white/92 shadow-xl backdrop-blur">
      <CardContent className="space-y-3 p-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            ["pins", "Pins reais", MapPin],
            ["heatmap", "Mapa de calor", Radar],
            ["cluster", "Clusters", Layers],
            ["mock", "Simulado", Layers],
          ].map(([key, label, Icon]) => (
            <Button key={key as string} size="sm" variant={mode === key ? "default" : "outline"} onClick={() => setMode(key as RealMapMode)}>
              <Icon className="h-3.5 w-3.5" /> {label as string}
            </Button>
          ))}
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Camadas de pins</div>
          <div className="flex flex-wrap gap-1">
            {mapPointLayers.map((layer) => (
              <button key={layer.key} type="button" onClick={() => toggleType(layer.key)} className={`rounded-full border px-2 py-1 text-[11px] font-bold ${visibleTypes.includes(layer.key) ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}>
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Heatmap</span>
          <select value={heatmapLayer} onChange={(event) => setHeatmapLayer(event.target.value as MapHeatmapLayerType)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold">
            {heatmapLayers.map((layer) => <option key={layer.key} value={layer.key}>{layer.label}</option>)}
          </select>
        </label>
      </CardContent>
    </Card>
  );
}
