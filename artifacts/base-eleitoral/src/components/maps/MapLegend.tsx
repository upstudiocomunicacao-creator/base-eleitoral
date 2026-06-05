import { Flame, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MapHeatmapLayerType } from "@/services/mapData";
import { getPointLayerColor, heatmapLayers, mapPointLayers } from "@/utils/mapLayers";

type Props = {
  heatmapLayer: MapHeatmapLayerType;
};

export function MapLegend({ heatmapLayer }: Props) {
  const activeHeatmap = heatmapLayers.find((item) => item.key === heatmapLayer);

  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4 text-blue-600" />
          Legenda real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
            <Flame className="h-3.5 w-3.5" />
            Heatmap ativo
          </div>
          <div className="mt-1 text-sm font-extrabold text-slate-900">{activeHeatmap?.label ?? "Heatmap"}</div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {mapPointLayers.map((layer) => (
            <div key={layer.key} className="flex items-center justify-between gap-3 rounded-lg bg-white px-2 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: getPointLayerColor(layer.key) }} />
                <span className="text-sm font-bold text-slate-700">{layer.label}</span>
              </div>
              <layer.icon className="h-4 w-4 text-slate-400" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
