import type {
  Apoiador,
  BairroMarica,
  ComparativoEleitoral,
  DashboardStats,
  Demanda,
  EventoAgenda,
  EvolucaoSemanal,
  Lideranca,
  MunicipioRJ,
  Prospecto,
  ProspeccaoPipeline,
  RankingItem,
  ZonaEleitoral,
} from "./generated/api.schemas";

const liderancas: Lideranca[] = [
  {
    id: 1,
    nome: "Mariana Costa",
    apelido: "Mari da Saúde",
    telefone: "(21) 99911-2401",
    email: "mariana.costa@base360.local",
    tipoLideranca: "Comunitária",
    status: "Ativa",
    bairro: "Centro",
    cidade: "Maricá",
    estado: "RJ",
    regiaoAtuacao: "Centro e Araçatiba",
    responsavelInterno: "Coordenação Maricá",
    apoiadoresCadastrados: 186,
    apoiadoresEstimadosDiretos: 260,
    apoiadoresEstimadosIndiretos: 410,
    votosDeclarados: 520,
    votosValidados: 368,
    grauConfianca: "alto",
    fonteEstimativa: "Lista validada em reunião",
    comprovacao: "Planilha e fotos de encontro",
    ultimaAtualizacao: "2026-06-03",
    proximaAcao: "Reunião com comerciantes",
    observacoes: "Boa entrada com lideranças de bairro.",
  },
  {
    id: 2,
    nome: "Rafael Almeida",
    apelido: "Rafa Inoã",
    telefone: "(21) 99820-1140",
    email: "rafael.almeida@base360.local",
    tipoLideranca: "Juventude",
    status: "Ativo",
    bairro: "Inoã",
    cidade: "Maricá",
    estado: "RJ",
    regiaoAtuacao: "Inoã e Santa Paula",
    responsavelInterno: "Mobilização Jovem",
    apoiadoresCadastrados: 112,
    apoiadoresEstimadosDiretos: 180,
    apoiadoresEstimadosIndiretos: 260,
    votosDeclarados: 310,
    votosValidados: 208,
    grauConfianca: "médio",
    fonteEstimativa: "Grupos de WhatsApp",
    comprovacao: "Lista parcial",
    ultimaAtualizacao: "2026-06-02",
    proximaAcao: "Mutirão de cadastro",
    observacoes: "Potencial de crescimento rápido.",
  },
  {
    id: 3,
    nome: "Cláudia Menezes",
    apelido: "Cláudia do Barroco",
    telefone: "(21) 99776-9021",
    email: "claudia.menezes@base360.local",
    tipoLideranca: "Comerciante",
    status: "Em validação",
    bairro: "Barroco",
    cidade: "Maricá",
    estado: "RJ",
    regiaoAtuacao: "Itaipuaçu e Barroco",
    responsavelInterno: "Coordenação Territorial",
    apoiadoresCadastrados: 94,
    apoiadoresEstimadosDiretos: 130,
    apoiadoresEstimadosIndiretos: 190,
    votosDeclarados: 260,
    votosValidados: 142,
    grauConfianca: "médio",
    fonteEstimativa: "Rede comercial",
    comprovacao: "Cadastros em conferência",
    ultimaAtualizacao: "2026-06-01",
    proximaAcao: "Validar contatos pendentes",
    observacoes: "Importante para comércio local.",
  },
];

const apoiadores: Apoiador[] = [
  { id: 1, nome: "João Pereira", telefone: "(21) 98811-2210", email: null, bairro: "Centro", cidade: "Maricá", estado: "RJ", liderancaVinculada: "Mariana Costa", tipoPessoa: "Apoiador confirmado", statusPolitico: "Confirmado", nivelConfianca: "alto", nivelPrecisaoGeografica: "bairro", dataUltimoContato: "2026-06-02", proximaAcao: "Convidar para reunião", responsavelContato: "Equipe Centro" },
  { id: 2, nome: "Ana Luiza Santos", telefone: "(21) 97770-8820", email: "ana.santos@base360.local", bairro: "Inoã", cidade: "Maricá", estado: "RJ", liderancaVinculada: "Rafael Almeida", tipoPessoa: "Voluntário", statusPolitico: "Prioridade", nivelConfianca: "alto", nivelPrecisaoGeografica: "rua", dataUltimoContato: "2026-06-03", proximaAcao: "Organizar caminhada", responsavelContato: "Mobilização Jovem" },
  { id: 3, nome: "Sérgio Martins", telefone: "(21) 96643-1199", email: null, bairro: "Itaipuaçu", cidade: "Maricá", estado: "RJ", liderancaVinculada: "Cláudia Menezes", tipoPessoa: "Comerciante", statusPolitico: "Simpatizante", nivelConfianca: "médio", nivelPrecisaoGeografica: "bairro", dataUltimoContato: "2026-05-31", proximaAcao: "Visita presencial", responsavelContato: "Coordenação Territorial" },
];

const evolucao: EvolucaoSemanal[] = [
  { semana: "Sem 1", cadastros: 45, liderancas: 3, apoiadores: 42 },
  { semana: "Sem 2", cadastros: 78, liderancas: 5, apoiadores: 73 },
  { semana: "Sem 3", cadastros: 62, liderancas: 4, apoiadores: 58 },
  { semana: "Sem 4", cadastros: 95, liderancas: 7, apoiadores: 88 },
  { semana: "Sem 5", cadastros: 110, liderancas: 8, apoiadores: 102 },
  { semana: "Sem 6", cadastros: 133, liderancas: 9, apoiadores: 124 },
  { semana: "Sem 7", cadastros: 147, liderancas: 11, apoiadores: 136 },
  { semana: "Sem 8", cadastros: 189, liderancas: 14, apoiadores: 175 },
];

