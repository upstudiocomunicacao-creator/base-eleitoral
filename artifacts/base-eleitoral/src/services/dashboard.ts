import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Campaign, Demand, ElectoralZone, FieldAgenda, Leader, Municipality, Neighborhood, Prospect, Supporter } from "@/types/database";
import { listLeaders } from "./leaders";

export type DashboardDataset = {
  campaigns: Campaign[];
  leaders: Leader[];
  supporters: Supporter[];
  prospects: Prospect[];
  electoralZones: ElectoralZone[];
  fieldAgenda: FieldAgenda[];
  demands: Demand[];
  municipalities: Municipality[];
  neighborhoods: Neighborhood[];
  warnings: string[];
};

export type DashboardFilters = {
  state: string;
  city: string;
  neighborhood: string;
  period: string;
  leaderId: string;
  responsible: string;
  politicalStatus: string;
  priority: string;
};

export type DashboardSummary = {
  totalLeaders: number;
  activeLeaders: number;
  totalSupporters: number;
  estimatedSupporters: number;
  declaredVotes: number;
  validatedVotes: number;
  confidenceIndex: number;
  municipalitiesWithAction: number;
  coveredNeighborhoods: number;
  electoralZones: number;
  mappedVoters: number;
  generalVoteGoal: number;
  distanceToGoal: number;
  openDemands: number;
  upcomingActions: number;
  priorityRegions: number;
  generalCoverage: number;
  validationRate: number;
};

export type PriorityRegion = {
  name: string;
  city: string;
  estimatedVoters: number;
  leaders: number;
  supporters: number;
  validatedVotes: number;
  openDemands: number;
  upcomingActions: number;
  priority: "Crítica" | "Alta" | "Média" | "Baixa";
  reading: string;
};

export type DashboardComputed = {
  summary: DashboardSummary;
  weeklyGrowth: Array<{ semana: string; liderancas: number; apoiadores: number; prospeccoes: number; cadastros: number }>;
  leaderRanking: Array<{ nome: string; valor: number }>;
  neighborhoodCoverage: Array<{ nome: string; cobertura: number; apoiadores: number; liderancas: number; eleitores: number }>;
  voteComparison: Array<{ nome: string; declarados: number; validados: number }>;
  supporterStatus: Array<{ name: string; value: number }>;
  prospectFunnel: Array<{ name: string; value: number }>;
  demandCategories: Array<{ name: string; value: number }>;
  upcomingAgenda: Array<{ title: string; date: string; neighborhood: string; priority: string; status: string }>;
  priorityRegions: PriorityRegion[];
};

const emptyDataset: DashboardDataset = {
  campaigns: [],
  leaders: [],
  supporters: [],
  prospects: [],
  electoralZones: [],
  fieldAgenda: [],
  demands: [],
  municipalities: [],
  neighborhoods: [],
  warnings: [],
};

export function isDashboardSupabaseReady() {
  return isSupabaseConfigured;
}

export async function getDashboardDataset(): Promise<DashboardDataset> {
  const [campaigns, leaders, municipalities, neighborhoods] = await Promise.all([
    safeLoad("campaigns", listCampaigns()),
    safeLoad("leaders", listLeaders()),
    safeLoad("municipalities", listMunicipalities()),
    safeLoad("neighborhoods", listNeighborhoods()),
  ]);

  return {
    campaigns: campaigns.data,
    leaders: leaders.data,
    supporters: [],
    prospects: [],
    electoralZones: [],
    fieldAgenda: [],
    demands: [],
    municipalities: municipalities.data,
    neighborhoods: neighborhoods.data,
    warnings: [campaigns, leaders, municipalities, neighborhoods].flatMap((item) => item.warning ? [item.warning] : []),
  };
}

export async function getDashboardSummary(filters?: Partial<DashboardFilters>) {
  return computeDashboard(getFilteredDataset(await getDashboardDataset(), filters)).summary;
}

export async function getWeeklyGrowthData(filters?: Partial<DashboardFilters>) {
  return computeDashboard(getFilteredDataset(await getDashboardDataset(), filters)).weeklyGrowth;
}

export async function getLeaderRanking(filters?: Partial<DashboardFilters>) {
  return computeDashboard(getFilteredDataset(await getDashboardDataset(), filters)).leaderRanking;
}

export async function getNeighborhoodCoverage(filters?: Partial<DashboardFilters>) {
  return computeDashboard(getFilteredDataset(await getDashboardDataset(), filters)).neighborhoodCoverage;
}

export async function getProspectFunnelSummary(filters?: Partial<DashboardFilters>) {
  return computeDashboard(getFilteredDataset(await getDashboardDataset(), filters)).prospectFunnel;
}

export async function getDemandSummary(filters?: Partial<DashboardFilters>) {
  return computeDashboard(getFilteredDataset(await getDashboardDataset(), filters)).demandCategories;
}

