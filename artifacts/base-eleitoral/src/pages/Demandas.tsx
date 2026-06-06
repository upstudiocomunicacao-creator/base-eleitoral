import { FormEvent, MouseEventHandler, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Loader2,
  MapPin,
  MessageSquareWarning,
  PlusCircle,
  RefreshCw,
  Target,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  createDemand,
  deleteDemand,
  isDemandsSupabaseReady,
  listDemandsWithRelations,
  updateDemand,
  type DemandWithRelations,
} from "@/services/demands";
import { DEFAULT_CAMPAIGN_ID } from "@/services/leaders";
import type { Database, Demand, ElectoralZone, Leader, Supporter } from "@/types/database";

type DemandInsert = Database["public"]["Tables"]["demands"]["Insert"];
type DemandUpdate = Database["public"]["Tables"]["demands"]["Update"];

type Filters = {
  query: string;
  person: string;
  neighborhood: string;
  city: string;
  category: string;
  priority: string;
  status: string;
  leader: string;
  zone: string;
  responsible: string;
  openedAt: string;
  returnAt: string;
  lateOnly: string;
  withoutResponsible: string;
};

type DemandFormState = {
  id: string | null;
  supporter_id: string;
  leader_id: string;
  electoral_zone_id: string;
  title: string;
  description: string;
  person_name: string;
  phone: string;
  category: string;
  priority: string;
  status: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  opening_date: string;
  return_date: string;
  next_action: string;
  result: string;
  internal_responsible: string;
  notes: string;
};

type Summary = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  withoutResponsible: number;
  neighborhoods: number;
  withLeader: number;
  pendingReturn: number;
  topTheme: string;
  resolutionRate: number;
  avgResponseDays: number;
  lateReturns: number;
  agendaCandidates: number;
};

const emptyFilters: Filters = {
  query: "",
  person: "todos",
  neighborhood: "todos",
  city: "todos",
  category: "todos",
  priority: "todos",
  status: "todos",
  leader: "todos",
  zone: "todos",
  responsible: "todos",
  openedAt: "todos",
  returnAt: "todos",
  lateOnly: "todos",
  withoutResponsible: "todos",
};

const emptyForm: DemandFormState = {
  id: null,
  supporter_id: "",
  leader_id: "",
  electoral_zone_id: "",
  title: "",
  description: "",
  person_name: "",
  phone: "",
  category: "Saúde",
  priority: "Média",
  status: "Aberta",
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "Maricá",
  state: "RJ",
  opening_date: new Date().toISOString().slice(0, 10),
  return_date: "",
  next_action: "",
  result: "",
  internal_responsible: "Equipe Campo",
  notes: "",
};

const categories = ["Saúde", "Educação", "Transporte", "Segurança", "Iluminação pública", "Limpeza urbana", "Meio ambiente", "Esporte", "Cultura", "Assistência social", "Obras", "Pavimentação", "Água/esgoto", "Emprego/renda", "Regularização", "Outro"];
const statuses = ["Aberta", "Em análise", "Em andamento", "Encaminhada", "Resolvida", "Sem solução", "Aguardando retorno", "Cancelada"];
const priorities = ["Baixa", "Média", "Alta", "Crítica"];

