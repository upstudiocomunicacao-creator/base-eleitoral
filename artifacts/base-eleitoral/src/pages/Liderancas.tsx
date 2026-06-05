import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit,
  Eye,
  Loader2,
  MapPinned,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserRound,
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
import { createLeader, deleteLeader, DEFAULT_CAMPAIGN_ID, isLeadersSupabaseReady, listLeaders, updateLeader } from "@/services/leaders";
import type { Database, Leader } from "@/types/database";

type LeaderInsert = Database["public"]["Tables"]["leaders"]["Insert"];
type LeaderUpdate = Database["public"]["Tables"]["leaders"]["Update"];
type AttentionLevel = "Crítico" | "Atenção" | "Estável" | "Forte";

type Filters = {
  search: string;
  cidade: string;
  bairro: string;
  tipo: string;
  status: string;
  confianca: string;
  responsavel: string;
  faixaValidados: string;
};

type LeaderFormState = {
  id: string | null;
  full_name: string;
  political_nickname: string;
  phone: string;
  email: string;
  leader_type: string;
  status: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  territory_region: string;
  geographic_precision: string;
  internal_responsible: string;
  registered_supporters: number;
  estimated_direct_supporters: number;
  estimated_indirect_supporters: number;
  declared_votes: number;
  validated_votes: number;
  confidence_level: string;
  estimate_source: string;
  proof_type: string;
  last_update: string;
  next_action: string;
  notes: string;
};

const emptyFilters: Filters = {
  search: "",
  cidade: "todos",
  bairro: "todos",
  tipo: "todos",
  status: "todos",
  confianca: "todos",
  responsavel: "todos",
  faixaValidados: "todos",
};

const emptyForm: LeaderFormState = {
  id: null,
  full_name: "",
  political_nickname: "",
  phone: "",
  email: "",
  leader_type: "Comunitária",
  status: "Ativa",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "Maricá",
  state: "RJ",
  territory_region: "",
  geographic_precision: "Média",
  internal_responsible: "Coordenação Territorial",
  registered_supporters: 0,
  estimated_direct_supporters: 0,
  estimated_indirect_supporters: 0,
  declared_votes: 0,
  validated_votes: 0,
  confidence_level: "Médio",
  estimate_source: "",
  proof_type: "Reunião",
  last_update: new Date().toISOString().slice(0, 10),
  next_action: "",
  notes: "",
};