export async function getUpcomingFieldAgenda(filters?: Partial<DashboardFilters>) {
  return computeDashboard(getFilteredDataset(await getDashboardDataset(), filters)).upcomingAgenda;
}

export async function getPriorityRegions(filters?: Partial<DashboardFilters>) {
  return computeDashboard(getFilteredDataset(await getDashboardDataset(), filters)).priorityRegions;
}

export function getFilteredDataset(dataset: DashboardDataset, filters: Partial<DashboardFilters> = {}): DashboardDataset {
  const state = filters.state ?? "todos";
  const city = filters.city ?? "todos";
  const neighborhood = filters.neighborhood ?? "todos";
  const leaderId = filters.leaderId ?? "todos";
  const responsible = filters.responsible ?? "todos";
  const politicalStatus = filters.politicalStatus ?? "todos";
  const priority = filters.priority ?? "todos";
  const period = filters.period ?? "todos";

  const filterLocation = (item: { state?: string; city?: string; neighborhood?: string }) =>
    selectMatches(state, item.state ?? "") &&
    selectMatches(city, item.city ?? "") &&
    selectMatches(neighborhood, item.neighborhood ?? "");

  const leaders = dataset.leaders.filter((item) =>
    filterLocation(item) &&
    selectMatches(leaderId, item.id) &&
    selectMatches(responsible, item.internal_responsible ?? "Não definido") &&
    selectMatches(politicalStatus, item.leader_type) &&
    selectMatches(priority, item.confidence_level) &&
    matchesPeriod(period, item.created_at),
  );
  const leaderIds = new Set(leaders.map((item) => item.id));

  const supporters = dataset.supporters.filter((item) =>
    filterLocation(item) &&
    (leaderId === "todos" || (item.leader_id && leaderIds.has(item.leader_id))) &&
    selectMatches(responsible, item.internal_responsible ?? "Não definido") &&
    selectMatches(politicalStatus, item.political_status) &&
    matchesPeriod(period, item.created_at),
  );

  const prospects = dataset.prospects.filter((item) =>
    selectMatches(city, item.city) &&
    selectMatches(neighborhood, item.neighborhood) &&
    (leaderId === "todos" || item.leader_id === leaderId) &&
    selectMatches(responsible, item.internal_responsible ?? "Não definido") &&
    selectMatches(priority, item.priority) &&
    matchesPeriod(period, item.created_at),
  );

  const electoralZones = dataset.electoralZones.filter((item) =>
    filterLocation(item) &&
    selectMatches(responsible, item.regional_responsible ?? "Não definido") &&
    selectMatches(priority, item.priority) &&
    matchesPeriod(period, item.created_at),
  );

  const fieldAgenda = dataset.fieldAgenda.filter((item) =>
    filterLocation(item) &&
    (leaderId === "todos" || item.leader_id === leaderId) &&
    selectMatches(responsible, item.internal_responsible ?? "Não definido") &&
    selectMatches(priority, item.priority) &&
    matchesPeriod(period, item.action_date),
  );

  const demands = dataset.demands.filter((item) =>
    filterLocation(item) &&
    (leaderId === "todos" || item.leader_id === leaderId) &&
    selectMatches(responsible, item.internal_responsible ?? "Não definido") &&
    selectMatches(priority, item.priority) &&
    matchesPeriod(period, item.opening_date),
  );

  return {
    ...dataset,
    leaders,
    supporters,
    prospects,
    electoralZones,
    fieldAgenda,
    demands,
    municipalities: dataset.municipalities.filter((item) => selectMatches(state, item.state) && selectMatches(city, item.name)),
    neighborhoods: dataset.neighborhoods.filter((item) => filterLocation({ state: item.state, city: item.city, neighborhood: item.name })),
  };
}

