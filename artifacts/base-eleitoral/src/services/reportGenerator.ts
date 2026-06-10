import { isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Leader, LeaderMonthlyMetric } from "@/types/database";
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

type LeaderReportNumbers = {
  supportEstimate: number;
  minVotes: number;
  maxVotes: number;
  baseCost: number;
  ceilingCost: number;
  extraCost: number;
  totalCost: number;
};

type CoordinatorRollup = {
  coordinator: Leader;
  descendants: Leader[];
  linkedLeaders: Leader[];
  numbers: LeaderReportNumbers;
};

export const reportDefinitions: ReportDefinition[] = [
  report("geral", "Relatório Geral Operacional", "Geral", "Visão consolidada de coordenações, lideranças, apoio estimado, votos e territórios prioritários.", "Operação completa"),
  report("lideranca", "Relatório por Cadastro Territorial", "Liderança", "Performance hierárquica de coordenadores e lideranças, com números individuais, somatórios dos subordinados, votos e custos mensais.", "Cadastros"),
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
  const currentMetrics = getCurrentMetrics(dataset.leaderMonthlyMetrics);
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
      estimatedSupporters: sumMetric(currentMetrics, "estimated_supporters") || sumLeadersSupport(dataset.leaders),
      analyzedValidatedVotes: sumMetric(currentMetrics, "min_votes") || sum(dataset.leaders, "validated_votes"),
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
  const chart = buildChartForReport(definition.id, territoryRows, filtered);
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
  const leaderIds = new Set(leaders.map((item) => item.id));

  return {
    ...dataset,
    leaders,
    leaderMonthlyMetrics: dataset.leaderMonthlyMetrics.filter((item) => leaderIds.has(item.leader_id)),
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
    return buildLeaderHierarchyRows(dataset);
  }

  if (reportId === "custos") {
    const metricMap = getCurrentMetricMap(dataset.leaderMonthlyMetrics);
    return dataset.leaders.map((item) => ({
      Cadastro: item.full_name,
      Papel: item.leader_type,
      Cidade: item.city,
      Bairro: item.neighborhood,
      "Custo base mensal": getLeaderMetricValue(item, metricMap, "base_cost", 0),
      "Teto mensal": getLeaderMetricValue(item, metricMap, "ceiling_cost", 0),
      "Despesa extra": getLeaderMetricValue(item, metricMap, "extra_cost", 0),
      "Custo por voto mínimo": costPerVote(
        getLeaderMetricValue(item, metricMap, "ceiling_cost", 0) + getLeaderMetricValue(item, metricMap, "extra_cost", 0),
        getLeaderMetricValue(item, metricMap, "min_votes", item.validated_votes),
      ),
    }));
  }

  return territoryRows.map((item) => ({
    Área: item.area,
    Cidade: item.city,
    "Região/Distrito": item.region,
    Lideranças: item.leaders,
    "Apoio estimado": item.supportEstimate,
    "Votos mínimos": item.validatedVotes,
    "Votos máximos": item.declaredVotes,
    "Meta atual": item.voteGoal,
    Cobertura: `${item.coverage}%`,
    Confirmação: `${item.validationRate}%`,
    Distância: item.distanceToGoal,
    Responsável: item.responsible,
    Prioridade: item.priority,
  }));
}

