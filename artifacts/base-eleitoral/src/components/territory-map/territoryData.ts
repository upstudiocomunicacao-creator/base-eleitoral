import type { EnrichedTerritoryRecord, HeatMode, TerritoryRecord } from "./types";

import { getMunicipalBaseByCity, getMunicipalNeighborhoods, getMunicipalSubdivisionForNeighborhood, getRJRegionForCity } from "@/services/operational";
import type { Leader, LeaderMonthlyMetric } from "@/types/database";
import type { TerritoryScope } from "./types";

export const heatModes: Array<{ key: HeatMode; label: string }> = [
  { key: "forca", label: "For\u00e7a territorial" },
  { key: "apoiadores", label: "Apoio estimado" },
  { key: "liderancas", label: "Cadastros" },
  { key: "votos", label: "Votos validados" },
  { key: "oportunidade", label: "Oportunidade" },
  { key: "sem_cobertura", label: "\u00c1reas sem cobertura" },
];

type Seed = Omit<TerritoryRecord, "weeklyGrowth" | "areas" | "notes">;

const stateSeeds: Seed[] = [
  seed(1, "Maric\u00e1", "Leste Metropolitano", "Munic\u00edpio", "Forte", "Manter", "Coordena\u00e7\u00e3o RJ", 42, 3750, 5900, 5040, 2432, 7410, 152200, 820, 46, 78, true, ["55"], [], [], ["Mariana Costa", "Cl\u00e1udia Menezes"], ["Refor\u00e7ar valida\u00e7\u00e3o mensal", "Manter alinhamento com coordena\u00e7\u00f5es"], "M\u00e9dia", 55, 55),
  seed(2, "Niter\u00f3i", "Leste Metropolitano", "Munic\u00edpio", "Em crescimento", "Alta", "Coordena\u00e7\u00e3o RJ", 11, 820, 1700, 1080, 420, 1800, 372000, 390, 18, 62, true, ["55"], [], [], ["Equipe Niter\u00f3i"], ["Definir coordenador municipal", "Atualizar estimativa mensal"], "M\u00e9dia", 44, 42),
  seed(3, "S\u00e3o Gon\u00e7alo", "Leste Metropolitano", "Munic\u00edpio", "Baixa cobertura", "Cr\u00edtica", "Coordena\u00e7\u00e3o RJ", 6, 520, 1300, 760, 240, 2200, 685000, 610, 32, 45, true, ["55"], [], [], ["Equipe SG"], ["Cadastrar novas lideran\u00e7as", "Definir meta m\u00ednima e teto mensal"], "Baixa", 38, 48),
  seed(4, "Itabora\u00ed", "Leste Metropolitano", "Munic\u00edpio", "Em crescimento", "Alta", "Coordena\u00e7\u00e3o RJ", 5, 410, 880, 530, 180, 1100, 180000, 280, 21, 51, true, ["55"], [], [], ["Equipe Itabora\u00ed"], ["Reuni\u00e3o regional", "Validar base inicial"], "M\u00e9dia", 50, 38),
  seed(5, "Rio de Janeiro", "Capital", "Munic\u00edpio", "Baixa cobertura", "Alta", "Coordena\u00e7\u00e3o Capital", 9, 760, 2100, 980, 360, 2600, 5300000, 740, 45, 55, true, ["55"], [], [], ["Coordena\u00e7\u00e3o Capital"], ["Segmentar regi\u00f5es", "Criar coordena\u00e7\u00e3o local"], "M\u00e9dia", 30, 60),
  seed(6, "Saquarema", "Baixadas Litor\u00e2neas", "Munic\u00edpio", "Priorit\u00e1rio", "Alta", "Coordena\u00e7\u00e3o RJ", 4, 280, 640, 350, 120, 700, 76000, 170, 13, 48, true, ["55"], [], [], ["Equipe Lagos"], ["Ativar lideran\u00e7a local", "Revisar centro de custos"], "M\u00e9dia", 62, 68),
  seed(7, "Araruama", "Baixadas Litor\u00e2neas", "Munic\u00edpio", "Em crescimento", "M\u00e9dia", "Coordena\u00e7\u00e3o RJ", 5, 360, 690, 410, 190, 760, 110000, 160, 9, 57, true, ["55"], [], [], ["Equipe Lagos"], ["Ampliar cadastros territoriais", "Consolidar estimativas"], "M\u00e9dia", 72, 63),
  seed(8, "Cabo Frio", "Baixadas Litor\u00e2neas", "Munic\u00edpio", "Baixa cobertura", "Alta", "Coordena\u00e7\u00e3o RJ", 3, 210, 520, 260, 80, 700, 175000, 220, 18, 42, true, ["55"], [], [], ["Equipe Lagos"], ["Criar coordena\u00e7\u00e3o municipal", "Buscar lideran\u00e7a local"], "Baixa", 82, 75),
  seed(9, "Silva Jardim", "Interior Leste", "Munic\u00edpio", "Sem lideran\u00e7a", "Cr\u00edtica", "Coordena\u00e7\u00e3o RJ", 0, 48, 130, 65, 12, 220, 17000, 70, 8, 24, false, ["55"], [], [], [], ["Cadastrar lideran\u00e7a", "Definir respons\u00e1vel municipal"], "Muito baixa", 67, 30),
  seed(10, "Tangu\u00e1", "Leste Metropolitano", "Munic\u00edpio", "Sem lideran\u00e7a", "Cr\u00edtica", "Coordena\u00e7\u00e3o RJ", 0, 64, 160, 80, 18, 260, 25000, 82, 7, 27, false, ["55"], [], [], [], ["Criar primeiro n\u00facleo local", "Cadastrar coordenador municipal"], "Muito baixa", 47, 32),
  seed(11, "Rio Bonito", "Interior Leste", "Munic\u00edpio", "Priorit\u00e1rio", "M\u00e9dia", "Coordena\u00e7\u00e3o RJ", 2, 140, 310, 190, 68, 420, 42000, 95, 10, 41, true, ["55"], [], [], ["Equipe Interior"], ["Reuni\u00e3o com comerciantes", "Validar votos declarados"], "Baixa", 59, 24),
  seed(12, "Mag\u00e9", "Baixada", "Munic\u00edpio", "Baixa cobertura", "Alta", "Coordena\u00e7\u00e3o RJ", 2, 190, 460, 230, 72, 650, 180000, 210, 16, 39, true, ["55"], [], [], ["Equipe Baixada"], ["Mapear lideran\u00e7a", "A\u00e7\u00e3o em bairro priorit\u00e1rio"], "Baixa", 25, 36),
];