const bairrosMarica: BairroMarica[] = [
  { nome: "Centro", liderancas: 6, apoiadores: 600, votosDeclarados: 820, votosValidados: 420, cobertura: 5.0, prioridade: "Manter" },
  { nome: "Itaipuaçu", liderancas: 3, apoiadores: 350, votosDeclarados: 310, votosValidados: 180, cobertura: 1.25, prioridade: "Alta" },
  { nome: "Inoã", liderancas: 2, apoiadores: 220, votosDeclarados: 210, votosValidados: 130, cobertura: 1.22, prioridade: "Alta" },
  { nome: "São José do Imbassaí", liderancas: 4, apoiadores: 500, votosDeclarados: 580, votosValidados: 350, cobertura: 5.0, prioridade: "Expandir" },
  { nome: "Araçatiba", liderancas: 2, apoiadores: 150, votosDeclarados: 180, votosValidados: 95, cobertura: 2.8, prioridade: "Alta" },
  { nome: "Mumbuca", liderancas: 2, apoiadores: 120, votosDeclarados: 140, votosValidados: 75, cobertura: 2.1, prioridade: "Média" },
];

const municipiosRJ: MunicipioRJ[] = [
  { nome: "Maricá", comAtuacao: true, liderancas: 24, apoiadores: 1240, votosDeclarados: 3200, votosValidados: 2100, ranking: 1 },
  { nome: "Niterói", comAtuacao: true, liderancas: 8, apoiadores: 320, votosDeclarados: 850, votosValidados: 540, ranking: 2 },
  { nome: "São Gonçalo", comAtuacao: true, liderancas: 6, apoiadores: 280, votosDeclarados: 720, votosValidados: 420, ranking: 3 },
  { nome: "Rio Bonito", comAtuacao: true, liderancas: 4, apoiadores: 180, votosDeclarados: 420, votosValidados: 260, ranking: 4 },
  { nome: "Saquarema", comAtuacao: true, liderancas: 3, apoiadores: 130, votosDeclarados: 310, votosValidados: 190, ranking: 5 },
  { nome: "Araruama", comAtuacao: false, liderancas: 0, apoiadores: 0, votosDeclarados: 0, votosValidados: 0, ranking: null },
];

const comparativo: ComparativoEleitoral[] = bairrosMarica.map((bairro, index) => {
  const eleitores = [12000, 28000, 18000, 10000, 8000, 7000][index] ?? 5000;
  const meta = Math.round(eleitores * 0.05);
  return {
    bairro: bairro.nome,
    eleitores,
    apoiadoresCadastrados: bairro.apoiadores,
    votosValidados: bairro.votosValidados,
    cobertura: bairro.cobertura,
    meta,
    distanciaMeta: Math.max(meta - bairro.votosValidados, 0),
    prioridade: bairro.prioridade,
  };
});

const zonas: ZonaEleitoral[] = [
  { id: 1, zona: "55", secao: "102", localVotacao: "C.E. Elisiário Matta", endereco: "Rua Álvares de Castro", bairro: "Centro", cidade: "Maricá", estado: "RJ", totalEleitores: 2810, historicoVotacao: "Alta participação", metaVotos: 180, votosEstimados: 210, votosValidados: 124, responsavel: "Mariana Costa" },
  { id: 2, zona: "55", secao: "118", localVotacao: "E.M. Darcy Ribeiro", endereco: "Av. Itaipuaçu", bairro: "Itaipuaçu", cidade: "Maricá", estado: "RJ", totalEleitores: 3420, historicoVotacao: "Área competitiva", metaVotos: 220, votosEstimados: 190, votosValidados: 88, responsavel: "Cláudia Menezes" },
  { id: 3, zona: "55", secao: "134", localVotacao: "CIEP Inoã", endereco: "Estrada de Inoã", bairro: "Inoã", cidade: "Maricá", estado: "RJ", totalEleitores: 2980, historicoVotacao: "Crescimento recente", metaVotos: 190, votosEstimados: 160, votosValidados: 76, responsavel: "Rafael Almeida" },
];

const agenda: EventoAgenda[] = [
  { id: 1, titulo: "Reunião com lideranças do Centro", tipo: "Reunião", data: "2026-06-06", horario: "19:00", bairro: "Centro", cidade: "Maricá", responsavel: "Coordenação Geral", status: "Confirmado", observacoes: "Validar lista de novos apoiadores." },
  { id: 2, titulo: "Caminhada em Itaipuaçu", tipo: "Caminhada", data: "2026-06-08", horario: "09:00", bairro: "Itaipuaçu", cidade: "Maricá", responsavel: "Equipe Territorial", status: "Planejado", observacoes: "Priorizar comércio local." },
  { id: 3, titulo: "Visita comunitária em Inoã", tipo: "Visita", data: "2026-06-10", horario: "17:30", bairro: "Inoã", cidade: "Maricá", responsavel: "Mobilização Jovem", status: "Em organização", observacoes: "Confirmar voluntários." },
];

