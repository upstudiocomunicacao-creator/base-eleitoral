import { isSupabaseConfigured } from "@/lib/supabaseClient";
import type { DashboardDataset } from "./dashboard";
import { getDashboardDataset } from "./dashboard";

export type ComparisonPriority = "Crítica" | "Alta" | "Média" | "Baixa" | "Manter";
export type OpportunityLevel = "Baixo" | "Médio" | "Alto" | "Crítico";
export type TerritorialStrength = "Fraco" | "Em desenvolvimento" | "Forte" | "Muito forte";
export type RegionStatus = "Forte" | "Em desenvolvimento" | "Oportunidade" | "Baixa cobertura" | "Sem liderança" | "Meta próxima";

export type RegionalComparisonRow = {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  zones: string[];
  sections: string[];
  votingPlaces: string[];
  voters: number;
  leaders: number;
  registeredSupporters: number;
  estimatedSupporters: number;
  activeProspects: number;
  undecided: number;
  openDemands: number;
  plannedActions: number;
  declaredVotes: number;
  validatedVotes: number;
  voteGoal: number;
  distanceToGoal: number;
  coverage: number;
  goalCompletion: number;
  validationRate: number;
  confidenceIndex: number;
  unexploredPotential: number;
  opportunity: OpportunityLevel;
  opportunityScore: number;
  territorialStrength: TerritorialStrength;
  territorialStrengthScore: number;
  priority: ComparisonPriority;
  status: RegionStatus;
  responsible: string;
  linkedLeaders: string[];
  strategicAnalysis: string;
  recommendedActions: string[];
};

export type ComparisonSummary = {
  mappedVoters: number;
  leaders: number;
  registeredSupporters: number;
  estimatedSupporters: number;
  declaredVotes: number;
  validatedVotes: number;
  voteGoal: number;
  distanceToGoal: number;
  coverage: number;
  validationRate: number;
  highPriorityNeighborhoods: number;
  attentionZones: number;
  regionsWithoutLeader: number;
  regionsNearGoal: number;
};

export type ComparisonChartsData = {
  votersVsValidated: Array<{ name: string; eleitores: number; validados: number }>;
  declaredVsValidated: Array<{ name: string; declarados: number; validados: number }>;
  coverageByNeighborhood: Array<{ name: string; cobertura: number }>;
  distanceToGoal: Array<{ name: string; distancia: number }>;
  opportunityRanking: Array<{ name: string; oportunidade: number }>;
  priorityDistribution: Array<{ name: string; value: number }>;
  strengthByNeighborhood: Array<{ name: string; forca: number }>;
  openDemands: Array<{ name: string; demandas: number }>;
  plannedActions: Array<{ name: string; acoes: number }>;
};

export type ComparisonComputed = {
  rows: RegionalComparisonRow[];
  summary: ComparisonSummary;
  charts: ComparisonChartsData;
  rankings: {
    criticalNeighborhoods: RegionalComparisonRow[];
    opportunityZones: RegionalComparisonRow[];
    lowCadastroRegions: RegionalComparisonRow[];
    regionsWithoutLeader: RegionalComparisonRow[];
    openDemandRegions: RegionalComparisonRow[];
    nearGoalRegions: RegionalComparisonRow[];
    leaderImpact: Array<{ name: string; neighborhood: string; validatedVotes: number; estimatedSupporters: number }>;
  };
  warnings: string[];
};

export function isElectoralComparisonSupabaseReady() {
  return isSupabaseConfigured;
}

export async function getRegionalComparisonRows(): Promise<RegionalComparisonRow[]> {
  return buildRegionalRows(await getDashboardDataset());
}

export async function getElectoralComparisonSummary(): Promise<ComparisonSummary> {
  return buildSummary(await getRegionalComparisonRows());
}

export async function getPriorityRegions(): Promise<RegionalComparisonRow[]> {
  return (await getRegionalComparisonRows()).filter((row) => row.priority === "Crítica" || row.priority === "Alta");
}

export async function getOpportunityRanking(): Promise<RegionalComparisonRow[]> {
  return sortBy(await getRegionalComparisonRows(), (row) => row.opportunityScore).slice(0, 10);
}