const citySeeds: Seed[] = [
  city(101, "Centro", "Regi\u00e3o Central", "Forte", "Manter", 8, 600, 1200, 800, 420, 700, 12000, 190, 11, 78, ["102", "103", "104"], ["C.E. Elisi\u00e1rio Matta", "E.M. Centro"], "Alta", ["Mariana Costa"], 48, 48),
  city(102, "Ara\u00e7atiba", "Regi\u00e3o Central", "Em crescimento", "M\u00e9dia", 5, 310, 520, 360, 210, 420, 8200, 120, 7, 74, ["151"], ["E.M. Ara\u00e7atiba"], "M\u00e9dia alta", ["Mariana Costa"], 42, 55),
  city(103, "Flamengo", "Interior", "Sem lideran\u00e7a", "Cr\u00edtica", 1, 90, 260, 140, 52, 360, 7600, 240, 18, 38, ["166"], ["C.E. Flamengo"], "Baixa", [], 39, 42),
  city(104, "Mumbuca", "Regi\u00e3o Central", "Em crescimento", "M\u00e9dia", 4, 260, 430, 290, 150, 330, 6900, 115, 9, 69, ["172"], ["E.M. Mumbuca"], "M\u00e9dia", ["Equipe Centro"], 50, 60),
  city(105, "Itapeba", "Interior", "Baixa cobertura", "Alta", 2, 130, 280, 170, 58, 330, 8400, 180, 13, 44, ["178"], ["E.M. Itapeba"], "M\u00e9dia", ["Equipe Territorial"], 45, 36),
  city(106, "Parque Nanci", "Regi\u00e3o Central", "Em crescimento", "M\u00e9dia", 3, 210, 390, 250, 120, 310, 6200, 105, 8, 61, ["181"], ["E.M. Parque Nanci"], "M\u00e9dia alta", ["Mariana Costa"], 56, 52),
  city(107, "Barra de Maric\u00e1", "Litoral Sul", "Baixa cobertura", "Alta", 2, 170, 360, 230, 82, 470, 9400, 210, 15, 45, ["188"], ["E.M. Barra"], "M\u00e9dia", ["Equipe Campo"], 61, 70),
  city(108, "Jacaro\u00e1", "Interior", "Sem lideran\u00e7a", "Cr\u00edtica", 0, 44, 120, 60, 16, 210, 4100, 70, 6, 25, ["190"], ["E.M. Jacaro\u00e1"], "Muito baixa", [], 55, 33),
  city(109, "S\u00e3o Jos\u00e9 do Imbassa\u00ed", "Interior", "Em crescimento", "M\u00e9dia", 6, 500, 850, 620, 350, 600, 10000, 160, 10, 71, ["145", "146"], ["E.M. S\u00e3o Jos\u00e9"], "M\u00e9dia alta", ["Rafael Almeida"], 63, 40),
  city(110, "Cordeirinho", "Litoral Sul", "Priorit\u00e1rio", "Baixa", 2, 120, 220, 130, 48, 250, 5400, 145, 11, 56, ["194"], ["E.M. Cordeirinho"], "Baixa", ["Equipe Campo"], 68, 78),
  city(111, "Jacon\u00e9", "Litoral Sul", "Sem lideran\u00e7a", "Cr\u00edtica", 0, 38, 95, 52, 14, 190, 3900, 64, 5, 22, ["198"], ["E.M. Jacon\u00e9"], "Muito baixa", [], 76, 84),
  city(112, "Caju", "Interior", "Baixa cobertura", "Alta", 1, 75, 160, 90, 24, 220, 4300, 82, 7, 33, ["201"], ["E.M. Caju"], "Baixa", ["Equipe Campo"], 52, 24),
  city(113, "Espraiado", "Interior", "Sem lideran\u00e7a", "Alta", 0, 32, 90, 42, 10, 180, 3200, 58, 5, 20, ["203"], ["E.M. Espraiado"], "Muito baixa", [], 58, 19),
  city(114, "Guaratiba", "Litoral Sul", "Forte", "M\u00e9dia", 5, 330, 560, 410, 260, 430, 8800, 135, 12, 76, ["207"], ["E.M. Guaratiba"], "Alta", ["Mariana Costa"], 72, 62),
  city(115, "Ino\u00e3", "Eixo Rodovi\u00e1rio", "Baixa cobertura", "Alta", 3, 220, 600, 400, 130, 850, 18000, 330, 20, 49, ["134", "135"], ["CIEP Ino\u00e3"], "M\u00e9dia", ["Rafael Almeida"], 43, 27),
  city(116, "Bosque Fundo", "Eixo Rodovi\u00e1rio", "Priorit\u00e1rio", "Alta", 1, 98, 230, 120, 38, 300, 6200, 130, 12, 37, ["136"], ["E.M. Bosque Fundo"], "Baixa", ["Equipe Campo"], 36, 24),
  city(117, "Santa Paula", "Eixo Rodovi\u00e1rio", "Em crescimento", "M\u00e9dia", 2, 160, 300, 190, 74, 310, 5800, 95, 9, 52, ["139"], ["E.M. Santa Paula"], "M\u00e9dia", ["Rafael Almeida"], 31, 30),
  city(118, "Itaipua\u00e7u", "Litoral Norte", "Baixa cobertura", "Alta", 4, 350, 900, 520, 180, 1200, 28000, 460, 28, 52, ["118", "119", "120"], ["E.M. Darcy Ribeiro", "CIEP Itaipua\u00e7u"], "M\u00e9dia alta", ["Cl\u00e1udia Menezes"], 28, 68),
  city(119, "Jardim Atl\u00e2ntico", "Litoral Norte", "Cr\u00edtico", "Cr\u00edtica", 3, 210, 520, 360, 95, 1000, 22000, 420, 24, 44, ["219", "220"], ["C.E. Jardim Atl\u00e2ntico"], "M\u00e9dia", ["Cl\u00e1udia Menezes"], 24, 75),
  city(120, "Recanto", "Litoral Norte", "Sem lideran\u00e7a", "Cr\u00edtica", 0, 70, 160, 90, 25, 280, 6100, 180, 11, 32, ["223"], ["E.M. Recanto"], "Baixa", [], 21, 71),
  city(121, "Barroco", "Interior", "Forte", "Manter", 7, 520, 900, 690, 430, 520, 9800, 110, 8, 82, ["231"], ["E.M. Barroco"], "Alta", ["Cl\u00e1udia Menezes"], 46, 31),
];

