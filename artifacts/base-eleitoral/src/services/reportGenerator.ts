import { isSupabaseConfigured } from "@/lib/supabaseClient";
import type { DashboardDataset } from "./dashboard";
import { getDashboardDataset } from "./dashboard";

export type ReportType =
  | "Geral"
  | "Liderança"
  | "Território"
  | "Financeiro"
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
    analyzedTerritories: number;
    estimatedSupporters: number;
    analyzedValidatedVotes: number;
    analyzedZones: number;
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

type TerritoryReportRow = {
  area: string;
  city: string;
  state: string;
  region: string;
  voters: number;
  leaders: number;
  supportEstimate: number;
  declaredVotes: number;
  validatedVotes: number;
  voteGoal: number;
  distanceToGoal: number;
  coverage: number;
  validationRate: number;
  priority: string;
  responsible: string;
};

export const reportDefinitions: ReportDefinition[] = [
  report("geral", "Relatório Geral Operacional", "Geral", "Visão consolidada de coordenações, lideranças, apoio estimado, votos e territórios prioritários.", "Operação completa"),
  report("lideranca", "Relatório por Cadastro Territorial", "Liderança", "Performance de coordenadores e lideranças por cidade, bairro, estimativa de apoio, votos e próxima ação.", "Cadastros"),
  report("bairro", "Relatório Maricá por Bairro", "Território", "Leitura territorial por bairro e distrito de Maricá, com força local, meta e distância.", "Bairros de Maricá"),
  report("municipio", "Relatório RJ por Cidade", "Território", "Comparativo das cidades do RJ com atuação, apoio estimado e oportunidade territorial.", "Cidades do RJ"),
  report("votos", "Relatório de Votos e Conversão", "Estratégico", "Compara votos declarados, validados, taxa de conversão e lacunas por território.", "Votos"),
  report("metas", "Relatório de Metas Territoriais", "Estratégico", "Mostra meta atual, distância até a meta e prioridade automática por cidade ou bairro.", "Metas"),
  report("custos", "Relatório de Centro de Custos", "Financeiro", "Base para acompanhar custo mínimo, teto e despesas extras por cadastro territorial.", "Custos"),
  report("regioes", "Relatório de Regiões Prioritárias", "Estratégico", "Lista cidades, regiões e bairros que exigem ação por baixa cobertura ou pouca liderança.", "Prioridades"),
  report("calor", "Relatório de Mapa de Calor", "Estratégico", "Concentração territorial por apoio estimado, lideranças e votos validados.", "Heatmap"),
  report("oportunidade", "Relatório de Oportunidade Territorial", "Estratégico", "Indica onde há alto potencial e baixa presença operacional.", "Oportunidade"),
  report("semanal", "Relatório Semanal Executivo", "Executivo", "Resumo curto para decisão da coordenação geral e planejamento da próxima semana.", "Executivo"),
];

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

export function isReportsSupabaseReady() {
  return isSupabaseConfigured;
}

export async function getReportsDashboardData(history: ReportsDashboardData["history"] = []): Promise<ReportsDashboardData> {
  const dataset = await getDashboardDataset();
  const filtered = filterReportDataset(dataset, emptyReportFilters);
  return buildReportsDashboardData(filtered, history, dataset.warnings);
}