export async function getTerritorialStrengthRanking(): Promise<RegionalComparisonRow[]> {
  return sortBy(await getRegionalComparisonRows(), (row) => row.territorialStrengthScore).slice(0, 10);
}

export async function getComparisonChartsData(): Promise<ComparisonChartsData> {
  return buildCharts(await getRegionalComparisonRows());
}

export async function getRegionDetail(id: string): Promise<RegionalComparisonRow | null> {
  return (await getRegionalComparisonRows()).find((row) => row.id === id) ?? null;
}

export async function getElectoralComparisonData(): Promise<ComparisonComputed> {
  const dataset = await getDashboardDataset();
  const rows = buildRegionalRows(dataset);
  return buildComparisonComputed(rows, dataset.warnings);
}

export function buildComparisonComputed(rows: RegionalComparisonRow[], warnings: string[] = []): ComparisonComputed {
  return {
    rows,
    summary: buildSummary(rows),
    charts: buildCharts(rows),
    rankings: {
      criticalNeighborhoods: rows.filter((row) => row.priority === "Crítica").sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 5),
      opportunityZones: sortBy(rows, (row) => row.opportunityScore).slice(0, 5),
      lowCadastroRegions: sortBy(rows, (row) => Math.max(row.voters - row.registeredSupporters * 20, 0)).slice(0, 5),
      regionsWithoutLeader: rows.filter((row) => row.leaders === 0).sort((a, b) => b.voters - a.voters).slice(0, 5),
      openDemandRegions: sortBy(rows, (row) => row.openDemands).slice(0, 5),
      nearGoalRegions: rows.filter((row) => row.distanceToGoal <= 120).sort((a, b) => a.distanceToGoal - b.distanceToGoal).slice(0, 5),
      leaderImpact: [],
    },
    warnings,
  };
}

function buildRegionalRows(dataset: DashboardDataset): RegionalComparisonRow[] {
  const keys = new Map<string, { neighborhood: string; city: string; state: string }>();
  const addKey = (neighborhood: string, city: string, state: string) => {
    const cleanNeighborhood = neighborhood?.trim();
    const cleanCity = city?.trim();
    const cleanState = state?.trim() || "RJ";
    if (!cleanNeighborhood || !cleanCity) return;
    keys.set(regionKey(cleanNeighborhood, cleanCity, cleanState), {
      neighborhood: cleanNeighborhood,
      city: cleanCity,
      state: cleanState,
    });
  };

  dataset.neighborhoods.forEach((item) => addKey(item.name, item.city, item.state));
  dataset.electoralZones.forEach((item) => addKey(item.neighborhood, item.city, item.state));
  dataset.leaders.forEach((item) => addKey(item.neighborhood, item.city, item.state));
  dataset.supporters.forEach((item) => addKey(item.neighborhood, item.city, item.state));
  dataset.prospects.forEach((item) => addKey(item.neighborhood, item.city, "RJ"));
  dataset.demands.forEach((item) => addKey(item.neighborhood, item.city, item.state));
  dataset.fieldAgenda.forEach((item) => addKey(item.neighborhood, item.city, item.state));

  return Array.from(keys.values()).map((region) => buildRegionRow(region, dataset)).sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || b.voters - a.voters);
}