const demandas: Demanda[] = [
  { id: 1, pessoaVinculada: "João Pereira", bairro: "Centro", tipoDemanda: "Saúde", prioridade: "Alta", status: "Em atendimento", responsavel: "Equipe Centro", observacoes: "Fila de consulta especializada.", dataRetorno: "2026-06-07" },
  { id: 2, pessoaVinculada: "Ana Luiza Santos", bairro: "Inoã", tipoDemanda: "Transporte", prioridade: "Média", status: "Registrada", responsavel: "Mobilização Jovem", observacoes: "Horário de ônibus no fim de semana.", dataRetorno: "2026-06-09" },
  { id: 3, pessoaVinculada: "Sérgio Martins", bairro: "Itaipuaçu", tipoDemanda: "Iluminação", prioridade: "Alta", status: "Encaminhada", responsavel: "Coordenação Territorial", observacoes: "Rua com baixa iluminação.", dataRetorno: "2026-06-11" },
];

const prospeccao: ProspeccaoPipeline = {
  novoContato: [{ id: 1, nome: "Patrícia Lima", telefone: "(21) 95510-2001", bairro: "Guaratiba", cidade: "Maricá", etapa: "novoContato", responsavel: "Equipe Campo", dataContato: "2026-06-03" }],
  primeiroAtendimento: [{ id: 2, nome: "Bruno Teixeira", telefone: "(21) 98830-4402", bairro: "Mumbuca", cidade: "Maricá", etapa: "primeiroAtendimento", responsavel: "Equipe Centro", dataContato: "2026-06-02" }],
  simpatizante: [{ id: 3, nome: "Lívia Rocha", telefone: "(21) 97740-3311", bairro: "Araçatiba", cidade: "Maricá", etapa: "simpatizante", responsavel: "Mariana Costa", dataContato: "2026-06-01" }],
  apoiadorConfirmado: [{ id: 4, nome: "Carlos Nunes", telefone: "(21) 96620-1009", bairro: "Centro", cidade: "Maricá", etapa: "apoiadorConfirmado", responsavel: "Coordenação Geral", dataContato: "2026-05-30" }],
  multiplicador: [{ id: 5, nome: "Renata Alves", telefone: "(21) 95542-9100", bairro: "Itaipuaçu", cidade: "Maricá", etapa: "multiplicador", responsavel: "Cláudia Menezes", dataContato: "2026-05-29" }],
  votoValidado: [{ id: 6, nome: "Mateus Freire", telefone: "(21) 94422-7810", bairro: "Inoã", cidade: "Maricá", etapa: "votoValidado", responsavel: "Rafael Almeida", dataContato: "2026-05-28" }],
};

const stats: DashboardStats = {
  totalLiderancas: liderancas.length,
  totalApoiadores: 1240,
  apoiadoresEstimados: 2200,
  votosDeclarados: 3200,
  votosValidados: 2100,
  indiceConfianca: 7.8,
  municipiosAtuacao: municipiosRJ.filter((municipio) => municipio.comAtuacao).length,
  bairrosCobertos: 21,
  zonasEleitorais: zonas.length,
  regioesPrioritarias: 8,
};

const rankingLiderancas: RankingItem[] = liderancas.map((lideranca) => ({
  nome: lideranca.nome,
  valor: lideranca.votosValidados ?? 0,
  secundario: lideranca.votosDeclarados ?? null,
}));

const rankingBairros: RankingItem[] = bairrosMarica.map((bairro) => ({
  nome: bairro.nome,
  valor: bairro.apoiadores,
  secundario: bairro.votosValidados,
}));

const mockByPath: Record<string, unknown> = {
  "/api/healthz": { status: "ok" },
  "/api/dashboard/stats": stats,
  "/api/dashboard/evolucao": evolucao,
  "/api/dashboard/ranking-liderancas": rankingLiderancas,
  "/api/dashboard/ranking-bairros": rankingBairros,
  "/api/liderancas": liderancas,
  "/api/apoiadores": apoiadores,
  "/api/prospeccao": prospeccao,
  "/api/zonas": zonas,
  "/api/agenda": agenda,
  "/api/demandas": demandas,
  "/api/mapas/rj": municipiosRJ,
  "/api/mapas/marica": bairrosMarica,
  "/api/mapas/comparativo": comparativo,
};

type SupabaseRow = Record<string, unknown>;
type ApiMutationResult = { handled: true; data: unknown } | { handled: false };

const remoteIdByNumericId = new Map<number, string>();

const supabaseEndpointByPath: Record<string, string> = {
  "/api/dashboard/stats": "view_dashboard_summary",
  "/api/dashboard/evolucao": "view_dashboard_summary",
  "/api/dashboard/ranking-liderancas": "leaders",
  "/api/dashboard/ranking-bairros": "view_neighborhood_comparison",
  "/api/liderancas": "leaders",
  "/api/apoiadores": "supporters",
  "/api/prospeccao": "prospects",
  "/api/zonas": "electoral_zones",
  "/api/agenda": "field_agenda",
  "/api/demandas": "demands",
  "/api/mapas/rj": "municipalities",
  "/api/mapas/marica": "view_neighborhood_comparison",
  "/api/mapas/comparativo": "view_neighborhood_comparison",
};

