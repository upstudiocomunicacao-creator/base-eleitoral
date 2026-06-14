import { FormEvent, MouseEventHandler, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Loader2,
  PlusCircle,
  RefreshCw,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { SensitiveText } from "@/components/auth/SensitiveText";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { DEFAULT_CAMPAIGN_ID } from "@/services/leaders";
import {
  createProspect,
  deleteProspect,
  isProspectsSupabaseReady,
  listProspectsWithRelations,
  updateProspect,
  updateProspectStage,
  type ProspectWithRelations,
} from "@/services/prospects";
import type { Database, Leader, Prospect, Supporter } from "@/types/database";

type ProspectInsert = Database["public"]["Tables"]["prospects"]["Insert"];
type ProspectUpdate = Database["public"]["Tables"]["prospects"]["Update"];
type FunnelStage = "Novo contato" | "Primeiro atendimento" | "Simpatizante" | "Apoiador confirmado" | "Multiplicador" | "Voto validado";
type Priority = "Baixa" | "Média" | "Alta" | "Crítica";

type Filters = {
  search: string;
  bairro: string;
  cidade: string;
  lideranca: string;
  pessoa: string;
  responsavel: string;
  etapa: string;
  prioridade: string;
  origem: string;
  confianca: string;
  dataProximaAcao: string;
  atrasados: string;
  semLideranca: string;
};

type ProspectFormState = {
  id: string | null;
  supporter_id: string;
  leader_id: string;
  contact_name: string;
  phone: string;
  neighborhood: string;
  city: string;
  funnel_stage: FunnelStage;
  origin: string;
  priority: Priority;
  confidence_level: string;
  internal_responsible: string;
  last_contact: string;
  next_action: string;
  next_action_date: string;
  last_result: string;
  loss_reason: string;
  notes: string;
};

const stages: Array<{ id: FunnelStage; title: string; short: string; tone: "slate" | "blue" | "amber" | "emerald" | "violet" | "green" }> = [
  { id: "Novo contato", title: "Novo contato", short: "Novo", tone: "slate" },
  { id: "Primeiro atendimento", title: "Primeiro atendimento", short: "1º atendimento", tone: "blue" },
  { id: "Simpatizante", title: "Simpatizante", short: "Simpatizante", tone: "amber" },
  { id: "Apoiador confirmado", title: "Apoiador confirmado", short: "Confirmado", tone: "emerald" },
  { id: "Multiplicador", title: "Multiplicador", short: "Multiplicador", tone: "violet" },
  { id: "Voto validado", title: "Voto validado", short: "Validado", tone: "green" },
];

const emptyFilters: Filters = {
  search: "",
  bairro: "todos",
  cidade: "todos",
  lideranca: "todos",
  pessoa: "todos",
  responsavel: "todos",
  etapa: "todos",
  prioridade: "todos",
  origem: "todos",
  confianca: "todos",
  dataProximaAcao: "",
  atrasados: "todos",
  semLideranca: "todos",
};

const emptyForm: ProspectFormState = {
  id: null,
  supporter_id: "",
  leader_id: "",
  contact_name: "",
  phone: "",
  neighborhood: "",
  city: "Maricá",
  funnel_stage: "Novo contato",
  origin: "Indicação",
  priority: "Média",
  confidence_level: "Médio",
  internal_responsible: "Equipe Campo",
  last_contact: "",
  next_action: "Primeiro contato",
  next_action_date: "",
  last_result: "Pediu retorno",
  loss_reason: "",
  notes: "",
};

const origins = ["Liderança", "Evento", "Reunião", "WhatsApp", "Abordagem de rua", "Rede social", "Indicação", "Planilha importada", "Demanda popular", "Outro"];
const approachResults = ["Não respondeu", "Pediu retorno", "Demonstrou interesse", "Confirmou apoio", "Indicou outras pessoas", "Virou multiplicador", "Voto validado", "Recusou apoio"];
const priorities: Priority[] = ["Baixa", "Média", "Alta", "Crítica"];

export default function Prospeccao() {
  const [prospects, setProspects] = useState<ProspectWithRelations[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [editing, setEditing] = useState<ProspectFormState | null>(null);
  const [selected, setSelected] = useState<ProspectWithRelations | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  async function loadProspects() {
    setLoading(true);
    setError(null);

    if (!isProspectsSupabaseReady()) {
      setProspects([]);
      setSupporters([]);
      setLeaders([]);
      setError("Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar prospecções reais.");
      setLoading(false);
      return;
    }

    try {
      const data = await listProspectsWithRelations();
      setProspects(data.prospects);
      setSupporters(data.supporters);
      setLeaders(data.leaders);
    } catch (err) {
      setProspects([]);
      setSupporters([]);
      setLeaders([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProspects();
  }, []);

  const options = useMemo(() => ({
    bairros: unique(prospects.map((item) => item.neighborhood)),
    cidades: unique(prospects.map((item) => item.city)),
    liderancas: unique(prospects.map((item) => getLeaderLabel(item))),
    pessoas: unique(prospects.map((item) => getSupporterLabel(item))),
    responsaveis: unique(prospects.map((item) => item.internal_responsible ?? "Não definido")),
    origens: unique(prospects.map((item) => item.origin)),
    confiancas: unique(prospects.map((item) => item.confidence_level)),
  }), [prospects]);

  const filtered = useMemo(() => prospects.filter((item) => {
    const term = normalize(filters.search);
    return (
      (!term || [item.contact_name, item.phone, item.neighborhood, item.city, getLeaderLabel(item), getSupporterLabel(item), item.internal_responsible].some((value) => normalize(value ?? "").includes(term))) &&
      matches(filters.bairro, item.neighborhood) &&
      matches(filters.cidade, item.city) &&
      matches(filters.lideranca, getLeaderLabel(item)) &&
      matches(filters.pessoa, getSupporterLabel(item)) &&
      matches(filters.responsavel, item.internal_responsible ?? "Não definido") &&
      matches(filters.etapa, item.funnel_stage) &&
      matches(filters.prioridade, item.priority) &&
      matches(filters.origem, item.origin) &&
      matches(filters.confianca, item.confidence_level) &&
      (!filters.dataProximaAcao || item.next_action_date === filters.dataProximaAcao) &&
      (filters.atrasados === "todos" || (filters.atrasados === "sim" ? isOverdue(item) : !isOverdue(item))) &&
      (filters.semLideranca === "todos" || (filters.semLideranca === "sim" ? !item.leader_id : Boolean(item.leader_id)))
    );
  }), [filters, prospects]);

  const byStage = useMemo(() => stages.reduce<Record<FunnelStage, ProspectWithRelations[]>>((acc, stage) => {
    acc[stage.id] = filtered.filter((item) => item.funnel_stage === stage.id);
    return acc;
  }, {
    "Novo contato": [],
    "Primeiro atendimento": [],
    Simpatizante: [],
    "Apoiador confirmado": [],
    Multiplicador: [],
    "Voto validado": [],
  }), [filtered]);

  const summary = useMemo(() => getSummary(filtered), [filtered]);

  function openCreate() {
    setEditing({ ...emptyForm });
    setFormOpen(true);
  }

  function openEdit(record: ProspectWithRelations) {
    setEditing(toFormState(record));
    setFormOpen(true);
  }

  async function saveRecord(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;

    const validationError = validateForm(editing);
    if (validationError) {
      toast({ title: "Revise a prospecção", description: validationError, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editing.id) {
        const saved = await updateProspect(editing.id, toUpdatePayload(editing));
        setProspects((current) => current.map((item) => (item.id === saved.id ? withRelations(saved, supporters, leaders) : item)));
        toast({ title: "Prospecção atualizada", description: "As alterações foram salvas no Supabase." });
      } else {
        const saved = await createProspect(toInsertPayload(editing));
        setProspects((current) => [withRelations(saved, supporters, leaders), ...current]);
        toast({ title: "Prospecção criada", description: "O novo contato foi salvo no Supabase." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast({ title: "Não foi possível salvar", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record: ProspectWithRelations) {
    const confirmed = window.confirm(`Excluir a prospecção "${record.contact_name}"?\n\nEssa ação não poderá ser desfeita.`);
    if (!confirmed) return;

    try {
      await deleteProspect(record.id);
      setProspects((current) => current.filter((item) => item.id !== record.id));
      toast({ title: "Prospecção excluída", description: "O registro foi removido do Supabase." });
    } catch (err) {
      toast({ title: "Não foi possível excluir", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  async function moveStage(record: ProspectWithRelations, direction: -1 | 1) {
    const oldStage = record.funnel_stage as FunnelStage;
    const nextStage = getMovedStage(oldStage, direction);
    if (oldStage === nextStage) return;

    setProspects((current) => current.map((item) => (item.id === record.id ? { ...item, funnel_stage: nextStage } : item)));
    setSelected((current) => current && current.id === record.id ? { ...current, funnel_stage: nextStage } : current);

    try {
      const saved = await updateProspectStage(record.id, nextStage);
      const hydrated = withRelations(saved, supporters, leaders);
      setProspects((current) => current.map((item) => (item.id === saved.id ? hydrated : item)));
      setSelected((current) => current && current.id === saved.id ? hydrated : current);
      toast({ title: "Etapa atualizada", description: `${record.contact_name} agora está em ${nextStage}.` });
    } catch (err) {
      setProspects((current) => current.map((item) => (item.id === record.id ? { ...item, funnel_stage: oldStage } : item)));
      setSelected((current) => current && current.id === record.id ? { ...current, funnel_stage: oldStage } : current);
      toast({ title: "Não foi possível mudar a etapa", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Funil Territorial"
        title="Prospecção de Eleitores"
        description={`${filtered.length} contatos no pipeline - dados reais da tabela prospects no Supabase.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadProspects()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <PermissionGate module="prospeccao" action="create">
              <Button onClick={openCreate}><PlusCircle className="h-4 w-4" /> Nova oportunidade</Button>
            </PermissionGate>
          </div>
        }
      />

      {error ? <ConnectionWarning message={error} /> : null}

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(148px,1fr))]">
        <MetricCard label="Novos" value={summary.novoContato} icon={Users} tone="blue" loading={loading} />
        <MetricCard label="1º atendimento" value={summary.primeiroAtendimento} icon={UserCheck} tone="cyan" loading={loading} />
        <MetricCard label="Simpatizantes" value={summary.simpatizante} icon={TrendingUp} tone="amber" loading={loading} />
        <MetricCard label="Confirmados" value={summary.apoiadorConfirmado} icon={CheckCircle2} tone="emerald" loading={loading} />
        <MetricCard label="Multiplicadores" value={summary.multiplicador} icon={Target} tone="violet" loading={loading} />
        <MetricCard label="Validados" value={summary.votoValidado} icon={CheckCircle2} tone="green" loading={loading} />
        <MetricCard label="Sem retorno" value={summary.semRetorno} icon={Clock} tone="orange" loading={loading} />
        <MetricCard label="Vencidas" value={summary.vencidas} icon={AlertTriangle} tone="red" loading={loading} />
        <MetricCard label="Conversão geral" value={`${summary.conversaoGeral}%`} icon={TrendingUp} tone="indigo" loading={loading} />
        <MetricCard label="Semanal" value={`${summary.conversaoSemanal}%`} icon={CalendarClock} tone="emerald" loading={loading} />
      </div>

      <ConversionPanel records={filtered} />
      <FiltersPanel filters={filters} setFilters={setFilters} options={options} />

      <section className="premium-card rounded-lg p-4">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Funil operacional</h2>
            <p className="text-sm font-medium text-slate-500">Use as setas nos cards para avançar ou voltar etapas e salvar no Supabase.</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible xl:flex xl:overflow-x-auto">
          {stages.map((stage) => (
            <FunnelColumn
              key={stage.id}
              stage={stage}
              items={byStage[stage.id]}
              onOpen={(record) => { setSelected(record); setDetailsOpen(true); }}
              onEdit={openEdit}
              onDelete={deleteRecord}
              onMove={moveStage}
              loading={loading}
            />
          ))}
        </div>
      </section>

      <ProspectFormSheet open={formOpen} record={editing} saving={saving} supporters={supporters} leaders={leaders} setRecord={setEditing} onOpenChange={setFormOpen} onSubmit={saveRecord} />
      <ProspectDetailSheet open={detailsOpen} record={selected} onOpenChange={(open) => { setDetailsOpen(open); if (!open) setSelected(null); }} onMove={moveStage} onEdit={openEdit} />
    </div>
  );
}

function ConnectionWarning({ message }: { message: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4 text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <div className="font-extrabold">Conexão com Supabase indisponível</div>
          <p className="text-sm font-medium leading-6">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelColumn({ stage, items, onOpen, onEdit, onDelete, onMove, loading }: {
  stage: (typeof stages)[number];
  items: ProspectWithRelations[];
  onOpen: (record: ProspectWithRelations) => void;
  onEdit: (record: ProspectWithRelations) => void;
  onDelete: (record: ProspectWithRelations) => void;
  onMove: (record: ProspectWithRelations, direction: -1 | 1) => void;
  loading: boolean;
}) {
  return (
    <div className="flex w-80 shrink-0 flex-col rounded-lg border border-slate-200 bg-slate-50/80 p-3 md:w-auto xl:w-80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-800">{stage.title}</h3>
          <p className="text-xs font-medium text-slate-500">Etapa do funil</p>
        </div>
        <StatusPill label={String(items.length)} tone={stage.tone} />
      </div>
      <div className="space-y-3">
        {loading ? <Skeleton className="h-36 w-full rounded-lg" /> : null}
        {!loading && items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-400">Sem contatos nesta etapa</div>
        ) : null}
        {!loading && items.map((item) => <ProspectCard key={item.id} record={item} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />)}
      </div>
    </div>
  );
}

function ProspectCard({ record, onOpen, onEdit, onDelete, onMove }: {
  record: ProspectWithRelations;
  onOpen: (record: ProspectWithRelations) => void;
  onEdit: (record: ProspectWithRelations) => void;
  onDelete: (record: ProspectWithRelations) => void;
  onMove: (record: ProspectWithRelations, direction: -1 | 1) => void;
}) {
  const stage = stages.find((item) => item.id === record.funnel_stage) ?? stages[0];
  return (
    <Card className="premium-card-hover overflow-hidden bg-white">
      <div className={`h-1.5 ${getStageAccent(record.funnel_stage as FunnelStage)}`} />
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <button className="min-w-0 text-left" onClick={() => onOpen(record)}>
            <div className="truncate font-extrabold text-slate-950">{record.contact_name}</div>
            <div className="mt-0.5 text-xs font-semibold text-slate-500">{record.neighborhood}, {record.city}</div>
          </button>
          <StatusPill label={record.priority} tone={getPriorityTone(record.priority as Priority)} />
        </div>
        <div className="grid gap-1.5 text-xs font-medium text-slate-600">
          <InfoLine icon={Users} text={getLeaderLabel(record)} />
          <InfoLine icon={UserCheck} text={getSupporterLabel(record)} />
          <InfoLine icon={CalendarClock} text={record.next_action_date || "Sem data"} />
        </div>
        <div className="grid gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          <div><span className="font-bold">WhatsApp:</span> <SensitiveText value={record.phone} kind="phone" fallback="-" /></div>
          <div><span className="font-bold">Responsável:</span> {record.internal_responsible || "-"}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label={stage.short} tone={stage.tone} />
          <StatusPill label={record.confidence_level} tone={getConfidenceTone(record.confidence_level)} />
          <StatusPill label={record.origin} tone="slate" />
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
          {record.next_action || "Sem próxima ação definida"}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex gap-1">
            <IconButton label="Retroceder" icon={ArrowLeft} onClick={(event) => { event.stopPropagation(); void onMove(record, -1); }} />
            <IconButton label="Avançar" icon={ArrowRight} onClick={(event) => { event.stopPropagation(); void onMove(record, 1); }} />
          </div>
          <div className="flex gap-1">
            <IconButton label="Visualizar" icon={Eye} onClick={(event) => { event.stopPropagation(); onOpen(record); }} />
            <PermissionGate module="prospeccao" action="edit"><IconButton label="Editar" icon={Edit} onClick={(event) => { event.stopPropagation(); onEdit(record); }} /></PermissionGate>
            <PermissionGate module="prospeccao" action="delete"><IconButton label="Excluir" icon={Trash2} danger onClick={(event) => { event.stopPropagation(); void onDelete(record); }} /></PermissionGate>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConversionPanel({ records }: { records: ProspectWithRelations[] }) {
  const items = [
    ["Novo > Simpatizante", conversionBetween(records, "Novo contato", "Simpatizante")],
    ["Simpatizante > Confirmado", conversionBetween(records, "Simpatizante", "Apoiador confirmado")],
    ["Confirmado > Multiplicador", conversionBetween(records, "Apoiador confirmado", "Multiplicador")],
    ["Multiplicador > Validado", conversionBetween(records, "Multiplicador", "Voto validado")],
  ] as const;

  return (
    <Card className="premium-card">
      <CardContent className="grid gap-3 p-4 md:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-2xl font-extrabold text-slate-950">{value}%</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</div>
          </div>
        ))}
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
    bairros: string[];
    cidades: string[];
    liderancas: string[];
    pessoas: string[];
    responsaveis: string[];
    origens: string[];
    confiancas: string[];
  };
}) {
  return (
    <Card className="premium-card">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Buscar por nome" className="xl:col-span-2"><Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Nome, telefone, bairro, liderança ou pessoa" /></Field>
          <FilterSelect label="Bairro" value={filters.bairro} values={options.bairros} onChange={(value) => setFilters({ ...filters, bairro: value })} />
          <FilterSelect label="Cidade" value={filters.cidade} values={options.cidades} onChange={(value) => setFilters({ ...filters, cidade: value })} />
          <FilterSelect label="Liderança" value={filters.lideranca} values={options.liderancas} onChange={(value) => setFilters({ ...filters, lideranca: value })} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <FilterSelect label="Pessoa vinculada" value={filters.pessoa} values={options.pessoas} onChange={(value) => setFilters({ ...filters, pessoa: value })} />
          <FilterSelect label="Responsável" value={filters.responsavel} values={options.responsaveis} onChange={(value) => setFilters({ ...filters, responsavel: value })} />
          <FilterSelect label="Etapa" value={filters.etapa} values={stages.map((item) => item.id)} onChange={(value) => setFilters({ ...filters, etapa: value })} />
          <FilterSelect label="Prioridade" value={filters.prioridade} values={priorities} onChange={(value) => setFilters({ ...filters, prioridade: value })} />
          <FilterSelect label="Origem" value={filters.origem} values={options.origens} onChange={(value) => setFilters({ ...filters, origem: value })} />
          <FilterSelect label="Confiança" value={filters.confianca} values={options.confiancas} onChange={(value) => setFilters({ ...filters, confianca: value })} />
          <Field label="Data da próxima ação"><Input type="date" value={filters.dataProximaAcao} onChange={(event) => setFilters({ ...filters, dataProximaAcao: event.target.value })} /></Field>
          <BooleanSelect label="Contatos atrasados" value={filters.atrasados} onChange={(value) => setFilters({ ...filters, atrasados: value })} />
          <BooleanSelect label="Sem liderança vinculada" value={filters.semLideranca} onChange={(value) => setFilters({ ...filters, semLideranca: value })} />
          <div className="flex items-end"><Button variant="outline" className="w-full" onClick={() => setFilters(emptyFilters)}>Limpar</Button></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProspectFormSheet({ open, record, saving, supporters, leaders, setRecord, onOpenChange, onSubmit }: {
  open: boolean;
  record: ProspectFormState | null;
  saving: boolean;
  supporters: Supporter[];
  leaders: Leader[];
  setRecord: (record: ProspectFormState | null) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  function update<K extends keyof ProspectFormState>(key: K, value: ProspectFormState[K]) {
    if (!record) return;
    setRecord({ ...record, [key]: value });
  }

  const supporterOptions: Array<[string, string]> = [["", "Sem pessoa vinculada"], ...supporters.map((supporter) => [supporter.id, `${supporter.full_name} - ${supporter.neighborhood}, ${supporter.city}`] as [string, string])];
  const leaderOptions: Array<[string, string]> = [["", "Sem liderança vinculada"], ...leaders.map((leader) => [leader.id, `${leader.full_name} - ${leader.neighborhood}, ${leader.city}`] as [string, string])];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-0 bg-slate-50 p-0 sm:max-w-4xl">
        <SheetHeader className="bg-gradient-to-br from-slate-950 to-amber-800 p-6 pb-8 text-white">
          <SheetTitle className="text-2xl font-extrabold text-white">{record?.id ? "Editar prospecção" : "Nova prospecção"}</SheetTitle>
          <SheetDescription className="text-sm font-medium leading-6 text-white/80">Cadastro real da jornada do contato até o voto validado.</SheetDescription>
        </SheetHeader>
        {record ? (
          <form className="space-y-5 p-5 sm:p-6" onSubmit={onSubmit}>
            {supporters.length === 0 || leaders.length === 0 ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 text-sm font-semibold text-amber-900">
                  {supporters.length === 0 ? "Cadastre apoiadores/pessoas para vincular prospecções. " : ""}
                  {leaders.length === 0 ? "Cadastre lideranças para vincular prospecções. " : ""}
                  Os vínculos são opcionais e a prospecção pode ser salva sem eles.
                </CardContent>
              </Card>
            ) : null}
            <FormSection title="Dados do contato">
              <SelectField label="Pessoa vinculada" value={record.supporter_id} values={supporterOptions} onChange={(value) => update("supporter_id", value)} />
              <TextField required label="Nome do contato" value={record.contact_name} onChange={(value) => update("contact_name", value)} />
              <TextField label="Telefone/WhatsApp" value={record.phone} onChange={(value) => update("phone", value)} />
              <TextField required label="Bairro" value={record.neighborhood} onChange={(value) => update("neighborhood", value)} />
              <TextField required label="Cidade" value={record.city} onChange={(value) => update("city", value)} />
              <SelectField label="Liderança vinculada" value={record.leader_id} values={leaderOptions} onChange={(value) => update("leader_id", value)} />
              <TextField label="Responsável interno" value={record.internal_responsible} onChange={(value) => update("internal_responsible", value)} />
              <SelectTextField required label="Etapa do funil" value={record.funnel_stage} values={stages.map((item) => item.id)} onChange={(value) => update("funnel_stage", value as FunnelStage)} />
              <SelectTextField required label="Origem do contato" value={record.origin} values={origins} onChange={(value) => update("origin", value)} />
              <SelectTextField required label="Prioridade" value={record.priority} values={priorities} onChange={(value) => update("priority", value as Priority)} />
              <SelectTextField required label="Grau de confiança" value={record.confidence_level} values={["Alto", "Médio", "Baixo", "Não validado"]} onChange={(value) => update("confidence_level", value)} />
              <TextField label="Último contato" type="date" value={record.last_contact} onChange={(value) => update("last_contact", value)} />
              <TextField label="Próxima ação" value={record.next_action} onChange={(value) => update("next_action", value)} />
              <TextField label="Data da próxima ação" type="date" value={record.next_action_date} onChange={(value) => update("next_action_date", value)} />
              <SelectTextField label="Resultado da última abordagem" value={record.last_result} values={approachResults} onChange={(value) => update("last_result", value)} />
              <TextField label="Motivo de perda" value={record.loss_reason} onChange={(value) => update("loss_reason", value)} />
              <AreaField label="Observações" value={record.notes} onChange={(value) => update("notes", value)} />
            </FormSection>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Salvar oportunidade</Button>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ProspectDetailSheet({ open, record, onOpenChange, onMove, onEdit }: { open: boolean; record: ProspectWithRelations | null; onOpenChange: (open: boolean) => void; onMove: (record: ProspectWithRelations, direction: -1 | 1) => void; onEdit: (record: ProspectWithRelations) => void }) {
  if (!record) return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent /></Sheet>;
  const stage = stages.find((item) => item.id === record.funnel_stage) ?? stages[0];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-0 bg-slate-50 p-0 sm:max-w-4xl">
        <SheetHeader className="bg-gradient-to-br from-blue-950 to-amber-800 p-6 pb-8 text-white">
          <SheetTitle className="text-2xl font-extrabold text-white">{record.contact_name}</SheetTitle>
          <SheetDescription className="text-sm font-medium leading-6 text-white/80">{stage.title} - {record.neighborhood}, {record.city}</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <DetailMetric label="Etapa atual" value={stage.short} />
            <DetailMetric label="Prioridade" value={record.priority} />
            <DetailMetric label="Atrasado" value={isOverdue(record) ? "Sim" : "Não"} />
            <DetailMetric label="Origem" value={record.origin} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onMove(record, -1)}><ArrowLeft className="h-4 w-4" /> Retroceder etapa</Button>
            <Button onClick={() => onMove(record, 1)}><ArrowRight className="h-4 w-4" /> Avançar etapa</Button>
            <Button variant="outline" onClick={() => onEdit(record)}><Edit className="h-4 w-4" /> Editar</Button>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <DetailCard title="Dados principais">
              <InfoGrid items={[["Telefone", record.phone ?? "-"], ["Bairro", record.neighborhood], ["Cidade", record.city], ["Origem", record.origin], ["Confiança", record.confidence_level], ["Resultado", record.last_result ?? "-"]]} />
            </DetailCard>
            <DetailCard title="Pessoa e liderança">
              <InfoGrid items={[["Pessoa vinculada", getSupporterLabel(record)], ["Liderança", getLeaderLabel(record)], ["Responsável", record.internal_responsible ?? "-"], ["Próxima ação", record.next_action ?? "-"], ["Data", record.next_action_date ?? "-"]]} />
            </DetailCard>
            <DetailCard title="Observações estratégicas">
              <p className="text-sm font-medium leading-6 text-slate-600">{record.notes || "Sem observações registradas."}</p>
              <div className="mt-4 flex flex-wrap gap-2"><StatusPill label={record.priority} tone={getPriorityTone(record.priority as Priority)} /><StatusPill label={stage.title} tone={stage.tone} /></div>
            </DetailCard>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <DetailList title="Histórico de interações" />
            <DetailList title="Demandas associadas" />
            <DetailCard title="Linha do tempo visual">
              <div className="space-y-2">
                <TimelineItem label="Cadastro" value={formatDate(record.created_at)} />
                <TimelineItem label="Último contato" value={record.last_contact || "Não registrado"} />
                <TimelineItem label="Próxima ação" value={record.next_action_date || "Não definida"} />
              </div>
            </DetailCard>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</span>{children}</label>;
}

function FilterSelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <Field label={label}><select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}><option value="todos">Todos</option>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>;
}

function SelectField({ label, value, values, onChange }: { label: string; value: string; values: Array<[string, string]>; onChange: (value: string) => void }) {
  return <Field label={label}><select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>{values.map(([optionValue, labelText]) => <option key={optionValue || "empty"} value={optionValue}>{labelText}</option>)}</select></Field>;
}

function BooleanSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label}><select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}><option value="todos">Todos</option><option value="sim">Sim</option><option value="nao">Não</option></select></Field>;
}

function TextField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <Field label={label}><Input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></Field>;
}

function SelectTextField({ label, value, values, onChange, required = false }: { label: string; value: string; values: string[]; onChange: (value: string) => void; required?: boolean }) {
  return <Field label={label}><select required={required} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>;
}

function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label} className="md:col-span-2 xl:col-span-3"><Textarea value={value} onChange={(event) => onChange(event.target.value)} /></Field>;
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <Card className="premium-card"><CardHeader className="px-5 pb-2 pt-5"><CardTitle className="text-base font-extrabold text-slate-950">{title}</CardTitle></CardHeader><CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{children}</CardContent></Card>;
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return <Card className="premium-card"><CardHeader className="px-5 pb-2 pt-5"><CardTitle className="text-base font-extrabold text-slate-950">{title}</CardTitle></CardHeader><CardContent className="p-5 pt-2">{children}</CardContent></Card>;
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return <div className="premium-card rounded-lg p-4"><div className="text-2xl font-extrabold tracking-tight text-slate-950">{value}</div><div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div></div>;
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return <div className="grid gap-3">{items.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"><span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span><span className="text-right text-sm font-bold text-slate-900">{value}</span></div>)}</div>;
}

function DetailList({ title }: { title: string }) {
  return <DetailCard title={title}><EmptyState title="Nenhum dado vinculado ainda." description="Esse relacionamento está preparado para ser exibido quando houver registros vinculados." icon={Users} /></DetailCard>;
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"><span className="font-bold text-slate-900">{label}: </span><span className="font-medium text-slate-600">{value}</span></div>;
}

function IconButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: typeof Eye; onClick: MouseEventHandler<HTMLButtonElement>; danger?: boolean }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`rounded-lg border p-2 transition-colors ${danger ? "border-red-100 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}><Icon className="h-4 w-4" /></button>;
}

function InfoLine({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">{text}</span></div>;
}

function toFormState(prospect: Prospect): ProspectFormState {
  return {
    id: prospect.id,
    supporter_id: prospect.supporter_id ?? "",
    leader_id: prospect.leader_id ?? "",
    contact_name: prospect.contact_name,
    phone: prospect.phone ?? "",
    neighborhood: prospect.neighborhood,
    city: prospect.city,
    funnel_stage: prospect.funnel_stage as FunnelStage,
    origin: prospect.origin,
    priority: prospect.priority as Priority,
    confidence_level: prospect.confidence_level,
    internal_responsible: prospect.internal_responsible ?? "",
    last_contact: prospect.last_contact ?? "",
    next_action: prospect.next_action ?? "",
    next_action_date: prospect.next_action_date ?? "",
    last_result: prospect.last_result ?? "",
    loss_reason: prospect.loss_reason ?? "",
    notes: prospect.notes ?? "",
  };
}

function toInsertPayload(form: ProspectFormState): ProspectInsert {
  return {
    campaign_id: DEFAULT_CAMPAIGN_ID,
    supporter_id: form.supporter_id || null,
    leader_id: form.leader_id || null,
    contact_name: form.contact_name.trim(),
    phone: nullable(form.phone),
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    funnel_stage: form.funnel_stage,
    origin: form.origin,
    priority: form.priority,
    confidence_level: form.confidence_level,
    internal_responsible: nullable(form.internal_responsible),
    last_contact: nullable(form.last_contact),
    next_action: nullable(form.next_action),
    next_action_date: nullable(form.next_action_date),
    last_result: nullable(form.last_result),
    loss_reason: nullable(form.loss_reason),
    notes: nullable(form.notes),
  };
}

function toUpdatePayload(form: ProspectFormState): ProspectUpdate {
  return toInsertPayload(form);
}

function validateForm(form: ProspectFormState) {
  const required: Array<[keyof ProspectFormState, string]> = [
    ["contact_name", "Nome do contato"],
    ["neighborhood", "Bairro"],
    ["city", "Cidade"],
    ["funnel_stage", "Etapa do funil"],
    ["origin", "Origem do contato"],
    ["priority", "Prioridade"],
    ["confidence_level", "Grau de confiança"],
  ];
  const missing = required.find(([key]) => !String(form[key] ?? "").trim());
  return missing ? `Preencha o campo obrigatório: ${missing[1]}.` : null;
}

function withRelations(prospect: Prospect, supporters: Supporter[], leaders: Leader[]): ProspectWithRelations {
  return {
    ...prospect,
    supporter: prospect.supporter_id ? supporters.find((supporter) => supporter.id === prospect.supporter_id) ?? null : null,
    leader: prospect.leader_id ? leaders.find((leader) => leader.id === prospect.leader_id) ?? null : null,
  };
}

function getSummary(records: ProspectWithRelations[]) {
  const count = (stage: FunnelStage) => records.filter((item) => item.funnel_stage === stage).length;
  const total = records.length || 1;
  return {
    novoContato: count("Novo contato"),
    primeiroAtendimento: count("Primeiro atendimento"),
    simpatizante: count("Simpatizante"),
    apoiadorConfirmado: count("Apoiador confirmado"),
    multiplicador: count("Multiplicador"),
    votoValidado: count("Voto validado"),
    semRetorno: records.filter((item) => !item.next_action).length,
    vencidas: records.filter(isOverdue).length,
    conversaoGeral: Math.round((count("Voto validado") / total) * 100),
    conversaoSemanal: Math.round((records.filter((item) => item.funnel_stage !== "Novo contato" && isWithinLastDays(item.updated_at, 7)).length / total) * 100),
  };
}

function conversionBetween(records: ProspectWithRelations[], from: FunnelStage, to: FunnelStage) {
  const fromIndex = stages.findIndex((stage) => stage.id === from);
  const toIndex = stages.findIndex((stage) => stage.id === to);
  const source = records.filter((item) => stages.findIndex((stage) => stage.id === item.funnel_stage) >= fromIndex).length;
  const target = records.filter((item) => stages.findIndex((stage) => stage.id === item.funnel_stage) >= toIndex).length;
  return source ? Math.round((target / source) * 100) : 0;
}

function getMovedStage(stage: FunnelStage, direction: -1 | 1): FunnelStage {
  const index = stages.findIndex((item) => item.id === stage);
  return stages[Math.min(stages.length - 1, Math.max(0, index + direction))].id;
}

function isOverdue(item: Prospect) {
  if (!item.next_action_date || item.funnel_stage === "Voto validado") return false;
  const date = new Date(item.next_action_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isWithinLastDays(date: string | null, days: number) {
  if (!date) return false;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= days * 24 * 60 * 60 * 1000;
}

function getLeaderLabel(prospect: ProspectWithRelations) {
  return prospect.leader ? `${prospect.leader.full_name} - ${prospect.leader.neighborhood}` : "Sem liderança";
}

function getSupporterLabel(prospect: ProspectWithRelations) {
  return prospect.supporter ? `${prospect.supporter.full_name} - ${prospect.supporter.neighborhood}` : "Sem pessoa";
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matches(filter: string, value: string | null) {
  return filter === "todos" || value === filter;
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function formatDate(date: string | null) {
  if (!date) return "Não registrado";
  return new Date(date).toLocaleDateString("pt-BR");
}

function getStageAccent(stage: string) {
  const map: Record<string, string> = {
    "Novo contato": "bg-slate-500",
    "Primeiro atendimento": "bg-blue-500",
    Simpatizante: "bg-amber-500",
    "Apoiador confirmado": "bg-emerald-500",
    Multiplicador: "bg-violet-500",
    "Voto validado": "bg-green-500",
  };
  return map[stage] ?? "bg-slate-500";
}

function getPriorityTone(priority: Priority | string) {
  if (priority === "Crítica") return "red";
  if (priority === "Alta") return "amber";
  if (priority === "Média") return "blue";
  return "slate";
}

function getConfidenceTone(confidence: string) {
  const normalized = normalize(confidence);
  if (normalized === "alto") return "emerald";
  if (normalized === "medio") return "amber";
  if (normalized === "nao validado") return "slate";
  return "red";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return "Erro inesperado ao acessar o Supabase.";
}
