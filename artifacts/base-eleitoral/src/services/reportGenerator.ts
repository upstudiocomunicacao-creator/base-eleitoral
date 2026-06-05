import { isSupabaseConfigured } from "@/lib/supabaseClient";
import type { DashboardDataset } from "./dashboard";
import { getDashboardDataset } from "./dashboard";
import { buildComparisonComputed, type ComparisonPriority, type OpportunityLevel, type RegionStatus, type RegionalComparisonRow, type TerritorialStrength } from "./electoralComparison";

export type ReportType =
  | "Geral"
  | "Liderança"
  | "Território"
  | "Eleitoral"
  | "Operacional"
  | "Estratégico"
  | "Executivo";

export type ReportDefinition = {
  id: string;
  title: string;
  type: ReportType;
  description: string;
  scope: string;
};

export type ReportFilters = {
  estado: string;
  cidade: string;
  bairro: string;
  zona: string;
  secao: string;
  lideranca: string;
  responsavel: string;
  periodo: string;
  prioridade: string;
  status: string;
  tipo: string;
};

export type ReportPreviewData = {
  definition: ReportDefinition;
  period: string;
  appliedFilters: string;
  executiveSummary: string;
  metrics: Array<{ label: string; value: string | number }>;
  rows: Array<Record<string, string | number>>;
  chart: Array<Record<string, string | number>>;
  strategicReading: string;
  recommendations: string[];
  warnings: string[];
};

export type ReportsDashboardData = {
  definitions: ReportDefinition[];
  summary: {
    availableReports: number;
    generatedThisMonth: number;
    lastUpdate: string;
    analyzedLeaders: number;
    analyzedNeighborhoods: number;
    analyzedZones: number;
    analyzedValidatedVotes: number;
    analyzedDemands: number;
    analyzedFieldActions: number;
    criticalIndicators: number;
  };
  options: {
    states: string[];
    cities: string[];
    neighborhoods: string[];
    zones: string[];
    sections: string[];
    leaders: string[];
    responsibles: string[];
    priorities: string[];
    statuses: string[];
    types: ReportType[];
  };
  history: Array<{ name: string; type: string; filters: string; date: string; user: string; status: string }>;
  dataset: DashboardDataset;
  warnings: string[];
};

export const reportDefinitions: ReportDefinition[] = [
  report("geral", "Relatório Geral da Campanha", "Geral", "Visão consolidada de lideranças, apoiadores, votos, metas, demandas, agenda e regiões prioritárias.", "Campanha completa"),
  report("lideranca", "Relatório por Liderança", "Liderança", "Performance de lideranças por bairro, votos declarados, validação, demandas e próxima ação.", "Lideranças"),
  report("bairro", "Relatório por Bairro", "Território", "Leitura territorial por bairro com cobertura, distância até a meta, demandas e ações de campo.", "Bairros"),
  report("municipio", "Relatório por Município", "Território", "Comparativo municipal no RJ com atuação, oportunidade eleitoral e força territorial.", "Municípios"),
  report("zona", "Relatório por Zona Eleitoral", "Eleitoral", "Zonas, seções, locais de votação, eleitores, metas, cobertura e prioridade.", "Zonas eleitorais"),
  report("secao", "Relatório por Seção Eleitoral", "Eleitoral", "Seções eleitorais vinculadas a bairros, locais de votação e metas operacionais.", "Seções"),
  report("apoiadores", "Relatório de Apoiadores", "Liderança", "Apoiadores, simpatizantes, indecisos, qualidade cadastral e vínculos territoriais.", "CRM territorial"),
  report("prospeccao", "Relatório de Prospecção", "Operacional", "Funil de contatos, conversão por etapa, responsáveis e ações vencidas.", "Funil"),
  report("votos", "Relatório de Votos Declarados x Votos Validados", "Eleitoral", "Promessa de voto, validação, taxa de conversão e lacunas por território.", "Votos"),
  report("metas", "Relatório de Metas", "Estratégico", "Meta geral, metas por bairro/zona, distância e prioridade automática.", "Metas"),
  report("demandas", "Relatório de Demandas", "Operacional", "Demandas abertas, críticas, resolvidas, recorrência por tema e retornos atrasados.", "Demandas"),
  report("agenda", "Relatório de Agenda de Campo", "Operacional", "Ações agendadas, realizadas, atrasadas, público e resultados por bairro.", "Agenda"),
  report("regioes", "Relatório de Regiões Prioritárias", "Estratégico", "Bairros e zonas que exigem ação imediata por baixa cobertura ou ausência de liderança.", "Prioridades"),
  report("calor", "Relatório de Mapa de Calor", "Estratégico", "Concentração por apoiadores, lideranças, votos validados, demandas e oportunidade.", "Heatmap"),
  report("oportunidade", "Relatório de Oportunidade Eleitoral", "Estratégico", "Onde há muitos eleitores, pouca campanha, baixa validação e maior retorno potencial.", "Oportunidade"),
  report("semanal", "Relatório Semanal Executivo", "Executivo", "Resumo curto para decisão da coordenação e agenda da próxima semana.", "Executivo"),
];