export const stateTerritories = complete(stateSeeds);
export const cityTerritories = complete(citySeeds);

export function getCityTerritories(cityName = "Maricá"): TerritoryRecord[] {
  return complete(getCitySeeds(cityName));
}

export function buildOperationalTerritories(scope: TerritoryScope, leaders: Leader[], monthlyMetrics: LeaderMonthlyMetric[], cityName = "Maricá"): TerritoryRecord[] {
  const citySeedRecords = getCitySeeds(cityName);
  const cityFallback = complete(citySeedRecords);
  if (!leaders.length) return scope === "state" ? stateTerritories : cityFallback;

  const latestMonth = getLatestMonth(monthlyMetrics);
  const monthMetrics = latestMonth ? monthlyMetrics.filter((metric) => metric.month_ref === latestMonth) : [];
  const metricsByLeader = new Map(monthMetrics.map((metric) => [metric.leader_id, metric]));
  const baseSeeds = scope === "state" ? stateSeeds : citySeedRecords;
  const baseByName = new Map(baseSeeds.map((record) => [normalizeText(record.name), record]));
  const grouped = new Map<string, Leader[]>();
  const normalizedCityName = normalizeText(cityName);

  for (const leader of leaders) {
    const isTargetCity = normalizeText(leader.city) === normalizedCityName;
    if (scope === "state" && isTargetCity) continue;
    if (scope === "city" && !isTargetCity) continue;

    const territory = scope === "state" ? leader.city : leader.neighborhood;
    if (!territory) continue;

    const key = normalizeText(territory);
    grouped.set(key, [...(grouped.get(key) ?? []), leader]);
  }

  const records = baseSeeds.map((seedRecord, index) => {
    const key = normalizeText(seedRecord.name);
    return grouped.has(key)
      ? buildRecordFromLeaders(scope, seedRecord.name, grouped.get(key) ?? [], metricsByLeader, seedRecord, index, cityName)
      : buildEmptyRecord(scope, seedRecord, index);
  });

  for (const [key, group] of grouped) {
    if (baseByName.has(key)) continue;
    const name = scope === "state" ? group[0]?.city : group[0]?.neighborhood;
    if (!name) continue;
    records.push(buildRecordFromLeaders(scope, name, group, metricsByLeader, undefined, records.length, cityName));
  }

  return complete(records);
}

