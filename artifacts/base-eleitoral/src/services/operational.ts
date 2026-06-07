export type OperationalScope = "rj" | "marica";
export type ForceRole = "coord_rj" | "coord_marica" | "leader";
export type ForceStatus = "Ativo" | "Atenção" | "Prioritário" | "Pendente";

export type MonthlyProjection = {
  month: string;
  minVotes: number;
  maxVotes: number;
  baseCost: number;
  ceilingCost: number;
  extraCost: number;
};

export type ForceActor = {
  id: string;
  name: string;
  phone: string;
  role: ForceRole;
  scope: OperationalScope;
  territory: string;
  city: string;
  neighborhood?: string;
  status: ForceStatus;
  parentId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  monthly: MonthlyProjection[];
};

export type OperationalSummary = {
  coordinatorsRJ: number;
  coordinatorsMarica: number;
  leaders: number;
  territories: number;
  minVotes: number;
  maxVotes: number;
  baseCost: number;
  ceilingCost: number;
  extraCost: number;
  costPerMinVote: number;
  costPerMaxVote: number;
  withoutCoordinates: number;
};

export const operationalMonths = ["Jun/26", "Jul/26", "Ago/26", "Set/26", "Out/26"];

export const rjCities = [
  "Maricá",
  "Niterói",
  "São Gonçalo",
  "Itaboraí",
  "Rio de Janeiro",
  "Saquarema",
  "Araruama",
  "Cabo Frio",
  "Tanguá",
  "Rio Bonito",
];

export const maricaNeighborhoods = [
  "Centro",
  "Itaipuaçu",
  "Inoã",
  "São José do Imbassaí",
  "Araçatiba",
  "Flamengo",
  "Mumbuca",
  "Barra de Maricá",
  "Cordeirinho",
  "Guaratiba",
  "Jardim Atlântico",
  "Recanto",
  "Barroco",
];

export const minimalFields = [
  "Nome",
  "Telefone/WhatsApp",
  "Tipo",
  "Cidade",
  "Bairro ou município",
  "Status",
  "Responsável/vínculo",
  "Latitude",
  "Longitude",
  "Votos mínimos",
  "Votos máximos",
  "Custo mínimo",
  "Custo máximo",
  "Custo extra",
];

export const operationalActors: ForceActor[] = [
  actor("rj-niteroi", "Coordenação Niterói", "coord_rj", "rj", "Niterói", 420, 720, 2800, 4500, 600, "Prioritário", -22.8832, -43.1034),
  actor("rj-sg", "Coordenação São Gonçalo", "coord_rj", "rj", "São Gonçalo", 360, 640, 2600, 4300, 400, "Atenção", -22.8268, -43.0634),
  actor("rj-itaborai", "Coordenação Itaboraí", "coord_rj", "rj", "Itaboraí", 180, 320, 1800, 3200, 250, "Pendente", -22.7448, -42.8599),
  actor("rj-rio", "Coordenação Rio de Janeiro", "coord_rj", "rj", "Rio de Janeiro", 520, 980, 4200, 7200, 900, "Prioritário", -22.9068, -43.1729),
  actor("marica-centro", "Coordenação Centro", "coord_marica", "marica", "Centro", 260, 430, 2100, 3600, 350, "Ativo", -22.9196, -42.8186),
  actor("marica-itaipuacu", "Coordenação Itaipuaçu", "coord_marica", "marica", "Itaipuaçu", 340, 620, 2600, 4300, 500, "Prioritário", -22.9553, -42.9861),
  actor("marica-inoa", "Coordenação Inoã", "coord_marica", "marica", "Inoã", 190, 350, 1700, 3100, 200, "Atenção", -22.8777, -42.9103),
  actor("marica-sji", "Coordenação São José", "coord_marica", "marica", "São José do Imbassaí", 220, 390, 1900, 3300, 300, "Ativo", -22.8894, -42.7848),
  leader("lider-centro-1", "Liderança Centro 01", "marica", "Centro", "marica-centro", 80, 140, 800, 1400, "Ativo", -22.917, -42.821),
  leader("lider-itaipuacu-1", "Liderança Itaipuaçu 01", "marica", "Itaipuaçu", "marica-itaipuacu", 120, 210, 900, 1700, "Prioritário", -22.959, -42.973),
  leader("lider-inoa-1", "Liderança Inoã 01", "marica", "Inoã", "marica-inoa", 60, 130, 650, 1200, "Atenção", -22.882, -42.904),
  leader("lider-niteroi-1", "Liderança Niterói 01", "rj", "Niterói", "rj-niteroi", 110, 180, 1000, 1800, "Ativo", -22.89, -43.11),
  leader("lider-sg-1", "Liderança São Gonçalo 01", "rj", "São Gonçalo", "rj-sg", 90, 170, 900, 1600, "Atenção", -22.82, -43.06),
];