export function isReportsSupabaseReady() {
  return isSupabaseConfigured;
}

export async function getReportsDashboardData(history: ReportsDashboardData["history"] = []): Promise<ReportsDashboardData> {
  const dataset = await getDashboardDataset();
  const filtered = filterReportDataset(dataset, emptyReportFilters);
  return buildReportsDashboardData(filtered, history, dataset.warnings);
}

export function buildReportsDashboardData(dataset: DashboardDataset, history: ReportsDashboardData["history"], warnings: string[] = []): ReportsDashboardData {
  const comparison = buildComparisonComputedFromDataset(dataset);
  const generatedThisMonth = history.filter((item) => isCurrentMonth(item.date)).length;
  const lastUpdate = latestDate([
    ...dataset.leaders.map((item) => item.updated_at),
    ...dataset.supporters.map((item) => item.updated_at),
    ...dataset.prospects.map((item) => item.updated_at),
    ...dataset.electoralZones.map((item) => item.updated_at),
    ...dataset.fieldAgenda.map((item) => item.updated_at),
    ...dataset.demands.map((item) => item.updated_at),
  ]);

  return {
    definitions: reportDefinitions,
    summary: {
      availableReports: reportDefinitions.length,
      generatedThisMonth,
      lastUpdate: lastUpdate ? formatDate(lastUpdate) : "-",
      analyzedLeaders: dataset.leaders.length,
      analyzedNeighborhoods: comparison.rows.length,
      analyzedZones: unique(dataset.electoralZones.map((item) => item.zone_number)).length,
      analyzedValidatedVotes: comparison.summary.validatedVotes,
      analyzedDemands: dataset.demands.length,
      analyzedFieldActions: dataset.fieldAgenda.length,
      criticalIndicators: comparison.rows.filter((item) => item.priority === "Crítica" || item.openDemands > 0 || item.leaders === 0).length,
    },
    options: {
      states: unique(["RJ", ...dataset.leaders.map((item) => item.state), ...dataset.supporters.map((item) => item.state), ...dataset.electoralZones.map((item) => item.state)]),
      cities: unique([...dataset.municipalities.map((item) => item.name), ...dataset.leaders.map((item) => item.city), ...dataset.supporters.map((item) => item.city), ...dataset.electoralZones.map((item) => item.city)]),
      neighborhoods: unique([...dataset.neighborhoods.map((item) => item.name), ...dataset.leaders.map((item) => item.neighborhood), ...dataset.supporters.map((item) => item.neighborhood), ...dataset.electoralZones.map((item) => item.neighborhood)]),
      zones: unique(dataset.electoralZones.map((item) => item.zone_number)),
      sections: unique(dataset.electoralZones.map((item) => item.section_number ?? "")),
      leaders: unique(dataset.leaders.map((item) => item.full_name)),
      responsibles: unique([
        ...dataset.leaders.map((item) => item.internal_responsible ?? ""),
        ...dataset.supporters.map((item) => item.internal_responsible ?? ""),
        ...dataset.prospects.map((item) => item.internal_responsible ?? ""),
        ...dataset.demands.map((item) => item.internal_responsible ?? ""),
        ...dataset.fieldAgenda.map((item) => item.internal_responsible ?? ""),
      ]),
      priorities: ["Crítica", "Alta", "Média", "Baixa", "Manter"],
      statuses: unique([
        ...dataset.leaders.map((item) => item.status),
        ...dataset.supporters.map((item) => item.political_status),
        ...dataset.prospects.map((item) => item.funnel_stage),
        ...dataset.demands.map((item) => item.status),
        ...dataset.fieldAgenda.map((item) => item.status),
      ]),
      types: ["Geral", "Liderança", "Território", "Eleitoral", "Operacional", "Estratégico", "Executivo"],
    },
    history,
    dataset,
    warnings,
  };
}