export function buildReportsDashboardData(dataset: DashboardDataset, history: ReportsDashboardData["history"], warnings: string[] = []): ReportsDashboardData {
  const territoryRows = buildTerritoryRows(dataset);
  const generatedThisMonth = history.filter((item) => isCurrentMonth(item.date)).length;
  const lastUpdate = latestDate(dataset.leaders.map((item) => item.updated_at));

  return {
    definitions: reportDefinitions,
    summary: {
      availableReports: reportDefinitions.length,
      generatedThisMonth,
      lastUpdate: lastUpdate ? formatDate(lastUpdate) : "-",
      analyzedLeaders: dataset.leaders.length,
      analyzedNeighborhoods: unique(dataset.leaders.map((item) => item.neighborhood)).length,
      analyzedTerritories: territoryRows.length,
      estimatedSupporters: sumLeadersSupport(dataset.leaders),
      analyzedValidatedVotes: sum(dataset.leaders, "validated_votes"),
      analyzedZones: 0,
      analyzedDemands: 0,
      analyzedFieldActions: 0,
      criticalIndicators: territoryRows.filter((item) => item.priority === "Crítica" || item.priority === "Alta").length,
    },
    options: {
      states: unique(["RJ", ...dataset.leaders.map((item) => item.state)]),
      cities: unique([...dataset.municipalities.map((item) => item.name), ...dataset.leaders.map((item) => item.city)]),
      neighborhoods: unique([...dataset.neighborhoods.map((item) => item.name), ...dataset.leaders.map((item) => item.neighborhood)]),
      zones: [],
      sections: [],
      leaders: unique(dataset.leaders.map((item) => item.full_name)),
      responsibles: unique(dataset.leaders.map((item) => item.internal_responsible ?? "")),
      priorities: ["Crítica", "Alta", "Média", "Baixa", "Manter"],
      statuses: unique(dataset.leaders.map((item) => item.status)),
      types: ["Geral", "Liderança", "Território", "Financeiro", "Estratégico", "Executivo"],
    },
    history,
    dataset,
    warnings,
  };
}

export function generateReportPreview(dataset: DashboardDataset, reportId: string, filters: ReportFilters): ReportPreviewData {
  const definition = reportDefinitions.find((item) => item.id === reportId) ?? reportDefinitions[0];
  const filtered = filterReportDataset(dataset, filters);
  const territoryRows = buildTerritoryRows(filtered);
  const rows = buildRowsForReport(definition.id, filtered, territoryRows);
  const metrics = buildMetricsForReport(definition.id, filtered, territoryRows, rows);
  const chart = buildChartForReport(definition.id, territoryRows);
  const recommendations = buildRecommendations(territoryRows);
  const executiveSummary = buildExecutiveSummary(definition.id, filtered, territoryRows);

  return {
    definition,
    period: filters.periodo,
    appliedFilters: filterSummary(filters),
    executiveSummary,
    metrics,
    rows,
    chart,
    strategicReading: recommendations[0] ?? "Dados insuficientes para leitura estratégica automática.",
    recommendations,
    warnings: filtered.warnings,
  };
}

export function filterReportDataset(dataset: DashboardDataset, filters: ReportFilters): DashboardDataset {
  const leaders = dataset.leaders.filter((item) =>
    selectMatches(filters.estado, item.state) &&
    selectMatches(filters.cidade, item.city) &&
    selectMatches(filters.bairro, item.neighborhood) &&
    selectMatches(filters.lideranca, item.full_name) &&
    selectMatches(filters.responsavel, item.internal_responsible ?? "Não definido") &&
    selectMatches(filters.prioridade, getLeaderPriority(item.validated_votes, item.declared_votes, item.confidence_level)) &&
    selectMatches(filters.status, item.status) &&
    matchesPeriod(filters.periodo, item.created_at),
  );

  return {
    ...dataset,
    leaders,
    supporters: [],
    prospects: [],
    electoralZones: [],
    fieldAgenda: [],
    demands: [],
    municipalities: dataset.municipalities.filter((item) => selectMatches(filters.estado, item.state) && selectMatches(filters.cidade, item.name)),
    neighborhoods: dataset.neighborhoods.filter((item) => selectMatches(filters.estado, item.state) && selectMatches(filters.cidade, item.city) && selectMatches(filters.bairro, item.name)),
  };
}