function buildMetricsForReport(reportId: string, dataset: DashboardDataset, territoryRows: TerritoryReportRow[], rows: Array<Record<string, string | number>>) {
  const currentMetrics = getCurrentMetrics(dataset.leaderMonthlyMetrics);
  const supportEstimate = sumMetric(currentMetrics, "estimated_supporters") || sumLeadersSupport(dataset.leaders);
  const minVotes = sumMetric(currentMetrics, "min_votes") || sum(dataset.leaders, "validated_votes");
  const maxVotes = sumMetric(currentMetrics, "max_votes") || sum(dataset.leaders, "declared_votes");
  const monthlyCost = sumMetric(currentMetrics, "ceiling_cost") + sumMetric(currentMetrics, "extra_cost");
  const distance = Math.max(maxVotes - minVotes, 0);

  if (reportId === "lideranca") {
    const rollups = buildCoordinatorRollups(dataset);
    const leadersById = new Map(dataset.leaders.map((item) => [item.id, item]));
    const subordinateLeaderIds = new Set(rollups.flatMap((item) => item.descendants.map((leader) => leader.id)));
    const linkedLeaders = Array.from(subordinateLeaderIds).filter((id) => {
      const leader = leadersById.get(id);
      return leader && !isCoordinatorLeader(leader);
    }).length;
    const withoutLink = dataset.leaders.filter((item) => !isCoordinatorLeader(item) && !item.parent_leader_id).length;

    return [
      metric("Coordenações", rollups.length),
      metric("Lideranças vinculadas", linkedLeaders),
      metric("Sem vínculo", withoutLink),
      metric("Apoio total", supportEstimate),
      metric("Votos mínimos", minVotes),
      metric("Votos máximos", maxVotes),
      metric("Custo total (R$)", monthlyCost),
      metric("Custo/voto mín.", costPerVote(monthlyCost, minVotes)),
    ];
  }

  if (reportId === "custos") {
    return [
      metric("Cadastros com custo", dataset.leaders.length),
      metric("Custo base", sumMetric(currentMetrics, "base_cost")),
      metric("Teto mensal", sumMetric(currentMetrics, "ceiling_cost")),
      metric("Extras", sumMetric(currentMetrics, "extra_cost")),
      metric("Custo/voto mínimo", costPerVote(monthlyCost, minVotes)),
    ];
  }

  return [
    metric("Cadastros", dataset.leaders.length),
    metric("Territórios", territoryRows.length),
    metric("Apoio estimado", supportEstimate),
    metric("Votos mínimos", minVotes),
    metric("Votos máximos", maxVotes),
    metric("Confirmação", `${percent(minVotes, maxVotes)}%`),
    metric("Distância", distance || sum(rows, "Distância")),
  ];
}

function buildChartForReport(reportId: string, territoryRows: TerritoryReportRow[], dataset: DashboardDataset) {
  if (reportId === "lideranca") return buildCoordinatorChartRows(dataset);

  const rows = reportId === "municipio" ? cityChartRows(territoryRows) : territoryRows;
  return rows.slice(0, 8).map((item) => ({
    name: item.area,
    maximos: item.declaredVotes,
    minimos: item.validatedVotes,
    apoio: item.supportEstimate,
  }));
}

function buildLeaderHierarchyRows(dataset: DashboardDataset) {
  const metricMap = getCurrentMetricMap(dataset.leaderMonthlyMetrics);
  const rollups = buildCoordinatorRollups(dataset);
  const descendantIds = new Set(rollups.flatMap((item) => item.descendants.map((leader) => leader.id)));
  const rows: Array<Record<string, string | number>> = [];

  rollups.forEach(({ coordinator, descendants, linkedLeaders, numbers }) => {
    rows.push({
      Nível: "Coordenação",
      Cadastro: coordinator.full_name,
      Coordenação: "-",
      Cidade: coordinator.city,
      Bairro: coordinator.neighborhood,
      "Lideranças vinculadas": linkedLeaders.length,
      "Apoio total": numbers.supportEstimate,
      "Custo total (R$)": numbers.totalCost,
      Papel: coordinator.leader_type,
      "Votos mínimos": numbers.minVotes,
      "Votos máximos": numbers.maxVotes,
      "Custo base (R$)": numbers.baseCost,
      "Custo teto (R$)": numbers.ceilingCost,
      "Extras (R$)": numbers.extraCost,
      "Custo/voto mín.": costPerVote(numbers.totalCost, numbers.minVotes),
      "Lista de lideranças": linkedLeaders.map((leader) => leader.full_name).join(", ") || "Sem lideranças vinculadas",
    });

    descendants.forEach((leader) => {
      const itemNumbers = leaderReportNumbers(leader, metricMap);
      rows.push({
        Nível: isCoordinatorLeader(leader) ? "Subcoordenação" : "Liderança vinculada",
        Cadastro: leader.full_name,
        Coordenação: coordinator.full_name,
        Cidade: leader.city,
        Bairro: leader.neighborhood,
        "Lideranças vinculadas": "-",
        "Apoio total": itemNumbers.supportEstimate,
        "Custo total (R$)": itemNumbers.totalCost,
        Papel: leader.leader_type,
        "Votos mínimos": itemNumbers.minVotes,
        "Votos máximos": itemNumbers.maxVotes,
        "Custo base (R$)": itemNumbers.baseCost,
        "Custo teto (R$)": itemNumbers.ceilingCost,
        "Extras (R$)": itemNumbers.extraCost,
        "Custo/voto mín.": costPerVote(itemNumbers.totalCost, itemNumbers.minVotes),
        Confiança: leader.confidence_level,
        Status: leader.status,
        "Próxima ação": leader.next_action ?? "Validar estimativa",
      });
    });
  });

  dataset.leaders
    .filter((leader) => !isCoordinatorLeader(leader) && !leader.parent_leader_id && !descendantIds.has(leader.id))
    .forEach((leader) => {
      const itemNumbers = leaderReportNumbers(leader, metricMap);
      rows.push({
        Nível: "Liderança sem vínculo",
        Cadastro: leader.full_name,
        Coordenação: "Nenhuma",
        Cidade: leader.city,
        Bairro: leader.neighborhood,
        "Lideranças vinculadas": "-",
        "Apoio total": itemNumbers.supportEstimate,
        "Custo total (R$)": itemNumbers.totalCost,
        Papel: leader.leader_type,
        "Votos mínimos": itemNumbers.minVotes,
        "Votos máximos": itemNumbers.maxVotes,
        "Custo base (R$)": itemNumbers.baseCost,
        "Custo teto (R$)": itemNumbers.ceilingCost,
        "Extras (R$)": itemNumbers.extraCost,
        "Custo/voto mín.": costPerVote(itemNumbers.totalCost, itemNumbers.minVotes),
        Confiança: leader.confidence_level,
        Status: leader.status,
        "Próxima ação": leader.next_action ?? "Vincular a uma coordenação",
      });
    });

  return rows;
}