export function enrichTerritory(record: TerritoryRecord): EnrichedTerritoryRecord {
  const coverage = pct(record.validatedVotes, record.estimatedElectors);
  const goalProgress = pct(record.validatedVotes, record.target);
  const distanceToTarget = Math.max(0, record.target - record.validatedVotes);
  const territorialStrength = Math.round(Math.min(100, record.leaders * 7 + record.supporters / 20 + record.validatedVotes / 16 + record.confidence * 0.22));
  const opportunity = Math.round(Math.min(100, (record.estimatedElectors / 28000) * 34 + (1 - Math.min(coverage / 4, 1)) * 32 + Math.max(0, 5 - record.leaders) * 7 + record.undecided / 28));
  const precisionScore: Record<string, number> = { Alta: 100, "M\u00e9dia alta": 82, "M\u00e9dia": 65, Baixa: 42, "Muito baixa": 24 };
  const averagePrecision = precisionScore[record.geoPrecision] ?? 60;
  const max = record.type === "Munic\u00edpio" ? { supporters: 3750, leaders: 42, votes: 2432, undecided: 820, demands: 46 } : { supporters: 600, leaders: 8, votes: 430, undecided: 460, demands: 28 };
  return {
    ...record,
    coverage,
    goalProgress,
    distanceToTarget,
    territorialStrength,
    opportunity,
    averagePrecision,
    heat: {
      forca: territorialStrength,
      apoiadores: normalize(record.supporters, max.supporters),
      liderancas: normalize(record.leaders, max.leaders),
      votos: normalize(record.validatedVotes, max.votes),
      indecisos: normalize(record.undecided, max.undecided),
      demandas: normalize(record.demands, max.demands),
      oportunidade: opportunity,
      sem_cobertura: Math.round(Math.min(100, (1 - Math.min(coverage / 5, 1)) * 100)),
    },
    analysis: buildAnalysis(record.name, record.type, record.status, record.priority, record.leaders, coverage, record.validatedVotes, record.target),
  };
}