function getEnv(): Record<string, string | undefined> {
  return (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
}

function normalizePath(path: string): string {
  return path.startsWith("http") ? new URL(path).pathname : path;
}

function getString(row: SupabaseRow, key: string, fallback = ""): string {
  const value = row[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getNullableString(row: SupabaseRow, key: string): string | null {
  const value = row[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function getNumber(row: SupabaseRow, key: string, fallback = 0): number {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return fallback;
}

function getDateString(row: SupabaseRow, key: string): string | null {
  const value = row[key];
  return typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : null;
}

function stableNumericId(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = typeof value === "string" ? value : String(fallback);
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  const id = hash || fallback;
  if (typeof value === "string" && value.length >= 16) {
    remoteIdByNumericId.set(id, value);
  }
  return id;
}

function mapLeader(row: SupabaseRow, index: number): Lideranca {
  return {
    id: stableNumericId(row.id, index + 1),
    nome: getString(row, "full_name", "Lideranca sem nome"),
    apelido: getNullableString(row, "political_nickname"),
    telefone: getNullableString(row, "phone"),
    email: getNullableString(row, "email"),
    tipoLideranca: getString(row, "leader_type", "Territorial"),
    status: getString(row, "status", "Ativa"),
    cep: getNullableString(row, "cep"),
    rua: getNullableString(row, "street"),
    numero: getNullableString(row, "number"),
    complemento: getNullableString(row, "complement"),
    bairro: getString(row, "neighborhood", "Nao informado"),
    cidade: getString(row, "city", "Marica"),
    estado: getString(row, "state", "RJ"),
    regiaoAtuacao: getNullableString(row, "territory_region"),
    liderancaSuperior: null,
    responsavelInterno: getNullableString(row, "internal_responsible"),
    apoiadoresCadastrados: getNumber(row, "registered_supporters"),
    apoiadoresEstimadosDiretos: getNumber(row, "estimated_direct_supporters"),
    apoiadoresEstimadosIndiretos: getNumber(row, "estimated_indirect_supporters"),
    votosDeclarados: getNumber(row, "declared_votes"),
    votosValidados: getNumber(row, "validated_votes"),
    grauConfianca: getString(row, "confidence_level", "medio").toLowerCase(),
    fonteEstimativa: getNullableString(row, "estimate_source"),
    comprovacao: getNullableString(row, "proof_type"),
    ultimaAtualizacao: getDateString(row, "last_update"),
    proximaAcao: getNullableString(row, "next_action"),
    observacoes: getNullableString(row, "notes"),
  };
}

function mapSupporter(row: SupabaseRow, index: number): Apoiador {
  return {
    id: stableNumericId(row.id, index + 1),
    nome: getString(row, "full_name", "Pessoa sem nome"),
    telefone: getNullableString(row, "phone"),
    email: getNullableString(row, "email"),
    cep: getNullableString(row, "cep"),
    rua: getNullableString(row, "street"),
    numero: getNullableString(row, "number"),
    complemento: getNullableString(row, "complement"),
    bairro: getString(row, "neighborhood", "Nao informado"),
    cidade: getString(row, "city", "Marica"),
    estado: getString(row, "state", "RJ"),
    liderancaVinculada: getNullableString(row, "internal_responsible"),
    tipoPessoa: getString(row, "person_type", "Apoiador confirmado"),
    statusPolitico: getString(row, "political_status", "Confirmado"),
    nivelConfianca: getString(row, "data_confidence", "medio").toLowerCase(),
    nivelPrecisaoGeografica: getNullableString(row, "geographic_precision"),
    observacoes: getNullableString(row, "notes"),
    dataUltimoContato: getDateString(row, "last_contact"),
    proximaAcao: getNullableString(row, "next_action"),
    responsavelContato: getNullableString(row, "internal_responsible"),
  };
}

function normalizeProspectStage(stage: string): keyof ProspeccaoPipeline {
  const normalized = stage
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("primeiro")) return "primeiroAtendimento";
  if (normalized.includes("simpatizante")) return "simpatizante";
  if (normalized.includes("confirmado")) return "apoiadorConfirmado";
  if (normalized.includes("multiplicador")) return "multiplicador";
  if (normalized.includes("validado")) return "votoValidado";
  return "novoContato";
}

function mapProspect(row: SupabaseRow, index: number): Prospecto {
  const etapa = normalizeProspectStage(getString(row, "funnel_stage", "Novo contato"));
  return {
    id: stableNumericId(row.id, index + 1),
    nome: getString(row, "contact_name", "Contato sem nome"),
    telefone: getNullableString(row, "phone"),
    bairro: getString(row, "neighborhood", "Nao informado"),
    cidade: getNullableString(row, "city"),
    etapa,
    responsavel: getNullableString(row, "internal_responsible"),
    dataContato: getDateString(row, "last_contact") ?? getDateString(row, "created_at"),
    observacoes: getNullableString(row, "notes"),
  };
}

function mapProspectPipeline(rows: SupabaseRow[]): ProspeccaoPipeline {
  const pipeline: ProspeccaoPipeline = {
    novoContato: [],
    primeiroAtendimento: [],
    simpatizante: [],
    apoiadorConfirmado: [],
    multiplicador: [],
    votoValidado: [],
  };

  rows.forEach((row, index) => {
    const prospect = mapProspect(row, index);
    pipeline[prospect.etapa as keyof ProspeccaoPipeline].push(prospect);
  });

  return pipeline;
}

function mapZone(row: SupabaseRow, index: number): ZonaEleitoral {
  return {
    id: stableNumericId(row.id, index + 1),
    zona: getString(row, "zone_number"),
    secao: getNullableString(row, "section_number"),
    localVotacao: getNullableString(row, "voting_place"),
    endereco: [getNullableString(row, "street"), getNullableString(row, "number")]
      .filter(Boolean)
      .join(", ") || null,
    bairro: getString(row, "neighborhood", "Nao informado"),
    cidade: getString(row, "city", "Marica"),
    estado: getString(row, "state", "RJ"),
    totalEleitores: getNumber(row, "voters_count"),
    historicoVotacao:
      row.historical_votes == null ? null : `${getNumber(row, "historical_votes")} votos historicos`,
    metaVotos: getNumber(row, "vote_goal"),
    votosEstimados: getNumber(row, "estimated_campaign_votes"),
    votosValidados: getNumber(row, "validated_votes"),
    responsavel: getNullableString(row, "regional_responsible"),
    observacoes: getNullableString(row, "notes"),
  };
}

function mapAgenda(row: SupabaseRow, index: number): EventoAgenda {
  return {
    id: stableNumericId(row.id, index + 1),
    titulo: getString(row, "title", "Acao sem titulo"),
    tipo: getString(row, "action_type", "Acao de campo"),
    data: getString(row, "action_date", new Date().toISOString().slice(0, 10)),
    horario: getNullableString(row, "start_time"),
    bairro: getString(row, "neighborhood", "Nao informado"),
    cidade: getNullableString(row, "city"),
    responsavel: getNullableString(row, "internal_responsible"),
    status: getString(row, "status", "Agendada"),
    observacoes: getNullableString(row, "notes") ?? getNullableString(row, "objective"),
  };
}

function mapDemand(row: SupabaseRow, index: number): Demanda {
  return {
    id: stableNumericId(row.id, index + 1),
    pessoaVinculada: getNullableString(row, "person_name"),
    bairro: getString(row, "neighborhood", "Nao informado"),
    tipoDemanda: getString(row, "category", "Outro"),
    prioridade: getString(row, "priority", "Media"),
    status: getString(row, "status", "Aberta"),
    responsavel: getNullableString(row, "internal_responsible"),
    observacoes: getNullableString(row, "description") ?? getNullableString(row, "notes"),
    dataRetorno: getDateString(row, "return_date"),
  };
}

function mapMunicipality(row: SupabaseRow, index: number): MunicipioRJ {
  return {
    nome: getString(row, "name", "Municipio"),
    comAtuacao: getString(row, "status", "mapped").toLowerCase() !== "sem lideranca",
    liderancas: getNumber(row, "leaders_count"),
    apoiadores: getNumber(row, "supporters_count"),
    votosDeclarados: getNumber(row, "declared_votes"),
    votosValidados: getNumber(row, "validated_votes"),
    ranking: index + 1,
  };
}

function mapNeighborhood(row: SupabaseRow): BairroMarica {
  const estimatedVoters = getNumber(row, "estimated_voters");
  const validatedVotes = getNumber(row, "validated_votes");
  return {
    nome: getString(row, "name", "Bairro"),
    liderancas: getNumber(row, "leaders_count"),
    apoiadores: getNumber(row, "supporters_count"),
    votosDeclarados: getNumber(row, "declared_votes", validatedVotes),
    votosValidados: validatedVotes,
    cobertura:
      estimatedVoters > 0 ? Number(((validatedVotes / estimatedVoters) * 100).toFixed(2)) : 0,
    prioridade: getString(row, "priority", "Media"),
  };
}

function mapComparison(row: SupabaseRow): ComparativoEleitoral {
  const eleitores = getNumber(row, "estimated_voters");
  const votosValidados = getNumber(row, "validated_votes");
  const meta = Math.round(eleitores * 0.05);
  return {
    bairro: getString(row, "name", "Bairro"),
    eleitores,
    apoiadoresCadastrados: getNumber(row, "supporters_count"),
    votosValidados,
    cobertura: eleitores > 0 ? Number(((votosValidados / eleitores) * 100).toFixed(2)) : 0,
    meta,
    distanciaMeta: Math.max(meta - votosValidados, 0),
    prioridade: getString(row, "priority", "Media"),
  };
}

function mapDashboardStats(rows: SupabaseRow[]): DashboardStats | undefined {
  const row = rows[0];
  if (!row) return undefined;

  return {
    totalLiderancas: getNumber(row, "total_leaders"),
    totalApoiadores: getNumber(row, "total_supporters"),
    apoiadoresEstimados: getNumber(row, "total_supporters"),
    votosDeclarados: getNumber(row, "declared_votes"),
    votosValidados: getNumber(row, "validated_votes"),
    indiceConfianca: 8,
    municipiosAtuacao: getNumber(row, "municipalities_count", stats.municipiosAtuacao),
    bairrosCobertos: getNumber(row, "neighborhoods_count", stats.bairrosCobertos),
    zonasEleitorais: getNumber(row, "zones_count", stats.zonasEleitorais),
    regioesPrioritarias: getNumber(row, "priority_regions", stats.regioesPrioritarias),
  };
}

function mapSupabaseResponse(path: string, rows: SupabaseRow[]): unknown | undefined {
  if (rows.length === 0) return undefined;

  switch (path) {
    case "/api/dashboard/stats":
      return mapDashboardStats(rows);
    case "/api/dashboard/ranking-liderancas":
      return rows.map((row) => ({
        nome: getString(row, "full_name"),
        valor: getNumber(row, "validated_votes"),
        secundario: getNumber(row, "declared_votes"),
      }));
    case "/api/dashboard/ranking-bairros":
      return rows.map((row) => ({
        nome: getString(row, "name"),
        valor: getNumber(row, "supporters_count"),
        secundario: getNumber(row, "validated_votes"),
      }));
    case "/api/liderancas":
      return rows.map(mapLeader);
    case "/api/apoiadores":
      return rows.map(mapSupporter);
    case "/api/prospeccao":
      return mapProspectPipeline(rows);
    case "/api/zonas":
      return rows.map(mapZone);
    case "/api/agenda":
      return rows.map(mapAgenda);
    case "/api/demandas":
      return rows.map(mapDemand);
    case "/api/mapas/rj":
      return rows.map(mapMunicipality);
    case "/api/mapas/marica":
      return rows.map(mapNeighborhood);
    case "/api/mapas/comparativo":
      return rows.map(mapComparison);
    default:
      return undefined;
  }
}

async function getSupabaseResponse(path: string): Promise<unknown | undefined> {
  const env = getEnv();
  const supabaseUrl = env["VITE_SUPABASE_URL"]?.replace(/\/+$/, "");
  const supabaseKey = env["VITE_SUPABASE_ANON_KEY"];
  const table = supabaseEndpointByPath[path];

  if (!supabaseUrl || !supabaseKey || !table) return undefined;

  try {
    if (path === "/api/dashboard/stats") {
      return await getLiveDashboardStats(supabaseUrl, supabaseKey);
    }

    if (path === "/api/dashboard/evolucao") {
      return await getLiveDashboardEvolution(supabaseUrl, supabaseKey);
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) return undefined;
    const rows = (await response.json()) as unknown;
    if (!Array.isArray(rows)) return undefined;

    return mapSupabaseResponse(path, rows as SupabaseRow[]);
  } catch {
    return undefined;
  }
}

async function fetchSupabaseRows(
  supabaseUrl: string,
  supabaseKey: string,
  table: string,
  select = "*",
): Promise<SupabaseRow[]> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${select}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) return [];
  const rows = (await response.json()) as unknown;
  return Array.isArray(rows) ? (rows as SupabaseRow[]) : [];
}

async function getLiveDashboardStats(
  supabaseUrl: string,
  supabaseKey: string,
): Promise<DashboardStats | undefined> {
  const [summaryRows, municipalitiesRows, neighborhoodsRows, zonesRows] = await Promise.all([
    fetchSupabaseRows(supabaseUrl, supabaseKey, "view_dashboard_summary"),
    fetchSupabaseRows(supabaseUrl, supabaseKey, "municipalities", "id,status,priority"),
    fetchSupabaseRows(supabaseUrl, supabaseKey, "neighborhoods", "id,status,priority"),
    fetchSupabaseRows(supabaseUrl, supabaseKey, "electoral_zones", "id,priority,status"),
  ]);

  const summary = mapDashboardStats(summaryRows);
  if (!summary) return undefined;

  const priorityNeighborhoods = neighborhoodsRows.filter((row) => {
    const priority = getString(row, "priority").toLowerCase();
    const status = getString(row, "status").toLowerCase();
    return ["alta", "critica", "crítica"].includes(priority) || status.includes("crit");
  }).length;

  return {
    ...summary,
    municipiosAtuacao: municipalitiesRows.length || summary.municipiosAtuacao,
    bairrosCobertos: neighborhoodsRows.length || summary.bairrosCobertos,
    zonasEleitorais: zonesRows.length || summary.zonasEleitorais,
    regioesPrioritarias: priorityNeighborhoods || summary.regioesPrioritarias,
  };
}

async function getLiveDashboardEvolution(
  supabaseUrl: string,
  supabaseKey: string,
): Promise<EvolucaoSemanal[] | undefined> {
  const [leadersRows, supportersRows] = await Promise.all([
    fetchSupabaseRows(supabaseUrl, supabaseKey, "leaders", "id,created_at"),
    fetchSupabaseRows(supabaseUrl, supabaseKey, "supporters", "id,created_at"),
  ]);

  if (leadersRows.length === 0 && supportersRows.length === 0) return undefined;

  const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];
  const totalLeaders = leadersRows.length;
  const totalSupporters = supportersRows.length;

  return weeks.map((week, index) => {
    const factor = (index + 1) / weeks.length;
    const liderancas = Math.max(0, Math.round(totalLeaders * factor));
    const apoiadores = Math.max(0, Math.round(totalSupporters * factor));
    return {
      semana: week,
      cadastros: liderancas + apoiadores,
      liderancas,
      apoiadores,
    };
  });
}

function getCampaignId(): string {
  return (
    getEnv()["VITE_SUPABASE_CAMPAIGN_ID"] ??
    "00000000-0000-4000-8000-000000000001"
  );
}

function parseRequestBody(body: BodyInit | null | undefined): SupabaseRow {
  if (typeof body !== "string" || !body.trim()) return {};

  try {
    const parsed = JSON.parse(body) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as SupabaseRow) : {};
  } catch {
    return {};
  }
}

