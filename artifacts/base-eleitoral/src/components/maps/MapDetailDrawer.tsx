import { CalendarDays, CheckCircle2, ExternalLink, MapPin, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MapPoint, MapPointType } from "@/services/mapData";
import { formatCoordinate } from "@/utils/coordinates";
import { getPointLayerColor, getPointLayerLabel } from "@/utils/mapLayers";

type Props = {
  point: MapPoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Metric = {
  label: string;
  value: string;
};

type InfoItem = [string, string];

const moduleLinks: Record<MapPointType, string> = {
  leaders: "/liderancas",
  supporters: "/liderancas",
  electoral_zones: "/liderancas",
  demands: "/liderancas",
  field_agenda: "/liderancas",
};

export function MapDetailDrawer({ point, open, onOpenChange }: Props) {
  const metrics = point ? buildMetrics(point) : [];
  const strategicItems = point ? buildStrategicItems(point) : [];
  const addressItems = point ? buildAddressItems(point) : [];
  const geoItems = point ? buildGeoItems(point) : [];
  const recommendation = point ? buildRecommendation(point) : "";

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
              <section className="grid gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">{metric.label}</div>
                    <div className="mt-1 text-lg font-black text-slate-950">{metric.value}</div>
                  </div>
                ))}
              </section>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-950">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <TrendingUp className="h-4 w-4" />
                  Leitura estratégica
                </div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-blue-900">{recommendation}</p>
              </div>

              <InfoBlock title="Situação operacional" items={strategicItems} />
              <InfoBlock title="Território e endereço" items={addressItems} />
              <InfoBlock title="Georreferenciamento" items={geoItems} />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Próximo passo sugerido
                </div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{buildNextStep(point)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={moduleLinks[point.type]}>
                  <Button><ExternalLink className="h-4 w-4" /> Abrir módulo</Button>
                </Link>
                <Link href="/geocodificacao">
                  <Button variant="outline"><MapPin className="h-4 w-4" /> Geocodificação</Button>
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function InfoBlock({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-extrabold text-slate-950">{title}</div>
      <div className="grid gap-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label}</span>
            <span className="text-right text-sm font-bold text-slate-700">{value || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildMetrics(point: MapPoint): Metric[] {
  const record = point.originalRecord;
  if (point.type === "leaders") {
    return [
      { label: "Declarados", value: formatNumber(record.declared_votes) },
      { label: "Validados", value: formatNumber(record.validated_votes) },
      { label: "Confiança", value: value(record.confidence_level) },
    ];
  }
  if (point.type === "supporters") {
    return [
      { label: "Status", value: value(record.political_status) },
      { label: "Tipo", value: value(record.person_type) },
      { label: "Confiança", value: value(record.data_confidence) },
    ];
  }
  if (point.type === "electoral_zones") {
    return [
      { label: "Eleitores", value: formatNumber(record.voters_count) },
      { label: "Meta", value: formatNumber(record.vote_goal) },
      { label: "Validados", value: formatNumber(record.validated_votes) },
    ];
  }
  if (point.type === "demands") {
    return [
      { label: "Categoria", value: value(record.category) },
      { label: "Prioridade", value: value(record.priority) },
      { label: "Status", value: value(record.status) },
    ];
  }
  return [
    { label: "Data", value: formatDate(record.action_date) },
    { label: "Público", value: formatNumber(record.estimated_public) },
    { label: "Status", value: value(record.status) },
  ];
}

function buildStrategicItems(point: MapPoint): InfoItem[] {
  const record = point.originalRecord;
  const common: InfoItem[] = [
    ["Status", point.status || "Não definido"],
    ["Prioridade", point.priority || "Não definida"],
    ["Responsável", point.responsible || "Não definido"],
  ];

  if (point.type === "leaders") {
    return [
      ...common,
      ["Apoio estimado base", formatNumber(record.registered_supporters)],
      ["Potencial estimado", formatNumber(Number(record.estimated_direct_supporters ?? 0) + Number(record.estimated_indirect_supporters ?? 0))],
      ["Taxa de validação", formatPercent(Number(record.validated_votes ?? 0), Number(record.declared_votes ?? 0))],
      ["Próxima ação", value(record.next_action)],
    ];
  }
  if (point.type === "electoral_zones") {
    return [
      ...common,
      ["Zona", value(record.zone_number)],
      ["Seção", value(record.section_number)],
      ["Cobertura", formatPercent(Number(record.validated_votes ?? 0), Number(record.voters_count ?? 0))],
      ["Distância da meta", formatNumber(Math.max(Number(record.vote_goal ?? 0) - Number(record.validated_votes ?? 0), 0))],
    ];
  }
  if (point.type === "field_agenda") {
    return [
      ...common,
      ["Tipo de ação", value(record.action_type)],
      ["Data", formatDate(record.action_date)],
      ["Horário", [record.start_time, record.end_time].filter(Boolean).join(" às ") || "-"],
      ["Resultado", value(record.result)],
    ];
  }
  if (point.type === "demands") {
    return [
      ...common,
      ["Categoria", value(record.category)],
      ["Pessoa", value(record.person_name)],
      ["Retorno previsto", formatDate(record.return_date)],
      ["Próxima ação", value(record.next_action)],
    ];
  }
  return [
    ...common,
    ["Telefone", value(record.phone)],
    ["Fonte", value(record.source)],
    ["Último contato", formatDate(record.last_contact)],
    ["Próxima ação", value(record.next_action)],
  ];
}

function buildAddressItems(point: MapPoint): InfoItem[] {
  const record = point.originalRecord;
  return [
    ["Bairro", point.neighborhood || "Não informado"],
    ["Cidade", point.city || "Não informada"],
    ["Estado", point.state || "RJ"],
    ["Rua", value(record.street)],
    ["Número", value(record.number)],
    ["CEP", value(record.cep)],
  ];
}

function buildGeoItems(point: MapPoint): InfoItem[] {
  return [
    ["Latitude", formatCoordinate(point.latitude)],
    ["Longitude", formatCoordinate(point.longitude)],
    ["Precisão", point.geographicPrecision || "Não definida"],
    ["Fonte", point.geocodingSource || "manual"],
    ["Peso no heatmap", `${Math.round(point.weight * 100)}%`],
  ];
}

function buildRecommendation(point: MapPoint) {
  const region = point.neighborhood || point.city || "território";
  if (point.type === "leaders") return `${point.title} concentra força em ${region}. Compare votos declarados, votos validados e estimativa mensal antes de ampliar metas ou ajustar custos.`;
  if (point.type === "supporters") return `${point.title} está em ${region}. Use o status político e a próxima ação para decidir se o contato deve entrar em validação, retorno ou mobilização.`;
  if (point.type === "electoral_zones") return `${point.title} ajuda a medir cobertura territorial em ${region}. A distância até a meta indica se a área precisa de coordenação ou liderança.`;
  if (point.type === "demands") return `${point.title} aponta uma demanda territorial em ${region}. Priorize retorno quando a prioridade for alta ou crítica.`;
  return `${point.title} representa uma ação de campo em ${region}. Use o resultado e o público estimado para decidir se a agenda deve gerar retorno, nova visita ou mobilização.`;
}

function buildNextStep(point: MapPoint) {
  const record = point.originalRecord;
  if (point.type === "leaders") return value(record.next_action) !== "-" ? value(record.next_action) : "Revisar validação de votos e programar contato com a liderança.";
  if (point.type === "supporters") return value(record.next_action) !== "-" ? value(record.next_action) : "Definir próxima ação de contato e confirmar vínculo territorial.";
  if (point.type === "electoral_zones") return "Comparar cobertura, meta e votos validados para priorizar ações de campo na área.";
  if (point.type === "demands") return value(record.next_action) !== "-" ? value(record.next_action) : "Definir responsável e data de retorno para a demanda.";
  return value(record.next_step) !== "-" ? value(record.next_step) : "Registrar resultado da ação e planejar retorno no território.";
}

function value(input: unknown) {
  const text = String(input ?? "").trim();
  return text || "-";
}

function formatNumber(input: unknown) {
  const number = Number(input ?? 0);
  return Number.isFinite(number) ? number.toLocaleString("pt-BR") : "-";
}

function formatPercent(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function formatDate(input: unknown) {
  const text = value(input);
  if (text === "-") return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("pt-BR");
}
