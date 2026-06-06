import type { EnrichedTerritoryRecord, HeatMode, TerritoryRecord } from "./types";

export const heatModes: Array<{ key: HeatMode; label: string }> = [
  { key: "forca", label: "For\u00e7a territorial" },
  { key: "apoiadores", label: "Apoiadores" },
  { key: "liderancas", label: "Lideran\u00e7as" },
  { key: "votos", label: "Votos validados" },
  { key: "indecisos", label: "Indecisos" },
  { key: "demandas", label: "Demandas" },
  { key: "oportunidade", label: "Oportunidade" },
  { key: "sem_cobertura", label: "\u00c1reas sem cobertura" },
];

type Seed = Omit<TerritoryRecord, "weeklyGrowth" | "areas" | "notes">;

const stateSeeds: Seed[] = [
  seed(1, "Maric\u00e1", "Leste Metropolitano", "Munic\u00edpio", "Forte", "Manter", "Coordena\u00e7\u00e3o RJ", 42, 3750, 5900, 5040, 2432, 7410, 152200, 820, 46, 78, true, ["55"], [], [], ["Mariana Costa", "Cl\u00e1udia Menezes"], ["Refor\u00e7ar valida\u00e7\u00e3o por zona", "Manter agenda com lideran\u00e7as"], "M\u00e9dia", 55, 55),
  seed(2, "Niter\u00f3i", "Leste Metropolitano", "Munic\u00edpio", "Em crescimento", "Alta", "Coordena\u00e7\u00e3o RJ", 11, 820, 1700, 1080, 420, 1800, 372000, 390, 18, 62, true, ["55"], [], [], ["Equipe Niter\u00f3i"], ["Prospec\u00e7\u00e3o qualificada", "Abrir n\u00facleo comunit\u00e1rio"], "M\u00e9dia", 44, 42),
  seed(3, "S\u00e3o Gon\u00e7alo", "Leste Metropolitano", "Munic\u00edpio", "Baixa cobertura", "Cr\u00edtica", "Coordena\u00e7\u00e3o RJ", 6, 520, 1300, 760, 240, 2200, 685000, 610, 32, 45, true, ["55"], [], [], ["Equipe SG"], ["Cadastrar novas lideran\u00e7as", "Iniciar prospec\u00e7\u00e3o regional"], "Baixa", 38, 48),
  seed(4, "Itabora\u00ed", "Leste Metropolitano", "Munic\u00edpio", "Em crescimento", "Alta", "Coordena\u00e7\u00e3o RJ", 5, 410, 880, 530, 180, 1100, 180000, 280, 21, 51, true, ["55"], [], [], ["Equipe Itabora\u00ed"], ["Reuni\u00e3o regional", "Validar base inicial"], "M\u00e9dia", 50, 38),
  seed(5, "Rio de Janeiro", "Capital", "Munic\u00edpio", "Baixa cobertura", "Alta", "Coordena\u00e7\u00e3o Capital", 9, 760, 2100, 980, 360, 2600, 5300000, 740, 45, 55, true, ["55"], [], [], ["Coordena\u00e7\u00e3o Capital"], ["Segmentar regi\u00f5es", "Criar coordena\u00e7\u00e3o local"], "M\u00e9dia", 30, 60),
  seed(6, "Saquarema", "Baixadas Litor\u00e2neas", "Munic\u00edpio", "Priorit\u00e1rio", "Alta", "Coordena\u00e7\u00e3o RJ", 4, 280, 640, 350, 120, 700, 76000, 170, 13, 48, true, ["55"], [], [], ["Equipe Lagos"], ["Ativar lideran\u00e7a tem\u00e1tica", "Agenda de rua"], "M\u00e9dia", 62, 68),
  seed(7, "Araruama", "Baixadas Litor\u00e2neas", "Munic\u00edpio", "Em crescimento", "M\u00e9dia", "Coordena\u00e7\u00e3o RJ", 5, 360, 690, 410, 190, 760, 110000, 160, 9, 57, true, ["55"], [], [], ["Equipe Lagos"], ["Ampliar apoiadores", "Consolidar lista"], "M\u00e9dia", 72, 63),
  seed(8, "Cabo Frio", "Baixadas Litor\u00e2neas", "Munic\u00edpio", "Baixa cobertura", "Alta", "Coordena\u00e7\u00e3o RJ", 3, 210, 520, 260, 80, 700, 175000, 220, 18, 42, true, ["55"], [], [], ["Equipe Lagos"], ["Criar agenda regional", "Buscar lideran\u00e7a local"], "Baixa", 82, 75),
  seed(9, "Silva Jardim", "Interior Leste", "Munic\u00edpio", "Sem lideran\u00e7a", "Cr\u00edtica", "Coordena\u00e7\u00e3o RJ", 0, 48, 130, 65, 12, 220, 17000, 70, 8, 24, false, ["55"], [], [], [], ["Cadastrar lideran\u00e7a", "Mapear demandas"], "Muito baixa", 67, 30),
  seed(10, "Tangu\u00e1", "Leste Metropolitano", "Munic\u00edpio", "Sem lideran\u00e7a", "Cr\u00edtica", "Coordena\u00e7\u00e3o RJ", 0, 64, 160, 80, 18, 260, 25000, 82, 7, 27, false, ["55"], [], [], [], ["Criar primeiro n\u00facleo local", "Busca ativa de apoiadores"], "Muito baixa", 47, 32),
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

function seed(id: number, name: string, region: string, type: TerritoryRecord["type"], status: TerritoryRecord["status"], priority: TerritoryRecord["priority"], responsible: string, leaders: number, supporters: number, estimatedSupporters: number, declaredVotes: number, validatedVotes: number, target: number, estimatedElectors: number, undecided: number, demands: number, confidence: number, campaignActive: boolean, zones: string[], sections: string[], votingPlaces: string[], leadersLinked: string[], nextActions: string[], geoPrecision: TerritoryRecord["geoPrecision"], x: number, y: number): Seed {
  return { id, name, region, type, status, priority, responsible, leaders, supporters, estimatedSupporters, declaredVotes, validatedVotes, target, estimatedElectors, undecided, demands, confidence, campaignActive, zones, sections, votingPlaces, leadersLinked, nextActions, geoPrecision, position: { x, y } };
}

function city(id: number, name: string, region: string, status: TerritoryRecord["status"], priority: TerritoryRecord["priority"], leaders: number, supporters: number, estimatedSupporters: number, declaredVotes: number, validatedVotes: number, target: number, estimatedElectors: number, undecided: number, demands: number, confidence: number, sections: string[], votingPlaces: string[], geoPrecision: TerritoryRecord["geoPrecision"], leadersLinked: string[], x: number, y: number): Seed {
  return seed(id, name, region, "Bairro", status, priority, region.includes("Litoral") ? "Cl\u00e1udia Menezes" : region.includes("Central") ? "Mariana Costa" : "Equipe Territorial", leaders, supporters, estimatedSupporters, declaredVotes, validatedVotes, target, estimatedElectors, undecided, demands, confidence, leaders > 0, ["55"], sections, votingPlaces, leadersLinked, leaders === 0 ? ["Cadastrar lideran\u00e7a local", "A\u00e7\u00e3o de busca ativa no bairro"] : ["Reuni\u00e3o com lideran\u00e7as", "Mutir\u00e3o de valida\u00e7\u00e3o por se\u00e7\u00e3o"], geoPrecision, x, y);
}

function complete(records: Seed[]): TerritoryRecord[] {
  return records.map((record) => ({
    ...record,
    weeklyGrowth: Math.max(1, Math.round(record.validatedVotes / (record.type === "Munic\u00edpio" ? 80 : 30))),
    areas: record.type === "Munic\u00edpio" ? record.leadersLinked.length ? record.leadersLinked : [record.name] : [record.name, record.region],
    notes: record.type === "Município" ? "Registro estadual preparado para geocodificação municipal e camada PostGIS." : "Registro municipal preparado para leitura por bairro, rua, CEP e heatmap real.",
  }));
}

function buildAnalysis(name: string, type: string, status: string, priority: string, leaders: number, coverage: number, validated: number, target: number) {
  if (status === "Forte") return name + " concentra for\u00e7a territorial relevante, com base de lideran\u00e7as e votos validados em crescimento.";
  if (status === "Sem lideran\u00e7a") return name + " tem baixa presen\u00e7a pol\u00edtica e precisa de lideran\u00e7a local antes de ampliar cadastros.";
  if (type === "Munic\u00edpio" && name === "S\u00e3o Gon\u00e7alo") return "S\u00e3o Gon\u00e7alo possui alto potencial eleitoral, mas ainda apresenta baixa cobertura da campanha. Recomenda-se cadastrar novas lideran\u00e7as e iniciar prospec\u00e7\u00e3o regional.";
  if (name === "Itaipua\u00e7u") return "Itaipua\u00e7u concentra grande volume estimado de eleitores, mas apresenta baixa cobertura e poucos votos validados. A prioridade \u00e9 ampliar lideran\u00e7as locais, cadastrar apoiadores e agendar a\u00e7\u00f5es de campo.";
  if (priority === "Cr\u00edtica") return name + " combina potencial eleitoral alto, baixa cobertura e pouca valida\u00e7\u00e3o. Deve entrar na agenda priorit\u00e1ria.";
  if (validated >= target * 0.75) return name + " est\u00e1 perto da meta e pode avan\u00e7ar com a\u00e7\u00f5es curtas de valida\u00e7\u00e3o.";
  return name + " est\u00e1 em desenvolvimento, com cobertura de " + formatPercent(coverage) + " e espa\u00e7o para prospec\u00e7\u00e3o qualificada.";
}

function pct(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function normalize(value: number, max: number) {
  return Math.round(Math.min(100, (value / max) * 100));
}

export function formatPercent(value: number) {
  return Number(value.toFixed(1)).toLocaleString("pt-BR") + "%";
}