function buildRowsForReport(reportId: string, dataset: DashboardDataset, territoryRows: TerritoryReportRow[]) {
  if (reportId === "municipio") return groupByCity(territoryRows);

  if (reportId === "lideranca") {
    return dataset.leaders.map((item) => ({
      Cadastro: item.full_name,
      Papel: item.leader_type,
      Bairro: item.neighborhood,
      Cidade: item.city,
      "Região/Distrito": item.territory_region ?? "-",
      "Apoio estimado": leaderSupport(item),
      "Votos declarados": item.declared_votes,
      "Votos validados": item.validated_votes,
      "Taxa de validação": `${percent(item.validated_votes, item.declared_votes)}%`,
      Confiança: item.confidence_level,
      Responsável: item.internal_responsible ?? "Não definido",
      "Próxima ação": item.next_action ?? "Validar estimativa",
    }));
  }

  if (reportId === "custos") {
    return dataset.leaders.map((item) => ({
      Cadastro: item.full_name,
      Papel: item.leader_type,
      Cidade: item.city,
      Bairro: item.neighborhood,
      "Custo base mensal": "A definir",
      "Teto mensal": "A definir",
      "Despesa extra": "A definir",
      Observação: "Preencher no centro de custos mensal",
    }));
  }

  return territoryRows.map((item) => ({
    Área: item.area,
    Cidade: item.city,
    "Região/Distrito": item.region,
    Lideranças: item.leaders,
    "Apoio estimado": item.supportEstimate,
    "Votos declarados": item.declaredVotes,
    "Votos validados": item.validatedVotes,
    "Meta atual": item.voteGoal,
    Cobertura: `${item.coverage}%`,
    Conversão: `${item.validationRate}%`,
    Distância: item.distanceToGoal,
    Responsável: item.responsible,
    Prioridade: item.priority,
  }));
}

function buildMetricsForReport(reportId: string, dataset: DashboardDataset, territoryRows: TerritoryReportRow[], rows: Array<Record<string, string | number>>) {
  const supportEstimate = sumLeadersSupport(dataset.leaders);
  const declaredVotes = sum(dataset.leaders, "declared_votes");
  const validatedVotes = sum(dataset.leaders, "validated_votes");
  const distance = Math.max(declaredVotes - validatedVotes, 0);

  if (reportId === "custos") {
    return [
      metric("Cadastros com custo", dataset.leaders.length),
      metric("Custo base", "A definir"),
      metric("Teto mensal", "A definir"),
      metric("Extras", "A definir"),
    ];
  }

  return [
    metric("Cadastros", dataset.leaders.length),
    metric("Territórios", territoryRows.length),
    metric("Apoio estimado", supportEstimate),
    metric("Votos validados", validatedVotes),
    metric("Conversão", `${percent(validatedVotes, declaredVotes)}%`),
    metric("Distância até meta", distance || sum(rows, "Distância")),
  ];
}

function buildChartForReport(reportId: string, territoryRows: TerritoryReportRow[]) {
  const rows = reportId === "municipio" ? cityChartRows(territoryRows) : territoryRows;
  return rows.slice(0, 8).map((item) => ({
    name: item.area,
    meta: item.voteGoal,
    validados: item.validatedVotes,
    apoio: item.supportEstimate,
  }));
}

function buildRecommendations(rows: TerritoryReportRow[]) {
  const critical = rows.filter((item) => item.priority === "Crítica" || item.priority === "Alta");
  const withoutLeader = rows.filter((item) => item.leaders === 0);
  const topOpportunity = [...rows].sort((a, b) => b.distanceToGoal - a.distanceToGoal || b.supportEstimate - a.supportEstimate)[0];
  return [
    topOpportunity ? `${topOpportunity.area}, em ${topOpportunity.city}, tem maior distância operacional: ${topOpportunity.distanceToGoal.toLocaleString("pt-BR")} votos até a meta atual.` : "Manter atualização mensal das estimativas para alimentar mapas e indicadores.",
    critical.length ? `Revisar ${critical.length} território(s) em prioridade alta ou crítica.` : "Os territórios do recorte estão sem alerta crítico no momento.",
    withoutLeader.length ? `Criar ou vincular coordenação em ${withoutLeader.length} território(s) sem cadastro ativo.` : "Usar coordenações existentes para validar votos declarados.",
    "Atualizar mensalmente apoio estimado, votos mínimos, votos máximos e centro de custos.",
  ];
}