export default function Demandas() {
  const [records, setRecords] = useState<DemandWithRelations[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [electoralZones, setElectoralZones] = useState<ElectoralZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<DemandWithRelations | null>(null);
  const [editing, setEditing] = useState<DemandFormState | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  async function loadDemands() {
    setLoading(true);
    setError(null);

    if (!isDemandsSupabaseReady()) {
      setRecords([]);
      setSupporters([]);
      setLeaders([]);
      setElectoralZones([]);
      setError("Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar demandas reais.");
      setLoading(false);
      return;
    }

    try {
      const data = await listDemandsWithRelations();
      setRecords(data.demands);
      setSupporters(data.supporters);
      setLeaders(data.leaders);
      setElectoralZones(data.electoralZones);
    } catch (err) {
      setRecords([]);
      setSupporters([]);
      setLeaders([]);
      setElectoralZones([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDemands();
  }, []);

  const options = useMemo(() => buildOptions(records), [records]);
  const filtered = useMemo(() => records.filter((record) => matchesRecord(record, filters)), [records, filters]);
  const summary = useMemo(() => buildSummary(filtered), [filtered]);
  const panels = useMemo(() => buildPanels(filtered), [filtered]);

  function openCreate() {
    setEditing({ ...emptyForm });
    setFormOpen(true);
  }

  function openDetails(record: DemandWithRelations) {
    setSelected(record);
    setDetailsOpen(true);
  }

  function openEdit(record: DemandWithRelations) {
    setEditing(toFormState(record));
    setFormOpen(true);
  }

  async function saveDemand(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;

    const validationError = validateForm(editing);
    if (validationError) {
      toast({ title: "Revise a demanda", description: validationError, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editing.id) {
        const saved = await updateDemand(editing.id, toUpdatePayload(editing));
        setRecords((current) => current.map((item) => (item.id === saved.id ? hydrateDemand(saved, supporters, leaders, electoralZones) : item)));
        toast({ title: "Demanda atualizada", description: "As alterações foram salvas no Supabase." });
      } else {
        const saved = await createDemand(toInsertPayload(editing));
        setRecords((current) => [hydrateDemand(saved, supporters, leaders, electoralZones), ...current]);
        toast({ title: "Demanda criada", description: "O novo registro foi salvo no Supabase." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast({ title: "Não foi possível salvar", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removeDemand(record: DemandWithRelations) {
    const confirmed = window.confirm(`Excluir a demanda "${record.title}"?\n\nEssa ação não poderá ser desfeita.`);
    if (!confirmed) return;

    try {
      await deleteDemand(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      toast({ title: "Demanda excluída", description: "O registro foi removido do Supabase." });
    } catch (err) {
      toast({ title: "Não foi possível excluir", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Demandas"
        title="Demandas da População"
        description={`${filtered.length} demandas no recorte atual - dados reais da tabela demands no Supabase.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadDemands()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <PermissionGate module="demandas" action="create">
              <Button onClick={openCreate}><PlusCircle className="h-4 w-4" /> Nova demanda</Button>
            </PermissionGate>
          </div>
        }
      />

      {error ? <ConnectionWarning message={error} /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Total" value={summary.total} icon={MessageSquareWarning} tone="blue" loading={loading} />
        <MetricCard label="Abertas" value={summary.open} icon={AlertTriangle} tone="amber" loading={loading} />
        <MetricCard label="Em andamento" value={summary.inProgress} icon={Clock} tone="indigo" loading={loading} />
        <MetricCard label="Resolvidas" value={summary.resolved} icon={CheckCircle2} tone="green" loading={loading} />
        <MetricCard label="Críticas" value={summary.critical} icon={Target} tone="red" loading={loading} />
        <MetricCard label="Sem responsável" value={summary.withoutResponsible} icon={UserRound} tone="orange" loading={loading} />
        <MetricCard label="Bairros" value={summary.neighborhoods} icon={BarChart3} tone="cyan" loading={loading} />
        <MetricCard label="Com liderança" value={summary.withLeader} icon={Users} tone="emerald" loading={loading} />
        <MetricCard label="Retorno pendente" value={summary.pendingReturn} icon={Clock} tone="rose" loading={loading} />
        <MetricCard label="Tema recorrente" value={summary.topTheme} icon={MessageSquareWarning} tone="violet" loading={loading} />
      </section>

      <DemandFilters filters={filters} setFilters={setFilters} options={options} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DemandTable loading={loading} data={filtered} onOpen={openDetails} onEdit={openEdit} onDelete={removeDemand} />
        <aside className="space-y-4">
          <RecurringThemesPanel records={filtered} />
          <RankingCard title="Bairros com mais demandas" data={panels.byNeighborhood} />
          <RankingCard title="Demandas críticas por bairro" data={panels.criticalByNeighborhood} />
          <RankingCard title="Resolvidas por responsável" data={panels.resolvedByResponsible} />
          <OperationalIndicators summary={summary} />
        </aside>
      </section>

      <DemandFormSheet
        open={formOpen}
        record={editing}
        supporters={supporters}
        leaders={leaders}
        electoralZones={electoralZones}
        saving={saving}
        setRecord={setEditing}
        onOpenChange={setFormOpen}
        onSubmit={saveDemand}
      />

      <DemandDetailSheet
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

function DemandFilters({ filters, setFilters, options }: { filters: Filters; setFilters: (filters: Filters) => void; options: Record<string, string[]> }) {
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value });
  return (
    <Card className="premium-card">
      <CardHeader className="pb-3"><CardTitle className="text-base">Filtros avançados</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <label className="block xl:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Buscar por título</span>
          <Input value={filters.query} onChange={(event) => update("query", event.target.value)} placeholder="Título, descrição, pessoa, telefone ou próxima ação" />
        </label>
        <FilterSelect label="Pessoa" value={filters.person} options={options.person} onChange={(value) => update("person", value)} />
        <FilterSelect label="Bairro" value={filters.neighborhood} options={options.neighborhood} onChange={(value) => update("neighborhood", value)} />
        <FilterSelect label="Cidade" value={filters.city} options={options.city} onChange={(value) => update("city", value)} />
        <FilterSelect label="Categoria" value={filters.category} options={categories} onChange={(value) => update("category", value)} />
        <FilterSelect label="Prioridade" value={filters.priority} options={priorities} onChange={(value) => update("priority", value)} />
        <FilterSelect label="Status" value={filters.status} options={statuses} onChange={(value) => update("status", value)} />
        <FilterSelect label="Liderança" value={filters.leader} options={options.leader} onChange={(value) => update("leader", value)} />
        <FilterSelect label="Zona eleitoral" value={filters.zone} options={options.zone} onChange={(value) => update("zone", value)} />
        <FilterSelect label="Responsável" value={filters.responsible} options={options.responsible} onChange={(value) => update("responsible", value)} />
        <FilterSelect label="Data de abertura" value={filters.openedAt} options={["Hoje", "Últimos 7 dias", "Últimos 30 dias"]} onChange={(value) => update("openedAt", value)} />
        <FilterSelect label="Data de retorno" value={filters.returnAt} options={["Hoje", "Próximos 7 dias", "Sem retorno"]} onChange={(value) => update("returnAt", value)} />
        <FilterSelect label="Demandas atrasadas" value={filters.lateOnly} options={["Sim", "Não"]} onChange={(value) => update("lateOnly", value)} />
        <FilterSelect label="Sem responsável" value={filters.withoutResponsible} options={["Sim", "Não"]} onChange={(value) => update("withoutResponsible", value)} />
        <div className="flex items-end">
          <Button className="w-full" variant="outline" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DemandTable({
  loading,
  data,
  onOpen,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  data: DemandWithRelations[];
  onOpen: (record: DemandWithRelations) => void;
  onEdit: (record: DemandWithRelations) => void;
  onDelete: (record: DemandWithRelations) => void;
}) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">Lista de demandas</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["Título", "Pessoa", "Telefone", "Bairro", "Cidade", "Categoria", "Prioridade", "Status", "Liderança", "Zona", "Responsável", "Abertura", "Retorno", "Próxima ação", "Ações"].map((head) => <TableHead key={head} className="whitespace-nowrap">{head}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 15 }).map((__, cellIndex) => <TableCell key={cellIndex}><Skeleton className="h-7 w-full rounded-lg" /></TableCell>)}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="p-6">
                    <EmptyState title="Nenhuma demanda encontrada" description="Ajuste os filtros ou cadastre uma nova demanda da população." icon={MessageSquareWarning} />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record) => (
                  <TableRow key={record.id} className="cursor-pointer" onClick={() => onOpen(record)}>
                    <TableCell className="min-w-[240px] font-extrabold text-slate-900">{record.title}</TableCell>
                    <TableCell>{getPersonName(record)}</TableCell>
                    <TableCell><SensitiveText value={getPhone(record)} kind="phone" fallback="Não informado" /></TableCell>
                    <TableCell>{record.neighborhood}</TableCell>
                    <TableCell>{record.city}</TableCell>
                    <TableCell><StatusPill label={record.category} tone="blue" /></TableCell>
                    <TableCell><StatusPill label={record.priority} tone={priorityTone(record.priority)} /></TableCell>
                    <TableCell><StatusPill label={record.status} tone={statusTone(record.status)} /></TableCell>
                    <TableCell className="min-w-[150px]">{record.leader?.full_name ?? "Sem vínculo"}</TableCell>
                    <TableCell>{formatZone(record.electoralZone)}</TableCell>
                    <TableCell>{record.internal_responsible || "Não definido"}</TableCell>
                    <TableCell>{formatDate(record.opening_date)}</TableCell>
                    <TableCell>{record.return_date ? formatDate(record.return_date) : "-"}</TableCell>
                    <TableCell className="min-w-[200px]">{record.next_action || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                        <IconButton label="Visualizar" icon={Eye} onClick={() => onOpen(record)} />
                        <PermissionGate module="demandas" action="edit">
                          <IconButton label="Editar" icon={Edit} onClick={() => onEdit(record)} />
                        </PermissionGate>
                        <PermissionGate module="demandas" action="delete">
                          <IconButton label="Excluir" icon={Trash2} danger onClick={() => onDelete(record)} />
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DemandFormSheet({
  open,
  record,
  supporters,
  leaders,
  electoralZones,
  saving,
  setRecord,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  record: DemandFormState | null;
  supporters: Supporter[];
  leaders: Leader[];
  electoralZones: ElectoralZone[];
  saving: boolean;
  setRecord: (record: DemandFormState | null) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  if (!record) return null;

  function update<K extends keyof DemandFormState>(key: K, value: DemandFormState[K]) {
    setRecord(record ? { ...record, [key]: value } : record);
  }

  function selectSupporter(id: string) {
    if (!record) return;
    const supporter = supporters.find((item) => item.id === id);
    setRecord({
      ...record,
      supporter_id: id,
      person_name: supporter?.full_name ?? record.person_name,
      phone: supporter?.phone ?? record.phone,
      neighborhood: supporter?.neighborhood ?? record.neighborhood,
      city: supporter?.city ?? record.city,
      state: supporter?.state ?? record.state,
      leader_id: supporter?.leader_id ?? record.leader_id,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-slate-50 p-0 sm:max-w-3xl">
        <form onSubmit={onSubmit} className="space-y-5 p-5">
          <SheetHeader className="rounded-lg border bg-white p-5 text-left shadow-sm">
            <SheetTitle>{record.id ? "Editar demanda" : "Nova demanda"}</SheetTitle>
            <SheetDescription>Cadastro real salvo na tabela demands, com vínculos opcionais a pessoas, lideranças e zonas.</SheetDescription>
          </SheetHeader>

          {(supporters.length === 0 || leaders.length === 0 || electoralZones.length === 0) ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-start gap-3 p-4 text-sm font-medium text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Alguns vínculos ainda não têm registros disponíveis. A demanda pode ser salva sem pessoa, liderança ou zona.</span>
              </CardContent>
            </Card>
          ) : null}

          <FormSection title="Dados da demanda">
            <TextField label="Título da demanda *" value={record.title} onChange={(value) => update("title", value)} />
            <SelectField label="Categoria *" value={record.category} options={categories} onChange={(value) => update("category", value)} />
            <SelectField label="Prioridade *" value={record.priority} options={priorities} onChange={(value) => update("priority", value)} />
            <SelectField label="Status *" value={record.status} options={statuses} onChange={(value) => update("status", value)} />
            <TextField label="Data de abertura *" type="date" value={record.opening_date} onChange={(value) => update("opening_date", value)} />
            <TextField label="Data de retorno" type="date" value={record.return_date} onChange={(value) => update("return_date", value)} />
            <AreaField label="Descrição *" value={record.description} onChange={(value) => update("description", value)} />
          </FormSection>

          <FormSection title="Pessoa e vínculos">
            <SelectField
              label="Pessoa vinculada"
              value={record.supporter_id}
              options={supporters.map((supporter) => ({ value: supporter.id, label: `${supporter.full_name} · ${supporter.neighborhood}` }))}
              includeEmpty="Sem vínculo"
              onChange={selectSupporter}
            />
            <TextField label="Nome da pessoa" value={record.person_name} onChange={(value) => update("person_name", value)} />
            <TextField label="Telefone/WhatsApp" value={record.phone} onChange={(value) => update("phone", value)} />
            <SelectField
              label="Liderança vinculada"
              value={record.leader_id}
              options={leaders.map((leader) => ({ value: leader.id, label: `${leader.full_name} · ${leader.neighborhood}` }))}
              includeEmpty="Sem vínculo"
              onChange={(value) => update("leader_id", value)}
            />
            <SelectField
              label="Zona eleitoral vinculada"
              value={record.electoral_zone_id}
              options={electoralZones.map((zone) => ({ value: zone.id, label: formatZone(zone) }))}
              includeEmpty="Sem vínculo"
              onChange={(value) => update("electoral_zone_id", value)}
            />
            <TextField label="Responsável interno" value={record.internal_responsible} onChange={(value) => update("internal_responsible", value)} />
          </FormSection>

          <FormSection title="Localização">
            <TextField label="CEP" value={record.cep} onChange={(value) => update("cep", value)} />
            <TextField label="Rua" value={record.street} onChange={(value) => update("street", value)} />
            <TextField label="Número" value={record.number} onChange={(value) => update("number", value)} />
            <TextField label="Bairro *" value={record.neighborhood} onChange={(value) => update("neighborhood", value)} />
            <TextField label="Cidade *" value={record.city} onChange={(value) => update("city", value)} />
            <TextField label="Estado *" value={record.state} onChange={(value) => update("state", value.toUpperCase())} />
          </FormSection>

          <FormSection title="Encaminhamento">
            <TextField label="Próxima ação" value={record.next_action} onChange={(value) => update("next_action", value)} />
            <TextField label="Resultado/encaminhamento" value={record.result} onChange={(value) => update("result", value)} />
            <AreaField label="Observações" value={record.notes} onChange={(value) => update("notes", value)} />
          </FormSection>

          <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-slate-50/95 py-4 backdrop-blur">
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

function DemandDetailSheet({ open, record, onOpenChange }: { open: boolean; record: DemandWithRelations | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-slate-50 p-0 sm:max-w-2xl">
        {record ? (
          <div className="space-y-5 p-5">
            <SheetHeader className="rounded-lg border bg-white p-5 text-left shadow-sm">
              <SheetTitle className="text-2xl">{record.title}</SheetTitle>
              <SheetDescription>{record.category} · {record.neighborhood}, {record.city} · aberta em {formatDate(record.opening_date)}</SheetDescription>
              <div className="flex flex-wrap gap-2 pt-2"><StatusPill label={record.status} tone={statusTone(record.status)} /><StatusPill label={record.priority} tone={priorityTone(record.priority)} /><StatusPill label={record.category} tone="blue" /></div>
            </SheetHeader>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailMetric label="Abertura" value={formatDate(record.opening_date)} />
              <DetailMetric label="Retorno" value={record.return_date ? formatDate(record.return_date) : "-"} />
              <DetailMetric label="Status" value={record.status} />
              <DetailMetric label="Prioridade" value={record.priority} />
            </div>

            <Card className="premium-card">
              <CardHeader><CardTitle className="text-base">Dados da demanda</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <InfoBlock title="Pessoa e vínculo" rows={[["Pessoa", getPersonName(record)], ["Telefone", getPhone(record) || "Não informado"], ["Liderança", record.leader?.full_name ?? "Sem vínculo"], ["Zona", formatZone(record.electoralZone)]]} />
                <InfoBlock title="Localização" rows={[["Endereço", formatAddress(record)], ["Bairro", record.neighborhood], ["Cidade/UF", `${record.city} / ${record.state}`], ["Responsável", record.internal_responsible || "Não definido"]]} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="premium-card overflow-hidden">
                <div className="relative min-h-64 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_75%_35%,rgba(244,63,94,0.12),transparent_28%),linear-gradient(135deg,#f8fafc,#eef6ff)] p-5">
                  <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-blue-700">Área territorial</div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-950">{record.neighborhood}</div>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Área preparada para leitura territorial com Mapbox/PostGIS.</p>
                  <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/80 bg-white/85 p-3 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><MapPin className="h-4 w-4 text-blue-600" />{formatAddress(record)}</div>
                  </div>
                </div>
              </Card>
              <ListCard title="Histórico visual" items={buildHistory(record)} />
              <ListCard title="Dados vinculados" items={[record.supporter ? `Pessoa: ${record.supporter.full_name}` : "Nenhuma pessoa vinculada ainda.", record.leader ? `Liderança: ${record.leader.full_name}` : "Nenhuma liderança vinculada ainda.", record.electoralZone ? `Zona: ${formatZone(record.electoralZone)}` : "Nenhuma zona vinculada ainda."]} />
              <ListCard title="Próximos encaminhamentos" items={[record.next_action || "Próxima ação não definida.", record.return_date ? `Retorno previsto: ${formatDate(record.return_date)}` : "Retorno ainda não definido.", record.result || "Resultado ainda não registrado."]} />
            </div>

            <Card className="premium-card">
              <CardHeader><CardTitle className="text-base">Descrição e observações estratégicas</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm font-medium leading-6 text-slate-600">
                <p><strong>Descrição:</strong> {record.description}</p>
                <p><strong>Resultado:</strong> {record.result || "Sem encaminhamento definido"}</p>
                <p>{record.notes || "Sem observações cadastradas."}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function RecurringThemesPanel({ records }: { records: DemandWithRelations[] }) {
  const data = countRanking(records.map((record) => record.category)).slice(0, 6).map((item, index) => ({ name: item.label, value: Number(item.value), color: ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][index] }));
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-sm">Temas recorrentes</CardTitle></CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? <EmptyState title="Sem temas ainda" description="As categorias aparecerão quando houver demandas reais." icon={BarChart3} /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 6, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={96} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 700 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function OperationalIndicators({ summary }: { summary: Summary }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-sm">Indicadores operacionais</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm font-semibold text-slate-600">
        <Indicator label="Taxa de resolução" value={`${summary.resolutionRate}%`} />
        <Indicator label="Tempo médio de resposta" value={summary.avgResponseDays ? `${summary.avgResponseDays} dias` : "-"} />
        <Indicator label="Retornos atrasados" value={summary.lateReturns} />
        <Indicator label="Devem virar agenda" value={summary.agendaCandidates} />
      </CardContent>
    </Card>
  );
}

function buildSummary(records: DemandWithRelations[]): Summary {
  const total = records.length;
  const resolved = records.filter((record) => normalize(record.status) === "resolvida").length;
  const responseDays = records
    .filter((record) => normalize(record.status) === "resolvida" && record.return_date)
    .map((record) => Math.max(daysBetween(record.opening_date, record.return_date as string), 0));

  return {
    total,
    open: records.filter((record) => normalize(record.status) === "aberta").length,
    inProgress: records.filter((record) => ["em analise", "em andamento", "encaminhada", "aguardando retorno"].includes(normalize(record.status))).length,
    resolved,
    critical: records.filter((record) => normalize(record.priority).includes("crit")).length,
    withoutResponsible: records.filter((record) => !record.internal_responsible?.trim()).length,
    neighborhoods: unique(records.map((record) => record.neighborhood)).length,
    withLeader: records.filter((record) => Boolean(record.leader_id)).length,
    pendingReturn: records.filter((record) => record.return_date && normalize(record.status) !== "resolvida").length,
    topTheme: countRanking(records.map((record) => record.category))[0]?.label ?? "-",
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    avgResponseDays: responseDays.length ? Math.round(responseDays.reduce((sum, item) => sum + item, 0) / responseDays.length) : 0,
    lateReturns: records.filter((record) => isReturnLate(record)).length,
    agendaCandidates: records.filter((record) => ["critica", "alta"].includes(normalize(record.priority)) && normalize(record.status) !== "resolvida").length,
  };
}

function buildPanels(records: DemandWithRelations[]) {
  return {
    byNeighborhood: countRanking(records.map((record) => record.neighborhood)).map((item) => ({ label: item.label, value: `${item.value} demandas` })),
    criticalByNeighborhood: countRanking(records.filter((record) => normalize(record.priority).includes("crit")).map((record) => record.neighborhood)).map((item) => ({ label: item.label, value: `${item.value} críticas` })),
    resolvedByResponsible: countRanking(records.filter((record) => normalize(record.status) === "resolvida").map((record) => record.internal_responsible || "Não definido")).map((item) => ({ label: item.label, value: `${item.value} resolvidas` })),
  };
}

function buildOptions(records: DemandWithRelations[]) {
  return {
    person: unique(records.map((record) => getPersonName(record))),
    neighborhood: unique(records.map((record) => record.neighborhood)),
    city: unique(records.map((record) => record.city)),
    leader: unique(records.map((record) => record.leader?.full_name ?? "Sem vínculo")),
    zone: unique(records.map((record) => formatZone(record.electoralZone))),
    responsible: unique(records.map((record) => record.internal_responsible ?? "Não definido")),
  };
}

function matchesRecord(record: DemandWithRelations, filters: Filters) {
  const term = normalize(filters.query);
  const openedDate = parseDate(record.opening_date);
  const returnDate = record.return_date ? parseDate(record.return_date) : null;
  const today = getToday();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const nextSeven = new Date(today);
  nextSeven.setDate(today.getDate() + 7);

  const textMatch = !term || [record.title, record.description, getPersonName(record), getPhone(record), record.next_action, record.result].some((value) => normalize(value ?? "").includes(term));
  const openedMatch =
    filters.openedAt === "todos" ||
    (filters.openedAt === "Hoje" && sameDate(openedDate, today)) ||
    (filters.openedAt === "Últimos 7 dias" && openedDate >= sevenDaysAgo) ||
    (filters.openedAt === "Últimos 30 dias" && openedDate >= thirtyDaysAgo);
  const returnMatch =
    filters.returnAt === "todos" ||
    (filters.returnAt === "Sem retorno" && !returnDate) ||
    (filters.returnAt === "Hoje" && returnDate !== null && sameDate(returnDate, today)) ||
    (filters.returnAt === "Próximos 7 dias" && returnDate !== null && returnDate >= today && returnDate <= nextSeven);

  return (
    textMatch &&
    selectMatches(filters.person, getPersonName(record)) &&
    selectMatches(filters.neighborhood, record.neighborhood) &&
    selectMatches(filters.city, record.city) &&
    selectMatches(filters.category, record.category) &&
    selectMatches(filters.priority, record.priority) &&
    selectMatches(filters.status, record.status) &&
    selectMatches(filters.leader, record.leader?.full_name ?? "Sem vínculo") &&
    selectMatches(filters.zone, formatZone(record.electoralZone)) &&
    selectMatches(filters.responsible, record.internal_responsible ?? "Não definido") &&
    openedMatch &&
    returnMatch &&
    (filters.lateOnly === "todos" || (filters.lateOnly === "Sim" ? isReturnLate(record) : !isReturnLate(record))) &&
    (filters.withoutResponsible === "todos" || (filters.withoutResponsible === "Sim" ? !record.internal_responsible?.trim() : Boolean(record.internal_responsible?.trim())))
  );
}

function toFormState(record: DemandWithRelations): DemandFormState {
  return {
    id: record.id,
    supporter_id: record.supporter_id ?? "",
    leader_id: record.leader_id ?? "",
    electoral_zone_id: record.electoral_zone_id ?? "",
    title: record.title,
    description: record.description,
    person_name: record.person_name ?? "",
    phone: record.phone ?? "",
    category: record.category,
    priority: record.priority,
    status: record.status,
    cep: record.cep ?? "",
    street: record.street ?? "",
    number: record.number ?? "",
    neighborhood: record.neighborhood,
    city: record.city,
    state: record.state,
    opening_date: record.opening_date,
    return_date: record.return_date ?? "",
    next_action: record.next_action ?? "",
    result: record.result ?? "",
    internal_responsible: record.internal_responsible ?? "",
    notes: record.notes ?? "",
  };
}

function toInsertPayload(form: DemandFormState): DemandInsert {
  return {
    campaign_id: DEFAULT_CAMPAIGN_ID,
    supporter_id: nullable(form.supporter_id),
    leader_id: nullable(form.leader_id),
    electoral_zone_id: nullable(form.electoral_zone_id),
    title: form.title.trim(),
    description: form.description.trim(),
    person_name: nullable(form.person_name),
    phone: nullable(form.phone),
    category: form.category,
    priority: form.priority,
    status: form.status,
    cep: nullable(form.cep),
    street: nullable(form.street),
    number: nullable(form.number),
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    opening_date: form.opening_date,
    return_date: nullable(form.return_date),
    next_action: nullable(form.next_action),
    result: nullable(form.result),
    internal_responsible: nullable(form.internal_responsible),
    notes: nullable(form.notes),
  };
}

function toUpdatePayload(form: DemandFormState): DemandUpdate {
  return toInsertPayload(form);
}

function validateForm(form: DemandFormState) {
  if (!form.title.trim()) return "Informe o título da demanda.";
  if (!form.description.trim()) return "Informe a descrição da demanda.";
  if (!form.category.trim()) return "Informe a categoria.";
  if (!form.priority.trim()) return "Informe a prioridade.";
  if (!form.status.trim()) return "Informe o status.";
  if (!form.neighborhood.trim()) return "Informe o bairro.";
  if (!form.city.trim()) return "Informe a cidade.";
  if (!form.state.trim()) return "Informe o estado.";
  if (!form.opening_date.trim()) return "Informe a data de abertura.";
  return null;
}

function hydrateDemand(demand: Demand, supporters: Supporter[], leaders: Leader[], zones: ElectoralZone[]): DemandWithRelations {
  return {
    ...demand,
    supporter: demand.supporter_id ? supporters.find((supporter) => supporter.id === demand.supporter_id) ?? null : null,
    leader: demand.leader_id ? leaders.find((leader) => leader.id === demand.leader_id) ?? null : null,
    electoralZone: demand.electoral_zone_id ? zones.find((zone) => zone.id === demand.electoral_zone_id) ?? null : null,
  };
}

function buildHistory(record: DemandWithRelations) {
  return [
    `Demanda aberta em ${formatDate(record.opening_date)}`,
    record.internal_responsible ? `Responsável definido: ${record.internal_responsible}` : "Nenhum responsável definido ainda.",
    record.leader ? `Liderança vinculada: ${record.leader.full_name}` : "Nenhuma liderança vinculada ainda.",
    record.return_date ? `Retorno previsto: ${formatDate(record.return_date)}` : "Sem data de retorno cadastrada.",
    record.result ? `Encaminhamento: ${record.result}` : "Resultado ainda não registrado.",
  ];
}

function getPersonName(record: DemandWithRelations) {
  return record.supporter?.full_name ?? record.person_name ?? "Não informado";
}

function getPhone(record: DemandWithRelations) {
  return record.supporter?.phone ?? record.phone ?? "";
}

function isReturnLate(record: DemandWithRelations) {
  if (!record.return_date || normalize(record.status) === "resolvida") return false;
  return parseDate(record.return_date) < getToday();
}

function formatZone(zone: ElectoralZone | null) {
  if (!zone) return "Sem vínculo";
  return `Zona ${zone.zone_number}${zone.section_number ? ` / Seção ${zone.section_number}` : ""}`;
}

function formatAddress(record: Demand) {
  return [record.street, record.number, record.neighborhood].filter(Boolean).join(", ") || "Não informado";
}

function RankingCard({ title, data }: { title: string; data: Array<{ label: string; value: string }> }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? <p className="text-sm font-medium text-slate-500">Nenhum dado suficiente ainda.</p> : data.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3">
            <span className="text-sm font-bold text-slate-800">{item.label}</span>
            <span className="text-right text-xs font-bold uppercase tracking-wide text-blue-700">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="todos">Todos</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SelectField({ label, value, options, includeEmpty, onChange }: { label: string; value: string; options: Array<string | { value: string; label: string }>; includeEmpty?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {includeEmpty ? <option value="">{includeEmpty}</option> : null}
        {options.map((option) => {
          const valueText = typeof option === "string" ? option : option.value;
          const labelText = typeof option === "string" ? option : option.label;
          return <option key={valueText} value={valueText}>{labelText}</option>;
        })}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block md:col-span-2 xl:col-span-3">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="premium-card">
      <CardHeader className="pb-3"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</CardContent>
    </Card>
  );
}

function IconButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: typeof Eye; onClick: MouseEventHandler<HTMLButtonElement>; danger?: boolean }) {
  return <Button variant="ghost" size="icon" title={label} onClick={onClick}><Icon className={`h-4 w-4 ${danger ? "text-red-600" : ""}`} /></Button>;
}

function DetailMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border bg-white p-4 shadow-sm"><div className="text-xl font-extrabold text-slate-900">{value}</div><div className="text-xs font-bold uppercase text-slate-400">{label}</div></div>;
}

function InfoBlock({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <h4 className="mb-3 font-extrabold text-slate-900">{title}</h4>
      <div className="space-y-2">
        {rows.map(([label, value]) => <div key={label} className="text-sm"><span className="font-bold text-slate-500">{label}: </span><span className="font-semibold text-slate-800">{value}</span></div>)}
      </div>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, index) => <div key={`${item}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{item}</div>)}
      </CardContent>
    </Card>
  );
}

function Indicator({ label, value }: { label: string; value: string | number }) {
  return <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>{label}</span><strong className="text-blue-700">{value}</strong></div>;
}

function countRanking(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    const key = value || "Não definido";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
}

function formatDate(value: string) {
  const date = parseDate(value);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function priorityTone(priority: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(priority);
  if (normalized.includes("crit")) return "red";
  if (normalized.includes("alta")) return "amber";
  if (normalized.includes("media")) return "blue";
  return "slate";
}

function statusTone(status: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(status);
  if (normalized === "resolvida") return "green";
  if (normalized === "aberta") return "amber";
  if (["em analise", "em andamento", "encaminhada"].includes(normalized)) return "blue";
  if (normalized === "aguardando retorno") return "violet";
  if (normalized === "sem solucao") return "red";
  return "slate";
}

function daysBetween(start: string, end: string) {
  return Math.round((parseDate(end).getTime() - parseDate(start).getTime()) / 86400000);
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function selectMatches(filterValue: string, value: string) {
  return filterValue === "todos" || normalize(filterValue) === normalize(value);
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return "Erro inesperado ao conectar com o Supabase.";
}
