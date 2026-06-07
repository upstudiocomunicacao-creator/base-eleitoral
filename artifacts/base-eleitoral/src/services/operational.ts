export type OperationalScope = "rj" | "marica";
export type ForceRole = "coord_rj" | "coord_marica" | "leader";
export type ForceStatus = "Ativo" | "Aten\u00e7\u00e3o" | "Priorit\u00e1rio" | "Pendente";

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
  region?: string;
  district?: string;
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

export type TerritoryPerformance = {
  territory: string;
  group: string;
  minVotes: number;
  maxVotes: number;
  cost: number;
  actors: number;
};

export const operationalMonths = ["Jun/26", "Jul/26", "Ago/26", "Set/26", "Out/26"];

export const rjRegions = [
  {
    name: "Metropolitana",
    cities: [
      "Belford Roxo",
      "Cachoeiras de Macacu",
      "Duque de Caxias",
      "Guapimirim",
      "Itabora\u00ed",
      "Itagua\u00ed",
      "Japeri",
      "Mag\u00e9",
      "Maric\u00e1",
      "Mesquita",
      "Nil\u00f3polis",
      "Niter\u00f3i",
      "Nova Igua\u00e7u",
      "Paracambi",
      "Petr\u00f3polis",
      "Queimados",
      "Rio Bonito",
      "Rio de Janeiro",
      "S\u00e3o Gon\u00e7alo",
      "S\u00e3o Jo\u00e3o de Meriti",
      "Serop\u00e9dica",
      "Tangu\u00e1",
    ],
  },
  { name: "Costa Verde", cities: ["Angra dos Reis", "Mangaratiba", "Paraty"] },
  {
    name: "M\u00e9dio Para\u00edba",
    cities: ["Barra do Pira\u00ed", "Barra Mansa", "Itatiaia", "Pinheiral", "Pira\u00ed", "Porto Real", "Quatis", "Resende", "Rio Claro", "Valen\u00e7a", "Volta Redonda"],
  },
  {
    name: "Centro-Sul Fluminense",
    cities: ["Areal", "Comendador Levy Gasparian", "Engenheiro Paulo de Frontin", "Mendes", "Miguel Pereira", "Para\u00edba do Sul", "Paty do Alferes", "Rio das Flores", "Sapucaia", "Tr\u00eas Rios", "Vassouras"],
  },
  {
    name: "Serrana",
    cities: ["Bom Jardim", "Cantagalo", "Carmo", "Cordeiro", "Duas Barras", "Macuco", "Nova Friburgo", "Santa Maria Madalena", "S\u00e3o Jos\u00e9 do Vale do Rio Preto", "S\u00e3o Sebasti\u00e3o do Alto", "Sumidouro", "Teres\u00f3polis", "Trajano de Moraes"],
  },
  {
    name: "Baixadas Litor\u00e2neas",
    cities: ["Araruama", "Arma\u00e7\u00e3o dos B\u00fazios", "Arraial do Cabo", "Cabo Frio", "Casimiro de Abreu", "Iguaba Grande", "Rio das Ostras", "S\u00e3o Pedro da Aldeia", "Saquarema", "Silva Jardim"],
  },
  {
    name: "Norte Fluminense",
    cities: ["Campos dos Goytacazes", "Carapebus", "Cardoso Moreira", "Concei\u00e7\u00e3o de Macabu", "Maca\u00e9", "Quissam\u00e3", "S\u00e3o Fid\u00e9lis", "S\u00e3o Francisco de Itabapoana", "S\u00e3o Jo\u00e3o da Barra"],
  },
  {
    name: "Noroeste Fluminense",
    cities: ["Aperib\u00e9", "Bom Jesus do Itabapoana", "Cambuci", "Italva", "Itaocara", "Itaperuna", "Laje do Muria\u00e9", "Miracema", "Natividade", "Porci\u00fancula", "Santo Ant\u00f4nio de P\u00e1dua", "S\u00e3o Jos\u00e9 de Ub\u00e1", "Varre-Sai"],
  },
] as const;

export const rjCities = rjRegions.flatMap((region) => region.cities);

