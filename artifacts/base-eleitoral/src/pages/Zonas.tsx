import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Edit,
  Eye,
  FileSpreadsheet,
  Flag,
  Gauge,
  Loader2,
  MapPin,
  PlusCircle,
  RefreshCw,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  createElectoralZone,
  deleteElectoralZone,
  isElectoralZonesSupabaseReady,
  listElectoralZones,
  updateElectoralZone,
} from "@/services/electoralZones";
import { DEFAULT_CAMPAIGN_ID } from "@/services/leaders";
import type { Database, ElectoralZone } from "@/types/database";

type ElectoralZoneInsert = Database["public"]["Tables"]["electoral_zones"]["Insert"];
type ElectoralZoneUpdate = Database["public"]["Tables"]["electoral_zones"]["Update"];

type Filters = {
  zona: string;
  secao: string;
  local: string;
  bairro: string;
  cidade: string;
  estado: string;
  faixaEleitores: string;
  meta: string;
  prioridade: string;
  responsavel: string;
  cobertura: string;
  status: string;
};

type ZoneFormState = {
  id: string | null;
  zone_number: string;
  section_number: string;
  voting_place: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  voters_count: number;
  historical_votes: number;
  vote_goal: number;
  estimated_campaign_votes: number;
  validated_votes: number;
  regional_responsible: string;
  priority: string;
  status: string;
  notes: string;
};

type Summary = {
  zones: number;
  sections: number;
  places: number;
  voters: number;
  goal: number;
  estimated: number;
  validated: number;
  distance: number;
  coverage: number;
  priority: number;
  attention: number;
  opportunity: number;
  avgGoalCompletion: number;
};

const emptyFilters: Filters = {
  zona: "",
  secao: "",
  local: "todos",
  bairro: "todos",
  cidade: "todos",
  estado: "todos",
  faixaEleitores: "todos",
  meta: "todos",
  prioridade: "todos",
  responsavel: "todos",
  cobertura: "todos",
  status: "todos",
};

const emptyForm: ZoneFormState = {
  id: null,
  zone_number: "",
  section_number: "",
  voting_place: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "Maricá",
  state: "RJ",
  latitude: "",
  longitude: "",
  voters_count: 0,
  historical_votes: 0,
  vote_goal: 0,
  estimated_campaign_votes: 0,
  validated_votes: 0,
  regional_responsible: "",
  priority: "Média",
  status: "Mapeada",
  notes: "",
};

const priorityOptions = ["Baixa", "Média", "Alta", "Crítica"];
const statusOptions = ["Mapeada", "Em prospecção", "Ativa", "Forte", "Baixa cobertura", "Sem liderança", "Revisar dados"];