export function computeDashboard(dataset: DashboardDataset = emptyDataset): DashboardComputed {
  const totalValidatedFromLeaders = sum(dataset.leaders, "validated_votes");
  const validatedVotes = totalValidatedFromLeaders;
  const declaredVotes = sum(dataset.leaders, "declared_votes");
  const mappedVoters = dataset.neighborhoods.reduce((total, item) => total + Number(item.estimated_voters ?? 0), 0);
  const generalVoteGoal = dataset.campaigns[0]?.general_vote_goal || declaredVotes || validatedVotes || 0;
  const activeCitySet = unique(dataset.leaders.map((item) => item.city).filter((city) => normalize(city) !== "marica"));
  const coveredNeighborhoods = unique(dataset.leaders.filter((item) => normalize(item.city) === "marica").map((item) => item.neighborhood));
  const estimatedSupporters = dataset.leaders.reduce((total, item) => total + Number(item.estimated_direct_supporters ?? 0) + Number(item.estimated_indirect_supporters ?? 0), 0);
  const confidenceIndex = dataset.leaders.length ? Math.round(dataset.leaders.reduce((total, item) => total + confidenceScore(item.confidence_level), 0) / dataset.leaders.length) : 0;
  const priorityRegions = buildPriorityRegions(dataset);

  return {
    summary: {
      totalLeaders: dataset.leaders.length,
      activeLeaders: dataset.leaders.filter((item) => normalize(item.status).includes("ativa") || normalize(item.status).includes("ativo")).length,
      totalSupporters: estimatedSupporters,
      estimatedSupporters,
      declaredVotes,
      validatedVotes,
      confidenceIndex,
      municipalitiesWithAction: activeCitySet.length,
      coveredNeighborhoods: coveredNeighborhoods.length,
      electoralZones: 0,
      mappedVoters,
      generalVoteGoal,
      distanceToGoal: Math.max(generalVoteGoal - validatedVotes, 0),
      openDemands: 0,
      upcomingActions: 0,
      priorityRegions: priorityRegions.filter((item) => item.priority === "Crítica" || item.priority === "Alta").length,
      generalCoverage: generalVoteGoal ? round((validatedVotes / generalVoteGoal) * 100) : 0,
      validationRate: declaredVotes ? round((validatedVotes / declaredVotes) * 100) : 0,
    },
    weeklyGrowth: getWeeklyGrowth(dataset),
    leaderRanking: dataset.leaders
      .slice()
      .sort((a, b) => Number(b.validated_votes ?? 0) - Number(a.validated_votes ?? 0))
      .slice(0, 8)
      .map((item) => ({ nome: item.full_name, valor: Number(item.validated_votes ?? 0) })),
    neighborhoodCoverage: getNeighborhoodCoverageRows(dataset),
    voteComparison: getVoteComparison(dataset),
    supporterStatus: countSeries(dataset.supporters.map((item) => item.political_status)),
    prospectFunnel: countSeries(dataset.prospects.map((item) => item.funnel_stage)),
    demandCategories: countSeries(dataset.demands.map((item) => item.category)),
    upcomingAgenda: getUpcomingAgenda(dataset.fieldAgenda),
    priorityRegions,
  };
}