function buildRecordFromLeaders(
  scope: TerritoryScope,
  name: string,
  leaders: Leader[],
  metricsByLeader: Map<string, LeaderMonthlyMetric>,
  seedRecord: Seed | undefined,
  index: number,
  cityName = "Maricá",
): Seed {
  const isState = scope === "state";
  const metrics = leaders.map((leader) => metricsByLeader.get(leader.id)).filter((metric): metric is LeaderMonthlyMetric => Boolean(metric));
  const supporters = metrics.length ? sum(metrics, (metric) => metric.estimated_supporters) : sum(leaders, getLeaderSupporters);
  const declaredVotes = metrics.length ? sum(metrics, (metric) => metric.max_votes) : sum(leaders, (leader) => leader.declared_votes ?? 0);
  const validatedVotes = metrics.length ? sum(metrics, (metric) => metric.min_votes) : sum(leaders, (leader) => leader.validated_votes ?? 0);
  const target = Math.max(declaredVotes, validatedVotes, Math.round(supporters * 0.72), 1);
  const estimatedElectors = Math.max(seedRecord?.estimatedElectors ?? 0, target * (isState ? 45 : 18), supporters * (isState ? 16 : 8), isState ? 12000 : 2800);
  const coverage = pct(validatedVotes, estimatedElectors);
  const status = getOperationalStatus(leaders.length, coverage, validatedVotes, target);
  const priority = getOperationalPriority(leaders.length, coverage, validatedVotes, target);
  const region = isState ? getRJRegionForCity(name) : getMunicipalSubdivisionForNeighborhood(cityName, name);
  const nextActions = uniqueText(leaders.map((leader) => leader.next_action).filter(Boolean) as string[]);

  return {
    id: seedRecord?.id ?? 9000 + index,
    name,
    region,
    type: isState ? "Município" : "Bairro",
    status,
    priority,
    responsible: mostCommon(leaders.map((leader) => leader.internal_responsible).filter(Boolean) as string[]) ?? "Coordenação Territorial",
    leaders: leaders.length,
    supporters,
    estimatedSupporters: supporters,
    declaredVotes,
    validatedVotes,
    target,
    estimatedElectors,
    undecided: Math.max(0, supporters - validatedVotes),
    demands: 0,
    confidence: getAverageConfidence(leaders),
    campaignActive: true,
    zones: [],
    sections: [],
    votingPlaces: [],
    leadersLinked: leaders.map((leader) => leader.full_name).filter(Boolean).slice(0, 6),
    nextActions: nextActions.length ? nextActions.slice(0, 4) : ["Atualizar estimativa mensal", "Revisar centro de custos"],
    geoPrecision: mostCommon(leaders.map((leader) => leader.geographic_precision).filter(Boolean) as TerritoryRecord["geoPrecision"][]) ?? "Média",
    position: seedRecord?.position ?? generatedPosition(index),
  };
}

function buildEmptyRecord(scope: TerritoryScope, seedRecord: Seed, index: number): Seed {
  const isState = scope === "state";
  return {
    ...seedRecord,
    type: isState ? "Município" : "Bairro",
    status: "Sem liderança",
    priority: "Crítica",
    responsible: "Sem responsável",
    leaders: 0,
    supporters: 0,
    estimatedSupporters: 0,
    declaredVotes: 0,
    validatedVotes: 0,
    target: Math.max(seedRecord.target, 1),
    undecided: 0,
    demands: 0,
    confidence: 0,
    campaignActive: false,
    zones: [],
    sections: [],
    votingPlaces: [],
    leadersLinked: [],
    nextActions: isState ? ["Cadastrar coordenação ou liderança na cidade", "Definir estimativa mensal"] : ["Cadastrar coordenação ou liderança no bairro", "Definir estimativa mensal"],
    position: seedRecord.position ?? generatedPosition(index),
  };
}