function nullable(value: unknown): unknown {
  return value === "" ? null : value;
}

function numberOrZero(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return 0;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function pathParts(path: string): { collection: string; id: number | null; action: string | null } | null {
  const match = normalizePath(path).match(/^\/api\/([^/]+)(?:\/(\d+))?(?:\/([^/]+))?$/);
  if (!match) return null;
  return {
    collection: match[1] ?? "",
    id: match[2] ? Number(match[2]) : null,
    action: match[3] ?? null,
  };
}

function remoteIdFor(id: number): string {
  return remoteIdByNumericId.get(id) ?? String(id);
}

function mapLeaderInput(input: SupabaseRow): SupabaseRow {
  return {
    campaign_id: getCampaignId(),
    full_name: input.nome,
    political_nickname: nullable(input.apelido),
    phone: input.telefone ?? "",
    email: nullable(input.email),
    leader_type: input.tipoLideranca ?? "Territorial",
    status: input.status ?? "Ativa",
    cep: nullable(input.cep),
    street: nullable(input.rua),
    number: nullable(input.numero),
    complement: nullable(input.complemento),
    neighborhood: input.bairro ?? "Nao informado",
    city: input.cidade ?? "Marica",
    state: input.estado ?? "RJ",
    territory_region: nullable(input.regiaoAtuacao),
    geographic_precision: input.nivelPrecisaoGeografica ?? "Media",
    internal_responsible: nullable(input.responsavelInterno),
    registered_supporters: numberOrZero(input.apoiadoresCadastrados),
    estimated_direct_supporters: numberOrZero(input.apoiadoresEstimadosDiretos),
    estimated_indirect_supporters: numberOrZero(input.apoiadoresEstimadosIndiretos),
    declared_votes: numberOrZero(input.votosDeclarados),
    validated_votes: numberOrZero(input.votosValidados),
    confidence_level: input.grauConfianca ?? "medio",
    estimate_source: nullable(input.fonteEstimativa),
    proof_type: nullable(input.comprovacao),
    last_update: input.ultimaAtualizacao ?? today(),
    next_action: nullable(input.proximaAcao),
    notes: nullable(input.observacoes),
  };
}

function mapSupporterInput(input: SupabaseRow): SupabaseRow {
  return {
    campaign_id: getCampaignId(),
    full_name: input.nome,
    nickname: nullable(input.apelido),
    phone: input.telefone ?? "",
    email: nullable(input.email),
    cep: nullable(input.cep),
    street: nullable(input.rua),
    number: nullable(input.numero),
    complement: nullable(input.complemento),
    neighborhood: input.bairro ?? "Nao informado",
    city: input.cidade ?? "Marica",
    state: input.estado ?? "RJ",
    reference_point: nullable(input.referenciaLocalidade),
    geographic_precision: input.nivelPrecisaoGeografica ?? "Baixa",
    person_type: input.tipoPessoa ?? "Apoiador confirmado",
    political_status: input.statusPolitico ?? "Confirmado",
    data_confidence: input.nivelConfianca ?? "medio",
    source: input.fonteCadastro ?? "Outro",
    internal_responsible: nullable(input.responsavelContato ?? input.liderancaVinculada),
    last_contact: nullable(input.dataUltimoContato),
    next_action: nullable(input.proximaAcao),
    next_action_date: nullable(input.dataProximaAcao),
    lgpd_consent: Boolean(input.lgpdConsent),
    notes: nullable(input.observacoes),
  };
}

function splitAddress(address: unknown): { street: string | null; number: string | null } {
  if (typeof address !== "string") return { street: null, number: null };
  const [street, number] = address.split(",").map((part) => part.trim());
  return { street: street || null, number: number || null };
}

function mapZoneInput(input: SupabaseRow): SupabaseRow {
  const address = splitAddress(input.endereco);
  return {
    campaign_id: getCampaignId(),
    zone_number: input.zona,
    section_number: nullable(input.secao),
    voting_place: input.localVotacao ?? "Local de votacao",
    street: nullable(address.street),
    number: nullable(address.number),
    neighborhood: input.bairro ?? "Nao informado",
    city: input.cidade ?? "Marica",
    state: input.estado ?? "RJ",
    voters_count: numberOrZero(input.totalEleitores),
    vote_goal: numberOrZero(input.metaVotos),
    estimated_campaign_votes: numberOrZero(input.votosEstimados),
    validated_votes: numberOrZero(input.votosValidados),
    regional_responsible: nullable(input.responsavel),
    priority: input.prioridade ?? "Media",
    status: input.status ?? "Ativa",
    notes: nullable(input.observacoes ?? input.historicoVotacao),
  };
}

function mapAgendaInput(input: SupabaseRow): SupabaseRow {
  return {
    campaign_id: getCampaignId(),
    title: input.titulo,
    action_type: input.tipo ?? "Acao de campo",
    action_date: input.data ?? today(),
    start_time: nullable(input.horario),
    neighborhood: input.bairro ?? "Nao informado",
    city: input.cidade ?? "Marica",
    state: input.estado ?? "RJ",
    internal_responsible: nullable(input.responsavel),
    status: input.status ?? "Agendada",
    priority: input.prioridade ?? "Media",
    notes: nullable(input.observacoes),
  };
}

function mapDemandInput(input: SupabaseRow): SupabaseRow {
  return {
    campaign_id: getCampaignId(),
    title: input.titulo ?? input.tipoDemanda ?? "Demanda",
    description: input.observacoes ?? input.descricao ?? "Demanda registrada no Base Eleitoral 360.",
    person_name: nullable(input.pessoaVinculada),
    category: input.tipoDemanda ?? input.categoria ?? "Outro",
    priority: input.prioridade ?? "Media",
    status: input.status ?? "Aberta",
    neighborhood: input.bairro ?? "Nao informado",
    city: input.cidade ?? "Marica",
    state: input.estado ?? "RJ",
    opening_date: input.dataAbertura ?? today(),
    return_date: nullable(input.dataRetorno),
    internal_responsible: nullable(input.responsavel),
    notes: nullable(input.observacoes),
  };
}

function mutationConfig(collection: string):
  | {
      table: string;
      toDb: (input: SupabaseRow) => SupabaseRow;
      fromDb: (row: SupabaseRow, index: number) => unknown;
    }
  | null {
  switch (collection) {
    case "liderancas":
      return { table: "leaders", toDb: mapLeaderInput, fromDb: mapLeader };
    case "apoiadores":
      return { table: "supporters", toDb: mapSupporterInput, fromDb: mapSupporter };
    case "zonas":
      return { table: "electoral_zones", toDb: mapZoneInput, fromDb: mapZone };
    case "agenda":
      return { table: "field_agenda", toDb: mapAgendaInput, fromDb: mapAgenda };
    case "demandas":
      return { table: "demands", toDb: mapDemandInput, fromDb: mapDemand };
    default:
      return null;
  }
}

function buildSupabaseHeaders(): HeadersInit | null {
  const env = getEnv();
  const supabaseKey = env["VITE_SUPABASE_ANON_KEY"];
  if (!supabaseKey) return null;

  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    Prefer: "return=representation",
  };
}