async function listCampaigns(): Promise<Campaign[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function listMunicipalities(): Promise<Municipality[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("municipalities").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function listNeighborhoods(): Promise<Neighborhood[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("neighborhoods").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function safeLoad<T>(label: string, promise: Promise<T[]>): Promise<{ data: T[]; warning: string | null }> {
  try {
    return { data: await promise, warning: null };
  } catch (error) {
    const message = error && typeof error === "object" && "message" in error ? String((error as { message?: unknown }).message) : "erro inesperado";
    return { data: [], warning: `${label}: ${message}` };
  }
}

function getWeeklyGrowth(dataset: DashboardDataset) {
  const buckets = new Map<string, { semana: string; liderancas: number; apoiadores: number; prospeccoes: number; cadastros: number }>();
  const add = (dateValue: string, key: "liderancas" | "apoiadores" | "prospeccoes") => {
    const label = weekLabel(dateValue);
    const current = buckets.get(label) ?? { semana: label, liderancas: 0, apoiadores: 0, prospeccoes: 0, cadastros: 0 };
    current[key] += 1;
    current.cadastros += 1;
    buckets.set(label, current);
  };
  dataset.leaders.forEach((item) => add(item.created_at, "liderancas"));
  return Array.from(buckets.values()).slice(-8);
}

function getNeighborhoodCoverageRows(dataset: DashboardDataset) {
  return getLeanTerritoryGroups(dataset).map(({ name, leaders }) => {
    const votersReference = dataset.neighborhoods.find((item) => normalize(item.name) === normalize(name));
    const eleitores = Number(votersReference?.estimated_voters ?? 0);
    const validados = leaders.reduce((total, item) => total + Number(item.validated_votes ?? 0), 0);
    const declarados = leaders.reduce((total, item) => total + Number(item.declared_votes ?? 0), 0);
    const estimatedSupport = leaders.reduce((total, item) => total + Number(item.estimated_direct_supporters ?? 0) + Number(item.estimated_indirect_supporters ?? 0), 0);
    return {
      nome: name,
      cobertura: eleitores ? round((validados / eleitores) * 100) : declarados ? round((validados / declarados) * 100) : 0,
      apoiadores: estimatedSupport,
      liderancas: leaders.length,
      eleitores,
    };
  }).sort((a, b) => b.cobertura - a.cobertura).slice(0, 8);
}

function getVoteComparison(dataset: DashboardDataset) {
  return getLeanTerritoryGroups(dataset)
    .map(({ name, leaders }) => ({
      nome: name,
      declarados: leaders.reduce((total, item) => total + Number(item.declared_votes ?? 0), 0),
      validados: leaders.reduce((total, item) => total + Number(item.validated_votes ?? 0), 0),
    }))
    .sort((a, b) => b.validados - a.validados)
    .slice(0, 8);
}

function getUpcomingAgenda(actions: FieldAgenda[]) {
  const today = startOfToday();
  const nextLimit = new Date(today);
  nextLimit.setDate(today.getDate() + 7);
  return actions
    .filter((item) => {
      const date = parseDate(item.action_date);
      return date >= today && date <= nextLimit;
    })
    .sort((a, b) => parseDate(a.action_date).getTime() - parseDate(b.action_date).getTime())
    .slice(0, 8)
    .map((item) => ({
      title: item.title,
      date: item.action_date,
      neighborhood: item.neighborhood,
      priority: item.priority,
      status: item.status,
    }));
}

function buildPriorityRegions(dataset: DashboardDataset): PriorityRegion[] {
  return getLeanTerritoryGroups(dataset).map(({ name, city, leaders }) => {
    const neighborhood = city === "Maricá" ? dataset.neighborhoods.find((item) => normalize(item.name) === normalize(name)) : null;
    const estimatedVoters = Number(neighborhood?.estimated_voters ?? 0);
    const validatedVotes = leaders.reduce((total, item) => total + Number(item.validated_votes ?? 0), 0);
    const declaredVotes = leaders.reduce((total, item) => total + Number(item.declared_votes ?? 0), 0);
    const supporters = leaders.reduce((total, item) => total + Number(item.estimated_direct_supporters ?? 0) + Number(item.estimated_indirect_supporters ?? 0), 0);
    const coverage = estimatedVoters ? validatedVotes / estimatedVoters : declaredVotes ? validatedVotes / declaredVotes : 0;
    const confidence = leaders.length ? leaders.reduce((total, item) => total + confidenceScore(item.confidence_level), 0) / leaders.length : 0;
    const score = (leaders.length <= 1 ? 3 : 0) + (coverage < 0.35 ? 3 : 0) + (supporters >= 200 && validatedVotes < 80 ? 2 : 0) + (confidence < 60 ? 2 : 0);
    const priority: PriorityRegion["priority"] = score >= 7 ? "Crítica" : score >= 5 ? "Alta" : score >= 3 ? "Média" : "Baixa";
    const reading = `${name} tem ${leaders.length} cadastro(s), ${supporters.toLocaleString("pt-BR")} apoios estimados e ${validatedVotes.toLocaleString("pt-BR")} votos validados. Recomenda-se ${coverage < 0.35 ? "validar a base declarada e reforçar responsáveis locais" : "manter acompanhamento mensal e comparar custo por voto"}.`;

    return {
      name,
      city,
      estimatedVoters,
      leaders: leaders.length,
      supporters,
      validatedVotes,
      openDemands: 0,
      upcomingActions: 0,
      priority,
      reading,
    };
  }).sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || b.estimatedVoters - a.estimatedVoters).slice(0, 8);
}

function getLeanTerritoryGroups(dataset: DashboardDataset) {
  const groups = new Map<string, { name: string; city: string; leaders: Leader[] }>();
  dataset.leaders.forEach((leader) => {
    const isMarica = normalize(leader.city) === "marica";
    const name = isMarica ? (leader.neighborhood || "Bairro não definido") : (leader.city || "Cidade não definida");
    const city = isMarica ? "Maricá" : name;
    const key = `${city}:${name}`;
    const current = groups.get(key) ?? { name, city, leaders: [] };
    current.leaders.push(leader);
    groups.set(key, current);
  });
  return Array.from(groups.values());
}

function countSeries(values: Array<string | null | undefined>) {
  const counts = values.reduce<Record<string, number>>((acc, raw) => {
    const key = raw?.trim() || "Não definido";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function confidenceScore(value: string) {
  const normalized = normalize(value);
  if (normalized.includes("alto")) return 100;
  if (normalized.includes("medio")) return 60;
  if (normalized.includes("baixo")) return 30;
  return 10;
}

function matchesPeriod(period: string, rawDate: string) {
  if (period === "todos") return true;
  const date = parseDate(rawDate.slice(0, 10));
  const today = startOfToday();
  const days = period === "7" ? 7 : period === "30" ? 30 : period === "90" ? 90 : 0;
  if (!days) return true;
  const limit = new Date(today);
  limit.setDate(today.getDate() - days);
  return date >= limit;
}

function weekLabel(value: string) {
  const date = parseDate(value.slice(0, 10));
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
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

function selectMatches(filterValue: string, current: string) {
  return filterValue === "todos" || normalize(filterValue) === normalize(current);
}

function sum<T>(records: T[], key: keyof T) {
  return records.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function priorityWeight(priority: string) {
  if (priority === "Crítica") return 4;
  if (priority === "Alta") return 3;
  if (priority === "Média") return 2;
  return 1;
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
