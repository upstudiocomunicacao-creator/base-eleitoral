import { useEffect, useState } from "react";
import { MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { summarizeGeocodingAddress, updateRecordCoordinates, type GeocodingRecord } from "@/services/geocoding";

export function GeocodingReviewDrawer({
  record,
  open,
  onOpenChange,
  onSaved,
}: {
  record: GeocodingRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [confidence, setConfidence] = useState("0.95");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLatitude(record?.latitude ? String(record.latitude) : "");
    setLongitude(record?.longitude ? String(record.longitude) : "");
    setConfidence(record?.geocoding_confidence ? String(record.geocoding_confidence) : "0.95");
    setNotes("");
  }, [record]);

  async function saveManual() {
    if (!record) return;
    const normalizedLatitude = normalizeCoordinateInput(latitude);
    const normalizedLongitude = normalizeCoordinateInput(longitude);
    const normalizedConfidence = normalizeCoordinateInput(confidence);

    if (!Number.isFinite(normalizedLatitude) || normalizedLatitude < -90 || normalizedLatitude > 90) {
      toast({ title: "Latitude inválida", description: "Informe uma latitude entre -90 e 90.", variant: "destructive" });
      return;
    }

    if (!Number.isFinite(normalizedLongitude) || normalizedLongitude < -180 || normalizedLongitude > 180) {
      toast({ title: "Longitude inválida", description: "Informe uma longitude entre -180 e 180.", variant: "destructive" });
      return;
    }

    if (!Number.isFinite(normalizedConfidence) || normalizedConfidence < 0 || normalizedConfidence > 1) {
      toast({ title: "Confiança inválida", description: "Use um valor entre 0 e 1. Exemplo: 0.95.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await updateRecordCoordinates(record.tableName, record.id, {
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
        geocoding_status: "manual",
        geocoding_source: "manual",
        geocoding_confidence: normalizedConfidence,
        geocoding_error: notes || null,
        geographic_precision: record.geographic_precision ?? "Alta",
      });
      toast({ title: "Coordenadas salvas", description: "O cadastro foi atualizado e já pode alimentar os mapas." });
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Não foi possível salvar",
        description: error instanceof Error ? error.message : "Revise os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!record) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-slate-50 sm:max-w-xl">
        <SheetHeader className="rounded-lg border bg-white p-5 text-left shadow-sm">
          <SheetTitle>Revisão manual</SheetTitle>
          <SheetDescription>{record.typeLabel} · {record.title}</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><MapPin className="h-4 w-4 text-blue-600" /> Endereço</div>
            <p className="text-sm font-medium leading-6 text-slate-500">{summarizeGeocodingAddress(record)}</p>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Latitude</span>
            <Input type="text" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="-22.9196" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Longitude</span>
            <Input type="text" inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="-42.8186" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Confiança</span>
            <Input type="text" inputMode="decimal" value={confidence} onChange={(event) => setConfidence(event.target.value)} placeholder="0.95" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Observação</span>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Coordenada revisada manualmente pela equipe." />
          </label>

          <Button className="w-full" onClick={saveManual} disabled={saving || !latitude || !longitude}>
            <Save className="h-4 w-4" /> Salvar coordenadas manuais
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function normalizeCoordinateInput(value: string) {
  return Number(String(value).trim().replace(",", "."));
}