export function generateReportPreview(dataset: DashboardDataset, reportId: string, filters: ReportFilters): ReportPreviewData {
  const definition = reportDefinitions.find((item) => item.id === reportId) ?? reportDefinitions[0];
  const filtered = filterReportDataset(dataset, filters);
  const comparison = buildComparisonComputedFromDataset(filtered);
  const rows = buildRowsForReport(definition.id, filtered, comparison.rows);
  const metrics = buildMetricsForReport(definition.id, filtered, comparison.summary, rows);
  const chart = buildChartForReport(definition.id, rows, comparison.rows);
  const recommendations = buildRecommendations(filtered, comparison.rows);
  const executiveSummary = buildExecutiveSummary(definition.id, filtered, comparison.summary, comparison.rows);

  return {
    definition,
    period: filters.periodo,
    appliedFilters: filterSummary(filters),
    executiveSummary,
    metrics,
    rows,
    chart,
    strategicReading: recommendations[0] ?? "Dados insuficientes para uma leitura estratégica automática.",
    recommendations,
    warnings: filtered.warnings,
  };
}

export function filterReportDataset(dataset: DashboardDataset, filters: ReportFilters): DashboardDataset {
  const leaderByName = dataset.leaders.find((item) => selectMatches(filters.lideranca, item.full_name));
  const leaderId = filters.lideranca === "todos" ? "todos" : leaderByName?.id ?? "__none__";
  const zoneIds = new Set(dataset.electoralZones.filter((item) =>
    selectMatches(filters.estado, item.state) &&
    selectMatches(filters.cidade, item.city) &&
    selectMatches(filters.bairro, item.neighborhood) &&
    selectMatches(filters.zona, item.zone_number) &&
    selectMatches(filters.secao, item.section_number ?? "") &&
    selectMatches(filters.prioridade, item.priority) &&
    selectMatches(filters.status, item.status) &&
    matchesPeriod(filters.periodo, item.created_at)
  ).map((item) => item.id));

  const location = (item: { state?: string | null; city?: string | null; neighborhood?: string | null }) =>
    selectMatches(filters.estado, item.state ?? "RJ") &&
    selectMatches(filters.cidade, item.city ?? "") &&
    selectMatches(filters.bairro, item.neighborhood ?? "");

  const leaders = dataset.leaders.filter((item) =>
    location(item) &&
    selectMatches(filters.lideranca, item.full_name) &&
    selectMatches(filters.responsavel, item.internal_responsible ?? "Não definido") &&
    selectMatches(filters.prioridade, getLeaderPriority(item.validated_votes, item.declared_votes, item.confidence_level)) &&
    selectMatches(filters.status, item.status) &&
    matchesPeriod(filters.periodo, item.created_at)
  );
  const leaderIds = new Set(leaders.map((item) => item.id));

  return {
    ...dataset,
    leaders,
    supporters: dataset.supporters.filter((item) =>
      location(item) &&
      (leaderId === "todos" || item.leader_id === leaderId || (item.leader_id && leaderIds.has(item.leader_id))) &&
      selectMatches(filters.responsavel, item.internal_responsible ?? "Não definido") &&
      selectMatches(filters.status, item.political_status) &&
      matchesPeriod(filters.periodo, item.created_at)
    ),
    prospects: dataset.prospects.filter((item) =>
      selectMatches(filters.cidade, item.city) &&
      selectMatches(filters.bairro, item.neighborhood) &&
      (leaderId === "todos" || item.leader_id === leaderId || (item.leader_id && leaderIds.has(item.leader_id))) &&
      selectMatches(filters.responsavel, item.internal_responsible ?? "Não definido") &&
      selectMatches(filters.prioridade, item.priority) &&
      selectMatches(filters.status, item.funnel_stage) &&
      matchesPeriod(filters.periodo, item.created_at)
    ),
    electoralZones: dataset.electoralZones.filter((item) => zoneIds.has(item.id)),
    fieldAgenda: dataset.fieldAgenda.filter((item) =>
      location(item) &&
      (leaderId === "todos" || item.leader_id === leaderId || (item.leader_id && leaderIds.has(item.leader_id))) &&
      (filters.zona === "todos" || (item.electoral_zone_id && zoneIds.has(item.electoral_zone_id))) &&
      selectMatches(filters.responsavel, item.internal_responsible ?? "Não definido") &&
      selectMatches(filters.prioridade, item.priority) &&
      selectMatches(filters.status, item.status) &&
      matchesPeriod(filters.periodo, item.action_date)
    ),
    demands: dataset.demands.filter((item) =>
      location(item) &&
      (leaderId === "todos" || item.leader_id === leaderId || (item.leader_id && leaderIds.has(item.leader_id))) &&
      (filters.zona === "todos" || (item.electoral_zone_id && zoneIds.has(item.electoral_zone_id))) &&
      selectMatches(filters.responsavel, item.internal_responsible ?? "Não definido") &&
      selectMatches(filters.prioridade, item.priority) &&
      selectMatches(filters.status, item.status) &&
      matchesPeriod(filters.periodo, item.opening_date)
    ),
    municipalities: dataset.municipalities.filter((item) => selectMatches(filters.estado, item.state) && selectMatches(filters.cidade, item.name)),
    neighborhoods: dataset.neighborhoods.filter((item) => selectMatches(filters.estado, item.state) && selectMatches(filters.cidade, item.city) && selectMatches(filters.bairro, item.name)),
  };
}