async function mutateSupabase(
  path: string,
  method: string,
  input: SupabaseRow,
): Promise<unknown | undefined> {
  const env = getEnv();
  const supabaseUrl = env["VITE_SUPABASE_URL"]?.replace(/\/+$/, "");
  const headers = buildSupabaseHeaders();
  const parts = pathParts(path);

  if (!supabaseUrl || !headers || !parts) return undefined;

  if (parts.collection === "prospeccao" && parts.action === "status" && parts.id) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/prospects?id=eq.${encodeURIComponent(remoteIdFor(parts.id))}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ funnel_stage: input.etapa ?? "Novo contato" }),
      },
    );
    if (!response.ok) return undefined;
    const rows = (await response.json()) as SupabaseRow[];
    return rows[0] ? mapProspect(rows[0], 0) : undefined;
  }

  const config = mutationConfig(parts.collection);
  if (!config) return undefined;

  if (method === "POST") {
    const response = await fetch(`${supabaseUrl}/rest/v1/${config.table}`, {
      method,
      headers,
      body: JSON.stringify(config.toDb(input)),
    });
    if (!response.ok) return undefined;
    const rows = (await response.json()) as SupabaseRow[];
    return rows[0] ? config.fromDb(rows[0], 0) : undefined;
  }

  if ((method === "PATCH" || method === "DELETE") && parts.id) {
    const remoteId = encodeURIComponent(remoteIdFor(parts.id));
    const response = await fetch(`${supabaseUrl}/rest/v1/${config.table}?id=eq.${remoteId}`, {
      method,
      headers,
      body: method === "PATCH" ? JSON.stringify(config.toDb(input)) : undefined,
    });
    if (!response.ok) return undefined;
    if (method === "DELETE") return null;
    const rows = (await response.json()) as SupabaseRow[];
    return rows[0] ? config.fromDb(rows[0], 0) : undefined;
  }

  return undefined;
}

