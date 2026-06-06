import { FormEvent, MouseEventHandler, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileImage,
  Footprints,
  Loader2,
  MapPin,
  Megaphone,
  PlusCircle,
  RefreshCw,
  Route,
  Target,
  Trash2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Database, ElectoralZone, FieldAgenda, Leader } from "@/types/database";
import { DEFAULT_CAMPAIGN_ID } from "@/services/leaders";
import {
  createFieldAgenda,
  deleteFieldAgenda,
  isFieldAgendaSupabaseReady,
  listFieldAgendaWithRelations,
  updateFieldAgenda,
  type FieldAgendaWithRelations,
} from "@/services/fieldAgenda";

type FieldAgendaInsert = Database["public"]["Tables"]["field_agenda"]["Insert"];
type FieldAgendaUpdate = Database["public"]["Tables"]["field_agenda"]["Update"];

type Filters = {
  type: string;
  date: string;
  neighborhood: string;
  city: string;
  leader: string;
  zone: string;
  responsible: string;
  status: string;
  priority: string;
  audience: string;
  result: string;
};

type AgendaFormState = {
  id: string | null;
  leader_id: string;
  electoral_zone_id: string;
  title: string;
  action_type: string;
  action_date: string;
  start_time: string;
  end_time: string;
  location: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  internal_responsible: string;
  estimated_public: number;
  actual_public: number;
  objective: string;
  status: string;
  priority: string;
  result: string;
  next_step: string;
  notes: string;
};

type Summary = {
  scheduled: number;
  done: number;
  late: number;
  meetings: number;
  walks: number;
  events: number;
  visits: number;
  critical: number;
  next7: number;
  neighborhoods: number;
  estimatedAudience: number;
  presentAudience: number;
};

const emptyFilters: Filters = {
  type: "todos",
  date: "todos",
  neighborhood: "todos",
  city: "todos",
  leader: "todos",
  zone: "todos",
  responsible: "todos",
  status: "todos",
  priority: "todos",
  audience: "todos",
  result: "todos",
};

const emptyForm: AgendaFormState = {
  id: null,
  leader_id: "",
  electoral_zone_id: "",
  title: "",
  action_type: "Reunião com liderança",
  action_date: new Date().toISOString().slice(0, 10),
  start_time: "",
  end_time: "",
  location: "",
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "Maricá",
  state: "RJ",
  internal_responsible: "Equipe Campo",
  estimated_public: 0,
  actual_public: 0,
  objective: "",
  status: "Agendada",
  priority: "Média",
  result: "Sem resultado definido",
  next_step: "",
  notes: "",
};

const actionTypes = [
  "Reunião com liderança",
  "Visita de campo",
  "Caminhada",
  "Panfletagem",
  "Evento comunitário",
  "Encontro com apoiadores",
  "Agenda do candidato",
  "Reunião de coordenação",
  "Ação em comércio",
  "Ação religiosa/comunitária",
  "Retorno de demanda",
  "Mobilização de bairro",
];
const statuses = ["Agendada", "Em andamento", "Concluída", "Cancelada", "Reagendar", "Atrasada"];
const priorities = ["Baixa", "Média", "Alta", "Crítica"];
const results = ["Liderança confirmada", "Novos apoiadores", "Demandas recebidas", "Necessita retorno", "Baixa adesão", "Alta adesão", "Gerou nova agenda", "Sem resultado definido"];

