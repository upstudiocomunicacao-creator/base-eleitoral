import { ExternalLink, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MapPoint } from "@/services/mapData";
import { formatCoordinate } from "@/utils/coordinates";
import { getPointLayerColor, getPointLayerLabel } from "@/utils/mapLayers";

type Props = {
  point: MapPoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MapDetailDrawer({ point, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {point ? (
          <>
            <SheetHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: getPointLayerColor(point.type) }}>
                <MapPin className="h-5 w-5" />
              </div>
              <SheetTitle>{point.title}</SheetTitle>
              <SheetDescription>{getPointLayerLabel(point.type)} · {point.subtitle}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <InfoBlock title="Território" items={[
                ["Bairro", point.neighborhood || "Não informado"],
                ["Cidade", point.city || "Não informada"],
                ["Estado", point.state || "RJ"],
                ["Responsável", point.responsible || "Não definido"],
              ]} />
              <InfoBlock title="Situação" items={[
                ["Status", point.status || "Não definido"],
                ["Prioridade", point.priority || "Não definida"],
                ["Peso no heatmap", `${Math.round(point.weight * 100)}%`],
              ]} />
              <InfoBlock title="Georreferenciamento" items={[
                ["Latitude", formatCoordinate(point.latitude)],
                ["Longitude", formatCoordinate(point.longitude)],
                ["Precisão", point.geographicPrecision || "Não definida"],
                ["Fonte", point.geocodingSource || "manual"],
              ]} />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-extrabold text-slate-950">Dados principais</div>
                <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-white p-3 text-xs font-semibold text-slate-500">
                  {JSON.stringify(point.originalRecord, null, 2)}
                </pre>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/geocodificacao">
                  <Button variant="outline"><MapPin className="h-4 w-4" /> Geocodificação</Button>
                </Link>
                <Button variant="outline" disabled><ExternalLink className="h-4 w-4" /> Abrir ficha completa</Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function InfoBlock({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-extrabold text-slate-950">{title}</div>
      <div className="grid gap-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label}</span>
            <span className="text-right text-sm font-bold text-slate-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