export default function Zonas() {
  const [zones, setZones] = useState<ElectoralZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState<ZoneFormState | null>(null);
  const [selected, setSelected] = useState<ElectoralZone | null>(null);

  async function loadZones() {
    setLoading(true);
    setError(null);

    if (!isElectoralZonesSupabaseReady()) {
      setZones([]);
      setError("Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar zonas reais.");
      setLoading(false);
      return;
    }

    try {
      const data = await listElectoralZones();
      setZones(data);
    } catch (err) {
      setZones([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadZones();
  }, []);

  const filterOptions = useMemo(() => ({
    locais: unique(zones.map((item) => item.voting_place)),
    bairros: unique(zones.map((item) => item.neighborhood)),
    cidades: unique(zones.map((item) => item.city)),
    estados: unique(zones.map((item) => item.state)),
    prioridades: unique(zones.map((item) => item.priority)),
    responsaveis: unique(zones.map((item) => item.regional_responsible ?? "Não definido")),
    status: unique(zones.map((item) => item.status)),
  }), [zones]);

  const filtered = useMemo(() => {
    const zonaTerm = normalize(filters.zona);
    const secaoTerm = normalize(filters.secao);

    return zones.filter((zone) => {
      const coverage = getCoverage(zone);
      const goalDistance = getDistanceToGoal(zone);

      return (
        (!zonaTerm || normalize(zone.zone_number).includes(zonaTerm)) &&
        (!secaoTerm || normalize(zone.section_number ?? "").includes(secaoTerm)) &&
        matches(filters.local, zone.voting_place) &&
        matches(filters.bairro, zone.neighborhood) &&
        matches(filters.cidade, zone.city) &&
        matches(filters.estado, zone.state) &&
        matches(filters.prioridade, zone.priority) &&
        matches(filters.responsavel, zone.regional_responsible ?? "Não definido") &&
        matches(filters.status, zone.status) &&
        matchRange(filters.faixaEleitores, zone.voters_count, [
          ["0-1000", 0, 1000],
          ["1001-2500", 1001, 2500],
          ["2501+", 2501, Number.POSITIVE_INFINITY],
        ]) &&
        matchRange(filters.meta, zone.vote_goal, [
          ["0-200", 0, 200],
          ["201-500", 201, 500],
          ["501+", 501, Number.POSITIVE_INFINITY],
        ]) &&
        matchRange(filters.cobertura, coverage, [
          ["baixa", 0, 3.99],
          ["media", 4, 9.99],
          ["alta", 10, Number.POSITIVE_INFINITY],
        ]) &&
        (filters.cobertura !== "abaixo-meta" || goalDistance > 0)
      );
    });
  }, [filters, zones]);

  const summary = useMemo(() => buildSummary(filtered), [filtered]);

  function openCreate() {
    setEditing({ ...emptyForm });
    setFormOpen(true);
  }

  function openEdit(record: ElectoralZone) {
    setEditing(toFormState(record));
    setFormOpen(true);
  }

  function openDetails(record: ElectoralZone) {
    setSelected(record);
    setDetailsOpen(true);
  }

  async function saveZone(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;

    const validationError = validateForm(editing);
    if (validationError) {
      toast({ title: "Revise o cadastro", description: validationError, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editing.id) {
        const saved = await updateElectoralZone(editing.id, toUpdatePayload(editing));
        setZones((current) => current.map((item) => (item.id === saved.id ? saved : item)));
        toast({ title: "Zona atualizada", description: "As alterações foram salvas no Supabase." });
      } else {
        const saved = await createElectoralZone(toInsertPayload(editing));
        setZones((current) => [saved, ...current]);
        toast({ title: "Zona criada", description: "O novo registro foi salvo no Supabase." });
      }

      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast({ title: "Não foi possível salvar", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removeZone(record: ElectoralZone) {
    const confirmed = window.confirm(`Excluir a zona ${record.zone_number}${record.section_number ? ` / seção ${record.section_number}` : ""}?\n\nEssa ação não poderá ser desfeita.`);
    if (!confirmed) return;

    try {
      await deleteElectoralZone(record.id);
      setZones((current) => current.filter((item) => item.id !== record.id));
      toast({ title: "Registro excluído", description: "A zona/seção foi removida do Supabase." });
    } catch (err) {
      toast({ title: "Não foi possível excluir", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base Territorial"
        title="Zonas Eleitorais"
        description={`${filtered.length} seções no recorte atual - dados reais da tabela electoral_zones no Supabase.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadZones()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <PermissionGate module="zonas_eleitorais" action="create">
              <Button onClick={openCreate}>
                <PlusCircle className="h-4 w-4" /> Nova Zona
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {error ? <ConnectionWarning message={error} /> : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Zonas" value={summary.zones} icon={Flag} tone="blue" loading={loading} />
        <MetricCard label="Seções" value={summary.sections} icon={ClipboardList} tone="cyan" loading={loading} />
        <MetricCard label="Locais" value={summary.places} icon={Building2} tone="indigo" loading={loading} />
        <MetricCard label="Eleitores" value={summary.voters} icon={Users} tone="violet" loading={loading} />
        <MetricCard label="Meta total" value={summary.goal} icon={Target} tone="amber" loading={loading} />
        <MetricCard label="Validados" value={summary.validated} icon={CheckCircle2} tone="green" loading={loading} />
        <MetricCard label="Distância" value={summary.distance} icon={TrendingUp} tone="orange" loading={loading} />
        <MetricCard label="Cobertura" value={`${summary.coverage}%`} icon={Gauge} tone="emerald" loading={loading} />
        <MetricCard label="Prioritárias" value={summary.priority} icon={AlertTriangle} tone="rose" loading={loading} />
        <MetricCard label="Atenção" value={summary.attention} icon={AlertTriangle} tone="red" loading={loading} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ComparativeIndicators summary={summary} loading={loading} />
        <ImportCard />
      </div>

      <FiltersPanel filters={filters} setFilters={setFilters} options={filterOptions} />

      <ZonesTable
        loading={loading}
        zones={filtered}
        onOpenDetails={openDetails}
        onEdit={openEdit}
        onDelete={removeZone}
      />

      <ZoneFormSheet
        open={formOpen}
        record={editing}
        saving={saving}
        setRecord={setEditing}
        onOpenChange={setFormOpen}
        onSubmit={saveZone}
      />

      <ZoneDetailSheet
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

function ConnectionWarning({ message }: { message: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-extrabold">Conexão com Supabase indisponível</div>
            <p className="text-sm font-medium leading-6">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparativeIndicators({ summary, loading }: { summary: Summary; loading: boolean }) {
  const items = [
    { label: "Cumprimento médio da meta", value: `${summary.avgGoalCompletion}%`, tone: "bg-blue-600" },
    { label: "Votos estimados da campanha", value: summary.estimated.toLocaleString("pt-BR"), tone: "bg-violet-600" },
    { label: "Oportunidades eleitorais", value: summary.opportunity.toLocaleString("pt-BR"), tone: "bg-amber-500" },
    { label: "Prioridade automática crítica", value: summary.attention.toLocaleString("pt-BR"), tone: "bg-red-500" },
  ];

  return (
    <Card className="premium-card">
      <CardHeader className="section-divider border-t-0 px-5 py-4">
        <CardTitle className="text-base font-extrabold text-slate-950">Indicadores comparativos</CardTitle>
        <p className="text-sm font-medium text-slate-500">Cobertura, distância da meta e oportunidade calculadas com os dados reais filtrados.</p>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            {loading ? <Skeleton className="mb-2 h-7 w-20" /> : <div className="text-2xl font-extrabold text-slate-950">{item.value}</div>}
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{item.label}</div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
              <div className={`h-full w-2/3 rounded-full ${item.tone}`} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ImportCard() {
  return (
    <Card className="premium-card border-dashed border-blue-200 bg-blue-50/40">
      <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div className="text-lg font-extrabold text-slate-950">Importar dados eleitorais</div>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            Estrutura preparada para CSV/XLSX com zona, seção, local, endereço, eleitores, histórico e meta.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full bg-white"
          onClick={() => toast({ title: "Importação de dados", description: "Use o módulo Importação para validar planilhas CSV/XLSX antes de gravar no Supabase." })}
        >
          <Upload className="h-4 w-4" /> Orientar importação
        </Button>
      </CardContent>
    </Card>
  );
}

function FiltersPanel({
  filters,
  setFilters,
  options,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  options: {
    locais: string[];
    bairros: string[];
    cidades: string[];
    estados: string[];
    prioridades: string[];
    responsaveis: string[];
    status: string[];
  };
}) {
  return (
    <Card className="premium-card">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Field label="Buscar por zona">
            <Input value={filters.zona} onChange={(event) => setFilters({ ...filters, zona: event.target.value })} placeholder="Ex.: 55" />
          </Field>
          <Field label="Buscar por seção">
            <Input value={filters.secao} onChange={(event) => setFilters({ ...filters, secao: event.target.value })} placeholder="Ex.: 120" />
          </Field>
          <FilterSelect label="Local de votação" value={filters.local} values={options.locais} onChange={(value) => setFilters({ ...filters, local: value })} />
          <FilterSelect label="Bairro" value={filters.bairro} values={options.bairros} onChange={(value) => setFilters({ ...filters, bairro: value })} />
          <FilterSelect label="Cidade" value={filters.cidade} values={options.cidades} onChange={(value) => setFilters({ ...filters, cidade: value })} />
          <FilterSelect label="Estado" value={filters.estado} values={options.estados} onChange={(value) => setFilters({ ...filters, estado: value })} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <RangeSelect
            label="Faixa de eleitores"
            value={filters.faixaEleitores}
            options={[["todos", "Todas"], ["0-1000", "Até 1.000"], ["1001-2500", "1.001 a 2.500"], ["2501+", "2.501+"]]}
            onChange={(value) => setFilters({ ...filters, faixaEleitores: value })}
          />
          <RangeSelect
            label="Meta de votos"
            value={filters.meta}
            options={[["todos", "Todas"], ["0-200", "Até 200"], ["201-500", "201 a 500"], ["501+", "501+"]]}
            onChange={(value) => setFilters({ ...filters, meta: value })}
          />
          <FilterSelect label="Prioridade" value={filters.prioridade} values={options.prioridades} onChange={(value) => setFilters({ ...filters, prioridade: value })} />
          <FilterSelect label="Responsável" value={filters.responsavel} values={options.responsaveis} onChange={(value) => setFilters({ ...filters, responsavel: value })} />
          <RangeSelect
            label="Cobertura"
            value={filters.cobertura}
            options={[["todos", "Todas"], ["baixa", "Baixa"], ["media", "Média"], ["alta", "Alta"], ["abaixo-meta", "Abaixo da meta"]]}
            onChange={(value) => setFilters({ ...filters, cobertura: value })}
          />
          <FilterSelect label="Status" value={filters.status} values={options.status} onChange={(value) => setFilters({ ...filters, status: value })} />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ZonesTable({
  loading,
  zones,
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  zones: ElectoralZone[];
  onOpenDetails: (record: ElectoralZone) => void;
  onEdit: (record: ElectoralZone) => void;
  onDelete: (record: ElectoralZone) => void;
}) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="section-divider border-t-0 px-5 py-4">
        <CardTitle className="text-base font-extrabold text-slate-950">Zonas, seções e locais de votação</CardTitle>
        <p className="text-sm font-medium text-slate-500">Clique em um registro para abrir a ficha detalhada.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-28 px-5">Zona</TableHead>
                <TableHead>Seção</TableHead>
                <TableHead className="min-w-60">Local de votação</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="text-right">Eleitores</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Estimados</TableHead>
                <TableHead className="text-right">Validados</TableHead>
                <TableHead>Cobertura</TableHead>
                <TableHead className="text-right">Distância</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="min-w-44">Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 15 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className={cellIndex === 0 ? "px-5" : ""}>
                        <Skeleton className="h-7 w-full rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="p-6">
                    <EmptyState title="Nenhuma zona encontrada" description="Ajuste os filtros ou cadastre uma zona/seção para iniciar o acompanhamento eleitoral." icon={ClipboardList} />
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => {
                  const coverage = getCoverage(zone);
                  const distance = getDistanceToGoal(zone);
                  const automaticPriority = getAutomaticPriority(zone);
                  return (
                    <TableRow key={zone.id} className="cursor-pointer" onClick={() => onOpenDetails(zone)}>
                      <TableCell className="px-5">
                        <div className="font-extrabold text-slate-950">{zone.zone_number}</div>
                        <div className="text-xs font-medium text-slate-500">Sugestão: {automaticPriority}</div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">{zone.section_number || "-"}</TableCell>
                      <TableCell>
                        <div className="font-extrabold text-slate-800">{zone.voting_place}</div>
                        <div className="text-xs font-medium text-slate-500">{formatAddress(zone)}</div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{zone.neighborhood}</TableCell>
                      <TableCell className="text-slate-600">{zone.city}</TableCell>
                      <TableCell className="text-right font-bold text-slate-700">{formatNumber(zone.voters_count)}</TableCell>
                      <TableCell className="text-right font-bold text-slate-700">{formatNumber(zone.vote_goal)}</TableCell>
                      <TableCell className="text-right font-bold text-slate-700">{formatNumber(zone.estimated_campaign_votes)}</TableCell>
                      <TableCell className="text-right text-base font-extrabold text-blue-700">{formatNumber(zone.validated_votes)}</TableCell>
                      <TableCell>
                        <ProgressCell value={coverage} />
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-slate-800">{formatNumber(distance)}</TableCell>
                      <TableCell><StatusPill label={zone.priority} tone={getPriorityTone(zone.priority)} /></TableCell>
                      <TableCell className="font-medium text-slate-600">{zone.regional_responsible || "Não definido"}</TableCell>
                      <TableCell><StatusPill label={zone.status} tone={getStatusTone(zone.status)} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => onOpenDetails(zone)} title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <PermissionGate module="zonas_eleitorais" action="edit">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(zone)} title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </PermissionGate>
                          <PermissionGate module="zonas_eleitorais" action="delete">
                            <Button variant="ghost" size="icon" onClick={() => onDelete(zone)} title="Excluir">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </PermissionGate>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ZoneFormSheet({
  open,
  record,
  saving,
  setRecord,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  record: ZoneFormState | null;
  saving: boolean;
  setRecord: (record: ZoneFormState | null) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  if (!record) return null;

  function update<K extends keyof ZoneFormState>(key: K, value: ZoneFormState[K]) {
    setRecord(record ? { ...record, [key]: value } : record);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{record.id ? "Editar zona/seção" : "Cadastrar zona/seção"}</SheetTitle>
          <SheetDescription>Dados eleitorais reais serão salvos na tabela electoral_zones.</SheetDescription>
        </SheetHeader>
        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <FormSection title="Identificação eleitoral">
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Zona eleitoral *">
                <Input value={record.zone_number} onChange={(event) => update("zone_number", event.target.value)} placeholder="Ex.: 55" />
              </Field>
              <Field label="Seção eleitoral">
                <Input value={record.section_number} onChange={(event) => update("section_number", event.target.value)} placeholder="Ex.: 120" />
              </Field>
              <Field label="Local de votação *">
                <Input value={record.voting_place} onChange={(event) => update("voting_place", event.target.value)} placeholder="Nome do local" />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Endereço e localização">
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="CEP">
                <Input value={record.cep} onChange={(event) => update("cep", event.target.value)} placeholder="00000-000" />
              </Field>
              <Field label="Rua">
                <Input value={record.street} onChange={(event) => update("street", event.target.value)} />
              </Field>
              <Field label="Número">
                <Input value={record.number} onChange={(event) => update("number", event.target.value)} />
              </Field>
              <Field label="Complemento">
                <Input value={record.complement} onChange={(event) => update("complement", event.target.value)} />
              </Field>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-5">
              <Field label="Bairro *">
                <Input value={record.neighborhood} onChange={(event) => update("neighborhood", event.target.value)} />
              </Field>
              <Field label="Cidade *">
                <Input value={record.city} onChange={(event) => update("city", event.target.value)} />
              </Field>
              <Field label="Estado *">
                <Input value={record.state} onChange={(event) => update("state", event.target.value.toUpperCase())} maxLength={2} />
              </Field>
              <Field label="Latitude">
                <Input value={record.latitude} onChange={(event) => update("latitude", event.target.value)} placeholder="-22.9" />
              </Field>
              <Field label="Longitude">
                <Input value={record.longitude} onChange={(event) => update("longitude", event.target.value)} placeholder="-42.8" />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Metas, votos e força territorial">
            <div className="grid gap-3 md:grid-cols-5">
              <NumberField label="Eleitores *" value={record.voters_count} onChange={(value) => update("voters_count", value)} />
              <NumberField label="Histórico de votos" value={record.historical_votes} onChange={(value) => update("historical_votes", value)} />
              <NumberField label="Meta de votos *" value={record.vote_goal} onChange={(value) => update("vote_goal", value)} />
              <NumberField label="Votos estimados" value={record.estimated_campaign_votes} onChange={(value) => update("estimated_campaign_votes", value)} />
              <NumberField label="Votos validados" value={record.validated_votes} onChange={(value) => update("validated_votes", value)} />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Field label="Responsável pela região">
                <Input value={record.regional_responsible} onChange={(event) => update("regional_responsible", event.target.value)} placeholder="Coordenação ou responsável" />
              </Field>
              <StaticSelect label="Prioridade *" value={record.priority} values={priorityOptions} onChange={(value) => update("priority", value)} />
              <StaticSelect label="Status *" value={record.status} values={statusOptions} onChange={(value) => update("status", value)} />
            </div>
          </FormSection>

          <FormSection title="Observações estratégicas">
            <Textarea value={record.notes} onChange={(event) => update("notes", event.target.value)} rows={5} placeholder="Demandas, leitura política, ações recomendadas e pontos de atenção." />
          </FormSection>

          <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white/95 py-4 backdrop-blur">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar no Supabase
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ZoneDetailSheet({
  open,
  record,
  onOpenChange,
}: {
  open: boolean;
  record: ElectoralZone | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!record) return null;

  const coverage = getCoverage(record);
  const goalCompletion = getGoalCompletion(record);
  const distance = getDistanceToGoal(record);
  const automaticPriority = getAutomaticPriority(record);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Zona {record.zone_number}{record.section_number ? ` / Seção ${record.section_number}` : ""}</SheetTitle>
          <SheetDescription>{record.voting_place} - {record.neighborhood}, {record.city}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="grid gap-3 md:grid-cols-4">
            <DetailMetric label="Eleitores" value={formatNumber(record.voters_count)} />
            <DetailMetric label="Meta" value={formatNumber(record.vote_goal)} />
            <DetailMetric label="Validados" value={formatNumber(record.validated_votes)} />
            <DetailMetric label="Distância" value={formatNumber(distance)} />
          </div>

          <Card className="premium-card">
            <CardHeader className="section-divider border-t-0 px-5 py-4">
              <CardTitle className="text-base font-extrabold text-slate-950">Dados eleitorais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              <Info label="Zona eleitoral" value={record.zone_number} />
              <Info label="Seção eleitoral" value={record.section_number || "Não informada"} />
              <Info label="Local de votação" value={record.voting_place} />
              <Info label="Histórico de votação" value={record.historical_votes ? formatNumber(record.historical_votes) : "Não informado"} />
              <Info label="Votos estimados" value={formatNumber(record.estimated_campaign_votes)} />
              <Info label="Cumprimento da meta" value={`${goalCompletion}%`} />
              <Info label="Cobertura" value={`${coverage}%`} />
              <Info label="Prioridade automática sugerida" value={automaticPriority} />
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="section-divider border-t-0 px-5 py-4">
              <CardTitle className="text-base font-extrabold text-slate-950">Endereço e localização</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              <Info label="Endereço" value={formatAddress(record) || "Não informado"} />
              <Info label="CEP" value={record.cep || "Não informado"} />
              <Info label="Bairro" value={record.neighborhood} />
              <Info label="Cidade/UF" value={`${record.city} / ${record.state}`} />
              <Info label="Latitude" value={record.latitude?.toString() || "Não informada"} />
              <Info label="Longitude" value={record.longitude?.toString() || "Não informada"} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="premium-card">
              <CardHeader className="section-divider border-t-0 px-5 py-4">
                <CardTitle className="text-base font-extrabold text-slate-950">Responsável e status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <Info label="Responsável pela região" value={record.regional_responsible || "Não definido"} />
                <div className="flex flex-wrap gap-2">
                  <StatusPill label={record.priority} tone={getPriorityTone(record.priority)} />
                  <StatusPill label={record.status} tone={getStatusTone(record.status)} />
                </div>
                <Info label="Observações estratégicas" value={record.notes || "Sem observações cadastradas."} />
              </CardContent>
            </Card>

            <Card className="premium-card overflow-hidden">
              <div className="relative h-full min-h-72 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_70%_35%,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#f8fafc,#eef6ff)] p-5">
                <div className="absolute left-10 top-16 h-24 w-24 rounded-full border border-blue-200 bg-blue-500/15" />
                <div className="absolute bottom-12 right-12 h-32 w-32 rounded-full border border-emerald-200 bg-emerald-500/15" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-blue-700">Área territorial</div>
                    <div className="mt-2 text-2xl font-extrabold text-slate-950">{record.neighborhood}</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Área preparada para leitura territorial com Mapbox/PostGIS.</p>
                  </div>
                  <div className="rounded-lg border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {record.voting_place}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <EmptyState title="Nenhum dado vinculado ainda." description="Lideranças, apoiadores, demandas e ações serão vinculados quando os próximos relacionamentos reais forem conectados." icon={BarChart3} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProgressCell({ value }: { value: number }) {
  const width = Math.max(Math.min(value, 100), 0);
  return (
    <div className="w-28">
      <div className="mb-1 text-xs font-bold text-slate-600">{value}%</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
      <div className="text-xl font-extrabold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 text-sm font-extrabold text-slate-950">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <Field label={label}>
      <Input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value || 0))} />
    </Field>
  );
}

function FilterSelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="todos">Todos</option>
        {values.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </Field>
  );
}

function StaticSelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </Field>
  );
}

function RangeSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </Field>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-bold leading-6 text-slate-800">{value}</div>
    </div>
  );
}

function buildSummary(records: ElectoralZone[]): Summary {
  const voters = records.reduce((total, item) => total + Number(item.voters_count ?? 0), 0);
  const goal = records.reduce((total, item) => total + Number(item.vote_goal ?? 0), 0);
  const estimated = records.reduce((total, item) => total + Number(item.estimated_campaign_votes ?? 0), 0);
  const validated = records.reduce((total, item) => total + Number(item.validated_votes ?? 0), 0);

  return {
    zones: unique(records.map((item) => item.zone_number)).length,
    sections: records.length,
    places: unique(records.map((item) => item.voting_place)).length,
    voters,
    goal,
    estimated,
    validated,
    distance: Math.max(goal - validated, 0),
    coverage: voters > 0 ? roundPercent((validated / voters) * 100) : 0,
    priority: records.filter((item) => ["alta", "critica"].includes(normalize(item.priority))).length,
    attention: records.filter((item) => getAutomaticPriority(item) === "Crítica" || normalize(item.status).includes("baixa") || normalize(item.status).includes("revisar")).length,
    opportunity: records.filter((item) => isElectoralOpportunity(item)).length,
    avgGoalCompletion: goal > 0 ? roundPercent((validated / goal) * 100) : 0,
  };
}

function toFormState(record: ElectoralZone): ZoneFormState {
  return {
    id: record.id,
    zone_number: record.zone_number,
    section_number: record.section_number ?? "",
    voting_place: record.voting_place,
    cep: record.cep ?? "",
    street: record.street ?? "",
    number: record.number ?? "",
    complement: record.complement ?? "",
    neighborhood: record.neighborhood,
    city: record.city,
    state: record.state,
    latitude: record.latitude?.toString() ?? "",
    longitude: record.longitude?.toString() ?? "",
    voters_count: record.voters_count ?? 0,
    historical_votes: record.historical_votes ?? 0,
    vote_goal: record.vote_goal ?? 0,
    estimated_campaign_votes: record.estimated_campaign_votes ?? 0,
    validated_votes: record.validated_votes ?? 0,
    regional_responsible: record.regional_responsible ?? "",
    priority: record.priority,
    status: record.status,
    notes: record.notes ?? "",
  };
}

function toInsertPayload(form: ZoneFormState): ElectoralZoneInsert {
  return {
    campaign_id: DEFAULT_CAMPAIGN_ID,
    zone_number: form.zone_number.trim(),
    section_number: nullable(form.section_number),
    voting_place: form.voting_place.trim(),
    cep: nullable(form.cep),
    street: nullable(form.street),
    number: nullable(form.number),
    complement: nullable(form.complement),
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    latitude: nullableNumber(form.latitude),
    longitude: nullableNumber(form.longitude),
    voters_count: Number(form.voters_count ?? 0),
    historical_votes: form.historical_votes > 0 ? Number(form.historical_votes) : null,
    vote_goal: Number(form.vote_goal ?? 0),
    estimated_campaign_votes: Number(form.estimated_campaign_votes ?? 0),
    validated_votes: Number(form.validated_votes ?? 0),
    regional_responsible: nullable(form.regional_responsible),
    priority: form.priority,
    status: form.status,
    notes: nullable(form.notes),
  };
}

function toUpdatePayload(form: ZoneFormState): ElectoralZoneUpdate {
  return toInsertPayload(form);
}

function validateForm(form: ZoneFormState) {
  if (!form.zone_number.trim()) return "Informe a zona eleitoral.";
  if (!form.voting_place.trim()) return "Informe o local de votação.";
  if (!form.neighborhood.trim()) return "Informe o bairro.";
  if (!form.city.trim()) return "Informe a cidade.";
  if (!form.state.trim()) return "Informe o estado.";
  if (Number(form.voters_count) <= 0) return "Informe o número de eleitores.";
  if (Number(form.vote_goal) <= 0) return "Informe a meta de votos.";
  if (!form.priority.trim()) return "Informe a prioridade.";
  if (!form.status.trim()) return "Informe o status.";
  return null;
}

function getCoverage(record: ElectoralZone) {
  return record.voters_count > 0 ? roundPercent((record.validated_votes / record.voters_count) * 100) : 0;
}

function getGoalCompletion(record: ElectoralZone) {
  return record.vote_goal > 0 ? roundPercent((record.validated_votes / record.vote_goal) * 100) : 0;
}

function getDistanceToGoal(record: ElectoralZone) {
  return Math.max((record.vote_goal ?? 0) - (record.validated_votes ?? 0), 0);
}

function getAutomaticPriority(record: ElectoralZone) {
  const coverage = getCoverage(record);
  const hasResponsible = Boolean(record.regional_responsible?.trim());
  if (record.voters_count >= 2500 && coverage < 3 && !hasResponsible) return "Crítica";
  if (record.voters_count >= 2200 && coverage < 4) return "Alta";
  if (coverage < 8 || getDistanceToGoal(record) > 250) return "Média";
  return "Baixa";
}

function isElectoralOpportunity(record: ElectoralZone) {
  return record.voters_count >= 2000 && getCoverage(record) < 5 && getDistanceToGoal(record) > 200;
}

function getPriorityTone(priority: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(priority);
  if (normalized.includes("crit")) return "red";
  if (normalized.includes("alta")) return "amber";
  if (normalized.includes("media")) return "blue";
  if (normalized.includes("baixa")) return "slate";
  return "violet";
}

function getStatusTone(status: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(status);
  if (normalized.includes("forte")) return "green";
  if (normalized.includes("ativa")) return "emerald";
  if (normalized.includes("prospeccao")) return "blue";
  if (normalized.includes("baixa") || normalized.includes("sem lideranca") || normalized.includes("revisar")) return "red";
  if (normalized.includes("mapeada")) return "violet";
  return "slate";
}

function formatAddress(record: ElectoralZone) {
  return [record.street, record.number, record.complement, record.neighborhood].filter(Boolean).join(", ");
}

function formatNumber(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR");
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function matchRange(value: string, current: number, ranges: Array<[string, number, number]>) {
  if (value === "todos") return true;
  const range = ranges.find(([key]) => key === value);
  if (!range) return true;
  return current >= range[1] && current <= range[2];
}

function matches(filterValue: string, current: string | null | undefined) {
  return filterValue === "todos" || normalize(current ?? "") === normalize(filterValue);
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function nullableNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return "Erro inesperado ao conectar com o Supabase.";
}
