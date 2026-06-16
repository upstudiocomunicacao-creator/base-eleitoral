export type MunicipalBaseKey = "marica" | "sao_goncalo" | "niteroi";

export type MunicipalBase = {
  key: MunicipalBaseKey;
  city: string;
  label: string;
  subdivisionLabel: string;
  center: { latitude: number; longitude: number; zoom: number };
  groups: Array<{
    name: string;
    neighborhoods: string[];
  }>;
};

export const municipalBases: Record<MunicipalBaseKey, MunicipalBase> = {
  marica: {
    key: "marica",
    city: "Maricá",
    label: "Base Maricá",
    subdivisionLabel: "Distrito",
    center: { latitude: -22.9196, longitude: -42.8186, zoom: 11.1 },
    groups: [
      {
        name: "Sede / Maricá",
        neighborhoods: [
          "Centro",
          "Flamengo",
          "Mumbuca",
          "Itapeba",
          "Parque Nanci",
          "Ponta Grossa",
          "São José do Imbassaí",
          "Araçatiba",
          "Jacaroá",
          "Barra de Maricá",
          "Zacarias",
          "Restinga de Maricá",
          "Retiro",
          "Camburi",
          "Pindobas",
          "Caxito",
          "Ubatiba",
          "Pilar",
          "Lagarto",
          "Silvado",
          "Condado de Maricá",
          "Marquês de Maricá",
        ],
      },
      {
        name: "Ponta Negra",
        neighborhoods: [
          "Ponta Negra",
          "Jaconé",
          "Cordeirinho",
          "Guaratiba",
          "Jardim Interlagos",
          "Jardim Balneário Bambuí",
          "Pindobal",
          "Caju",
          "Manoel Ribeiro",
          "Espraiado",
          "Vale da Figueira",
          "Bananal",
        ],
      },
      {
        name: "Inoã",
        neighborhoods: ["Inoã", "Chácaras de Inoã", "Calaboca", "SPAR", "Santa Paula", "Cassorotiba"],
      },
      {
        name: "Itaipuaçu",
        neighborhoods: [
          "Recanto de Itaipuaçu",
          "Praia de Itaipuaçu",
          "Morada das Águias",
          "Rincão Mimoso",
          "Barroco",
          "Jardim Atlântico Oeste",
          "Jardim Atlântico Central",
          "Jardim Atlântico Leste",
          "Cajueiros",
          "Itaocaia Valley",
        ],
      },
    ],
  },
  sao_goncalo: {
    key: "sao_goncalo",
    city: "São Gonçalo",
    label: "Base São Gonçalo",
    subdivisionLabel: "Distrito",
    center: { latitude: -22.8268, longitude: -43.0634, zoom: 11 },
    groups: [
      {
        name: "São Gonçalo / Sede",
        neighborhoods: [
          "Palmeira",
          "Itaoca",
          "Fazenda dos Mineiros",
          "Porto do Rosa",
          "Boaçu",
          "Zé Garoto",
          "Brasilândia",
          "Rosane",
          "Vila Lara",
          "Centro / Rodo de São Gonçalo",
          "Rocha",
          "Lindo Parque",
          "Tribobó",
          "Colubandê",
          "Mutondo",
          "Galo Branco",
          "Estrela do Norte",
          "São Miguel",
          "Mutuá",
          "Mutuaguaçu",
          "Mutuapira",
          "Cruzeiro do Sul",
          "Antonina",
          "Nova Cidade",
          "Trindade",
          "Luiz Caçador",
          "Recanto das Acácias",
          "Itaúna",
          "Salgueiro",
          "Alcântara",
        ],
      },
      {
        name: "Ipiíba",
        neighborhoods: [
          "Almerinda",
          "Jardim Nova República",
          "Arsenal",
          "Maria Paula",
          "Arrastão",
          "Anaia Pequeno",
          "Joquei",
          "Coelho",
          "Amendoeira",
          "Jardim Amendoeira",
          "Vila Candoza",
          "Anaia Grande",
          "Ipiíba",
          "Engenho do Roçado",
          "Rio do Ouro",
          "Várzea das Moças",
          "Santa Isabel",
          "Eliane",
          "Ieda",
          "Sacramento",
        ],
      },
      {
        name: "Monjolos",
        neighborhoods: [
          "Jardim Catarina",
          "Raul Veiga",
          "Vila Três",
          "Laranjal",
          "Santa Luzia",
          "Bom Retiro",
          "Gebara",
          "Vista Alegre",
          "Lagoinha",
          "Miriambi",
          "Tiradentes",
          "Pacheco",
          "Barracão",
          "Guarani",
          "Monjolo",
          "Marambaia",
          "Largo da Idéia",
        ],
      },
      {
        name: "Neves",
        neighborhoods: [
          "Boa Vista",
          "Porto da Pedra",
          "Porto Novo",
          "Gradim",
          "Porto Velho",
          "Neves",
          "Venda da Cruz",
          "Convanca",
          "Vila Lage",
          "Porto da Madama",
          "Paraíso",
          "Patronato",
          "Mangueira",
        ],
      },
      {
        name: "Sete Pontes",
        neighborhoods: ["Parada 40", "Camarão", "Santa Catarina", "Barro Vermelho", "Pita", "Zumbi", "Tenente Jardim", "Morro do Castro", "Engenho Pequeno", "Novo México"],
      },
    ],
  },
  niteroi: {
    key: "niteroi",
    city: "Niterói",
    label: "Base Niterói",
    subdivisionLabel: "Região administrativa",
    center: { latitude: -22.8832, longitude: -43.1034, zoom: 11.2 },
    groups: [
      {
        name: "Praias da Baía",
        neighborhoods: [
          "Bairro de Fátima",
          "Boa Viagem",
          "Cachoeiras",
          "Centro",
          "Charitas",
          "Gragoatá",
          "Icaraí",
          "Ingá",
          "Jurujuba",
          "Morro do Estado",
          "Pé Pequeno",
          "Ponta d'Areia",
          "Santa Rosa",
          "São Domingos",
          "São Francisco",
          "Viradouro",
          "Vital Brazil",
        ],
      },
      {
        name: "Norte",
        neighborhoods: ["Baldeador", "Barreto", "Caramujo", "Cubango", "Engenhoca", "Fonseca", "Ilha da Conceição", "Santa Bárbara", "Santana", "São Lourenço", "Tenente Jardim", "Viçoso Jardim"],
      },
      {
        name: "Oceânica",
        neighborhoods: ["Cafubá", "Camboinhas", "Engenho do Mato", "Itacoatiara", "Itaipu", "Jacaré", "Jardim Imbuí", "Maravista", "Piratininga", "Santo Antônio", "Serra Grande"],
      },
      {
        name: "Pendotiba",
        neighborhoods: ["Badu", "Cantagalo", "Ititioca", "Largo da Batalha", "Maceió", "Maria Paula", "Matapaca", "Sapê", "Vila Progresso"],
      },
      {
        name: "Leste",
        neighborhoods: ["Muriqui", "Rio do Ouro", "Várzea das Moças"],
      },
    ],
  },
};

export const municipalBaseOptions = Object.values(municipalBases);
export const municipalBaseCities = municipalBaseOptions.map((base) => base.city);

export function normalizeTerritoryText(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getMunicipalBaseByCity(city: string | null | undefined) {
  const normalized = normalizeTerritoryText(city);
  return municipalBaseOptions.find((base) => normalizeTerritoryText(base.city) === normalized) ?? null;
}

export function getMunicipalBaseByKey(key: MunicipalBaseKey) {
  return municipalBases[key];
}

export function isMunicipalBaseCity(city: string | null | undefined) {
  return Boolean(getMunicipalBaseByCity(city));
}

export function getMunicipalNeighborhoods(city: string | null | undefined) {
  return getMunicipalBaseByCity(city)?.groups.flatMap((group) => group.neighborhoods) ?? [];
}

export function getMunicipalSubdivisionForNeighborhood(city: string | null | undefined, neighborhood: string | null | undefined) {
  const base = getMunicipalBaseByCity(city);
  const normalized = normalizeTerritoryText(neighborhood);
  return base?.groups.find((group) => group.neighborhoods.some((item) => normalizeTerritoryText(item) === normalized))?.name ?? "Sem região";
}