export const emptyReportFilters: ReportFilters = {
  estado: "todos",
  cidade: "todos",
  bairro: "todos",
  zona: "todos",
  secao: "todos",
  lideranca: "todos",
  responsavel: "todos",
  periodo: "Últimos 30 dias",
  prioridade: "todos",
  status: "todos",
  tipo: "todos",
};

function buildRowsForReport(reportId: string, dataset: DashboardDataset, regionalRows: ReturnType<typeof buildComparisonComputedFromDataset>["rows"]) {
  if (["bairro", "municipio", "regioes", "calor", "oportunidade", "metas", "votos", "geral", "semanal"].includes(reportId)) {
    if (reportId === "municipio") return groupByCity(regionalRows);
    return regionalRows.map((item) => ({
      Área: item.neighborhood,
      Cidade: item.city,
      Zona: item.zones.join(", ") || "-",
      Lideranças: item.leaders,
      Apoiadores: item.registeredSupporters,
      Prospecções: item.activeProspects,
      Declarados: item.declaredVotes,
      Validados: item.validatedVotes,
      Eleitores: item.voters,
      Meta: item.voteGoal,
      Cobertura: `${item.coverage}%`,
      Distância: item.distanceToGoal,
      Demandas: item.openDemands,
      Ações: item.plannedActions,
      Prioridade: item.priority,
    }));
  }

  if (reportId === "lideranca") {
    return dataset.leaders.map((item) => {
      const supporters = dataset.supporters.filter((supporter) => supporter.leader_id === item.id).length;
      const demands = dataset.demands.filter((demand) => demand.leader_id === item.id).length;
      const actions = dataset.fieldAgenda.filter((action) => action.leader_id === item.id && normalize(action.status).includes("conclu")).length;
      return {
        Liderança: item.full_name,
        Bairro: item.neighborhood,
        Cidade: item.city,
        Apoiadores: supporters || item.registered_supporters,
        Estimados: Number(item.estimated_direct_supporters ?? 0) + Number(item.estimated_indirect_supporters ?? 0),
        Declarados: item.declared_votes,
        Validados: item.validated_votes,
        "Taxa de validação": `${percent(item.validated_votes, item.declared_votes)}%`,
        Confiança: item.confidence_level,
        Demandas: demands,
        Ações: actions,
        "Próxima ação": item.next_action ?? "Validar base declarada",
      };
    });
  }

  if (reportId === "zona" || reportId === "secao") {
    return dataset.electoralZones.map((item) => ({
      Zona: item.zone_number,
      Seção: item.section_number ?? "-",
      "Local de votação": item.voting_place,
      Bairro: item.neighborhood,
      Cidade: item.city,
      Eleitores: item.voters_count,
      Meta: item.vote_goal,
      Validados: item.validated_votes,
      Cobertura: `${percent(item.validated_votes, item.voters_count)}%`,
      Distância: Math.max(item.vote_goal - item.validated_votes, 0),
      Prioridade: item.priority,
      Status: item.status,
    }));
  }

  if (reportId === "apoiadores") {
    return dataset.supporters.map((item) => ({
      Nome: item.full_name,
      Bairro: item.neighborhood,
      Cidade: item.city,
      Tipo: item.person_type,
      Status: item.political_status,
      Confiança: item.data_confidence,
      "Precisão geográfica": item.geographic_precision,
      Responsável: item.internal_responsible ?? "Não definido",
      "Próxima ação": item.next_action ?? "-",
      Telefone: item.phone,
      Email: item.email ?? "",
    }));
  }

  if (reportId === "prospeccao") {
    return dataset.prospects.map((item) => ({
      Contato: item.contact_name,
      Bairro: item.neighborhood,
      Cidade: item.city,
      Etapa: item.funnel_stage,
      Origem: item.origin,
      Prioridade: item.priority,
      Confiança: item.confidence_level,
      Responsável: item.internal_responsible ?? "Não definido",
      "Próxima ação": item.next_action ?? "-",
      "Data próxima ação": item.next_action_date ?? "-",
    }));
  }

  if (reportId === "demandas") {
    return dataset.demands.map((item) => ({
      Demanda: item.title,
      Pessoa: item.person_name ?? "-",
      Bairro: item.neighborhood,
      Categoria: item.category,
      Prioridade: item.priority,
      Status: item.status,
      Responsável: item.internal_responsible ?? "Não definido",
      "Data abertura": formatDate(item.opening_date),
      "Data retorno": item.return_date ? formatDate(item.return_date) : "-",
    }));
  }

  if (reportId === "agenda") {
    return dataset.fieldAgenda.map((item) => ({
      Ação: item.title,
      Tipo: item.action_type,
      Data: formatDate(item.action_date),
      Bairro: item.neighborhood,
      Cidade: item.city,
      Responsável: item.internal_responsible ?? "Não definido",
      "Público estimado": item.estimated_public ?? 0,
      "Público presente": item.actual_public ?? 0,
      Status: item.status,
      Prioridade: item.priority,
      Resultado: item.result ?? "-",
    }));
  }

  return [];
}