function actor(
  id: string,
  name: string,
  role: Extract<ForceRole, "coord_rj" | "coord_marica">,
  scope: OperationalScope,
  territory: string,
  minVotes: number,
  maxVotes: number,
  baseCost: number,
  ceilingCost: number,
  extraCost: number,
  status: ForceStatus,
  latitude?: number,
  longitude?: number,
): ForceActor {
  return {
    id,
    name,
    phone: "(21) 90000-0000",
    role,
    scope,
    territory,
    city: scope === "marica" ? "Maricá" : territory,
    neighborhood: scope === "marica" ? territory : undefined,
    status,
    latitude,
    longitude,
    notes: "Cadastro enxuto preparado para mapa, metas e centro de custos.",
    monthly: buildMonthly(minVotes, maxVotes, baseCost, ceilingCost, extraCost),
  };
}

function leader(
  id: string,
  name: string,
  scope: OperationalScope,
  territory: string,
  parentId: string,
  minVotes: number,
  maxVotes: number,
  baseCost: number,
  ceilingCost: number,
  status: ForceStatus,
  latitude?: number,
  longitude?: number,
): ForceActor {
  return {
    id,
    name,
    phone: "(21) 98888-0000",
    role: "leader",
    scope,
    territory,
    city: scope === "marica" ? "Maricá" : territory,
    neighborhood: scope === "marica" ? territory : undefined,
    parentId,
    status,
    latitude,
    longitude,
    notes: "Liderança com vínculo opcional à coordenação territorial.",
    monthly: buildMonthly(minVotes, maxVotes, baseCost, ceilingCost, 0),
  };
}

function buildMonthly(minVotes: number, maxVotes: number, baseCost: number, ceilingCost: number, extraCost: number) {
  return operationalMonths.map((month, index) => ({
    month,
    minVotes: Math.round(minVotes * (1 + index * 0.08)),
    maxVotes: Math.round(maxVotes * (1 + index * 0.1)),
    baseCost,
    ceilingCost,
    extraCost: index === 0 ? extraCost : Math.round(extraCost * 0.65),
  }));
}

export function computeOperationalSummary(actors: ForceActor[], month = operationalMonths[0]): OperationalSummary {
  const rows = actors.map((item) => getMonthly(item, month));
  const minVotes = sum(rows, "minVotes");
  const maxVotes = sum(rows, "maxVotes");
  const baseCost = sum(rows, "baseCost");
  const ceilingCost = sum(rows, "ceilingCost");
  const extraCost = sum(rows, "extraCost");
  const territories = new Set(actors.map((item) => `${item.scope}-${item.territory}`)).size;

  return {
    coordinatorsRJ: actors.filter((item) => item.role === "coord_rj").length,
    coordinatorsMarica: actors.filter((item) => item.role === "coord_marica").length,
    leaders: actors.filter((item) => item.role === "leader").length,
    territories,
    minVotes,
    maxVotes,
    baseCost,
    ceilingCost,
    extraCost,
    costPerMinVote: minVotes ? Math.round((baseCost + extraCost) / minVotes) : 0,
    costPerMaxVote: maxVotes ? Math.round((ceilingCost + extraCost) / maxVotes) : 0,
    withoutCoordinates: actors.filter((item) => !item.latitude || !item.longitude).length,
  };
}

export function getMonthly(actor: ForceActor, month: string) {
  return actor.monthly.find((item) => item.month === month) ?? actor.monthly[0];
}

export function getRoleLabel(role: ForceRole) {
  if (role === "coord_rj") return "Coord. RJ";
  if (role === "coord_marica") return "Coord. Maricá";
  return "Liderança";
}

export function getScopeLabel(scope: OperationalScope) {
  return scope === "marica" ? "Maricá por bairros" : "RJ por cidades";
}

export function groupTerritoryPerformance(actors: ForceActor[], month: string, scope: OperationalScope) {
  const grouped = actors
    .filter((item) => item.scope === scope)
    .reduce<Record<string, { territory: string; minVotes: number; maxVotes: number; cost: number; actors: number }>>((acc, item) => {
      const monthly = getMonthly(item, month);
      const key = item.territory;
      acc[key] ??= { territory: key, minVotes: 0, maxVotes: 0, cost: 0, actors: 0 };
      acc[key].minVotes += monthly.minVotes;
      acc[key].maxVotes += monthly.maxVotes;
      acc[key].cost += monthly.baseCost + monthly.extraCost;
      acc[key].actors += 1;
      return acc;
    }, {});

  return Object.values(grouped).sort((a, b) => b.maxVotes - a.maxVotes);
}

function sum(rows: MonthlyProjection[], key: keyof MonthlyProjection) {
  return rows.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}