export default function Agenda() {
  const [actions, setActions] = useState<FieldAgendaWithRelations[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [electoralZones, setElectoralZones] = useState<ElectoralZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<FieldAgendaWithRelations | null>(null);
  const [editing, setEditing] = useState<AgendaFormState | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  async function loadAgenda() {
    setLoading(true);
    setError(null);

    if (!isFieldAgendaSupabaseReady()) {
      setActions([]);
      setLeaders([]);
      setElectoralZones([]);
      setError("Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar a agenda real.");
      setLoading(false);
      return;
    }

    try {
      const data = await listFieldAgendaWithRelations();
      setActions(data.actions);
      setLeaders(data.leaders);
      setElectoralZones(data.electoralZones);
    } catch (err) {
      setActions([]);
      setLeaders([]);
      setElectoralZones([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAgenda();
  }, []);

  const options = useMemo(() => buildOptions(actions), [actions]);
  const filtered = useMemo(() => actions.filter((record) => matchesRecord(record, filters)), [actions, filters]);
  const summary = useMemo(() => buildSummary(filtered), [filtered]);
  const rankings = useMemo(() => buildRankings(filtered), [filtered]);

  function openCreate() {
    setEditing({ ...emptyForm });
    setFormOpen(true);
  }

  function openEdit(record: FieldAgendaWithRelations) {
    setEditing(toFormState(record));
    setFormOpen(true);
  }

  function openDetails(record: FieldAgendaWithRelations) {
    setSelected(record);
    setDetailsOpen(true);
  }

  async function saveAction(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;

    const validationError = validateForm(editing);
    if (validationError) {
      toast({ title: "Revise a ação", description: validationError, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editing.id) {
        const saved = await updateFieldAgenda(editing.id, toUpdatePayload(editing));
        setActions((current) => current.map((item) => (item.id === saved.id ? hydrateAction(saved, leaders, electoralZones) : item)));
        toast({ title: "Ação atualizada", description: "As alterações foram salvas no Supabase." });
      } else {
        const saved = await createFieldAgenda(toInsertPayload(editing));
        setActions((current) => [hydrateAction(saved, leaders, electoralZones), ...current]);
        toast({ title: "Ação criada", description: "O novo compromisso foi salvo no Supabase." });
      }

      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast({ title: "Não foi possível salvar", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removeAction(record: FieldAgendaWithRelations) {
    const confirmed = window.confirm(`Excluir a ação "${record.title}"?\n\nEssa ação não poderá ser desfeita.`);
    if (!confirmed) return;

    try {
      await deleteFieldAgenda(record.id);
      setActions((current) => current.filter((item) => item.id !== record.id));
      toast({ title: "Ação excluída", description: "O registro foi removido do Supabase." });
    } catch (err) {
      toast({ title: "Não foi possível excluir", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Agenda de Campo"
        title="Operação Territorial"
        description={`${filtered.length} ações no recorte atual - dados reais da tabela field_agenda no Supabase.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadAgenda()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <PermissionGate module="agenda" action="create">
              <Button onClick={openCreate}><PlusCircle className="h-4 w-4" /> Nova ação</Button>
            </PermissionGate>
          </div>
        }
      />

      {error ? <ConnectionWarning message={error} /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Agendadas" value={summary.scheduled} icon={CalendarDays} tone="blue" loading={loading} />
        <MetricCard label="Concluídas" value={summary.done} icon={CheckCircle2} tone="green" loading={loading} />
        <MetricCard label="Atrasadas" value={summary.late} icon={AlertTriangle} tone="red" loading={loading} />
        <MetricCard label="Reuniões" value={summary.meetings} icon={Users} tone="indigo" loading={loading} />
        <MetricCard label="Caminhadas" value={summary.walks} icon={Footprints} tone="emerald" loading={loading} />
        <MetricCard label="Eventos" value={summary.events} icon={Megaphone} tone="violet" loading={loading} />
        <MetricCard label="Visitas" value={summary.visits} icon={MapPin} tone="cyan" loading={loading} />
        <MetricCard label="Críticas" value={summary.critical} icon={Target} tone="orange" loading={loading} />
        <MetricCard label="Próx. 7 dias" value={summary.next7} icon={Clock} tone="amber" loading={loading} />
        <MetricCard label="Bairros previstos" value={summary.neighborhoods} icon={Route} tone="emerald" loading={loading} />
      </section>

      <AgendaFilters filters={filters} setFilters={setFilters} options={options} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Tabs defaultValue="lista" className="min-w-0 space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="lista">Lista operacional</TabsTrigger>
            <TabsTrigger value="calendario">Calendário operacional</TabsTrigger>
          </TabsList>
          <TabsContent value="lista" className="mt-0">
            <AgendaTable loading={loading} data={filtered} onOpen={openDetails} onEdit={openEdit} onDelete={removeAction} />
          </TabsContent>
          <TabsContent value="calendario" className="mt-0">
            <CalendarView loading={loading} data={filtered} onOpen={openDetails} />
          </TabsContent>
        </Tabs>
        <aside className="space-y-4">
          <RankingCard title="Próximas prioridades" data={rankings.priorities} />
          <RankingCard title="Bairros mais ativos" data={rankings.neighborhoods} />
          <RankingCard title="Responsáveis mais ativos" data={rankings.responsibles} />
          <ResultPanel summary={summary} records={filtered} />
        </aside>
      </section>

      <ActionFormSheet
        open={formOpen}
        record={editing}
        leaders={leaders}
        electoralZones={electoralZones}
        saving={saving}
        setRecord={setEditing}
        onOpenChange={setFormOpen}
        onSubmit={saveAction}
      />

      <ActionDetailSheet
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

function AgendaFilters({ filters, setFilters, options }: { filters: Filters; setFilters: (filters: Filters) => void; options: Record<string, string[]> }) {
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value });
  return (
    <Card className="premium-card">
      <CardHeader className="pb-3"><CardTitle className="text-base">Filtros avançados</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <FilterSelect label="Tipo de ação" value={filters.type} options={actionTypes} onChange={(value) => update("type", value)} />
        <FilterSelect label="Data" value={filters.date} options={["Hoje", "Próximos 7 dias", "Atrasadas"]} onChange={(value) => update("date", value)} />
        <FilterSelect label="Bairro" value={filters.neighborhood} options={options.neighborhood} onChange={(value) => update("neighborhood", value)} />
        <FilterSelect label="Cidade" value={filters.city} options={options.city} onChange={(value) => update("city", value)} />
        <FilterSelect label="Liderança" value={filters.leader} options={options.leader} onChange={(value) => update("leader", value)} />
        <FilterSelect label="Zona eleitoral" value={filters.zone} options={options.zone} onChange={(value) => update("zone", value)} />
        <FilterSelect label="Responsável" value={filters.responsible} options={options.responsible} onChange={(value) => update("responsible", value)} />
        <FilterSelect label="Status" value={filters.status} options={statuses} onChange={(value) => update("status", value)} />
        <FilterSelect label="Prioridade" value={filters.priority} options={priorities} onChange={(value) => update("priority", value)} />
        <FilterSelect label="Público estimado" value={filters.audience} options={["Até 50", "51 a 120", "Acima de 120"]} onChange={(value) => update("audience", value)} />
        <FilterSelect label="Resultado" value={filters.result} options={results} onChange={(value) => update("result", value)} />
        <div className="flex items-end">
          <Button className="w-full" variant="outline" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaTable({
  loading,
  data,
  onOpen,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  data: FieldAgendaWithRelations[];
  onOpen: (record: FieldAgendaWithRelations) => void;
  onEdit: (record: FieldAgendaWithRelations) => void;
  onDelete: (record: FieldAgendaWithRelations) => void;
}) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">Lista de ações de campo</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["Data", "Horário", "Tipo", "Título", "Bairro", "Cidade", "Liderança", "Zona", "Responsável", "Estimado", "Presente", "Status", "Prioridade", "Resultado", "Próxima ação", "Ações"].map((head) => <TableHead key={head} className="whitespace-nowrap">{head}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 16 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}><Skeleton className="h-7 w-full rounded-lg" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} className="p-6">
                    <EmptyState title="Nenhuma ação encontrada" description="Ajuste os filtros ou cadastre uma nova ação de campo." icon={CalendarDays} />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record) => (
                  <TableRow key={record.id} className="cursor-pointer" onClick={() => onOpen(record)}>
                    <TableCell className="whitespace-nowrap font-bold">{formatDate(record.action_date)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatTimeRange(record)}</TableCell>
                    <TableCell><StatusPill label={record.action_type} tone={typeTone(record.action_type)} /></TableCell>
                    <TableCell className="min-w-[220px] font-bold text-slate-900">{record.title}</TableCell>
                    <TableCell>{record.neighborhood}</TableCell>
                    <TableCell>{record.city}</TableCell>
                    <TableCell className="min-w-[150px]">{record.leader?.full_name ?? "Sem vínculo"}</TableCell>
                    <TableCell>{formatZone(record.electoralZone)}</TableCell>
                    <TableCell>{record.internal_responsible || "Não definido"}</TableCell>
                    <TableCell>{formatNumber(record.estimated_public)}</TableCell>
                    <TableCell>{formatNumber(record.actual_public)}</TableCell>
                    <TableCell><StatusPill label={record.status} tone={statusTone(record.status)} /></TableCell>
                    <TableCell><StatusPill label={record.priority} tone={priorityTone(record.priority)} /></TableCell>
                    <TableCell><StatusPill label={record.result || "Sem resultado"} tone="blue" /></TableCell>
                    <TableCell className="min-w-[200px]">{record.next_step || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                        <IconButton label="Visualizar" icon={Eye} onClick={() => onOpen(record)} />
                        <PermissionGate module="agenda" action="edit">
                          <IconButton label="Editar" icon={Edit} onClick={() => onEdit(record)} />
                        </PermissionGate>
                        <PermissionGate module="agenda" action="delete">
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

function CalendarView({ loading, data, onOpen }: { loading: boolean; data: FieldAgendaWithRelations[]; onOpen: (record: FieldAgendaWithRelations) => void }) {
  const grouped = groupBy(data, (record) => record.action_date);
  const dates = Object.keys(grouped).sort();
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-base">Calendário semanal/mensal</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-lg" />)
        ) : dates.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState title="Calendário sem ações" description="Quando houver registros em field_agenda, eles aparecerão agrupados por data." icon={CalendarDays} />
          </div>
        ) : dates.map((date) => (
          <div key={date} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-extrabold text-slate-900">{formatDate(date)}</span>
              <span className="text-xs font-bold uppercase text-slate-400">{grouped[date].length} ações</span>
            </div>
            <div className="space-y-2">
              {grouped[date].map((record) => (
                <button key={record.id} type="button" onClick={() => onOpen(record)} className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left shadow-sm hover:bg-blue-50">
                  <div className="text-sm font-bold text-slate-900">{record.start_time || "--:--"} · {record.title}</div>
                  <div className="text-xs font-semibold text-slate-500">{record.neighborhood} · {record.internal_responsible || "Não definido"}</div>
                  <div className="mt-2 flex flex-wrap gap-1"><StatusPill label={record.status} tone={statusTone(record.status)} /><StatusPill label={record.priority} tone={priorityTone(record.priority)} /></div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ActionFormSheet({
  open,
  record,
  leaders,
  electoralZones,
  saving,
  setRecord,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  record: AgendaFormState | null;
  leaders: Leader[];
  electoralZones: ElectoralZone[];
  saving: boolean;
  setRecord: (record: AgendaFormState | null) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  if (!record) return null;

  function update<K extends keyof AgendaFormState>(key: K, value: AgendaFormState[K]) {
    setRecord(record ? { ...record, [key]: value } : record);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-slate-50 p-0 sm:max-w-3xl">
        <form onSubmit={onSubmit} className="space-y-5 p-5">
          <SheetHeader className="rounded-lg border bg-white p-5 text-left shadow-sm">
            <SheetTitle>{record.id ? "Editar ação" : "Nova ação de campo"}</SheetTitle>
            <SheetDescription>Cadastro real salvo na tabela field_agenda, com vínculo opcional a lideranças e zonas eleitorais.</SheetDescription>
          </SheetHeader>

          {(leaders.length === 0 || electoralZones.length === 0) ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-start gap-3 p-4 text-sm font-medium text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Não há {leaders.length === 0 ? "lideranças" : ""}{leaders.length === 0 && electoralZones.length === 0 ? " e " : ""}{electoralZones.length === 0 ? "zonas eleitorais" : ""} disponíveis para vínculo. Você ainda pode salvar a ação sem vínculo.</span>
              </CardContent>
            </Card>
          ) : null}

          <FormSection title="Dados da ação">
            <TextField label="Título da ação *" value={record.title} onChange={(value) => update("title", value)} />
            <SelectField label="Tipo de ação *" value={record.action_type} options={actionTypes} onChange={(value) => update("action_type", value)} />
            <TextField label="Data *" type="date" value={record.action_date} onChange={(value) => update("action_date", value)} />
            <TextField label="Horário inicial" type="time" value={record.start_time} onChange={(value) => update("start_time", value)} />
            <TextField label="Horário final" type="time" value={record.end_time} onChange={(value) => update("end_time", value)} />
            <TextField label="Local" value={record.location} onChange={(value) => update("location", value)} />
          </FormSection>

          <FormSection title="Localização e território">
            <TextField label="CEP" value={record.cep} onChange={(value) => update("cep", value)} />
            <TextField label="Rua" value={record.street} onChange={(value) => update("street", value)} />
            <TextField label="Número" value={record.number} onChange={(value) => update("number", value)} />
            <TextField label="Bairro *" value={record.neighborhood} onChange={(value) => update("neighborhood", value)} />
            <TextField label="Cidade *" value={record.city} onChange={(value) => update("city", value)} />
            <TextField label="Estado *" value={record.state} onChange={(value) => update("state", value.toUpperCase())} />
            <SelectField
              label="Zona eleitoral vinculada"
              value={record.electoral_zone_id}
              options={electoralZones.map((zone) => ({ value: zone.id, label: formatZone(zone) }))}
              includeEmpty="Sem vínculo"
              onChange={(value) => update("electoral_zone_id", value)}
            />
          </FormSection>

          <FormSection title="Operação e resultado">
            <SelectField
              label="Liderança vinculada"
              value={record.leader_id}
              options={leaders.map((leader) => ({ value: leader.id, label: `${leader.full_name} · ${leader.neighborhood}` }))}
              includeEmpty="Sem vínculo"
              onChange={(value) => update("leader_id", value)}
            />
            <TextField label="Responsável interno" value={record.internal_responsible} onChange={(value) => update("internal_responsible", value)} />
            <NumberField label="Público estimado" value={record.estimated_public} onChange={(value) => update("estimated_public", value)} />
            <NumberField label="Público presente" value={record.actual_public} onChange={(value) => update("actual_public", value)} />
            <SelectField label="Status *" value={record.status} options={statuses} onChange={(value) => update("status", value)} />
            <SelectField label="Prioridade *" value={record.priority} options={priorities} onChange={(value) => update("priority", value)} />
            <SelectField label="Resultado" value={record.result} options={results} onChange={(value) => update("result", value)} />
            <TextField label="Próximo passo" value={record.next_step} onChange={(value) => update("next_step", value)} />
            <AreaField label="Objetivo da ação" value={record.objective} onChange={(value) => update("objective", value)} />
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

function ActionDetailSheet({ open, record, onOpenChange }: { open: boolean; record: FieldAgendaWithRelations | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-slate-50 p-0 sm:max-w-2xl">
        {record ? (
          <div className="space-y-5 p-5">
            <SheetHeader className="rounded-lg border bg-white p-5 text-left shadow-sm">
              <SheetTitle className="text-2xl">{record.title}</SheetTitle>
              <SheetDescription>{record.action_type} · {record.neighborhood}, {record.city} · {formatDate(record.action_date)}</SheetDescription>
              <div className="flex flex-wrap gap-2 pt-2"><StatusPill label={record.status} tone={statusTone(record.status)} /><StatusPill label={record.priority} tone={priorityTone(record.priority)} /><StatusPill label={record.result || "Sem resultado"} tone="blue" /></div>
            </SheetHeader>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailMetric label="Estimado" value={formatNumber(record.estimated_public)} />
              <DetailMetric label="Presente" value={formatNumber(record.actual_public)} />
              <DetailMetric label="Status" value={record.status} />
              <DetailMetric label="Prioridade" value={record.priority} />
            </div>

            <Card className="premium-card">
              <CardHeader><CardTitle className="text-base">Dados principais e localização</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <InfoBlock title="Agenda" rows={[["Data", formatDate(record.action_date)], ["Horário", formatTimeRange(record)], ["Local", record.location || "Não informado"], ["Objetivo", record.objective || "Não informado"]]} />
                <InfoBlock title="Território" rows={[["Endereço", formatAddress(record)], ["Bairro", record.neighborhood], ["Zona", formatZone(record.electoralZone)], ["Liderança", record.leader?.full_name ?? "Sem vínculo"]]} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="premium-card overflow-hidden">
                <div className="relative min-h-64 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_75%_35%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,#f8fafc,#eef6ff)] p-5">
                  <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-blue-700">Área territorial</div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-950">{record.neighborhood}</div>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Área preparada para leitura territorial com Mapbox/PostGIS.</p>
                  <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/80 bg-white/85 p-3 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><MapPin className="h-4 w-4 text-blue-600" />{record.location || record.electoralZone?.voting_place || record.neighborhood}</div>
                  </div>
                </div>
              </Card>
              <ListCard title="Linha do tempo visual" items={buildTimeline(record)} />
              <ListCard title="Dados vinculados" items={[record.leader ? `Liderança: ${record.leader.full_name}` : "Nenhuma liderança vinculada ainda.", record.electoralZone ? `Zona: ${formatZone(record.electoralZone)}` : "Nenhuma zona vinculada ainda."]} />
              <ListCard title="Fotos/anexos" items={["Foto da ação em campo", "Lista de presença", "Registro de demandas"]} icon={FileImage} />
            </div>

            <Card className="premium-card">
              <CardHeader><CardTitle className="text-base">Resultado e observações estratégicas</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm font-medium leading-6 text-slate-600">
                <p><strong>Resultado:</strong> {record.result || "Sem resultado definido"}</p>
                <p><strong>Próximo passo:</strong> {record.next_step || "Não definido"}</p>
                <p>{record.notes || "Sem observações cadastradas."}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ResultPanel({ summary, records }: { summary: Summary; records: FieldAgendaWithRelations[] }) {
  const goodResults = records.filter((record) => ["Novos apoiadores", "Alta adesão", "Liderança confirmada", "Gerou nova agenda"].includes(record.result ?? "")).length;
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="text-sm">Indicadores operacionais</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm font-semibold text-slate-600">
        <Indicator label="Concluídas x agendadas" value={`${summary.done}/${records.length}`} />
        <Indicator label="Público estimado x presente" value={`${summary.estimatedAudience}/${summary.presentAudience}`} />
        <Indicator label="Ações com maior resultado" value={goodResults} />
        <Indicator label="Próximas em até 7 dias" value={summary.next7} />
      </CardContent>
    </Card>
  );
}

function buildSummary(records: FieldAgendaWithRelations[]): Summary {
  const today = getToday();
  const nextLimit = new Date(today);
  nextLimit.setDate(today.getDate() + 7);

  return {
    scheduled: records.filter((record) => normalize(record.status) === "agendada").length,
    done: records.filter((record) => normalize(record.status) === "concluida").length,
    late: records.filter((record) => isDelayed(record, today)).length,
    meetings: records.filter((record) => normalize(record.action_type).includes("reuniao")).length,
    walks: records.filter((record) => normalize(record.action_type) === "caminhada").length,
    events: records.filter((record) => normalize(record.action_type).includes("evento")).length,
    visits: records.filter((record) => normalize(record.action_type).includes("visita")).length,
    critical: records.filter((record) => normalize(record.priority).includes("crit")).length,
    next7: records.filter((record) => {
      const date = parseDate(record.action_date);
      return date >= today && date <= nextLimit;
    }).length,
    neighborhoods: unique(records.map((record) => record.neighborhood)).length,
    estimatedAudience: records.reduce((sum, record) => sum + Number(record.estimated_public ?? 0), 0),
    presentAudience: records.reduce((sum, record) => sum + Number(record.actual_public ?? 0), 0),
  };
}

function buildRankings(records: FieldAgendaWithRelations[]) {
  return {
    priorities: records
      .filter((record) => ["Crítica", "Alta"].includes(record.priority) || isDelayed(record, getToday()))
      .slice(0, 5)
      .map((record) => ({ label: record.title, value: `${formatDate(record.action_date)} · ${record.neighborhood}` })),
    neighborhoods: countRanking(records.map((record) => record.neighborhood)),
    responsibles: countRanking(records.map((record) => record.internal_responsible || "Não definido")),
  };
}

function buildOptions(records: FieldAgendaWithRelations[]) {
  return {
    neighborhood: unique(records.map((record) => record.neighborhood)),
    city: unique(records.map((record) => record.city)),
    leader: unique(records.map((record) => record.leader?.full_name ?? "Sem vínculo")),
    zone: unique(records.map((record) => formatZone(record.electoralZone))),
    responsible: unique(records.map((record) => record.internal_responsible ?? "Não definido")),
  };
}

function matchesRecord(record: FieldAgendaWithRelations, filters: Filters) {
  const today = getToday();
  const nextLimit = new Date(today);
  nextLimit.setDate(today.getDate() + 7);
  const date = parseDate(record.action_date);
  const leaderName = record.leader?.full_name ?? "Sem vínculo";
  const zoneLabel = formatZone(record.electoralZone);
  const estimated = Number(record.estimated_public ?? 0);

  return (
    selectMatches(filters.type, record.action_type) &&
    selectMatches(filters.neighborhood, record.neighborhood) &&
    selectMatches(filters.city, record.city) &&
    selectMatches(filters.leader, leaderName) &&
    selectMatches(filters.zone, zoneLabel) &&
    selectMatches(filters.responsible, record.internal_responsible ?? "Não definido") &&
    selectMatches(filters.status, record.status) &&
    selectMatches(filters.priority, record.priority) &&
    selectMatches(filters.result, record.result ?? "Sem resultado definido") &&
    (filters.date === "todos" || (filters.date === "Hoje" && sameDate(date, today)) || (filters.date === "Próximos 7 dias" && date >= today && date <= nextLimit) || (filters.date === "Atrasadas" && isDelayed(record, today))) &&
    (filters.audience === "todos" || (filters.audience === "Até 50" && estimated <= 50) || (filters.audience === "51 a 120" && estimated >= 51 && estimated <= 120) || (filters.audience === "Acima de 120" && estimated > 120))
  );
}

function toFormState(record: FieldAgendaWithRelations): AgendaFormState {
  return {
    id: record.id,
    leader_id: record.leader_id ?? "",
    electoral_zone_id: record.electoral_zone_id ?? "",
    title: record.title,
    action_type: record.action_type,
    action_date: record.action_date,
    start_time: record.start_time ?? "",
    end_time: record.end_time ?? "",
    location: record.location ?? "",
    cep: record.cep ?? "",
    street: record.street ?? "",
    number: record.number ?? "",
    neighborhood: record.neighborhood,
    city: record.city,
    state: record.state,
    internal_responsible: record.internal_responsible ?? "",
    estimated_public: record.estimated_public ?? 0,
    actual_public: record.actual_public ?? 0,
    objective: record.objective ?? "",
    status: record.status,
    priority: record.priority,
    result: record.result ?? "Sem resultado definido",
    next_step: record.next_step ?? "",
    notes: record.notes ?? "",
  };
}

function toInsertPayload(form: AgendaFormState): FieldAgendaInsert {
  return {
    campaign_id: DEFAULT_CAMPAIGN_ID,
    leader_id: nullable(form.leader_id),
    electoral_zone_id: nullable(form.electoral_zone_id),
    title: form.title.trim(),
    action_type: form.action_type,
    action_date: form.action_date,
    start_time: nullable(form.start_time),
    end_time: nullable(form.end_time),
    location: nullable(form.location),
    cep: nullable(form.cep),
    street: nullable(form.street),
    number: nullable(form.number),
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    internal_responsible: nullable(form.internal_responsible),
    estimated_public: form.estimated_public > 0 ? Number(form.estimated_public) : null,
    actual_public: form.actual_public > 0 ? Number(form.actual_public) : null,
    objective: nullable(form.objective),
    status: form.status,
    priority: form.priority,
    result: nullable(form.result),
    next_step: nullable(form.next_step),
    notes: nullable(form.notes),
  };
}

function toUpdatePayload(form: AgendaFormState): FieldAgendaUpdate {
  return toInsertPayload(form);
}

function validateForm(form: AgendaFormState) {
  if (!form.title.trim()) return "Informe o título da ação.";
  if (!form.action_type.trim()) return "Informe o tipo de ação.";
  if (!form.action_date.trim()) return "Informe a data.";
  if (!form.neighborhood.trim()) return "Informe o bairro.";
  if (!form.city.trim()) return "Informe a cidade.";
  if (!form.state.trim()) return "Informe o estado.";
  if (!form.status.trim()) return "Informe o status.";
  if (!form.priority.trim()) return "Informe a prioridade.";
  return null;
}

function hydrateAction(action: FieldAgenda, leaders: Leader[], zones: ElectoralZone[]): FieldAgendaWithRelations {
  return {
    ...action,
    leader: action.leader_id ? leaders.find((leader) => leader.id === action.leader_id) ?? null : null,
    electoralZone: action.electoral_zone_id ? zones.find((zone) => zone.id === action.electoral_zone_id) ?? null : null,
  };
}

function buildTimeline(record: FieldAgendaWithRelations) {
  return [
    `Ação criada em ${formatDate(record.created_at.slice(0, 10))}`,
    record.internal_responsible ? `Responsável definido: ${record.internal_responsible}` : "Responsável ainda não definido",
    record.leader ? `Liderança vinculada: ${record.leader.full_name}` : "Nenhuma liderança vinculada ainda.",
    record.result ? `Resultado registrado: ${record.result}` : "Resultado aguardando atualização",
    record.next_step ? `Próximo passo: ${record.next_step}` : "Próximo passo não definido",
  ];
}

function groupBy<T>(records: T[], getKey: (record: T) => string) {
  return records.reduce<Record<string, T[]>>((acc, record) => {
    const key = getKey(record);
    acc[key] = acc[key] ?? [];
    acc[key].push(record);
    return acc;
  }, {});
}

function countRanking(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value: `${value} ações` }));
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

function SelectField({
  label,
  value,
  options,
  includeEmpty,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<string | { value: string; label: string }>;
  includeEmpty?: string;
  onChange: (value: string) => void;
}) {
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

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <Input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value || 0))} />
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

function ListCard({ title, items, icon: Icon = Upload }: { title: string; items: string[]; icon?: typeof Upload }) {
  return (
    <Card className="premium-card">
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-blue-600" />{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, index) => <div key={`${item}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{item}</div>)}
      </CardContent>
    </Card>
  );
}

function Indicator({ label, value }: { label: string; value: string | number }) {
  return <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>{label}</span><strong className="text-blue-700">{value}</strong></div>;
}

function formatZone(zone: ElectoralZone | null) {
  if (!zone) return "Sem vínculo";
  return `Zona ${zone.zone_number}${zone.section_number ? ` / Seção ${zone.section_number}` : ""}`;
}

function formatAddress(record: FieldAgenda) {
  return [record.street, record.number, record.location, record.neighborhood].filter(Boolean).join(", ") || "Não informado";
}

function formatTimeRange(record: FieldAgenda) {
  if (!record.start_time && !record.end_time) return "-";
  return [record.start_time || "--:--", record.end_time || "--:--"].join(" - ");
}

function formatNumber(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR");
}

function formatDate(value: string) {
  const date = parseDate(value);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function typeTone(type: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(type);
  if (normalized.includes("caminhada")) return "emerald";
  if (normalized.includes("evento")) return "violet";
  if (normalized.includes("retorno")) return "amber";
  if (normalized.includes("visita")) return "blue";
  return "slate";
}

function statusTone(status: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(status);
  if (normalized === "concluida") return "green";
  if (normalized === "agendada") return "blue";
  if (normalized === "em andamento") return "emerald";
  if (normalized === "atrasada") return "red";
  if (normalized === "reagendar") return "amber";
  return "slate";
}

function priorityTone(priority: string): "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green" {
  const normalized = normalize(priority);
  if (normalized.includes("crit")) return "red";
  if (normalized.includes("alta")) return "amber";
  if (normalized.includes("media")) return "blue";
  return "slate";
}

function isDelayed(record: FieldAgenda, today: Date) {
  const status = normalize(record.status);
  if (status === "atrasada") return true;
  return parseDate(record.action_date) < today && !["concluida", "cancelada"].includes(status);
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