function buildCoordinatorChartRows(dataset: DashboardDataset) {
  return buildCoordinatorRollups(dataset).slice(0, 8).map(({ coordinator, numbers }) => ({
    name: coordinator.full_name,
    maximos: numbers.maxVotes,
    minimos: numbers.minVotes,
    apoio: numbers.supportEstimate,
    custo: numbers.totalCost,
  }));
}

function buildCoordinatorRollups(dataset: DashboardDataset): CoordinatorRollup[] {
  const metricMap = getCurrentMetricMap(dataset.leaderMonthlyMetrics);
  const childrenByParent = buildChildrenByParent(dataset.leaders);
  const coordinatorIds = new Set<string>();

  dataset.leaders.forEach((leader) => {
    if (isCoordinatorLeader(leader) || childrenByParent.has(leader.id)) coordinatorIds.add(leader.id);
  });

  return dataset.leaders
    .filter((leader) => coordinatorIds.has(leader.id))
    .map((coordinator) => {
      const descendants = collectDescendants(coordinator.id, childrenByParent);
      const linkedLeaders = descendants.filter((leader) => !isCoordinatorLeader(leader));
      return {
        coordinator,
        descendants,
        linkedLeaders,
        numbers: sumLeaderReportNumbers([coordinator, ...descendants], metricMap),
      };
    })
    .sort((a, b) => b.numbers.totalCost - a.numbers.totalCost || b.numbers.maxVotes - a.numbers.maxVotes);
}

function buildChildrenByParent(leaders: Leader[]) {
  const childrenByParent = new Map<string, Leader[]>();
  const leadersById = new Map(leaders.map((leader) => [leader.id, leader]));

  leaders.forEach((leader) => {
    if (!leader.parent_leader_id || !leadersById.has(leader.parent_leader_id)) return;
    const current = childrenByParent.get(leader.parent_leader_id) ?? [];
    current.push(leader);
    childrenByParent.set(leader.parent_leader_id, current);
  });

  return childrenByParent;
}

function collectDescendants(parentId: string, childrenByParent: Map<string, Leader[]>, visited = new Set<string>()): Leader[] {
  if (visited.has(parentId)) return [];
  visited.add(parentId);

  const children = childrenByParent.get(parentId) ?? [];
  return children.flatMap((child) => [child, ...collectDescendants(child.id, childrenByParent, visited)]);
}

