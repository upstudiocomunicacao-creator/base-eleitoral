import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { hasPermission } from "@/lib/permissions";
import { DEFAULT_CAMPAIGN_ID } from "@/services/leaders";

type DiagnosticStatus = "pendente" | "ok" | "erro";

type DiagnosticResult = {
  id: string;
  name: string;
  group: string;
  status: DiagnosticStatus;
  detail: string;
  durationMs?: number;
};

const tableChecks = [
  { table: "leaders", label: "Lideranças" },
  { table: "supporters", label: "Apoiadores" },
  { table: "prospects", label: "Prospecção" },
  { table: "electoral_zones", label: "Zonas eleitorais" },
  { table: "field_agenda", label: "Agenda de campo" },
  { table: "demands", label: "Demandas" },
  { table: "report_history", label: "Histórico de relatórios" },
  { table: "import_history", label: "Histórico de importações" },
] as const;

export default function Diagnostico() {
  const { user, session, profile, refreshProfile } = useAuth();
  const [running, setRunning] = useState(false);
  const [cleanupRunning, setCleanupRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const canUseDiagnostics = hasPermission(profile, "configuracoes", "view");
  const summary = useMemo(() => ({
    total: results.length,
    ok: results.filter((item) => item.status === "ok").length,
    errors: results.filter((item) => item.status === "erro").length,
    pending: results.filter((item) => item.status === "pendente").length,
  }), [results]);

  async function runDiagnostics() {
    if (!canUseDiagnostics) return;
    setRunning(true);
    const next: DiagnosticResult[] = [];
    const add = (result: DiagnosticResult) => {
      const index = next.findIndex((item) => item.id === result.id);
      if (index >= 0) next[index] = result;
      else next.push(result);
      setResults([...next]);
    };

    await runCheck(add, "env", "Ambiente", "Configuração Supabase", async () => {
      if (!isSupabaseConfigured) throw new Error("Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas.");
      return "Supabase configurado no front-end.";
    });

    await runCheck(add, "session", "Autenticação", "Sessão do usuário", async () => {
      if (!session || !user) throw new Error("Usuário sem sessão ativa.");
      return `Sessão ativa para ${user.email ?? user.id}.`;
    });

    await runCheck(add, "profile", "Autenticação", "Perfil em users_profiles", async () => {
      await refreshProfile();
      if (!profile) throw new Error("Usuário autenticado, mas sem perfil cadastrado.");
      return `${profile.full_name} · ${profile.role} · ${profile.email}`;
    });

    await runCheck(add, "permissions", "Permissões", "Permissões administrativas", async () => {
      const canCreate = hasPermission(profile, "prospeccao", "create");
      const canEdit = hasPermission(profile, "prospeccao", "edit");
      const canDelete = hasPermission(profile, "prospeccao", "delete");
      const canConfig = hasPermission(profile, "configuracoes", "view");
      if (!canConfig) throw new Error("Perfil sem acesso às áreas administrativas.");
      return `Criar: ${yesNo(canCreate)} · Editar: ${yesNo(canEdit)} · Excluir: ${yesNo(canDelete)} · Configurações: ${yesNo(canConfig)}`;
    });

    for (const item of tableChecks) {
      await runCheck(add, `read-${item.table}`, "Leitura Supabase", item.label, async () => {
        const supabase = getSupabaseClient();
        const { count, error } = await supabase
          .from(item.table)
          .select("id", { count: "exact", head: true });
        if (error) throw error;
        return `${count ?? 0} registro(s) acessíveis.`;
      });
    }

    await runCheck(add, "crud-prospects", "CRUD temporário", "Prospecção", runProspectCrud);
    await runCheck(add, "crud-agenda", "CRUD temporário", "Agenda de campo", runAgendaCrud);
    await runCheck(add, "crud-demands", "CRUD temporário", "Demandas", runDemandCrud);

    await runCheck(add, "mapbox", "Mapas", "Mapbox", async () => {
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!token) throw new Error("VITE_MAPBOX_ACCESS_TOKEN não configurado.");
      if (!String(token).startsWith("pk.")) throw new Error("Token Mapbox público não parece válido.");
      return "Token público Mapbox configurado.";
    });

    await runCheck(add, "geocoding", "Mapas", "Geocodificação", async () => {
      const provider = import.meta.env.VITE_GEOCODING_PROVIDER ?? "mock";
      return `Provider atual: ${provider}.`;
    });

    setLastRun(new Date().toLocaleString("pt-BR"));
    setRunning(false);
  }

  async function cleanupTemporaryRecords() {
    setCleanupRunning(true);
    try {
      const supabase = getSupabaseClient();
      await Promise.all([
        supabase.from("prospects").delete().ilike("contact_name", "Teste Diagnóstico%"),
        supabase.from("field_agenda").delete().ilike("title", "Teste Diagnóstico%"),
        supabase.from("demands").delete().ilike("title", "Teste Diagnóstico%"),
      ]);
      setResults((current) => [
        {
          id: `cleanup-${Date.now()}`,
          name: "Limpeza de temporários",
          group: "Manutenção",
          status: "ok",
          detail: "Registros temporários de diagnóstico foram removidos.",
        },
        ...current,
      ]);
    } catch (error) {
      setResults((current) => [
        {
          id: `cleanup-${Date.now()}`,
          name: "Limpeza de temporários",
          group: "Manutenção",
          status: "erro",
          detail: getErrorMessage(error),
        },
        ...current,
      ]);
    } finally {
      setCleanupRunning(false);
    }
  }

  if (!canUseDiagnostics) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="O diagnóstico do sistema fica disponível apenas para perfis administrativos."
        icon={ShieldCheck}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sistema"
        title="Diagnóstico do Sistema"
        description="Validação administrativa de Supabase, sessão, permissões, dados reais, CRUD temporário, mapas e geocodificação."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={cleanupTemporaryRecords} disabled={cleanupRunning || running}>
              {cleanupRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Limpar testes
            </Button>
            <Button onClick={runDiagnostics} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Rodar diagnóstico
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Testes" value={summary.total} icon={Activity} tone="blue" loading={running && !results.length} />
        <MetricCard label="Aprovados" value={summary.ok} icon={CheckCircle2} tone="green" loading={running && !results.length} />
        <MetricCard label="Com erro" value={summary.errors} icon={XCircle} tone="red" loading={running && !results.length} />
        <MetricCard label="Última execução" value={lastRun ?? "-"} icon={RefreshCw} tone="indigo" loading={false} />
      </section>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-blue-600" />
            Resultado dos testes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!results.length ? (
            <EmptyState
              title="Nenhum diagnóstico executado"
              description="Clique em Rodar diagnóstico para verificar conexão, permissões e operações reais com registros temporários."
              icon={Activity}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Teste</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhe</TableHead>
                    <TableHead className="text-right">Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-slate-700">{item.group}</TableCell>
                      <TableCell className="font-bold text-slate-950">{item.name}</TableCell>
                      <TableCell><DiagnosticPill status={item.status} /></TableCell>
                      <TableCell className="max-w-xl text-sm font-medium text-slate-600">{item.detail}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-slate-400">{item.durationMs ? `${item.durationMs}ms` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/70 shadow-sm">
        <CardContent className="flex gap-3 p-4 text-amber-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-extrabold">Como funciona</div>
            <p className="mt-1 text-sm font-medium leading-6">
              O teste de CRUD cria registros temporários em Prospecção, Agenda e Demandas, edita os registros e remove tudo ao final. Se alguma etapa falhar, o detalhe aparece na tabela para orientar a correção.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function runCheck(
  add: (result: DiagnosticResult) => void,
  id: string,
  group: string,
  name: string,
  check: () => Promise<string>,
) {
  const start = performance.now();
  add({ id, group, name, status: "pendente", detail: "Executando..." });
  try {
    const detail = await check();
    add({ id, group, name, status: "ok", detail, durationMs: Math.round(performance.now() - start) });
  } catch (error) {
    add({ id, group, name, status: "erro", detail: getErrorMessage(error), durationMs: Math.round(performance.now() - start) });
  }
}

async function runProspectCrud() {
  const supabase = getSupabaseClient();
  const stamp = Date.now();
  const { data, error } = await supabase.from("prospects").insert({
    campaign_id: DEFAULT_CAMPAIGN_ID,
    contact_name: `Teste Diagnóstico Prospecção ${stamp}`,
    phone: "(21) 90000-0101",
    neighborhood: "Centro",
    city: "Maricá",
    funnel_stage: "Novo contato",
    origin: "Indicação",
    priority: "Média",
    confidence_level: "Médio",
    internal_responsible: "Diagnóstico do Sistema",
    next_action: "Remover teste",
    next_action_date: "2026-06-12",
    notes: "Registro temporário criado pelo diagnóstico.",
  }).select("*").single();
  if (error) throw error;

  try {
    const { error: updateError } = await supabase.from("prospects").update({ funnel_stage: "Simpatizante", priority: "Alta" }).eq("id", data.id);
    if (updateError) throw updateError;
    return "Criou, editou e removeu registro temporário.";
  } finally {
    await supabase.from("prospects").delete().eq("id", data.id);
  }
}

async function runAgendaCrud() {
  const supabase = getSupabaseClient();
  const stamp = Date.now();
  const { data, error } = await supabase.from("field_agenda").insert({
    campaign_id: DEFAULT_CAMPAIGN_ID,
    title: `Teste Diagnóstico Agenda ${stamp}`,
    action_type: "Visita de campo",
    action_date: "2026-06-12",
    start_time: "10:00",
    end_time: "11:00",
    location: "Centro de Maricá",
    neighborhood: "Centro",
    city: "Maricá",
    state: "RJ",
    internal_responsible: "Diagnóstico do Sistema",
    estimated_public: 12,
    objective: "Validar CRUD temporário",
    status: "Agendada",
    priority: "Média",
    next_step: "Remover teste",
    notes: "Registro temporário criado pelo diagnóstico.",
  }).select("*").single();
  if (error) throw error;

  try {
    const { error: updateError } = await supabase.from("field_agenda").update({ status: "Concluída", actual_public: 9 }).eq("id", data.id);
    if (updateError) throw updateError;
    return "Criou, editou e removeu registro temporário.";
  } finally {
    await supabase.from("field_agenda").delete().eq("id", data.id);
  }
}

async function runDemandCrud() {
  const supabase = getSupabaseClient();
  const stamp = Date.now();
  const { data, error } = await supabase.from("demands").insert({
    campaign_id: DEFAULT_CAMPAIGN_ID,
    title: `Teste Diagnóstico Demanda ${stamp}`,
    description: "Demanda temporária criada para validar CRUD.",
    person_name: "Pessoa Teste Diagnóstico",
    phone: "(21) 90000-0102",
    category: "Saúde",
    priority: "Média",
    status: "Aberta",
    neighborhood: "Centro",
    city: "Maricá",
    state: "RJ",
    opening_date: "2026-06-05",
    return_date: "2026-06-12",
    next_action: "Remover teste",
    internal_responsible: "Diagnóstico do Sistema",
    notes: "Registro temporário criado pelo diagnóstico.",
  }).select("*").single();
  if (error) throw error;

  try {
    const { error: updateError } = await supabase.from("demands").update({ status: "Em andamento", priority: "Alta" }).eq("id", data.id);
    if (updateError) throw updateError;
    return "Criou, editou e removeu registro temporário.";
  } finally {
    await supabase.from("demands").delete().eq("id", data.id);
  }
}

function DiagnosticPill({ status }: { status: DiagnosticStatus }) {
  if (status === "ok") return <StatusPill label="Aprovado" tone="green" />;
  if (status === "erro") return <StatusPill label="Erro" tone="red" />;
  return <StatusPill label="Executando" tone="amber" />;
}

function yesNo(value: boolean) {
  return value ? "sim" : "não";
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message);
  return "Erro inesperado.";
}