function seed(id: number, name: string, region: string, type: TerritoryRecord["type"], status: TerritoryRecord["status"], priority: TerritoryRecord["priority"], responsible: string, leaders: number, supporters: number, estimatedSupporters: number, declaredVotes: number, validatedVotes: number, target: number, estimatedElectors: number, undecided: number, demands: number, confidence: number, campaignActive: boolean, zones: string[], sections: string[], votingPlaces: string[], leadersLinked: string[], nextActions: string[], geoPrecision: TerritoryRecord["geoPrecision"], x: number, y: number): Seed {
  return { id, name, region, type, status, priority, responsible, leaders, supporters, estimatedSupporters, declaredVotes, validatedVotes, target, estimatedElectors, undecided, demands, confidence, campaignActive, zones, sections, votingPlaces, leadersLinked, nextActions, geoPrecision, position: { x, y } };
}

function city(id: number, name: string, region: string, status: TerritoryRecord["status"], priority: TerritoryRecord["priority"], leaders: number, supporters: number, estimatedSupporters: number, declaredVotes: number, validatedVotes: number, target: number, estimatedElectors: number, undecided: number, demands: number, confidence: number, sections: string[], votingPlaces: string[], geoPrecision: TerritoryRecord["geoPrecision"], leadersLinked: string[], x: number, y: number): Seed {
  return seed(id, name, region, "Bairro", status, priority, region.includes("Litoral") ? "Cl\u00e1udia Menezes" : region.includes("Central") ? "Mariana Costa" : "Equipe Territorial", leaders, supporters, estimatedSupporters, declaredVotes, validatedVotes, target, estimatedElectors, undecided, demands, confidence, leaders > 0, ["55"], sections, votingPlaces, leadersLinked, leaders === 0 ? ["Cadastrar lideran\u00e7a local", "Definir coordenador de bairro"] : ["Reuni\u00e3o com coordena\u00e7\u00e3o local", "Atualizar estimativa mensal"], geoPrecision, x, y);
}

function getCitySeeds(cityName: string): Seed[] {
  const base = getMunicipalBaseByCity(cityName);
  if (!base || normalizeText(base.city) === "marica") return citySeeds;

  const neighborhoods = getMunicipalNeighborhoods(base.city);
  return neighborhoods.map((neighborhood, index) => {
    const region = getMunicipalSubdivisionForNeighborhood(base.city, neighborhood);
    const position = generatedPosition(index);
    const estimatedElectors = 3600 + (index % 7) * 680 + Math.floor(index / 7) * 420;
    const target = Math.round(estimatedElectors * 0.06);
    const supporters = Math.round(target * 0.56);
    const declaredVotes = Math.round(target * 0.42);
    const validatedVotes = Math.round(target * 0.16);
    const priority: TerritoryRecord["priority"] = index % 5 === 0 ? "Alta" : index % 7 === 0 ? "Crítica" : "Média";
    const status: TerritoryRecord["status"] = index % 7 === 0 ? "Sem liderança" : index % 5 === 0 ? "Baixa cobertura" : "Em crescimento";

    return seed(
      3000 + index,
      neighborhood,
      region,
      "Bairro",
      status,
      priority,
      "Coordenação Territorial",
      status === "Sem liderança" ? 0 : Math.max(1, index % 4),
      supporters,
      supporters,
      declaredVotes,
      validatedVotes,
      Math.max(target, 1),
      estimatedElectors,
      Math.max(0, supporters - validatedVotes),
      0,
      status === "Sem liderança" ? 22 : 48 + (index % 5) * 7,
      status !== "Sem liderança",
      [],
      [],
      [],
      [],
      status === "Sem liderança" ? ["Cadastrar coordenação ou liderança local", "Definir estimativa mensal"] : ["Atualizar estimativa mensal", "Revisar centro de custos"],
      "Média",
      position.x,
      position.y,
    );
  });
}