export const maricaDistricts = [
  {
    name: "Sede / Maric\u00e1",
    neighborhoods: [
      "Centro",
      "Flamengo",
      "Mumbuca",
      "Itapeba",
      "Parque Nanci",
      "Ponta Grossa",
      "S\u00e3o Jos\u00e9 do Imbassa\u00ed",
      "Ara\u00e7atiba",
      "Jacaro\u00e1",
      "Barra de Maric\u00e1",
      "Zacarias",
      "Restinga de Maric\u00e1",
      "Retiro",
      "Camburi",
      "Pindobas",
      "Caxito",
      "Ubatiba",
      "Pilar",
      "Lagarto",
      "Silvado",
      "Condado de Maric\u00e1",
      "Marqu\u00eas de Maric\u00e1",
    ],
  },
  {
    name: "Ponta Negra",
    neighborhoods: ["Ponta Negra", "Jacon\u00e9", "Cordeirinho", "Guaratiba", "Jardim Interlagos", "Jardim Balne\u00e1rio Bambu\u00ed", "Pindobal", "Caju", "Manoel Ribeiro", "Espraiado", "Vale da Figueira", "Bananal"],
  },
  {
    name: "Ino\u00e3",
    neighborhoods: ["Ino\u00e3", "Ch\u00e1caras de Ino\u00e3", "Calaboca", "SPAR", "Santa Paula", "Cassorotiba"],
  },
  {
    name: "Itaipua\u00e7u",
    neighborhoods: ["Recanto de Itaipua\u00e7u", "Praia de Itaipua\u00e7u", "Morada das \u00c1guias", "Rinc\u00e3o Mimoso", "Barroco", "Jardim Atl\u00e2ntico Oeste", "Jardim Atl\u00e2ntico Central", "Jardim Atl\u00e2ntico Leste", "Cajueiros", "Itaocaia Valley"],
  },
] as const;

export const maricaNeighborhoods = maricaDistricts.flatMap((district) => district.neighborhoods);

export const minimalFields = [
  "Nome",
  "Telefone/WhatsApp",
  "Tipo",
  "Cidade ou bairro",
  "Regi\u00e3o/Distrito",
  "Status",
  "Respons\u00e1vel/v\u00ednculo",
  "Latitude",
  "Longitude",
  "Votos m\u00ednimos",
  "Votos m\u00e1ximos",
  "Custo m\u00ednimo",
  "Custo m\u00e1ximo",
  "Custo extra",
];

