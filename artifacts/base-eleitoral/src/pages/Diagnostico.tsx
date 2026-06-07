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
import { getLeaderMonthlyMetricsSetupMessage, isLeaderMonthlyMetricsSchemaError } from "@/services/leaderMonthlyMetrics";
import { geocodeAddress, getGeocodingProvider, getGeocodingProviderLabel, getGeocodingStats } from "@/services/geocoding";
import { getMaricaMapData, getRJMapData } from "@/services/mapData";

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
  { table: "leaders", label: "Cadastros territoriais" },
  { table: "leader_monthly_metrics", label: "Métricas mensais" },
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
      const canCreate = hasPermission(profile, "liderancas", "create");
      const canEdit = hasPermission(profile, "liderancas", "edit");
      const canDelete = hasPermission(profile, "liderancas", "delete");
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

    await runCheck(add, "crud-operational", "CRUD temporário", "Cadastros e métricas mensais", runOperationalCrud);

    await runCheck(add, "mapbox", "Mapas", "Mapbox", async () => {
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!token) throw new Error("VITE_MAPBOX_ACCESS_TOKEN não configurado.");
      if (!String(token).startsWith("pk.")) throw new Error("Token Mapbox público não parece válido.");
      return "Token público Mapbox configurado.";
    });

    await runCheck(add, "geocoding", "Mapas", "Geocodificação", async () => {
      const provider = getGeocodingProvider();
      const providerLabel = getGeocodingProviderLabel();
      if (provider !== "mapbox") return `Provider atual: ${providerLabel}. Sem consulta externa.`;
      const coordinates = await geocodeAddress({
        street: "Rua Álvares de Castro",
        number: "103",
        neighborhood: "Centro",
        city: "Maricá",
        state: "RJ",
      });
      return `Provider atual: ${providerLabel}. Resultado: ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)} com ${Math.round(coordinates.geocoding_confidence * 100)}% de confiança.`;
    });

    await runCheck(add, "geocoding-coverage", "Mapas", "Cobertura de coordenadas", async () => {
      const stats = await getGeocodingStats();
      const totalKnown = stats.total || 0;
      const readiness = totalKnown ? Math.round((stats.withCoordinates / totalKnown) * 100) : 100;
      return `${stats.withCoordinates}/${totalKnown} registros com latitude/longitude (${readiness}%). Pendentes: ${stats.pending}. Falhas: ${stats.failed}.`;
    });

    await runCheck(add, "map-rj-readiness", "Mapas", "Mapa RJ real", async () => {
      const mapData = await getRJMapData();
      return `${mapData.points.length} ponto(s) carregados no RJ. ${mapData.withoutCoordinates.length} registro(s) ainda sem coordenadas.`;
    });

    await runCheck(add, "map-marica-readiness", "Mapas", "Mapa Maricá real", async () => {
      const mapData = await getMaricaMapData();
      return `${mapData.points.length} ponto(s) carregados em Maricá. ${mapData.withoutCoordinates.length} registro(s) ainda sem coordenadas.`;
    });

    setLastRun(new Date().toLocaleString("pt-BR"));
    setRunning(false);
  }

  async function cleanupTemporaryRecords() {
    setCleanupRunning(true);
    try {
      const supabase = getSupabaseClient();
      const { data: temporaryLeaders, error } = await supabase
        .from("leaders")
        .select("id")
        .ilike("full_name", "Teste Diagnóstico%");
      if (error) throw error;
      const ids = (temporaryLeaders ?? []).map((item) => item.id);
      if (ids.length) {
        await supabase.from("leader_monthly_metrics").delete().in("leader_id", ids);
        await supabase.from("leaders").delete().in("id", ids);
      }
      setResults((current) => [
        {
          id: `cleanup-${Date.now()}`,
          name: "Limpeza de temporários",
          group: "Manutenção",
          status: "ok",
          detail: ids.length ? `${ids.length} registro(s) temporário(s) removido(s).` : "Nenhum registro temporário encontrado.",
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
        description="Validação administrativa de Supabase, sessão, permissões, cadastros territoriais, mapas e geocodificação."
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
              description="Clique em Rodar diagnóstico para verificar conexão, permissões e operações reais da versão enxuta."
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
              O teste de CRUD cria um cadastro territorial temporário, registra uma métrica mensal, edita os dados e remove tudo ao final. Se alguma etapa falhar, o detalhe aparece na tabela para orientar a correção.
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

async function runOperationalCrud() {
  const supabase = getSupabaseClient();
  const stamp = Date.now();
  const { data: leader, error } = await supabase.from("leaders").insert({
    campaign_id: DEFAULT_CAMPAIGN_ID,
    full_name: `Teste Diagnóstico Liderança ${stamp}`,
    political_nickname: "Teste automático",
    phone: "(21) 90000-0101",
    email: null,
    leader_type: "Liderança Maricá",
    status: "Em validação",
    neighborhood: "Centro",
    city: "Maricá",
    state: "RJ",
    territory_region: "Sede / Maricá",
    geographic_precision: "Média",
    internal_responsible: "Diagnóstico do Sistema",
    registered_supporters: 10,
    estimated_direct_supporters: 15,
    estimated_indirect_supporters: 5,
    declared_votes: 20,
    validated_votes: 8,
    confidence_level: "Médio",
    estimate_source: "Teste automático",
    proof_type: "Sem comprovação",
    last_update: "2026-06-05",
    next_action: "Remover teste",
    notes: "Registro temporário criado pelo diagnóstico.",
  }).select("*").single();
  if (error) throw error;

  try {
    const { data: metric, error: metricError } = await supabase.from("leader_monthly_metrics").insert({
      campaign_id: DEFAULT_CAMPAIGN_ID,
      leader_id: leader.id,
      month_ref: "2026-06-01",
      estimated_supporters: 20,
      min_votes: 8,
      max_votes: 20,
      base_cost: 1000,
      ceiling_cost: 1500,
      extra_cost: 200,
      notes: "Registro temporário criado pelo diagnóstico.",
    }).select("*").single();
    if (isLeaderMonthlyMetricsSchemaError(metricError)) throw new Error(getLeaderMonthlyMetricsSetupMessage());
    if (metricError) throw metricError;

    const { error: updateLeaderError } = await supabase.from("leaders").update({ status: "Ativa", validated_votes: 12 }).eq("id", leader.id);
    if (updateLeaderError) throw updateLeaderError;

    const { error: updateMetricError } = await supabase.from("leader_monthly_metrics").update({ min_votes: 12, max_votes: 24 }).eq("id", metric.id);
    if (updateMetricError) throw updateMetricError;

    return "Criou, editou e removeu cadastro territorial e métrica mensal temporários.";
  } finally {
    await supabase.from("leader_monthly_metrics").delete().eq("leader_id", leader.id);
    await supabase.from("leaders").delete().eq("id", leader.id);
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