function buildMetricsForReport(reportId: string, dataset: DashboardDataset, summary: ReturnType<typeof buildComparisonComputedFromDataset>["summary"], rows: Array<Record<string, string | number>>) {
  const resolvedDemands = dataset.demands.filter((item) => normalize(item.status).includes("resol")).length;
  const completedActions = dataset.fieldAgenda.filter((item) => normalize(item.status).includes("conclu")).length;
  const prospectStages = countBy(dataset.prospects, (item) => item.funnel_stage);

  if (reportId === "demandas") {
    return [
      metric("Total de demandas", dataset.demands.length),
      metric("Abertas", dataset.demands.filter((item) => !normalize(item.status).includes("resol")).length),
      metric("Resolvidas", resolvedDemands),
      metric("Críticas", dataset.demands.filter((item) => normalize(item.priority).includes("crit")).length),
    ];
  }
  if (reportId === "agenda") {
    return [
      metric("Ações agendadas", dataset.fieldAgenda.length),
      metric("Realizadas", completedActions),
      metric("Público estimado", sum(dataset.fieldAgenda, "estimated_public")),
      metric("Público presente", sum(dataset.fieldAgenda, "actual_public")),
    ];
  }
  if (reportId === "prospeccao") {
    return [
      metric("Novos contatos", prospectStages["Novo contato"] ?? prospectStages["novo contato"] ?? 0),
      metric("Simpatizantes", prospectStages.Simpatizante ?? 0),
      metric("Confirmados", prospectStages["Apoiador confirmado"] ?? 0),
      metric("Votos validados", prospectStages["Voto validado"] ?? 0),
    ];
  }
  return [
    metric("Lideranças", dataset.leaders.length),
    metric("Apoiadores", dataset.supporters.length),
    metric("Votos validados", summary.validatedVotes),
    metric("Distância até meta", summary.distanceToGoal || sum(rows, "Distância")),
  ];
}