function buildRegionRow(region: { neighborhood: string; city: string; state: string }, dataset: DashboardDataset): RegionalComparisonRow {
  const inRegion = (item: { neighborhood: string; city: string; state?: string }) =>
    normalize(item.neighborhood) === normalize(region.neighborhood) &&
    normalize(item.city) === normalize(region.city) &&
    (!item.state || normalize(item.state) === normalize(region.state));

  const leaders = dataset.leaders.filter(inRegion);
  const supporters = dataset.supporters.filter(inRegion);
  const prospects = dataset.prospects.filter((item) => normalize(item.neighborhood) === normalize(region.neighborhood) && normalize(item.city) === normalize(region.city));
  const zones = dataset.electoralZones.filter(inRegion);
  const demands = dataset.demands.filter(inRegion);
  const agenda = dataset.fieldAgenda.filter(inRegion);
  const neighborhoodData = dataset.neighborhoods.find((item) => normalize(item.name) === normalize(region.neighborhood) && normalize(item.city) === normalize(region.city));

  const voters = Number(neighborhoodData?.estimated_voters ?? 0) || sum(zones, "voters_count");
  const estimatedSupporters = leaders.reduce((total, item) => total + Number(item.estimated_direct_supporters ?? 0) + Number(item.estimated_indirect_supporters ?? 0), 0);
  const declaredVotes = sum(leaders, "declared_votes") + sum(zones, "estimated_campaign_votes");
  const validatedVotes = sum(leaders, "validated_votes") + sum(zones, "validated_votes");
  const voteGoal = sum(zones, "vote_goal") || Math.round(voters * 0.05);
  const openDemands = demands.filter((item) => !["resolvida", "cancelada"].includes(normalize(item.status))).length;
  const plannedActions = agenda.filter((item) => isFutureAction(item.action_date, item.status)).length;
  const activeProspects = prospects.filter((item) => !["voto validado", "perdido", "recusou apoio"].includes(normalize(item.funnel_stage)) && !normalize(item.loss_reason).trim()).length;
  const undecided = supporters.filter((item) => normalize(item.political_status).includes("indeciso")).length + prospects.filter((item) => normalize(item.funnel_stage).includes("indeciso") || normalize(item.confidence_level).includes("baixo")).length;
  const coverage = voters ? percent(validatedVotes, voters) : 0;
  const goalCompletion = voteGoal ? percent(validatedVotes, voteGoal) : 0;
  const distanceToGoal = Math.max(voteGoal - validatedVotes, 0);
  const validationRate = declaredVotes ? percent(validatedVotes, declaredVotes) : 0;
  const confidenceIndex = leaders.length ? Math.round(leaders.reduce((total, item) => total + confidenceScore(item.confidence_level), 0) / leaders.length) : 0;
  const unexploredPotential = Math.max(voters - validatedVotes, 0);
  const opportunityScore = getOpportunityScore({ voters, coverage, leaders: leaders.length, plannedActions, openDemands, undecided, validatedVotes });
  const territorialStrengthScore = getStrengthScore({ leaders: leaders.length, supporters: supporters.length, estimatedSupporters, validatedVotes, validationRate, confidenceIndex, completedActions: agenda.filter((item) => normalize(item.status) === "concluida").length });
  const opportunity = getOpportunityLevel(opportunityScore);
  const territorialStrength = getStrengthLevel(territorialStrengthScore);
  const priority = getAutoPriority({ voters, coverage, leaders: leaders.length, goalCompletion, territorialStrengthScore });
  const status = getRegionStatus({ leaders: leaders.length, coverage, goalCompletion, territorialStrength });

  return {
    id: regionKey(region.neighborhood, region.city, region.state),
    neighborhood: region.neighborhood,
    city: region.city,
    state: region.state,
    zones: unique(zones.map((item) => item.zone_number)),
    sections: unique(zones.map((item) => item.section_number ?? "")),
    votingPlaces: unique(zones.map((item) => item.voting_place)),
    voters,
    leaders: leaders.length,
    registeredSupporters: supporters.length,
    estimatedSupporters,
    activeProspects,
    undecided,
    openDemands,
    plannedActions,
    declaredVotes,
    validatedVotes,
    voteGoal,
    distanceToGoal,
    coverage,
    goalCompletion,
    validationRate,
    confidenceIndex,
    unexploredPotential,
    opportunity,
    opportunityScore,
    territorialStrength,
    territorialStrengthScore,
    priority,
    status,
    responsible: firstNonEmpty([...leaders.map((item) => item.internal_responsible), ...supporters.map((item) => item.internal_responsible), ...agenda.map((item) => item.internal_responsible), ...demands.map((item) => item.internal_responsible)]) ?? "Não definido",
    linkedLeaders: leaders.map((item) => item.full_name),
    strategicAnalysis: buildAnalysis(region.neighborhood, { voters, coverage, validatedVotes, leaders: leaders.length, activeProspects, distanceToGoal, priority, territorialStrength }),
    recommendedActions: buildRecommendedActions({ leaders: leaders.length, coverage, plannedActions, openDemands, distanceToGoal, undecided }),
  };
}