function leaderReportNumbers(leader: Leader, metricMap: Map<string, LeaderMonthlyMetric>): LeaderReportNumbers {
  const baseCost = getLeaderMetricValue(leader, metricMap, "base_cost", 0);
  const ceilingCost = getLeaderMetricValue(leader, metricMap, "ceiling_cost", 0);
  const extraCost = getLeaderMetricValue(leader, metricMap, "extra_cost", 0);

  return {
    supportEstimate: getLeaderMetricValue(leader, metricMap, "estimated_supporters", leaderSupport(leader)),
    minVotes: getLeaderMetricValue(leader, metricMap, "min_votes", leader.validated_votes),
    maxVotes: getLeaderMetricValue(leader, metricMap, "max_votes", leader.declared_votes),
    baseCost,
    ceilingCost,
    extraCost,
    totalCost: ceilingCost + extraCost,
  };
}

function sumLeaderReportNumbers(leaders: Leader[], metricMap: Map<string, LeaderMonthlyMetric>): LeaderReportNumbers {
  return leaders.reduce<LeaderReportNumbers>((total, leader) => {
    const numbers = leaderReportNumbers(leader, metricMap);
    return {
      supportEstimate: total.supportEstimate + numbers.supportEstimate,
      minVotes: total.minVotes + numbers.minVotes,
      maxVotes: total.maxVotes + numbers.maxVotes,
      baseCost: total.baseCost + numbers.baseCost,
      ceilingCost: total.ceilingCost + numbers.ceilingCost,
      extraCost: total.extraCost + numbers.extraCost,
      totalCost: total.totalCost + numbers.totalCost,
    };
  }, { supportEstimate: 0, minVotes: 0, maxVotes: 0, baseCost: 0, ceilingCost: 0, extraCost: 0, totalCost: 0 });
}

function isCoordinatorLeader(leader: Leader) {
  return normalize(leader.leader_type).includes("coord");
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
  if (reportId === "lideranca") {
    const rollups = buildCoordinatorRollups(dataset);
    const leadersById = new Map(dataset.leaders.map((item) => [item.id, item]));
    const linkedLeaders = new Set(rollups.flatMap((item) => item.descendants.map((leader) => leader.id)));
    const linkedLeadershipCount = Array.from(linkedLeaders).filter((id) => {
      const leader = leadersById.get(id);
      return leader && !isCoordinatorLeader(leader);
    }).length;
    const monthlyCost = sumMetric(getCurrentMetrics(dataset.leaderMonthlyMetrics), "ceiling_cost") + sumMetric(getCurrentMetrics(dataset.leaderMonthlyMetrics), "extra_cost");

    return `${base} A leitura hierárquica consolida ${rollups.length} coordenação(ões), ${linkedLeadershipCount} liderança(s) vinculada(s) e custo mensal de R$ ${monthlyCost.toLocaleString("pt-BR")}. Cada coordenação soma seus próprios números com os subordinados vinculados.`;
  }
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

function getCurrentMetrics(metrics: LeaderMonthlyMetric[]) {
  const latestMonth = metrics.map((item) => item.month_ref).filter(Boolean).sort((a, b) => b.localeCompare(a))[0];
  return latestMonth ? metrics.filter((item) => item.month_ref === latestMonth) : [];
}

function getCurrentMetricMap(metrics: LeaderMonthlyMetric[]) {
  return new Map(getCurrentMetrics(metrics).map((item) => [item.leader_id, item]));
}

function getLeaderMetricValue(leader: Leader, metricMap: Map<string, LeaderMonthlyMetric>, key: keyof Pick<LeaderMonthlyMetric, "estimated_supporters" | "min_votes" | "max_votes" | "base_cost" | "ceiling_cost" | "extra_cost">, fallback: number) {
  return Number(metricMap.get(leader.id)?.[key] ?? fallback ?? 0);
}

function sumMetric(metrics: LeaderMonthlyMetric[], key: keyof Pick<LeaderMonthlyMetric, "estimated_supporters" | "min_votes" | "max_votes" | "base_cost" | "ceiling_cost" | "extra_cost">) {
  return metrics.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function costPerVote(cost: number, votes: number) {
  return votes ? Math.round(cost / votes) : 0;
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