export const operationalActors: ForceActor[] = [
  actor("rj-niteroi", "Coordena\u00e7\u00e3o Niter\u00f3i", "coord_rj", "rj", "Niter\u00f3i", 420, 720, 2800, 4500, 600, "Priorit\u00e1rio", -22.8832, -43.1034),
  actor("rj-sg", "Coordena\u00e7\u00e3o S\u00e3o Gon\u00e7alo", "coord_rj", "rj", "S\u00e3o Gon\u00e7alo", 360, 640, 2600, 4300, 400, "Aten\u00e7\u00e3o", -22.8268, -43.0634),
  actor("rj-itaborai", "Coordena\u00e7\u00e3o Itabora\u00ed", "coord_rj", "rj", "Itabora\u00ed", 180, 320, 1800, 3200, 250, "Pendente", -22.7448, -42.8599),
  actor("rj-rio", "Coordena\u00e7\u00e3o Rio de Janeiro", "coord_rj", "rj", "Rio de Janeiro", 520, 980, 4200, 7200, 900, "Priorit\u00e1rio", -22.9068, -43.1729),
  actor("marica-centro", "Coordena\u00e7\u00e3o Centro", "coord_marica", "marica", "Centro", 260, 430, 2100, 3600, 350, "Ativo", -22.9196, -42.8186),
  actor("marica-itaipuacu", "Coordena\u00e7\u00e3o Itaipua\u00e7u", "coord_marica", "marica", "Recanto de Itaipua\u00e7u", 340, 620, 2600, 4300, 500, "Priorit\u00e1rio", -22.9553, -42.9861),
  actor("marica-inoa", "Coordena\u00e7\u00e3o Ino\u00e3", "coord_marica", "marica", "Ino\u00e3", 190, 350, 1700, 3100, 200, "Aten\u00e7\u00e3o", -22.8777, -42.9103),
  actor("marica-sji", "Coordena\u00e7\u00e3o S\u00e3o Jos\u00e9", "coord_marica", "marica", "S\u00e3o Jos\u00e9 do Imbassa\u00ed", 220, 390, 1900, 3300, 300, "Ativo", -22.8894, -42.7848),
  leader("lider-centro-1", "Lideran\u00e7a Centro 01", "marica", "Centro", "marica-centro", 80, 140, 800, 1400, "Ativo", -22.917, -42.821),
  leader("lider-itaipuacu-1", "Lideran\u00e7a Itaipua\u00e7u 01", "marica", "Recanto de Itaipua\u00e7u", "marica-itaipuacu", 120, 210, 900, 1700, "Priorit\u00e1rio", -22.959, -42.973),
  leader("lider-inoa-1", "Lideran\u00e7a Ino\u00e3 01", "marica", "Ino\u00e3", "marica-inoa", 60, 130, 650, 1200, "Aten\u00e7\u00e3o", -22.882, -42.904),
  leader("lider-niteroi-1", "Lideran\u00e7a Niter\u00f3i 01", "rj", "Niter\u00f3i", "rj-niteroi", 110, 180, 1000, 1800, "Ativo", -22.89, -43.11),
  leader("lider-sg-1", "Lideran\u00e7a S\u00e3o Gon\u00e7alo 01", "rj", "S\u00e3o Gon\u00e7alo", "rj-sg", 90, 170, 900, 1600, "Aten\u00e7\u00e3o", -22.82, -43.06),
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
  const isMarica = scope === "marica";

  return {
    id,
    name,
    phone: "(21) 90000-0000",
    role,
    scope,
    territory,
    city: isMarica ? "Maric\u00e1" : territory,
    neighborhood: isMarica ? territory : undefined,
    region: isMarica ? undefined : getRJRegionForCity(territory),
    district: isMarica ? getMaricaDistrictForNeighborhood(territory) : undefined,
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
  const isMarica = scope === "marica";

  return {
    id,
    name,
    phone: "(21) 98888-0000",
    role: "leader",
    scope,
    territory,
    city: isMarica ? "Maric\u00e1" : territory,
    neighborhood: isMarica ? territory : undefined,
    region: isMarica ? undefined : getRJRegionForCity(territory),
    district: isMarica ? getMaricaDistrictForNeighborhood(territory) : undefined,
    parentId,
    status,
    latitude,
    longitude,
    notes: "Lideran\u00e7a com v\u00ednculo opcional \u00e0 coordena\u00e7\u00e3o territorial.",
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
  if (role === "coord_marica") return "Coord. Maric\u00e1";
  return "Lideran\u00e7a";
}

export function getScopeLabel(scope: OperationalScope) {
  return scope === "marica" ? "Maric\u00e1 por bairros" : "RJ por cidades";
}

export function getRJRegionForCity(city: string) {
  return rjRegions.find((region) => (region.cities as readonly string[]).includes(city))?.name ?? "Sem regi\u00e3o";
}

export function getMaricaDistrictForNeighborhood(neighborhood: string) {
  return maricaDistricts.find((district) => (district.neighborhoods as readonly string[]).includes(neighborhood))?.name ?? "Sem distrito";
}

export function getTerritoryGroup(actor: ForceActor) {
  return actor.scope === "marica"
    ? actor.district ?? getMaricaDistrictForNeighborhood(actor.territory)
    : actor.region ?? getRJRegionForCity(actor.territory);
}

export function groupTerritoryPerformance(actors: ForceActor[], month: string, scope: OperationalScope): TerritoryPerformance[] {
  const grouped = actors
    .filter((item) => item.scope === scope)
    .reduce<Record<string, TerritoryPerformance>>((acc, item) => {
      const monthly = getMonthly(item, month);
      const key = item.territory;
      acc[key] ??= { territory: key, group: getTerritoryGroup(item), minVotes: 0, maxVotes: 0, cost: 0, actors: 0 };
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