function buildSummary(rows: RegionalComparisonRow[]): ComparisonSummary {
  const mappedVoters = sum(rows, "voters");
  const declaredVotes = sum(rows, "declaredVotes");
  const validatedVotes = sum(rows, "validatedVotes");
  const voteGoal = sum(rows, "voteGoal");
  return {
    mappedVoters,
    leaders: sum(rows, "leaders"),
    registeredSupporters: sum(rows, "registeredSupporters"),
    estimatedSupporters: sum(rows, "estimatedSupporters"),
    declaredVotes,
    validatedVotes,
    voteGoal,
    distanceToGoal: Math.max(voteGoal - validatedVotes, 0),
    coverage: mappedVoters ? percent(validatedVotes, mappedVoters) : 0,
    validationRate: declaredVotes ? percent(validatedVotes, declaredVotes) : 0,
    highPriorityNeighborhoods: rows.filter((item) => item.priority === "Crítica" || item.priority === "Alta").length,
    attentionZones: unique(rows.filter((item) => item.priority === "Crítica" || item.priority === "Alta").flatMap((item) => item.zones)).length,
    regionsWithoutLeader: rows.filter((item) => item.leaders === 0).length,
    regionsNearGoal: rows.filter((item) => item.distanceToGoal <= 120 || item.goalCompletion >= 85).length,
  };
}

function buildCharts(rows: RegionalComparisonRow[]): ComparisonChartsData {
  const topRows = rows.slice(0, 10);
  return {
    votersVsValidated: topRows.map((item) => ({ name: item.neighborhood, eleitores: item.voters, validados: item.validatedVotes })),
    declaredVsValidated: topRows.map((item) => ({ name: item.neighborhood, declarados: item.declaredVotes, validados: item.validatedVotes })),
    coverageByNeighborhood: topRows.map((item) => ({ name: item.neighborhood, cobertura: item.coverage })),
    distanceToGoal: topRows.map((item) => ({ name: item.neighborhood, distancia: item.distanceToGoal })),
    opportunityRanking: sortBy(rows, (item) => item.opportunityScore).slice(0, 8).map((item) => ({ name: item.neighborhood, oportunidade: item.opportunityScore })),
    priorityDistribution: countSeries(rows.map((item) => item.priority)),
    strengthByNeighborhood: topRows.map((item) => ({ name: item.neighborhood, forca: item.territorialStrengthScore })),
    openDemands: sortBy(rows, (item) => item.openDemands).slice(0, 8).map((item) => ({ name: item.neighborhood, demandas: item.openDemands })),
    plannedActions: sortBy(rows, (item) => item.plannedActions).slice(0, 8).map((item) => ({ name: item.neighborhood, acoes: item.plannedActions })),
  };
}

function getOpportunityScore(input: { voters: number; coverage: number; leaders: number; plannedActions: number; openDemands: number; undecided: number; validatedVotes: number }) {
  const voterScore = Math.min(input.voters / 300, 30);
  const coverageScore = input.coverage < 2 ? 24 : input.coverage < 5 ? 16 : 6;
  const leaderScore = input.leaders === 0 ? 18 : input.leaders <= 1 ? 12 : 4;
  const actionScore = input.plannedActions === 0 ? 10 : input.plannedActions <= 1 ? 6 : 2;
  const demandScore = Math.min(input.openDemands * 3, 9);
  const undecidedScore = Math.min(input.undecided / 10, 9);
  return Math.round(Math.min(100, voterScore + coverageScore + leaderScore + actionScore + demandScore + undecidedScore));
}

function getStrengthScore(input: { leaders: number; supporters: number; estimatedSupporters: number; validatedVotes: number; validationRate: number; confidenceIndex: number; completedActions: number }) {
  return Math.round(Math.min(100, input.leaders * 7 + input.supporters / 10 + input.estimatedSupporters / 40 + input.validatedVotes / 18 + input.validationRate * 0.2 + input.confidenceIndex * 0.2 + input.completedActions * 3));
}

function getOpportunityLevel(score: number): OpportunityLevel {
  if (score >= 75) return "Crítico";
  if (score >= 55) return "Alto";
  if (score >= 30) return "Médio";
  return "Baixo";
}

function getStrengthLevel(score: number): TerritorialStrength {
  if (score >= 80) return "Muito forte";
  if (score >= 58) return "Forte";
  if (score >= 30) return "Em desenvolvimento";
  return "Fraco";
}