function buildChartForReport(reportId: string, rows: Array<Record<string, string | number>>, regionalRows: ReturnType<typeof buildComparisonComputedFromDataset>["rows"]) {
  if (reportId === "demandas") return rows.slice(0, 8).map((row) => ({ name: String(row.Bairro ?? row.Categoria ?? row.Demanda), valor: Number(row.Prioridade === "Crítica" ? 2 : 1) }));
  if (reportId === "agenda") return rows.slice(0, 8).map((row) => ({ name: String(row.Bairro ?? row.Ação), valor: Number(row["Público presente"] ?? row["Público estimado"] ?? 0) }));
  if (reportId === "prospeccao") return Object.entries(countByKey(rows, "Etapa")).map(([name, valor]) => ({ name, valor }));
  return regionalRows.slice(0, 8).map((item) => ({ name: item.neighborhood, meta: item.voteGoal, validados: item.validatedVotes, demandas: item.openDemands }));
}

function buildRecommendations(dataset: DashboardDataset, rows: ReturnType<typeof buildComparisonComputedFromDataset>["rows"]) {
  const critical = rows.filter((item) => item.priority === "Crítica" || item.priority === "Alta");
  const withoutLeader = rows.filter((item) => item.leaders === 0);
  const openCriticalDemands = dataset.demands.filter((item) => normalize(item.priority).includes("crit") && !normalize(item.status).includes("resol"));
  return [
    critical[0] ? `${critical[0].neighborhood} exige prioridade: baixa cobertura, distância de ${critical[0].distanceToGoal.toLocaleString("pt-BR")} votos e oportunidade ${critical[0].opportunity.toLowerCase()}.` : "Manter acompanhamento das regiões já mapeadas e ampliar validação em campo.",
    withoutLeader.length ? `Criar ou reforçar liderança em ${withoutLeader.length} região(ões) sem liderança vinculada.` : "Usar lideranças fortes para validar votos declarados e multiplicar apoiadores.",
    openCriticalDemands.length ? `Resolver ${openCriticalDemands.length} demanda(s) crítica(s) antes da próxima rodada de agenda.` : "Registrar demandas recebidas nas próximas ações para melhorar leitura territorial.",
    "Agendar ações nos próximos 7 dias nos bairros abaixo da meta.",
    "Reforçar contato com indecisos e validar votos declarados por liderança.",
  ];
}

function buildExecutiveSummary(reportId: string, dataset: DashboardDataset, summary: ReturnType<typeof buildComparisonComputedFromDataset>["summary"], rows: ReturnType<typeof buildComparisonComputedFromDataset>["rows"]) {
  const top = rows.sort((a, b) => b.opportunityScore - a.opportunityScore)[0];
  const campaign = dataset.campaigns[0];
  const base = `A campanha possui ${summary.validatedVotes.toLocaleString("pt-BR")} votos validados de uma meta de ${summary.voteGoal.toLocaleString("pt-BR")}, com distância de ${summary.distanceToGoal.toLocaleString("pt-BR")} votos.`;
  if (reportId === "demandas") return `${base} Há ${dataset.demands.length} demandas no recorte, sendo ${dataset.demands.filter((item) => normalize(item.priority).includes("crit")).length} críticas. Priorize retornos pendentes por bairro.`;
  if (reportId === "agenda") return `${base} Existem ${dataset.fieldAgenda.length} ações de campo no recorte. O foco deve ser converter presença territorial em votos validados.`;
  if (reportId === "prospeccao") return `${base} O funil tem ${dataset.prospects.length} contatos e precisa acelerar conversão de simpatizantes para apoiadores confirmados.`;
  if (top) return `${base} ${top.neighborhood} apresenta alta oportunidade, ${top.coverage}% de cobertura e distância de ${top.distanceToGoal.toLocaleString("pt-BR")} votos até a meta. Recomenda-se ampliar lideranças e ações de campo.`;
  return campaign ? `${base} O relatório usa a campanha ${campaign.name}.` : base;
}

function groupByCity(rows: ReturnType<typeof buildComparisonComputedFromDataset>["rows"]) {
  const map = new Map<string, { Cidade: string; Lideranças: number; Apoiadores: number; Declarados: number; Validados: number; Eleitores: number; Meta: number; Demandas: number; Ações: number }>();
  rows.forEach((item) => {
    const current = map.get(item.city) ?? { Cidade: item.city, Lideranças: 0, Apoiadores: 0, Declarados: 0, Validados: 0, Eleitores: 0, Meta: 0, Demandas: 0, Ações: 0 };
    current.Lideranças += item.leaders;
    current.Apoiadores += item.registeredSupporters;
    current.Declarados += item.declaredVotes;
    current.Validados += item.validatedVotes;
    current.Eleitores += item.voters;
    current.Meta += item.voteGoal;
    current.Demandas += item.openDemands;
    current.Ações += item.plannedActions;
    map.set(item.city, current);
  });
  return Array.from(map.values()).map((item) => ({ ...item, Cobertura: `${percent(item.Validados, item.Eleitores)}%`, Distância: Math.max(item.Meta - item.Validados, 0) }));
}