function buildExecutiveSummary(reportId: string, dataset: DashboardDataset, territoryRows: TerritoryReportRow[]) {
  const campaign = dataset.campaigns[0];
  const declaredVotes = sum(dataset.leaders, "declared_votes");
  const validatedVotes = sum(dataset.leaders, "validated_votes");
  const distance = Math.max(declaredVotes - validatedVotes, 0);
  const supportEstimate = sumLeadersSupport(dataset.leaders);
  const top = [...territoryRows].sort((a, b) => b.distanceToGoal - a.distanceToGoal || b.supportEstimate - a.supportEstimate)[0];
  const base = `O recorte possui ${dataset.leaders.length} cadastros territoriais, ${supportEstimate.toLocaleString("pt-BR")} apoios estimados e ${validatedVotes.toLocaleString("pt-BR")} votos validados. A distância até a meta atual é de ${distance.toLocaleString("pt-BR")} votos.`;
  if (reportId === "custos") return `${base} O centro de custos mensal deve consolidar custo base, teto e extras por coordenação ou liderança.`;
  if (top) return `${base} O território mais sensível é ${top.area}, em ${top.city}, com prioridade ${top.priority.toLowerCase()} e ${top.distanceToGoal.toLocaleString("pt-BR")} votos de distância.`;
  return campaign ? `${base} Relatório vinculado à campanha ${campaign.name}.` : base;
}

function buildTerritoryRows(dataset: DashboardDataset): TerritoryReportRow[] {
  const keys = new Map<string, { area: string; city: string; state: string }>();
  const add = (area: string, city: string, state = "RJ") => {
    if (!area || !city) return;
    keys.set(`${normalize(area)}|${normalize(city)}|${normalize(state)}`, { area, city, state });
  };
  dataset.neighborhoods.forEach((item) => add(item.name, item.city, item.state));
  dataset.leaders.forEach((item) => add(item.neighborhood, item.city, item.state));

  return Array.from(keys.values()).map((territory) => {
    const leaders = dataset.leaders.filter((item) => normalize(item.neighborhood) === normalize(territory.area) && normalize(item.city) === normalize(territory.city));
    const neighborhoodData = dataset.neighborhoods.find((item) => normalize(item.name) === normalize(territory.area) && normalize(item.city) === normalize(territory.city));
    const municipalityData = dataset.municipalities.find((item) => normalize(item.name) === normalize(territory.city));
    const voters = Number(neighborhoodData?.estimated_voters ?? 0);
    const supportEstimate = sumLeadersSupport(leaders);
    const declaredVotes = sum(leaders, "declared_votes");
    const validatedVotes = sum(leaders, "validated_votes");
    const voteGoal = Math.max(declaredVotes, validatedVotes, Math.round(supportEstimate * 0.7));
    const coverage = percent(validatedVotes, voters || voteGoal);
    const validationRate = percent(validatedVotes, declaredVotes);
    const priority = getTerritoryPriority(leaders.length, voters, coverage, validationRate, voteGoal, validatedVotes);
    return {
      area: territory.area,
      city: territory.city,
      state: territory.state,
      region: first(leaders.map((item) => item.territory_region)) ?? neighborhoodData?.region ?? municipalityData?.region ?? "-",
      voters,
      leaders: leaders.length,
      supportEstimate,
      declaredVotes,
      validatedVotes,
      voteGoal,
      distanceToGoal: Math.max(voteGoal - validatedVotes, 0),
      coverage,
      validationRate,
      priority,
      responsible: first(leaders.map((item) => item.internal_responsible)) ?? "Não definido",
    };
  }).sort((a, b) => b.distanceToGoal - a.distanceToGoal || b.supportEstimate - a.supportEstimate);
}