function getAutoPriority(input: { voters: number; coverage: number; leaders: number; goalCompletion: number; territorialStrengthScore: number }): ComparisonPriority {
  if (input.territorialStrengthScore >= 78 && input.goalCompletion >= 85) return "Manter";
  if (input.voters >= 9000 && input.coverage < 3 && input.leaders <= 1) return "Crítica";
  if (input.voters >= 7000 && input.coverage < 5) return "Alta";
  if (input.goalCompletion < 65) return "Média";
  return "Baixa";
}

function getRegionStatus(input: { leaders: number; coverage: number; goalCompletion: number; territorialStrength: TerritorialStrength }): RegionStatus {
  if (input.leaders === 0) return "Sem liderança";
  if (input.territorialStrength === "Muito forte") return "Forte";
  if (input.goalCompletion >= 85) return "Meta próxima";
  if (input.coverage < 3) return "Baixa cobertura";
  if (input.coverage < 7) return "Oportunidade";
  return "Em desenvolvimento";
}

function buildAnalysis(neighborhood: string, input: { voters: number; coverage: number; validatedVotes: number; leaders: number; activeProspects: number; distanceToGoal: number; priority: ComparisonPriority; territorialStrength: TerritorialStrength }) {
  if (input.priority === "Crítica") return `${neighborhood} possui alto volume de eleitores, baixa cobertura e poucos votos validados. Prioridade para novas lideranças e agenda de campo.`;
  if (input.priority === "Alta") return `${neighborhood} tem potencial eleitoral relevante e ainda precisa acelerar cadastros, validação e presença de campo.`;
  if (input.territorialStrength === "Muito forte" || input.priority === "Manter") return `${neighborhood} apresenta boa força territorial. Manter presença, proteger a base e converter indecisos.`;
  if (input.activeProspects > input.validatedVotes) return `${neighborhood} tem prospecção ativa, mas precisa converter contatos em apoiadores confirmados e votos validados.`;
  return `${neighborhood} está em desenvolvimento, com distância de ${input.distanceToGoal.toLocaleString("pt-BR")} votos até a meta.`;
}

function buildRecommendedActions(input: { leaders: number; coverage: number; plannedActions: number; openDemands: number; distanceToGoal: number; undecided: number }) {
  const actions: string[] = [];
  if (input.leaders === 0) actions.push("Mapear e cadastrar liderança local.");
  if (input.coverage < 5) actions.push("Realizar mutirão de validação de votos e endereços.");
  if (input.plannedActions === 0) actions.push("Agendar ação de campo nos próximos 7 dias.");
  if (input.openDemands > 0) actions.push("Dar retorno às demandas abertas antes da próxima agenda.");
  if (input.undecided > 0) actions.push("Criar régua de contato para indecisos.");
  if (input.distanceToGoal <= 120) actions.push("Executar ação rápida para fechar a meta.");
  return actions.length ? actions : ["Manter acompanhamento semanal e atualizar metas por seção."];
}

function isFutureAction(dateValue: string, status: string) {
  const date = parseDate(dateValue);
  return date >= startOfToday() && ["agendada", "em andamento"].includes(normalize(status));
}

function confidenceScore(value: string) {
  const normalized = normalize(value);
  if (normalized.includes("alto")) return 100;
  if (normalized.includes("medio")) return 60;
  if (normalized.includes("baixo")) return 30;
  return 10;
}

function countSeries(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, raw) => {
    const key = raw || "Não definido";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function firstNonEmpty(values: Array<string | null | undefined>) {
  return values.find((value) => value?.trim())?.trim();
}

function regionKey(neighborhood: string, city: string, state: string) {
  return `${normalize(state)}__${normalize(city)}__${normalize(neighborhood)}`;
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 1000) / 10 : 0;
}

function sum<T>(records: T[], key: keyof T) {
  return records.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function sortBy<T>(items: T[], getValue: (item: T) => number) {
  return items.slice().sort((a, b) => getValue(b) - getValue(a));
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function priorityWeight(priority: ComparisonPriority) {
  if (priority === "Crítica") return 5;
  if (priority === "Alta") return 4;
  if (priority === "Média") return 3;
  if (priority === "Baixa") return 2;
  return 1;
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}