export default function Liderancas() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState<LeaderFormState | null>(null);
  const [selected, setSelected] = useState<Leader | null>(null);

  async function loadLeaders() {
    setLoading(true);
    setError(null);

    if (!isLeadersSupabaseReady()) {
      setLeaders([]);
      setError("Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar lideranças reais.");
      setLoading(false);
      return;
    }

    try {
      const data = await listLeaders();
      setLeaders(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeaders();
  }, []);

  const filterOptions = useMemo(() => ({
    cidades: unique(leaders.map((item) => item.city)),
    bairros: unique(leaders.map((item) => item.neighborhood)),
    tipos: unique(leaders.map((item) => item.leader_type)),
    status: unique(leaders.map((item) => item.status)),
    confiancas: unique(leaders.map((item) => item.confidence_level)),
    responsaveis: unique(leaders.map((item) => item.internal_responsible ?? "Não definido")),
  }), [leaders]);

  const filtered = useMemo(() => {
    const term = normalize(filters.search);
    return leaders.filter((leader) => {
      const textMatch = !term || [
        leader.full_name,
        leader.political_nickname,
        leader.neighborhood,
        leader.city,
        leader.leader_type,
        leader.internal_responsible,
      ].some((value) => normalize(value ?? "").includes(term));

      const validated = leader.validated_votes ?? 0;
      const rangeMatch =
        filters.faixaValidados === "todos" ||
        (filters.faixaValidados === "0-100" && validated <= 100) ||
        (filters.faixaValidados === "101-300" && validated >= 101 && validated <= 300) ||
        (filters.faixaValidados === "301+" && validated >= 301);

      return (
        textMatch &&
        matches(filters.cidade, leader.city) &&
        matches(filters.bairro, leader.neighborhood) &&
        matches(filters.tipo, leader.leader_type) &&
        matches(filters.status, leader.status) &&
        matches(filters.confianca, leader.confidence_level) &&
        matches(filters.responsavel, leader.internal_responsible ?? "Não definido") &&
        rangeMatch
      );
    });
  }, [filters, leaders]);

  const summary = useMemo(() => buildSummary(filtered), [filtered]);

  function openCreate() {
    setEditing({ ...emptyForm, last_update: new Date().toISOString().slice(0, 10) });
    setFormOpen(true);
  }

  function openEdit(record: Leader) {
    setEditing(toFormState(record));
    setFormOpen(true);
  }

  function openDetails(record: Leader) {
    setSelected(record);
    setDetailsOpen(true);
  }

  async function saveLeadership(event: FormEvent) {
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
        const saved = await updateLeader(editing.id, toUpdatePayload(editing));
        setLeaders((current) => current.map((item) => (item.id === saved.id ? saved : item)));
        toast({ title: "Liderança atualizada", description: "As alterações foram salvas no Supabase." });
      } else {
        const saved = await createLeader(toInsertPayload(editing));
        setLeaders((current) => [saved, ...current]);
        toast({ title: "Liderança criada", description: "O novo registro foi salvo no Supabase." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast({ title: "Não foi possível salvar", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removeLeadership(record: Leader) {
    const confirmed = window.confirm(`Excluir a liderança "${record.full_name}"?\n\nEssa ação não poderá ser desfeita.`);
    if (!confirmed) return;

    try {
      await deleteLeader(record.id);
      setLeaders((current) => current.filter((item) => item.id !== record.id));
      toast({ title: "Liderança excluída", description: "O registro foi removido do Supabase." });
    } catch (err) {
      toast({ title: "Não foi possível excluir", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base Territorial"
        title="Lideranças"
        description={`${filtered.length} lideranças no recorte atual - dados reais da tabela leaders no Supabase.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadLeaders()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <PermissionGate module="liderancas" action="create">
              <Button onClick={openCreate}>
                <PlusCircle className="h-4 w-4" /> Nova Liderança
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {error ? <ConnectionWarning message={error} /> : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
        <MetricCard label="Total" value={filtered.length} icon={Users} tone="blue" loading={loading} />
        <MetricCard label="Ativas" value={summary.active} icon={CheckCircle2} tone="emerald" loading={loading} />
        <MetricCard label="Estimados" value={summary.estimated} icon={TrendingUp} tone="violet" loading={loading} />
        <MetricCard label="Declarados" value={summary.declared} icon={UserRound} tone="amber" loading={loading} />
        <MetricCard label="Validados" value={summary.validated} icon={ShieldCheck} tone="green" loading={loading} />
        <MetricCard label="Confiança" value={summary.confidence} icon={ShieldCheck} tone="cyan" loading={loading} />
        <MetricCard label="Bairros" value={summary.neighborhoods} icon={MapPinned} tone="indigo" loading={loading} />
        <MetricCard label="Atenção" value={summary.attention} icon={AlertTriangle} tone="red" loading={loading} />
      </div>

      <FiltersPanel filters={filters} setFilters={setFilters} options={filterOptions} />

      <LeadersTable
        loading={loading}
        leaders={filtered}
        onOpenDetails={openDetails}
        onEdit={openEdit}
        onDelete={removeLeadership}
      />

      <LeadershipFormSheet
        open={formOpen}
        record={editing}
        saving={saving}
        setRecord={setEditing}
        onOpenChange={setFormOpen}
        onSubmit={saveLeadership}
      />

      <LeadershipDetailSheet
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
    tipos: string[];
    status: string[];
    confiancas: string[];
    responsaveis: string[];
  };
}) {
  return (
    <Card className="premium-card">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <Field label="Buscar por nome" className="lg:min-w-72 lg:flex-1">
            <Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Nome, apelido, bairro ou responsável" />
          </Field>
          <FilterSelect label="Cidade" value={filters.cidade} values={options.cidades} onChange={(value) => setFilters({ ...filters, cidade: value })} />
          <FilterSelect label="Bairro" value={filters.bairro} values={options.bairros} onChange={(value) => setFilters({ ...filters, bairro: value })} />
          <FilterSelect label="Tipo" value={filters.tipo} values={options.tipos} onChange={(value) => setFilters({ ...filters, tipo: value })} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <FilterSelect label="Status" value={filters.status} values={options.status} onChange={(value) => setFilters({ ...filters, status: value })} />
          <FilterSelect label="Confiança" value={filters.confianca} values={options.confiancas} onChange={(value) => setFilters({ ...filters, confianca: value })} />
          <FilterSelect label="Responsável interno" value={filters.responsavel} values={options.responsaveis} onChange={(value) => setFilters({ ...filters, responsavel: value })} />
          <Field label="Faixa de votos validados">
            <select className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={filters.faixaValidados} onChange={(event) => setFilters({ ...filters, faixaValidados: event.target.value })}>
              <option value="todos">Todas</option>
              <option value="0-100">0 a 100</option>
              <option value="101-300">101 a 300</option>
              <option value="301+">301+</option>
            </select>
          </Field>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={() => setFilters(emptyFilters)}>Limpar filtros</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeadersTable({
  loading,
  leaders,
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  leaders: Leader[];
  onOpenDetails: (record: Leader) => void;
  onEdit: (record: Leader) => void;
  onDelete: (record: Leader) => void;
}) {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader className="section-divider border-t-0 px-5 py-4">
        <CardTitle className="text-base font-extrabold text-slate-950">Força Territorial</CardTitle>
        <p className="text-sm font-medium text-slate-500">Clique em uma liderança para abrir a ficha individual.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-64 px-5">Nome completo</TableHead>
                <TableHead className="min-w-40">Apelido político</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Estimados</TableHead>
                <TableHead className="text-right">Declarados</TableHead>
                <TableHead className="text-right">Validados</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead className="min-w-44">Próxima ação</TableHead>
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
              ) : leaders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="p-6">
                    <EmptyState title="Nenhuma liderança encontrada" description="Ajuste os filtros ou cadastre uma nova liderança para ampliar a base territorial." icon={Users} />
                  </TableCell>
                </TableRow>
              ) : (
                leaders.map((leader) => {
                  const potential = getPotentialTotal(leader);
                  const validationRate = getValidationRate(leader);
                  const attentionLevel = getAttentionLevel(leader);
                  return (
                    <TableRow key={leader.id} className="cursor-pointer" onClick={() => onOpenDetails(leader)}>
                      <TableCell className="px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-extrabold text-blue-700 ring-1 ring-blue-100">
                            {getInitials(leader.full_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-extrabold text-slate-950">{leader.full_name}</div>
                            <div className="truncate text-xs font-medium text-slate-500"><SensitiveText value={leader.phone} kind="phone" fallback="WhatsApp não informado" /></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">{leader.political_nickname || "-"}</TableCell>
                      <TableCell className="font-medium text-slate-600">{leader.neighborhood}</TableCell>
                      <TableCell className="text-slate-600">{leader.city}</TableCell>
                      <TableCell><StatusPill label={leader.leader_type} tone="blue" /></TableCell>
                      <TableCell><StatusPill label={leader.status} tone={getStatusTone(leader.status)} /></TableCell>
                      <TableCell className="text-right font-bold text-slate-700">{potential.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right font-bold text-slate-700">{leader.declared_votes.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right text-base font-extrabold text-blue-700">{leader.validated_votes.toLocaleString("pt-BR")}</TableCell>
                      <TableCell><StatusPill label={leader.confidence_level} tone={getConfidenceTone(leader.confidence_level)} /></TableCell>
                      <TableCell>
                        <div className="w-24">
                          <div className="mb-1 text-xs font-bold text-slate-600">{validationRate}%</div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${validationRate}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-44 truncate text-sm font-medium text-slate-600">{leader.next_action || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IconButton label="Visualizar" onClick={(event) => { event.stopPropagation(); onOpenDetails(leader); }} icon={Eye} />
                          <PermissionGate module="liderancas" action="edit"><IconButton label="Editar" onClick={(event) => { event.stopPropagation(); onEdit(leader); }} icon={Edit} /></PermissionGate>
                          <PermissionGate module="liderancas" action="delete"><IconButton label="Excluir" danger onClick={(event) => { event.stopPropagation(); void onDelete(leader); }} icon={Trash2} /></PermissionGate>
                        </div>
                        <div className="mt-2">
                          <StatusPill label={attentionLevel} tone={getAttentionTone(attentionLevel)} />
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

function LeadershipFormSheet({
  open,
  record,
  saving,
  setRecord,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  record: LeaderFormState | null;
  saving: boolean;
  setRecord: (record: LeaderFormState | null) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  function update<K extends keyof LeaderFormState>(key: K, value: LeaderFormState[K]) {
    if (!record) return;
    setRecord({ ...record, [key]: value });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-0 bg-slate-50 p-0 sm:max-w-4xl">
        <SheetHeader className="bg-gradient-to-br from-slate-950 to-blue-950 p-6 pb-8 text-white">
          <SheetTitle className="text-2xl font-extrabold text-white">{record?.id ? "Editar liderança" : "Nova liderança"}</SheetTitle>
          <SheetDescription className="text-sm font-medium leading-6 text-white/80">
            Registre dados territoriais, potencial político e comprovação da força da liderança.
          </SheetDescription>
        </SheetHeader>

        {record ? (
          <form className="space-y-5 p-5 sm:p-6" onSubmit={onSubmit}>
            <FormSection title="Dados básicos">
              <TextField required label="Nome completo" value={record.full_name} onChange={(value) => update("full_name", value)} />
              <TextField label="Apelido político" value={record.political_nickname} onChange={(value) => update("political_nickname", value)} />
              <TextField required label="Telefone/WhatsApp" value={record.phone} onChange={(value) => update("phone", value)} />
              <TextField label="E-mail" value={record.email} onChange={(value) => update("email", value)} />
              <SelectTextField required label="Tipo de liderança" value={record.leader_type} values={["Comunitária", "Regional", "Territorial", "Juventude", "Comerciante", "Religiosa", "Temática", "Política"]} onChange={(value) => update("leader_type", value)} />
              <SelectTextField required label="Status" value={record.status} values={["Ativa", "Atenção", "Em validação", "Inativa"]} onChange={(value) => update("status", value)} />
              <TextField label="Responsável interno" value={record.internal_responsible} onChange={(value) => update("internal_responsible", value)} />
              <AreaField label="Observações" value={record.notes} onChange={(value) => update("notes", value)} />
            </FormSection>

            <FormSection title="Endereço e território">
              <TextField label="CEP" value={record.cep} onChange={(value) => update("cep", value)} />
              <TextField label="Rua" value={record.street} onChange={(value) => update("street", value)} />
              <TextField label="Número" value={record.number} onChange={(value) => update("number", value)} />
              <TextField label="Complemento" value={record.complement} onChange={(value) => update("complement", value)} />
              <TextField required label="Bairro" value={record.neighborhood} onChange={(value) => update("neighborhood", value)} />
              <TextField required label="Cidade" value={record.city} onChange={(value) => update("city", value)} />
              <TextField required label="Estado" value={record.state} onChange={(value) => update("state", value)} />
              <TextField label="Região de atuação" value={record.territory_region} onChange={(value) => update("territory_region", value)} />
              <SelectTextField required label="Precisão geográfica" value={record.geographic_precision} values={["Alta", "Média alta", "Média", "Baixa", "Muito baixa"]} onChange={(value) => update("geographic_precision", value)} />
            </FormSection>

            <FormSection title="Potencial político">
              <NumberField label="Apoiadores cadastrados" value={record.registered_supporters} onChange={(value) => update("registered_supporters", value)} />
              <NumberField label="Estimados diretos" value={record.estimated_direct_supporters} onChange={(value) => update("estimated_direct_supporters", value)} />
              <NumberField label="Estimados indiretos" value={record.estimated_indirect_supporters} onChange={(value) => update("estimated_indirect_supporters", value)} />
              <NumberField label="Votos declarados" value={record.declared_votes} onChange={(value) => update("declared_votes", value)} />
              <NumberField label="Votos validados" value={record.validated_votes} onChange={(value) => update("validated_votes", value)} />
              <SelectTextField required label="Grau de confiança" value={record.confidence_level} values={["Baixo", "Médio", "Alto"]} onChange={(value) => update("confidence_level", value)} />
              <TextField label="Fonte da estimativa" value={record.estimate_source} onChange={(value) => update("estimate_source", value)} />
              <SelectTextField label="Comprovação" value={record.proof_type} values={["Lista", "Reunião", "Evento", "Histórico", "Grupo WhatsApp", "Lista parcial", "Sem comprovação"]} onChange={(value) => update("proof_type", value)} />
              <TextField label="Última atualização" type="date" value={record.last_update} onChange={(value) => update("last_update", value)} />
              <TextField label="Próxima ação" value={record.next_action} onChange={(value) => update("next_action", value)} />
            </FormSection>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Salvar liderança
              </Button>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function LeadershipDetailSheet({ open, record, onOpenChange }: { open: boolean; record: Leader | null; onOpenChange: (open: boolean) => void }) {
  if (!record) {
    return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent /></Sheet>;
  }

  const potential = getPotentialTotal(record);
  const validation = getValidationRate(record);
  const attention = getAttentionLevel(record);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-0 bg-slate-50 p-0 sm:max-w-4xl">
        <SheetHeader className="bg-gradient-to-br from-blue-950 to-emerald-800 p-6 pb-8 text-white">
          <SheetTitle className="flex items-center gap-3 text-2xl font-extrabold text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-sm font-extrabold ring-1 ring-white/20">{getInitials(record.full_name)}</div>
            {record.full_name}
          </SheetTitle>
          <SheetDescription className="text-sm font-medium leading-6 text-white/80">
            {record.political_nickname || "Sem apelido político"} - {record.neighborhood}, {record.city}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <DetailMetric label="Potencial total" value={potential.toLocaleString("pt-BR")} />
            <DetailMetric label="Declarados" value={record.declared_votes.toLocaleString("pt-BR")} />
            <DetailMetric label="Validados" value={record.validated_votes.toLocaleString("pt-BR")} />
            <DetailMetric label="Taxa" value={`${validation}%`} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <DetailCard title="Dados principais">
              <InfoGrid items={[
                ["Tipo", record.leader_type],
                ["Status", record.status],
                ["Confiança", record.confidence_level],
                ["Nível de atenção", attention],
                ["Responsável interno", record.internal_responsible ?? "-"],
                ["Telefone", <SensitiveText value={record.phone} kind="phone" />],
                ["E-mail", <SensitiveText value={record.email} kind="email" />],
                ["Próxima ação", record.next_action ?? "-"],
              ]} />
            </DetailCard>

            <DetailCard title="Mapa/área de atuação simulada">
              <div className="relative h-56 overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ecfeff_45%,#f0fdf4_100%)]">
                <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-blue-300 bg-blue-400/15" />
                <div className="absolute bottom-8 right-10 h-24 w-24 rounded-full border border-emerald-300 bg-emerald-400/20" />
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700 shadow-[0_0_0_10px_rgba(37,99,235,0.14)]" />
                <div className="absolute bottom-4 left-4 rounded-lg bg-white/85 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
                  {record.territory_region || `${record.neighborhood} e entorno`}
                </div>
              </div>
            </DetailCard>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <DetailCard title="Endereço e território">
              <InfoGrid items={[
                ["CEP", record.cep ?? "-"],
                ["Rua", record.street ?? "-"],
                ["Número", record.number ?? "-"],
                ["Complemento", record.complement ?? "-"],
                ["Bairro", record.neighborhood],
                ["Cidade", record.city],
                ["Estado", record.state],
                ["Precisão", record.geographic_precision],
              ]} />
            </DetailCard>

            <DetailCard title="Potencial político">
              <InfoGrid items={[
                ["Apoiadores cadastrados", String(record.registered_supporters)],
                ["Estimados diretos", String(record.estimated_direct_supporters)],
                ["Estimados indiretos", String(record.estimated_indirect_supporters)],
                ["Fonte", record.estimate_source ?? "-"],
                ["Comprovação", record.proof_type ?? "-"],
                ["Última atualização", record.last_update ?? "-"],
              ]} />
            </DetailCard>

            <DetailCard title="Observações estratégicas">
              <p className="text-sm font-medium leading-6 text-slate-600">{record.notes || "Sem observações estratégicas registradas."}</p>
              <div className="mt-4">
                <StatusPill label={attention} tone={getAttentionTone(attention)} />
              </div>
            </DetailCard>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <DetailList title="Apoiadores vinculados" />
            <DetailList title="Histórico de ações" />
            <DetailList title="Demandas associadas" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</span>
      {children}
    </label>
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

function TextField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <Field label={label}><Input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></Field>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <Field label={label}><Input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>;
}

function SelectTextField({ label, value, values, onChange, required = false }: { label: string; value: string; values: string[]; onChange: (value: string) => void; required?: boolean }) {
  return (
    <Field label={label}>
      <select required={required} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </Field>
  );
}

function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label} className="md:col-span-2"><Textarea value={value} onChange={(event) => onChange(event.target.value)} /></Field>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="premium-card">
      <CardHeader className="px-5 pb-2 pt-5">
        <CardTitle className="text-base font-extrabold text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{children}</CardContent>
    </Card>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="premium-card">
      <CardHeader className="px-5 pb-2 pt-5">
        <CardTitle className="text-base font-extrabold text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">{children}</CardContent>
    </Card>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="premium-card rounded-lg p-4">
      <div className="text-2xl font-extrabold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div className="grid gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
          <span className="text-right text-sm font-bold text-slate-900">{value}</span>
        </div>
      ))}
    </div>
  );
}

function DetailList({ title }: { title: string }) {
  return (
    <DetailCard title={title}>
      <EmptyState title="Nenhum dado vinculado ainda." description="Esse relacionamento será conectado em uma próxima etapa." icon={Users} />
    </DetailCard>
  );
}

function IconButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: typeof Eye; onClick: React.MouseEventHandler<HTMLButtonElement>; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded-lg border p-2 transition-colors ${danger ? "border-red-100 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function toFormState(leader: Leader): LeaderFormState {
  return {
    id: leader.id,
    full_name: leader.full_name,
    political_nickname: leader.political_nickname ?? "",
    phone: leader.phone,
    email: leader.email ?? "",
    leader_type: leader.leader_type,
    status: leader.status,
    cep: leader.cep ?? "",
    street: leader.street ?? "",
    number: leader.number ?? "",
    complement: leader.complement ?? "",
    neighborhood: leader.neighborhood,
    city: leader.city,
    state: leader.state,
    territory_region: leader.territory_region ?? "",
    geographic_precision: leader.geographic_precision,
    internal_responsible: leader.internal_responsible ?? "",
    registered_supporters: leader.registered_supporters,
    estimated_direct_supporters: leader.estimated_direct_supporters,
    estimated_indirect_supporters: leader.estimated_indirect_supporters,
    declared_votes: leader.declared_votes,
    validated_votes: leader.validated_votes,
    confidence_level: leader.confidence_level,
    estimate_source: leader.estimate_source ?? "",
    proof_type: leader.proof_type ?? "",
    last_update: leader.last_update ?? "",
    next_action: leader.next_action ?? "",
    notes: leader.notes ?? "",
  };
}

function toInsertPayload(form: LeaderFormState): LeaderInsert {
  return {
    campaign_id: DEFAULT_CAMPAIGN_ID,
    full_name: form.full_name.trim(),
    political_nickname: nullable(form.political_nickname),
    phone: form.phone.trim(),
    email: nullable(form.email),
    leader_type: form.leader_type,
    status: form.status,
    cep: nullable(form.cep),
    street: nullable(form.street),
    number: nullable(form.number),
    complement: nullable(form.complement),
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    territory_region: nullable(form.territory_region),
    geographic_precision: form.geographic_precision,
    internal_responsible: nullable(form.internal_responsible),
    registered_supporters: Number(form.registered_supporters || 0),
    estimated_direct_supporters: Number(form.estimated_direct_supporters || 0),
    estimated_indirect_supporters: Number(form.estimated_indirect_supporters || 0),
    declared_votes: Number(form.declared_votes || 0),
    validated_votes: Number(form.validated_votes || 0),
    confidence_level: form.confidence_level,
    estimate_source: nullable(form.estimate_source),
    proof_type: nullable(form.proof_type),
    last_update: nullable(form.last_update),
    next_action: nullable(form.next_action),
    notes: nullable(form.notes),
  };
}

function toUpdatePayload(form: LeaderFormState): LeaderUpdate {
  return toInsertPayload(form);
}

function validateForm(form: LeaderFormState) {
  const required: Array<[keyof LeaderFormState, string]> = [
    ["full_name", "Nome completo"],
    ["phone", "Telefone/WhatsApp"],
    ["leader_type", "Tipo de liderança"],
    ["status", "Status"],
    ["neighborhood", "Bairro"],
    ["city", "Cidade"],
    ["state", "Estado"],
    ["confidence_level", "Grau de confiança"],
  ];

  const missing = required.find(([key]) => !String(form[key] ?? "").trim());
  return missing ? `Preencha o campo obrigatório: ${missing[1]}.` : null;
}

function buildSummary(items: Leader[]) {
  const active = items.filter((item) => normalize(item.status).includes("ativa") || normalize(item.status).includes("ativo")).length;
  const estimated = items.reduce((total, item) => total + getPotentialTotal(item), 0);
  const declared = items.reduce((total, item) => total + item.declared_votes, 0);
  const validated = items.reduce((total, item) => total + item.validated_votes, 0);
  const confidence = getAverageConfidence(items);
  const neighborhoods = new Set(items.map((item) => item.neighborhood).filter(Boolean)).size;
  const attention = items.filter((item) => ["Crítico", "Atenção"].includes(getAttentionLevel(item))).length;
  return { active, estimated, declared, validated, confidence, neighborhoods, attention };
}

function getPotentialTotal(leader: Leader) {
  return (leader.estimated_direct_supporters ?? 0) + (leader.estimated_indirect_supporters ?? 0);
}

function getValidationRate(leader: Leader) {
  const declared = leader.declared_votes ?? 0;
  if (!declared) return 0;
  return Math.min(100, Math.round(((leader.validated_votes ?? 0) / declared) * 100));
}

function getAttentionLevel(leader: Leader): AttentionLevel {
  const declared = leader.declared_votes ?? 0;
  const validated = leader.validated_votes ?? 0;
  const rate = getValidationRate(leader);
  const confidence = normalize(leader.confidence_level);
  const proof = normalize(leader.proof_type ?? "");
  const weakProof = !proof || proof.includes("parcial") || proof.includes("sem comprovacao");

  if (declared >= 250 && rate < 50) return "Crítico";
  if (weakProof || rate < 60) return "Atenção";
  if (confidence === "alto" && validated >= 250) return "Forte";
  return "Estável";
}

function getAverageConfidence(items: Leader[]) {
  if (!items.length) return "0,0";
  const score = items.reduce((total, item) => {
    const confidence = normalize(item.confidence_level);
    return total + (confidence === "alto" ? 10 : confidence === "medio" ? 6 : 3);
  }, 0);
  return (score / items.length).toFixed(1).replace(".", ",");
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

function getStatusTone(status: string) {
  const normalized = normalize(status);
  if (normalized.includes("ativa") || normalized.includes("ativo")) return "emerald";
  if (normalized.includes("validacao") || normalized.includes("atencao")) return "amber";
  return "slate";
}

function getConfidenceTone(confidence: string) {
  const normalized = normalize(confidence);
  if (normalized === "alto") return "emerald";
  if (normalized === "medio") return "amber";
  return "red";
}

function getAttentionTone(level: AttentionLevel) {
  if (level === "Crítico") return "red";
  if (level === "Atenção") return "amber";
  if (level === "Forte") return "emerald";
  return "blue";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return "Erro inesperado ao acessar o Supabase.";
}