function buildComparisonComputedFromDataset(dataset: DashboardDataset) {
  const { buildComparisonComputed: build } = { buildComparisonComputed };
  const keys = new Map<string, { neighborhood: string; city: string; state: string }>();
  const add = (neighborhood: string, city: string, state = "RJ") => {
    if (!neighborhood || !city) return;
    keys.set(`${normalize(neighborhood)}|${normalize(city)}|${normalize(state)}`, { neighborhood, city, state });
  };
  dataset.neighborhoods.forEach((item) => add(item.name, item.city, item.state));
  dataset.electoralZones.forEach((item) => add(item.neighborhood, item.city, item.state));
  dataset.leaders.forEach((item) => add(item.neighborhood, item.city, item.state));
  dataset.supporters.forEach((item) => add(item.neighborhood, item.city, item.state));
  dataset.prospects.forEach((item) => add(item.neighborhood, item.city));
  dataset.demands.forEach((item) => add(item.neighborhood, item.city, item.state));
  dataset.fieldAgenda.forEach((item) => add(item.neighborhood, item.city, item.state));

  const rows: RegionalComparisonRow[] = Array.from(keys.values()).map((region) => {
    const same = (item: { neighborhood: string; city: string; state?: string | null }) => normalize(item.neighborhood) === normalize(region.neighborhood) && normalize(item.city) === normalize(region.city);
    const leaders = dataset.leaders.filter(same);
    const supporters = dataset.supporters.filter(same);
    const prospects = dataset.prospects.filter((item) => normalize(item.neighborhood) === normalize(region.neighborhood) && normalize(item.city) === normalize(region.city));
    const zones = dataset.electoralZones.filter(same);
    const demands = dataset.demands.filter(same);
    const agenda = dataset.fieldAgenda.filter(same);
    const neighborhoodData = dataset.neighborhoods.find((item) => normalize(item.name) === normalize(region.neighborhood) && normalize(item.city) === normalize(region.city));
    const voters = Number(neighborhoodData?.estimated_voters ?? 0) || sum(zones, "voters_count");
    const validatedVotes = sum(leaders, "validated_votes") + sum(zones, "validated_votes");
    const declaredVotes = sum(leaders, "declared_votes") + sum(zones, "estimated_campaign_votes");
    const voteGoal = sum(zones, "vote_goal") || Math.round(voters * 0.05);
    const coverage = percent(validatedVotes, voters);
    const goalCompletion = percent(validatedVotes, voteGoal);
    const priority: ComparisonPriority = leaders.length === 0 && voters > 4000 ? "Crítica" : coverage < 2 ? "Alta" : coverage < 5 ? "Média" : "Manter";
    const opportunity: OpportunityLevel = coverage < 1 && voters > 4000 ? "Crítico" : coverage < 3 ? "Alto" : coverage < 6 ? "Médio" : "Baixo";
    const territorialStrength: TerritorialStrength = validatedVotes > 400 && leaders.length >= 3 ? "Muito forte" : leaders.length >= 2 ? "Forte" : leaders.length ? "Em desenvolvimento" : "Fraco";
    const status: RegionStatus = leaders.length === 0 ? "Sem liderança" : goalCompletion >= 80 ? "Meta próxima" : coverage < 2 ? "Baixa cobertura" : "Em desenvolvimento";
    return {
      id: `${normalize(region.neighborhood)}-${normalize(region.city)}`,
      neighborhood: region.neighborhood,
      city: region.city,
      state: region.state,
      zones: unique(zones.map((item) => item.zone_number)),
      sections: unique(zones.map((item) => item.section_number ?? "")),
      votingPlaces: unique(zones.map((item) => item.voting_place)),
      voters,
      leaders: leaders.length,
      registeredSupporters: supporters.length,
      estimatedSupporters: leaders.reduce((total, item) => total + Number(item.estimated_direct_supporters ?? 0) + Number(item.estimated_indirect_supporters ?? 0), 0),
      activeProspects: prospects.length,
      undecided: supporters.filter((item) => normalize(item.political_status).includes("indeciso")).length,
      openDemands: demands.filter((item) => !normalize(item.status).includes("resol")).length,
      plannedActions: agenda.filter((item) => !normalize(item.status).includes("conclu")).length,
      declaredVotes,
      validatedVotes,
      voteGoal,
      distanceToGoal: Math.max(voteGoal - validatedVotes, 0),
      coverage,
      goalCompletion,
      validationRate: percent(validatedVotes, declaredVotes),
      confidenceIndex: leaders.length ? Math.round(leaders.reduce((total, item) => total + confidenceScore(item.confidence_level), 0) / leaders.length) : 0,
      unexploredPotential: Math.max(voters - validatedVotes, 0),
      opportunity,
      opportunityScore: Math.min(100, Math.round((voters / 250) + (100 - coverage * 10) + (leaders.length === 0 ? 20 : 0))),
      territorialStrength,
      territorialStrengthScore: Math.min(100, Math.round(leaders.length * 16 + supporters.length * 0.6 + validatedVotes * 0.08)),
      priority,
      status,
      responsible: first([...leaders.map((item) => item.internal_responsible), ...agenda.map((item) => item.internal_responsible), ...demands.map((item) => item.internal_responsible)]) ?? "Não definido",
      linkedLeaders: leaders.map((item) => item.full_name),
      strategicAnalysis: `${region.neighborhood} tem ${validatedVotes.toLocaleString("pt-BR")} votos validados, ${coverage}% de cobertura e ${Math.max(voteGoal - validatedVotes, 0).toLocaleString("pt-BR")} votos de distância até a meta.`,
      recommendedActions: ["Ampliar lideranças locais", "Validar votos declarados", "Agendar ação de campo"],
    };
  });
  return build(rows, dataset.warnings);
}

