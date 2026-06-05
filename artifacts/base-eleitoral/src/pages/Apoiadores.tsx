import { FormEvent, MouseEventHandler, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Edit,
  Eye,
  Loader2,
  MapPinned,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { DEFAULT_CAMPAIGN_ID } from "@/services/leaders";
import {
  createSupporter,
  deleteSupporter,
  isSupportersSupabaseReady,
  listSupportersWithLeaders,
  updateSupporter,
  type SupporterWithLeader,
} from "@/services/supporters";
import type { Database, Leader, Supporter } from "@/types/database";

type SupporterInsert = Database["public"]["Tables"]["supporters"]["Insert"];
type SupporterUpdate = Database["public"]["Tables"]["supporters"]["Update"];
type GeoPrecision = "Alta" | "Média alta" | "Média" | "Baixa" | "Muito baixa";
type QualityStage = "Cadastro completo" | "Cadastro parcial" | "Cadastro básico" | "Cadastro mínimo" | "Cadastro incompleto";

type Filters = {
  search: string;
  telefone: string;
  cidade: string;
  bairro: string;
  rua: string;
  lideranca: string;
  tipoPessoa: string;
  statusPolitico: string;
  confianca: string;
  precisao: string;
  periodo: string;
  proximaAcao: string;
  responsavel: string;
};

type SupporterFormState = {
  id: string | null;
  leader_id: string;
  full_name: string;
  nickname: string;
  phone: string;
  email: string;
  birth_date: string;
  gender: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  reference_point: string;
  geographic_precision: string;
  person_type: string;
  political_status: string;
  data_confidence: string;
  source: string;
  internal_responsible: string;
  last_contact: string;
  next_action: string;
  next_action_date: string;
  lgpd_consent: boolean;
  notes: string;
};

const emptyFilters: Filters = {
  search: "",
  telefone: "",
  cidade: "todos",
  bairro: "todos",
  rua: "",
  lideranca: "todos",
  tipoPessoa: "todos",
  statusPolitico: "todos",
  confianca: "todos",
  precisao: "todos",
  periodo: "todos",
  proximaAcao: "todos",
  responsavel: "todos",
};

const emptyForm: SupporterFormState = {
  id: null,
  leader_id: "",
  full_name: "",
  nickname: "",
  phone: "",
  email: "",
  birth_date: "",
  gender: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "Maricá",
  state: "RJ",
  reference_point: "",
  geographic_precision: "Baixa",
  person_type: "Apoiador confirmado",
  political_status: "Precisa contato",
  data_confidence: "Não validado",
  source: "Indicação",
  internal_responsible: "Equipe Territorial",
  last_contact: "",
  next_action: "Primeiro contato",
  next_action_date: "",
  lgpd_consent: false,
  notes: "",
};

const personTypes = ["Apoiador confirmado", "Simpatizante", "Indeciso", "Voluntário", "Comerciante", "Religioso", "Liderança comunitária", "Jovem", "Servidor público", "Empresário", "Formador de opinião", "Morador com demanda", "Multiplicador"];
const politicalStatuses = ["Confirmado", "Simpatizante", "Indeciso", "Precisa contato", "Prioridade", "Contrário", "Não respondeu", "Voto validado"];
const registrationSources = ["Liderança", "Evento", "Reunião", "WhatsApp", "Planilha importada", "Abordagem de rua", "Rede social", "Indicação", "Outro"];
const geoPrecisions: GeoPrecision[] = ["Alta", "Média alta", "Média", "Baixa", "Muito baixa"];

export default function Apoiadores() {
  const [supporters, setSupporters] = useState<SupporterWithLeader[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState<SupporterFormState | null>(null);
  const [selected, setSelected] = useState<SupporterWithLeader | null>(null);

  async function loadSupporters() {
    setLoading(true);
    setError(null);

    if (!isSupportersSupabaseReady()) {
      setSupporters([]);
      setLeaders([]);
      setError("Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar apoiadores reais.");
      setLoading(false);
      return;
    }

    try {
      const data = await listSupportersWithLeaders();
      setSupporters(data.supporters);
      setLeaders(data.leaders);
    } catch (err) {
      setSupporters([]);
      setLeaders([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSupporters();
  }, []);

  const options = useMemo(() => ({
    cidades: unique(supporters.map((item) => item.city)),
    bairros: unique(supporters.map((item) => item.neighborhood)),
    ruas: unique(supporters.map((item) => item.street)),
    liderancas: unique(supporters.map((item) => getLeaderLabel(item))),
    tipos: unique(supporters.map((item) => item.person_type)),
    status: unique(supporters.map((item) => item.political_status)),
    confiancas: unique(supporters.map((item) => item.data_confidence)),
    precisoes: unique(supporters.map((item) => item.geographic_precision)),
    acoes: unique(supporters.map((item) => item.next_action || "Sem próxima ação")),
    responsaveis: unique(supporters.map((item) => item.internal_responsible ?? "Não definido")),
  }), [supporters]);

  const filtered = useMemo(() => {
    const term = normalize(filters.search);
    const phone = normalize(filters.telefone);
    const street = normalize(filters.rua);

    return supporters.filter((supporter) => {
      const textMatch = !term || [
        supporter.full_name,
        supporter.nickname,
        supporter.neighborhood,
        supporter.city,
        supporter.political_status,
        getLeaderLabel(supporter),
      ].some((value) => normalize(value ?? "").includes(term));

      const phoneMatch = !phone || normalize(supporter.phone).includes(phone);
      const streetMatch = !street || normalize(supporter.street ?? "").includes(street);
      const periodMatch =
        filters.periodo === "todos" ||
        (filters.periodo === "semana" && isWithinLastDays(supporter.created_at, 7)) ||
        (filters.periodo === "mes" && isWithinLastDays(supporter.created_at, 30));

      return (
        textMatch &&
        phoneMatch &&
        streetMatch &&
        matches(filters.cidade, supporter.city) &&
        matches(filters.bairro, supporter.neighborhood) &&
        matches(filters.lideranca, getLeaderLabel(supporter)) &&
        matches(filters.tipoPessoa, supporter.person_type) &&
        matches(filters.statusPolitico, supporter.political_status) &&
        matches(filters.confianca, supporter.data_confidence) &&
        matches(filters.precisao, supporter.geographic_precision) &&
        matches(filters.proximaAcao, supporter.next_action || "Sem próxima ação") &&
        matches(filters.responsavel, supporter.internal_responsible ?? "Não definido") &&
        periodMatch
      );
    });
  }, [filters, supporters]);

  const summary = useMemo(() => buildSummary(filtered), [filtered]);

  function openCreate() {
    setEditing({ ...emptyForm });
    setFormOpen(true);
  }

  function openEdit(record: SupporterWithLeader) {
    setEditing(toFormState(record));
    setFormOpen(true);
  }

  function openDetails(record: SupporterWithLeader) {
    setSelected(record);
    setDetailsOpen(true);
  }

  async function savePerson(event: FormEvent) {
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
        const saved = await updateSupporter(editing.id, toUpdatePayload(editing));
        setSupporters((current) => current.map((item) => (item.id === saved.id ? withLeader(saved, leaders) : item)));
        toast({ title: "Pessoa atualizada", description: "As alterações foram salvas no Supabase." });
      } else {
        const saved = await createSupporter(toInsertPayload(editing));
        setSupporters((current) => [withLeader(saved, leaders), ...current]);
        toast({ title: "Pessoa cadastrada", description: "O novo registro foi salvo no Supabase." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast({ title: "Não foi possível salvar", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removePerson(record: SupporterWithLeader) {
    const confirmed = window.confirm(`Excluir a pessoa "${record.full_name}"?\n\nEssa ação não poderá ser desfeita.`);
    if (!confirmed) return;

    try {
      await deleteSupporter(record.id);
      setSupporters((current) => current.filter((item) => item.id !== record.id));
      toast({ title: "Pessoa excluída", description: "O registro foi removido do Supabase." });
    } catch (err) {
      toast({ title: "Não foi possível excluir", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Apoiadores / Pessoas"
        title="CRM Territorial"
        description={`${filtered.length} pessoas no recorte atual - dados reais da tabela supporters no Supabase.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadSupporters()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <PermissionGate module="apoiadores" action="create">
              <Button onClick={openCreate}><PlusCircle className="h-4 w-4" /> Nova Pessoa</Button>
            </PermissionGate>
          </div>
        }
      />

      {error ? <ConnectionWarning message={error} /> : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 xl:grid-cols-10">
        <MetricCard label="Total" value={filtered.length} icon={Users} tone="blue" loading={loading} />
        <MetricCard label="Confirmados" value={summary.confirmed} icon={CheckCircle2} tone="emerald" loading={loading} />
        <MetricCard label="Simpatizantes" value={summary.sympathizers} icon={UserPlus} tone="cyan" loading={loading} />
        <MetricCard label="Indecisos" value={summary.undecided} icon={AlertCircle} tone="amber" loading={loading} />
        <MetricCard label="Sem endereço" value={summary.missingAddress} icon={MapPinned} tone="red" loading={loading} />
        <MetricCard label="Alta precisão" value={summary.highPrecision} icon={MapPinned} tone="green" loading={loading} />
        <MetricCard label="Com liderança" value={summary.linked} icon={UserCheck} tone="violet" loading={loading} />
        <MetricCard label="Retorno" value={summary.needsReturn} icon={CalendarClock} tone="orange" loading={loading} />
        <MetricCard label="Semana" value={summary.week} icon={PlusCircle} tone="indigo" loading={loading} />
        <MetricCard label="Validados" value={summary.validated} icon={ShieldCheck} tone="emerald" loading={loading} />
      </div>

      <FiltersPanel filters={filters} setFilters={setFilters} options={options} />
      <SupportersTable loading={loading} supporters={filtered} onOpenDetails={openDetails} onEdit={openEdit} onDelete={removePerson} />

      <PersonFormSheet
        open={formOpen}
        record={editing}
        saving={saving}
        leaders={leaders}
        setRecord={setEditing}
        onOpenChange={setFormOpen}
        onSubmit={savePerson}
      />

      <PersonDetailSheet
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

function FiltersPanel({
  filters,
  setFilters,
  options,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  options: {
    cidades: string[];
    bairros: string[];
    ruas: string[];
    liderancas: string[];
    tipos: string[];
    status: string[];
    confiancas: string[];
    precisoes: string[];
    acoes: string[];
    responsaveis: string[];
  };
}) {
  return (
    <Card className="premium-card">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Buscar por nome">
            <Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Nome, apelido, bairro ou liderança" />
          </Field>
          <Field label="Telefone">
            <Input value={filters.telefone} onChange={(event) => setFilters({ ...filters, telefone: event.target.value })} placeholder="WhatsApp" />
          </Field>
          <FilterSelect label="Cidade" value={filters.cidade} values={options.cidades} onChange={(value) => setFilters({ ...filters, cidade: value })} />
          <FilterSelect label="Bairro" value={filters.bairro} values={options.bairros} onChange={(value) => setFilters({ ...filters, bairro: value })} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Rua">
            <Input value={filters.rua} onChange={(event) => setFilters({ ...filters, rua: event.target.value })} placeholder="Rua ou avenida" />
          </Field>
          <FilterSelect label="Liderança" value={filters.lideranca} values={options.liderancas} onChange={(value) => setFilters({ ...filters, lideranca: value })} />
          <FilterSelect label="Tipo de pessoa" value={filters.tipoPessoa} values={options.tipos} onChange={(value) => setFilters({ ...filters, tipoPessoa: value })} />
          <FilterSelect label="Status político" value={filters.statusPolitico} values={options.status} onChange={(value) => setFilters({ ...filters, statusPolitico: value })} />
          <FilterSelect label="Confiança" value={filters.confianca} values={options.confiancas} onChange={(value) => setFilters({ ...filters, confianca: value })} />
          <FilterSelect label="Precisão geográfica" value={filters.precisao} values={options.precisoes} onChange={(value) => setFilters({ ...filters, precisao: value })} />
          <Field label="Período de cadastro">
            <select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={filters.periodo} onChange={(event) => setFilters({ ...filters, periodo: event.target.value })}>
              <option value="todos">Todos</option>
              <option value="semana">Últimos 7 dias</option>
              <option value="mes">Últimos 30 dias</option>
            </select>
          </Field>
          <FilterSelect label="Próxima ação" value={filters.proximaAcao} values={options.acoes} onChange={(value) => setFilters({ ...filters, proximaAcao: value })} />
          <FilterSelect label="Responsável" value={filters.responsavel} values={options.responsaveis} onChange={(value) => setFilters({ ...filters, responsavel: value })} />
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SupportersTable({
  loading,
  supporters,
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  supporters: SupporterWithLeader[];
  onOpenDetails: (record: SupporterWithLeader) => void;
  onEdit: (record: SupporterWithLeader) => void;
  onDelete: (record: SupporterWithLeader) => void;
}) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-base font-extrabold text-slate-950">Pessoas e Apoiadores</CardTitle>
        <p className="text-sm font-medium text-slate-500">Clique em uma pessoa para abrir a ficha individual e ver a qualidade do cadastro.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-64 px-5">Nome</TableHead>
                <TableHead>Telefone/WhatsApp</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="min-w-48">Liderança vinculada</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status político</TableHead>
                <TableHead>Precisão</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Último contato</TableHead>
                <TableHead className="min-w-44">Próxima ação</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 13 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className={cellIndex === 0 ? "px-5" : ""}>
                        <Skeleton className="h-7 w-full rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : supporters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="p-6">
                    <EmptyState title="Nenhuma pessoa encontrada" description="Ajuste os filtros ou cadastre uma nova pessoa para ampliar o CRM territorial." icon={UserPlus} />
                  </TableCell>
                </TableRow>
              ) : (
                supporters.map((supporter) => {
                  const quality = getQualityScore(supporter);
                  const precision = getGeoPrecision(supporter);
                  return (
                    <TableRow key={supporter.id} className="cursor-pointer" onClick={() => onOpenDetails(supporter)}>
                      <TableCell className="px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-100">{getInitials(supporter.full_name)}</div>
                          <div className="min-w-0">
                            <div className="truncate font-extrabold text-slate-950">{supporter.full_name}</div>
                            <div className="truncate text-xs font-medium text-slate-500">{supporter.nickname || getQualityStage(quality)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><SensitiveText value={supporter.phone} kind="phone" /></TableCell>
                      <TableCell className="font-medium text-slate-600">{supporter.neighborhood}</TableCell>
                      <TableCell className="text-slate-600">{supporter.city}</TableCell>
                      <TableCell className="font-semibold text-slate-700">{getLeaderLabel(supporter)}</TableCell>
                      <TableCell><StatusPill label={supporter.person_type} tone="blue" /></TableCell>
                      <TableCell><StatusPill label={supporter.political_status} tone={getPoliticalStatusTone(supporter.political_status)} /></TableCell>
                      <TableCell><StatusPill label={precision} tone={getPrecisionTone(precision)} /></TableCell>
                      <TableCell><StatusPill label={supporter.data_confidence} tone={getConfidenceTone(supporter.data_confidence)} /></TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">{supporter.last_contact || "-"}</TableCell>
                      <TableCell className="max-w-44 truncate text-sm font-medium text-slate-600">{supporter.next_action || "-"}</TableCell>
                      <TableCell className="text-sm font-semibold text-slate-600">{supporter.internal_responsible || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IconButton label="Visualizar" onClick={(event) => { event.stopPropagation(); onOpenDetails(supporter); }} icon={Eye} />
                          <PermissionGate module="apoiadores" action="edit"><IconButton label="Editar" onClick={(event) => { event.stopPropagation(); onEdit(supporter); }} icon={Edit} /></PermissionGate>
                          <PermissionGate module="apoiadores" action="delete"><IconButton label="Excluir" danger onClick={(event) => { event.stopPropagation(); void onDelete(supporter); }} icon={Trash2} /></PermissionGate>
                        </div>
                        <div className="mt-2">
                          <StatusPill label={`${quality}%`} tone={quality >= 80 ? "emerald" : quality >= 60 ? "blue" : "amber"} />
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

function PersonFormSheet({
  open,
  record,
  saving,
  leaders,
  setRecord,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  record: SupporterFormState | null;
  saving: boolean;
  leaders: Leader[];
  setRecord: (record: SupporterFormState | null) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  function update<K extends keyof SupporterFormState>(key: K, value: SupporterFormState[K]) {
    if (!record) return;
    setRecord({ ...record, [key]: value });
  }

  const leaderOptions: Array<[string, string]> = [
    ["", "Sem liderança vinculada"],
    ...leaders.map((leader) => [leader.id, `${leader.full_name} - ${leader.neighborhood}, ${leader.city}`] as [string, string]),
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-0 bg-slate-50 p-0 sm:max-w-4xl">
        <SheetHeader className="bg-gradient-to-br from-emerald-900 to-blue-950 p-6 pb-8 text-white">
          <SheetTitle className="text-2xl font-extrabold text-white">{record?.id ? "Editar pessoa" : "Nova pessoa"}</SheetTitle>
          <SheetDescription className="text-sm font-medium leading-6 text-white/80">
            Cadastre dados pessoais, endereço, vínculo político e status de conversão territorial.
          </SheetDescription>
        </SheetHeader>

        {record ? (
          <form className="space-y-5 p-5 sm:p-6" onSubmit={onSubmit}>
            {leaders.length === 0 ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 text-sm font-semibold text-amber-900">
                  Cadastre lideranças antes de vincular apoiadores. Você ainda pode salvar esta pessoa sem liderança.
                </CardContent>
              </Card>
            ) : null}

            <FormSection title="Dados pessoais">
              <TextField required label="Nome completo" value={record.full_name} onChange={(value) => update("full_name", value)} />
              <TextField label="Apelido" value={record.nickname} onChange={(value) => update("nickname", value)} />
              <TextField required label="Telefone/WhatsApp" value={record.phone} onChange={(value) => update("phone", value)} />
              <TextField label="E-mail" value={record.email} onChange={(value) => update("email", value)} />
              <TextField label="Data de nascimento" type="date" value={record.birth_date} onChange={(value) => update("birth_date", value)} />
              <SelectTextField label="Gênero" value={record.gender} values={["", "Feminino", "Masculino", "Outro", "Prefere não informar"]} onChange={(value) => update("gender", value)} />
              <AreaField label="Observações gerais" value={record.notes} onChange={(value) => update("notes", value)} />
            </FormSection>

            <FormSection title="Endereço">
              <TextField label="CEP" value={record.cep} onChange={(value) => update("cep", value)} />
              <TextField label="Rua" value={record.street} onChange={(value) => update("street", value)} />
              <TextField label="Número" value={record.number} onChange={(value) => update("number", value)} />
              <TextField label="Complemento" value={record.complement} onChange={(value) => update("complement", value)} />
              <TextField required label="Bairro" value={record.neighborhood} onChange={(value) => update("neighborhood", value)} />
              <TextField required label="Cidade" value={record.city} onChange={(value) => update("city", value)} />
              <TextField required label="Estado" value={record.state} onChange={(value) => update("state", value)} />
              <TextField label="Referência/localidade" value={record.reference_point} onChange={(value) => update("reference_point", value)} />
              <SelectTextField label="Precisão geográfica" value={record.geographic_precision} values={geoPrecisions} onChange={(value) => update("geographic_precision", value)} />
            </FormSection>

            <FormSection title="Vínculo político">
              <SelectField label="Liderança vinculada" value={record.leader_id} values={leaderOptions} onChange={(value) => update("leader_id", value)} />
              <TextField label="Responsável interno" value={record.internal_responsible} onChange={(value) => update("internal_responsible", value)} />
              <SelectTextField required label="Tipo de pessoa" value={record.person_type} values={personTypes} onChange={(value) => update("person_type", value)} />
              <SelectTextField required label="Status político" value={record.political_status} values={politicalStatuses} onChange={(value) => update("political_status", value)} />
              <SelectTextField required label="Confiança do cadastro" value={record.data_confidence} values={["Alto", "Médio", "Baixo", "Não validado"]} onChange={(value) => update("data_confidence", value)} />
              <SelectTextField required label="Fonte do cadastro" value={record.source} values={registrationSources} onChange={(value) => update("source", value)} />
              <TextField label="Último contato" type="date" value={record.last_contact} onChange={(value) => update("last_contact", value)} />
              <TextField label="Próxima ação" value={record.next_action} onChange={(value) => update("next_action", value)} />
              <TextField label="Data da próxima ação" type="date" value={record.next_action_date} onChange={(value) => update("next_action_date", value)} />
              <CheckboxField label="Consentimento LGPD registrado" checked={record.lgpd_consent} onChange={(value) => update("lgpd_consent", value)} />
            </FormSection>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Salvar pessoa</Button>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function PersonDetailSheet({ open, record, onOpenChange }: { open: boolean; record: SupporterWithLeader | null; onOpenChange: (open: boolean) => void }) {
  if (!record) return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent /></Sheet>;

  const quality = getQualityScore(record);
  const precision = getGeoPrecision(record);
  const stage = getConversionStage(record);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-0 bg-slate-50 p-0 sm:max-w-4xl">
        <SheetHeader className="bg-gradient-to-br from-emerald-900 to-blue-950 p-6 pb-8 text-white">
          <SheetTitle className="flex items-center gap-3 text-2xl font-extrabold text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-sm font-extrabold ring-1 ring-white/20">{getInitials(record.full_name)}</div>
            {record.full_name}
          </SheetTitle>
          <SheetDescription className="text-sm font-medium leading-6 text-white/80">{record.political_status} - {record.neighborhood}, {record.city}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-5">
            <DetailMetric label="Qualidade" value={`${quality}%`} />
            <DetailMetric label="Precisão" value={precision} />
            <DetailMetric label="Liderança" value={record.leader_id ? "Sim" : "Não"} />
            <DetailMetric label="Mapa" value={hasMapReadyAddress(record) ? "Pronto" : "Pendente"} />
            <DetailMetric label="Conversão" value={stage} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <DetailCard title="Dados pessoais">
              <InfoGrid items={[
                ["Apelido", record.nickname ?? "-"],
                ["Telefone", <SensitiveText value={record.phone} kind="phone" />],
                ["E-mail", <SensitiveText value={record.email} kind="email" />],
                ["Nascimento", record.birth_date ?? "-"],
                ["Gênero", record.gender ?? "-"],
                ["Fonte", record.source],
              ]} />
            </DetailCard>

            <DetailCard title="Card de localização simulada">
              <div className="relative h-56 overflow-hidden rounded-lg border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#eff6ff_50%,#f8fafc_100%)]">
                <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-emerald-300 bg-emerald-400/15" />
                <div className="absolute bottom-8 right-10 h-24 w-24 rounded-full border border-blue-300 bg-blue-400/20" />
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-700 shadow-[0_0_0_10px_rgba(5,150,105,0.14)]" />
                <div className="absolute bottom-4 left-4 rounded-lg bg-white/85 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">{record.neighborhood}, {record.city} - {precision}</div>
              </div>
            </DetailCard>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <DetailCard title="Endereço e precisão">
              <InfoGrid items={[
                ["CEP", record.cep ?? "-"],
                ["Rua", record.street ?? "-"],
                ["Número", record.number ?? "-"],
                ["Complemento", record.complement ?? "-"],
                ["Bairro", record.neighborhood],
                ["Cidade", record.city],
                ["Estado", record.state],
                ["Referência", record.reference_point ?? "-"],
                ["Suficiente para mapa", hasMapReadyAddress(record) ? "Sim" : "Não"],
              ]} />
            </DetailCard>

            <DetailCard title="Vínculo político">
              <InfoGrid items={[
                ["Liderança vinculada", getLeaderLabel(record)],
                ["Status político", record.political_status],
                ["Tipo de pessoa", record.person_type],
                ["Confiança", record.data_confidence],
                ["Responsável", record.internal_responsible ?? "-"],
                ["Próxima ação", record.next_action ?? "-"],
              ]} />
            </DetailCard>

            <DetailCard title="Observações estratégicas">
              <p className="text-sm font-medium leading-6 text-slate-600">{record.notes || "Sem observações estratégicas registradas."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill label={record.political_status} tone={getPoliticalStatusTone(record.political_status)} />
                <StatusPill label={getQualityStage(quality)} tone={quality >= 80 ? "emerald" : quality >= 60 ? "blue" : "amber"} />
              </div>
            </DetailCard>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <DetailList title="Histórico de contatos" />
            <DetailList title="Demandas associadas" />
            <DetailCard title="Linha do tempo de interações">
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

function TextField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <Field label={label}><Input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></Field>;
}

function SelectTextField({ label, value, values, onChange, required = false }: { label: string; value: string; values: string[]; onChange: (value: string) => void; required?: boolean }) {
  return <Field label={label}><select required={required} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>{values.map((item) => <option key={item || "empty"} value={item}>{item || "Não informado"}</option>)}</select></Field>;
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <Field label={label}>
      <label className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        Sim
      </label>
    </Field>
  );
}

function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label} className="md:col-span-2"><Textarea value={value} onChange={(event) => onChange(event.target.value)} /></Field>;
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

function InfoGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return <div className="grid gap-3">{items.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"><span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span><span className="text-right text-sm font-bold text-slate-900">{value}</span></div>)}</div>;
}

function DetailList({ title }: { title: string }) {
  return <DetailCard title={title}><EmptyState title="Nenhum dado vinculado ainda." description="Esse relacionamento será conectado em uma próxima etapa." icon={Users} /></DetailCard>;
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"><span className="font-bold text-slate-900">{label}: </span><span className="font-medium text-slate-600">{value}</span></div>;
}

function IconButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: typeof Eye; onClick: MouseEventHandler<HTMLButtonElement>; danger?: boolean }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`rounded-lg border p-2 transition-colors ${danger ? "border-red-100 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}><Icon className="h-4 w-4" /></button>;
}

function toFormState(supporter: Supporter): SupporterFormState {
  return {
    id: supporter.id,
    leader_id: supporter.leader_id ?? "",
    full_name: supporter.full_name,
    nickname: supporter.nickname ?? "",
    phone: supporter.phone,
    email: supporter.email ?? "",
    birth_date: supporter.birth_date ?? "",
    gender: supporter.gender ?? "",
    cep: supporter.cep ?? "",
    street: supporter.street ?? "",
    number: supporter.number ?? "",
    complement: supporter.complement ?? "",
    neighborhood: supporter.neighborhood,
    city: supporter.city,
    state: supporter.state,
    reference_point: supporter.reference_point ?? "",
    geographic_precision: supporter.geographic_precision,
    person_type: supporter.person_type,
    political_status: supporter.political_status,
    data_confidence: supporter.data_confidence,
    source: supporter.source,
    internal_responsible: supporter.internal_responsible ?? "",
    last_contact: supporter.last_contact ?? "",
    next_action: supporter.next_action ?? "",
    next_action_date: supporter.next_action_date ?? "",
    lgpd_consent: supporter.lgpd_consent,
    notes: supporter.notes ?? "",
  };
}

function toInsertPayload(form: SupporterFormState): SupporterInsert {
  return {
    campaign_id: DEFAULT_CAMPAIGN_ID,
    leader_id: form.leader_id || null,
    full_name: form.full_name.trim(),
    nickname: nullable(form.nickname),
    phone: form.phone.trim(),
    email: nullable(form.email),
    birth_date: nullable(form.birth_date),
    gender: nullable(form.gender),
    cep: nullable(form.cep),
    street: nullable(form.street),
    number: nullable(form.number),
    complement: nullable(form.complement),
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    reference_point: nullable(form.reference_point),
    geographic_precision: form.geographic_precision,
    person_type: form.person_type,
    political_status: form.political_status,
    data_confidence: form.data_confidence,
    source: form.source,
    internal_responsible: nullable(form.internal_responsible),
    last_contact: nullable(form.last_contact),
    next_action: nullable(form.next_action),
    next_action_date: nullable(form.next_action_date),
    lgpd_consent: form.lgpd_consent,
    notes: nullable(form.notes),
  };
}

function toUpdatePayload(form: SupporterFormState): SupporterUpdate {
  return toInsertPayload(form);
}

function validateForm(form: SupporterFormState) {
  const required: Array<[keyof SupporterFormState, string]> = [
    ["full_name", "Nome completo"],
    ["phone", "Telefone/WhatsApp"],
    ["neighborhood", "Bairro"],
    ["city", "Cidade"],
    ["state", "Estado"],
    ["person_type", "Tipo de pessoa"],
    ["political_status", "Status político"],
    ["data_confidence", "Nível de confiança"],
    ["source", "Fonte do cadastro"],
  ];
  const missing = required.find(([key]) => !String(form[key] ?? "").trim());
  return missing ? `Preencha o campo obrigatório: ${missing[1]}.` : null;
}

function buildSummary(items: SupporterWithLeader[]) {
  return {
    confirmed: items.filter((item) => ["confirmado", "apoiador confirmado", "voto validado"].includes(normalize(item.political_status))).length,
    sympathizers: items.filter((item) => normalize(item.political_status) === "simpatizante").length,
    undecided: items.filter((item) => normalize(item.political_status) === "indeciso").length,
    missingAddress: items.filter((item) => !hasCompleteAddress(item)).length,
    highPrecision: items.filter((item) => getGeoPrecision(item) === "Alta").length,
    linked: items.filter((item) => Boolean(item.leader_id)).length,
    needsReturn: items.filter((item) => Boolean(item.next_action) && !["voto validado", "contrario"].includes(normalize(item.political_status))).length,
    week: items.filter((item) => isWithinLastDays(item.created_at, 7)).length,
    validated: items.filter((item) => normalize(item.political_status) === "voto validado").length,
  };
}

function withLeader(supporter: Supporter, leaders: Leader[]): SupporterWithLeader {
  return {
    ...supporter,
    leader: supporter.leader_id ? leaders.find((leader) => leader.id === supporter.leader_id) ?? null : null,
  };
}

function getLeaderLabel(supporter: SupporterWithLeader) {
  return supporter.leader ? `${supporter.leader.full_name} - ${supporter.leader.neighborhood}` : "Sem liderança";
}

function getGeoPrecision(person: Supporter): GeoPrecision {
  if (geoPrecisions.includes(person.geographic_precision as GeoPrecision)) return person.geographic_precision as GeoPrecision;
  if (person.street && person.number && person.neighborhood && person.city && person.state) return "Alta";
  if (person.cep && person.street) return "Média alta";
  if (person.street && person.neighborhood) return "Média";
  if (person.neighborhood && person.city) return "Baixa";
  return "Muito baixa";
}

function getQualityScore(person: Supporter) {
  if (person.full_name && person.phone && hasCompleteAddress(person) && person.leader_id && person.political_status) return 100;
  if (person.full_name && person.phone && person.neighborhood && person.city && person.leader_id) return 80;
  if (person.full_name && person.phone && person.neighborhood && person.city) return 60;
  if (person.full_name && person.phone) return 40;
  return 20;
}

function getQualityStage(score: number): QualityStage {
  if (score >= 100) return "Cadastro completo";
  if (score >= 80) return "Cadastro parcial";
  if (score >= 60) return "Cadastro básico";
  if (score >= 40) return "Cadastro mínimo";
  return "Cadastro incompleto";
}

function hasCompleteAddress(person: Supporter) {
  return Boolean(person.street && person.number && person.neighborhood && person.city && person.state);
}

function hasMapReadyAddress(person: Supporter) {
  return ["Alta", "Média alta", "Média"].includes(getGeoPrecision(person));
}

function getConversionStage(person: Supporter) {
  const status = normalize(person.political_status);
  if (status === "voto validado") return "Validado";
  if (status === "confirmado") return "Confirmado";
  if (status === "prioridade") return "Prioridade";
  if (status === "simpatizante") return "Conversão";
  return "Contato";
}

function isWithinLastDays(date: string | null, days: number) {
  if (!date) return false;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return false;
  const now = Date.now();
  return now - time <= days * 24 * 60 * 60 * 1000;
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
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

function getPoliticalStatusTone(status: string) {
  const normalized = normalize(status);
  if (["confirmado", "voto validado", "apoiador confirmado"].includes(normalized)) return "emerald";
  if (normalized === "prioridade") return "red";
  if (["indeciso", "precisa contato", "nao respondeu"].includes(normalized)) return "amber";
  if (normalized === "contrario") return "slate";
  return "blue";
}

function getPrecisionTone(precision: GeoPrecision) {
  if (precision === "Alta") return "emerald";
  if (precision === "Média alta" || precision === "Média") return "blue";
  if (precision === "Baixa") return "amber";
  return "red";
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