function complete(records: Seed[]): TerritoryRecord[] {
  return records.map((record) => ({
    ...record,
    weeklyGrowth: Math.max(1, Math.round(record.validatedVotes / (record.type === "Munic\u00edpio" ? 80 : 30))),
    areas: record.type === "Munic\u00edpio" ? record.leadersLinked.length ? record.leadersLinked : [record.name] : [record.name, record.region],
    notes: record.type === "Município" ? "Registro estadual preparado para leitura por cidade e camada PostGIS." : "Registro municipal preparado para leitura por bairro, distrito e heatmap real.",
  }));
}

function buildAnalysis(name: string, type: string, status: string, priority: string, leaders: number, coverage: number, validated: number, target: number) {
  if (status === "Forte") return name + " concentra for\u00e7a territorial relevante, com base de lideran\u00e7as e votos validados em crescimento.";
  if (status === "Sem lideran\u00e7a") return name + " tem baixa presen\u00e7a pol\u00edtica e precisa de lideran\u00e7a local antes de ampliar cadastros.";
  if (type === "Munic\u00edpio" && name === "S\u00e3o Gon\u00e7alo") return "S\u00e3o Gon\u00e7alo possui alto potencial eleitoral, mas ainda apresenta baixa cobertura. Recomenda-se cadastrar novas lideran\u00e7as e ajustar a meta mensal.";
  if (name === "Itaipua\u00e7u") return "Itaipua\u00e7u concentra grande volume estimado de eleitores, mas apresenta baixa cobertura e poucos votos validados. A prioridade \u00e9 ampliar lideran\u00e7as locais e atualizar estimativas mensais.";
  if (priority === "Cr\u00edtica") return name + " combina potencial eleitoral alto, baixa cobertura e pouca valida\u00e7\u00e3o. Deve receber prioridade na coordena\u00e7\u00e3o territorial.";
  if (validated >= target * 0.75) return name + " est\u00e1 perto da meta e pode avan\u00e7ar com a\u00e7\u00f5es curtas de valida\u00e7\u00e3o.";
  return name + " est\u00e1 em desenvolvimento, com cobertura de " + formatPercent(coverage) + " e espa\u00e7o para refor\u00e7ar cadastros territoriais.";
}

function pct(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function getLatestMonth(metrics: LeaderMonthlyMetric[]) {
  return metrics.map((metric) => metric.month_ref).filter(Boolean).sort((a, b) => b.localeCompare(a))[0] ?? null;
}

function getLeaderSupporters(leader: Leader) {
  return (leader.registered_supporters ?? 0) + (leader.estimated_direct_supporters ?? 0) + (leader.estimated_indirect_supporters ?? 0);
}

function getOperationalStatus(leaders: number, coverage: number, validatedVotes: number, target: number): TerritoryRecord["status"] {
  if (!leaders) return "Sem liderança";
  if (validatedVotes >= target * 0.72) return "Forte";
  if (coverage < 1 || validatedVotes < target * 0.28) return "Baixa cobertura";
  if (validatedVotes < target * 0.48) return "Prioritário";
  return "Em crescimento";
}

function getOperationalPriority(leaders: number, coverage: number, validatedVotes: number, target: number): TerritoryRecord["priority"] {
  if (!leaders || coverage < 0.7) return "Crítica";
  if (validatedVotes < target * 0.45) return "Alta";
  if (validatedVotes >= target * 0.78) return "Manter";
  return "Média";
}

function getAverageConfidence(leaders: Leader[]) {
  if (!leaders.length) return 0;
  const score = leaders.reduce((total, leader) => {
    const confidence = normalizeText(leader.confidence_level);
    return total + (confidence === "alto" ? 90 : confidence === "medio" ? 62 : 34);
  }, 0);
  return Math.round(score / leaders.length);
}

function generatedPosition(index: number) {
  const columns = 5;
  const col = index % columns;
  const row = Math.floor(index / columns);
  return {
    x: 18 + col * 16 + (row % 2) * 5,
    y: 18 + (row % 5) * 15,
  };
}

function uniqueText(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function mostCommon<T extends string>(items: T[]) {
  if (!items.length) return null;
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function sum<T>(items: T[], getValue: (item: T) => number | null | undefined) {
  return items.reduce((total, item) => total + Number(getValue(item) ?? 0), 0);
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function normalize(value: number, max: number) {
  return Math.round(Math.min(100, (value / max) * 100));
}

export function formatPercent(value: number) {
  return Number(value.toFixed(1)).toLocaleString("pt-BR") + "%";
}