function report(id: string, title: string, type: ReportType, description: string, scope: string): ReportDefinition {
  return { id, title, type, description, scope };
}

function metric(label: string, value: string | number) {
  return { label, value };
}

function getLeaderPriority(validated: number, declared: number, confidence: string) {
  if (declared > 0 && percent(validated, declared) < 30) return "Crítica";
  if (normalize(confidence).includes("baixo")) return "Alta";
  if (normalize(confidence).includes("alto")) return "Manter";
  return "Média";
}

function selectMatches(filter: string, value: string) {
  return filter === "todos" || normalize(filter) === normalize(value);
}

function matchesPeriod(period: string, date: string | null | undefined) {
  if (!date || period === "todos" || normalize(period).includes("ciclo")) return true;
  const created = new Date(date);
  const days = normalize(period).includes("7") ? 7 : normalize(period).includes("30") ? 30 : 365;
  const limit = new Date();
  limit.setDate(limit.getDate() - days);
  return created >= limit;
}

function filterSummary(filters: ReportFilters) {
  return [
    filters.estado !== "todos" ? filters.estado : null,
    filters.cidade !== "todos" ? filters.cidade : null,
    filters.bairro !== "todos" ? filters.bairro : null,
    filters.zona !== "todos" ? `Zona ${filters.zona}` : null,
    filters.secao !== "todos" ? `Seção ${filters.secao}` : null,
    filters.lideranca !== "todos" ? filters.lideranca : null,
  ].filter(Boolean).join(" · ") || "Todos os dados disponíveis";
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item) || "Não definido";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function countByKey(rows: Array<Record<string, string | number>>, key: string) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = String(row[key] ?? "Não definido");
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function sum<T>(records: T[], key: keyof T) {
  return records.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function percent(value: number, base: number) {
  return base ? Math.round((value / base) * 1000) / 10 : 0;
}

function confidenceScore(value: string) {
  const normalized = normalize(value);
  if (normalized.includes("alto")) return 90;
  if (normalized.includes("medio")) return 65;
  if (normalized.includes("baixo")) return 35;
  return 50;
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function first(values: Array<string | null | undefined>) {
  return values.find((item) => item && item.trim()) ?? null;
}

function latestDate(values: string[]) {
  return values.filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
}

function isCurrentMonth(value: string) {
  const date = parseBrazilianDate(value);
  if (!date) return false;
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function parseBrazilianDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function normalize(value: string | null | undefined) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLowerCase().trim();
}