function localMutationResponse(path: string, method: string, input: SupabaseRow): ApiMutationResult {
  if (getEnv()["VITE_ENABLE_API_MOCKS"] === "false") return { handled: false };

  const parts = pathParts(path);
  if (!parts) return { handled: false };

  if (method === "DELETE") return { handled: true, data: undefined };

  const id = parts.id ?? stableNumericId(`${parts.collection}-${Date.now()}`, Date.now());
  const data =
    parts.collection === "prospeccao"
      ? { id, nome: "Contato", bairro: "Nao informado", etapa: input.etapa ?? "novoContato" }
      : { id, ...input };

  return { handled: true, data };
}

export async function getApiMutationResponse(
  path: string,
  method: string,
  body: BodyInit | null | undefined,
): Promise<ApiMutationResult> {
  const normalizedMethod = method.toUpperCase();
  if (!["POST", "PATCH", "DELETE"].includes(normalizedMethod)) return { handled: false };

  const normalizedPath = normalizePath(path);
  const input = parseRequestBody(body);

  try {
    const remote = await mutateSupabase(normalizedPath, normalizedMethod, input);
    if (remote !== undefined) {
      return { handled: true, data: remote === null ? undefined : remote };
    }
  } catch {
    // Keep the app usable with local mock behavior when Supabase is unavailable.
  }

  return localMutationResponse(normalizedPath, normalizedMethod, input);
}

export async function getApiFallbackResponse(path: string): Promise<unknown | undefined> {
  const normalizedPath = normalizePath(path);
  const remote = await getSupabaseResponse(normalizedPath);
  if (remote !== undefined) return remote;
  if (getEnv()["VITE_ENABLE_API_MOCKS"] === "false") return undefined;
  return mockByPath[normalizedPath];
}

export function getMockResponse(path: string): unknown | undefined {
  const normalizedPath = normalizePath(path);
  return mockByPath[normalizedPath];
}