function groupByCity(rows: TerritoryReportRow[]) {
  const map = new Map<string, TerritoryReportRow>();
  rows.forEach((item) => {
    const current = map.get(item.city) ?? {
      area: item.city,
      city: item.city,
      state: item.state,
      region: item.region,
      voters: 0,
      leaders: 0,
      supportEstimate: 0,
      declaredVotes: 0,
      validatedVotes: 0,
      voteGoal: 0,
      distanceToGoal: 0,
      coverage: 0,
      validationRate: 0,
      priority: "Média",
      responsible: item.responsible,
    };
    current.voters += item.voters;
    current.leaders += item.leaders;
    current.supportEstimate += item.supportEstimate;
    current.declaredVotes += item.declaredVotes;
    current.validatedVotes += item.validatedVotes;
    current.voteGoal += item.voteGoal;
    current.distanceToGoal = Math.max(current.voteGoal - current.validatedVotes, 0);
    current.coverage = percent(current.validatedVotes, current.voters || current.voteGoal);
    current.validationRate = percent(current.validatedVotes, current.declaredVotes);
    current.priority = getTerritoryPriority(current.leaders, current.voters, current.coverage, current.validationRate, current.voteGoal, current.validatedVotes);
    map.set(item.city, current);
  });
  return Array.from(map.values()).map((item) => ({
    Cidade: item.city,
    Região: item.region,
    Lideranças: item.leaders,
    "Apoio estimado": item.supportEstimate,
    "Votos declarados": item.declaredVotes,
    "Votos validados": item.validatedVotes,
    "Meta atual": item.voteGoal,
    Cobertura: `${item.coverage}%`,
    Conversão: `${item.validationRate}%`,
    Distância: item.distanceToGoal,
    Prioridade: item.priority,
  }));
}

function cityChartRows(rows: TerritoryReportRow[]) {
  const grouped = new Map<string, TerritoryReportRow>();
  rows.forEach((item) => {
    const current = grouped.get(item.city) ?? { ...item, area: item.city, voters: 0, leaders: 0, supportEstimate: 0, declaredVotes: 0, validatedVotes: 0, voteGoal: 0, distanceToGoal: 0 };
    current.voters += item.voters;
    current.leaders += item.leaders;
    current.supportEstimate += item.supportEstimate;
    current.declaredVotes += item.declaredVotes;
    current.validatedVotes += item.validatedVotes;
    current.voteGoal += item.voteGoal;
    current.distanceToGoal = Math.max(current.voteGoal - current.validatedVotes, 0);
    grouped.set(item.city, current);
  });
  return Array.from(grouped.values()).sort((a, b) => b.validatedVotes - a.validatedVotes);
}

function report(id: string, title: string, type: ReportType, description: string, scope: string): ReportDefinition {
  return { id, title, type, description, scope };
}

function metric(label: string, value: string | number) {
  return { label, value };
}

function getTerritoryPriority(leaders: number, voters: number, coverage: number, validationRate: number, voteGoal: number, validatedVotes: number) {
  if (!leaders && voters > 0) return "Crítica";
  if (voteGoal > 0 && validatedVotes / voteGoal < 0.25) return "Alta";
  if (validationRate > 0 && validationRate < 35) return "Alta";
  if (coverage < 2 && voters > 0) return "Média";
  return "Manter";
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
    filters.lideranca !== "todos" ? filters.lideranca : null,
  ].filter(Boolean).join(" · ") || "Todos os dados disponíveis";
}

function leaderSupport(item: { registered_supporters: number; estimated_direct_supporters: number; estimated_indirect_supporters: number }) {
  return Number(item.registered_supporters ?? 0) + Number(item.estimated_direct_supporters ?? 0) + Number(item.estimated_indirect_supporters ?? 0);
}

function sumLeadersSupport(leaders: Array<{ registered_supporters: number; estimated_direct_supporters: number; estimated_indirect_supporters: number }>) {
  return leaders.reduce((total, item) => total + leaderSupport(item), 0);
}

function sum<T>(records: T[], key: keyof T) {
  return records.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function percent(value: number, base: number) {
  return base ? Math.round((value / base) * 1000) / 10 : 0;
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
