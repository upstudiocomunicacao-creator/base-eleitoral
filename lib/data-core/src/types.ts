export type EntityId = string;

export type ISODateString = string;

export type StatusRegistro = "ativo" | "inativo" | "em_validacao" | "arquivado";

export type PapelUsuario = "admin" | "coordenador" | "operador" | "leitura";

export type NivelConfianca = "baixo" | "medio" | "alto";

export type Prioridade = "baixa" | "media" | "alta" | "critica";

export type StatusPolitico =
  | "indefinido"
  | "simpatizante"
  | "apoiador_confirmado"
  | "multiplicador"
  | "voto_validado"
  | "oposicao";

export type StatusDemanda = "registrada" | "em_atendimento" | "encaminhada" | "resolvida" | "cancelada";

export type StatusAgenda = "planejado" | "confirmado" | "em_andamento" | "concluido" | "cancelado";

export type ProspeccaoEtapa =
  | "novo_contato"
  | "primeiro_atendimento"
  | "simpatizante"
  | "apoiador_confirmado"
  | "multiplicador"
  | "voto_validado";

export type GeometriaGeoJson =
  | {
      type: "Point";
      coordinates: [longitude: number, latitude: number];
    }
  | {
      type: "Polygon" | "MultiPolygon";
      coordinates: number[][][] | number[][][][];
    };

export interface AuditFields {
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdByUserId?: EntityId | null;
  updatedByUserId?: EntityId | null;
}

export interface Usuario extends AuditFields {
  id: EntityId;
  nome: string;
  email: string;
  telefone?: string | null;
  avatarUrl?: string | null;
  papel: PapelUsuario;
  status: StatusRegistro;
}

export interface Regiao extends AuditFields {
  id: EntityId;
  nome: string;
  tipo: "municipal" | "bairro" | "zona_eleitoral" | "estrategica";
  municipioId?: EntityId | null;
  prioridade: Prioridade;
  responsavelUserId?: EntityId | null;
  geometria?: GeometriaGeoJson | null;
}

export interface Municipio extends AuditFields {
  id: EntityId;
  nome: string;
  uf: string;
  codigoIbge?: string | null;
  regiaoId?: EntityId | null;
  comAtuacao: boolean;
  eleitoresEstimados?: number | null;
  geometria?: GeometriaGeoJson | null;
}

export interface Bairro extends AuditFields {
  id: EntityId;
  nome: string;
  municipioId: EntityId;
  regiaoId?: EntityId | null;
  prioridade: Prioridade;
  eleitoresEstimados?: number | null;
  coberturaPercentual?: number | null;
  geometria?: GeometriaGeoJson | null;
}

export interface Lideranca extends AuditFields {
  id: EntityId;
  nome: string;
  apelido?: string | null;
  telefone?: string | null;
  email?: string | null;
  tipoLideranca: "comunitaria" | "religiosa" | "comerciante" | "juventude" | "tematica" | "politica";
  status: StatusRegistro;
  municipioId: EntityId;
  bairroId?: EntityId | null;
  regiaoId?: EntityId | null;
  responsavelUserId?: EntityId | null;
  apoiadoresCadastrados: number;
  apoiadoresEstimadosDiretos: number;
  apoiadoresEstimadosIndiretos: number;
  votosDeclarados: number;
  votosValidados: number;
  grauConfianca: NivelConfianca;
  fonteEstimativa?: string | null;
  comprovacao?: string | null;
  ultimaAtualizacao?: ISODateString | null;
  proximaAcao?: string | null;
  observacoes?: string | null;
}

export interface ApoiadorPessoa extends AuditFields {
  id: EntityId;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  documento?: string | null;
  dataNascimento?: ISODateString | null;
  municipioId: EntityId;
  bairroId?: EntityId | null;
  endereco?: string | null;
  liderancaId?: EntityId | null;
  tipoPessoa: "eleitor" | "apoiador" | "voluntario" | "influenciador" | "lideranca_potencial";
  statusPolitico: StatusPolitico;
  nivelConfianca: NivelConfianca;
  nivelPrecisaoGeografica: "municipio" | "bairro" | "rua" | "coordenada";
  localVotacaoId?: EntityId | null;
  secaoEleitoralId?: EntityId | null;
  dataUltimoContato?: ISODateString | null;
  proximaAcao?: string | null;
  responsavelUserId?: EntityId | null;
  coordenadas?: GeometriaGeoJson | null;
}

export interface ProspeccaoContato extends AuditFields {
  id: EntityId;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  municipioId: EntityId;
  bairroId?: EntityId | null;
  origem: "campo" | "whatsapp" | "evento" | "lideranca" | "demanda" | "redes_sociais";
  etapa: ProspeccaoEtapa;
  prioridade: Prioridade;
  responsavelUserId?: EntityId | null;
  liderancaIndicadoraId?: EntityId | null;
  dataContato?: ISODateString | null;
  proximaAcao?: string | null;
  observacoes?: string | null;
}

export interface ZonaEleitoral extends AuditFields {
  id: EntityId;
  numero: string;
  municipioId: EntityId;
  nome?: string | null;
  totalEleitores: number;
  metaVotos: number;
  votosEstimados: number;
  votosValidados: number;
  prioridade: Prioridade;
  responsavelUserId?: EntityId | null;
}

export interface SecaoEleitoral extends AuditFields {
  id: EntityId;
  numero: string;
  zonaEleitoralId: EntityId;
  localVotacaoId: EntityId;
  totalEleitores: number;
  historicoVotacao?: string | null;
  metaVotos: number;
  votosEstimados: number;
  votosValidados: number;
}

export interface LocalVotacao extends AuditFields {
  id: EntityId;
  nome: string;
  endereco: string;
  municipioId: EntityId;
  bairroId?: EntityId | null;
  zonaEleitoralId?: EntityId | null;
  totalEleitores: number;
  coordenadas?: GeometriaGeoJson | null;
}

export interface Demanda extends AuditFields {
  id: EntityId;
  titulo: string;
  pessoaId?: EntityId | null;
  liderancaId?: EntityId | null;
  municipioId: EntityId;
  bairroId?: EntityId | null;
  tipoDemanda: "saude" | "transporte" | "educacao" | "infraestrutura" | "seguranca" | "outros";
  prioridade: Prioridade;
  status: StatusDemanda;
  responsavelUserId?: EntityId | null;
  dataRetorno?: ISODateString | null;
  observacoes?: string | null;
}

export interface EventoAgenda extends AuditFields {
  id: EntityId;
  titulo: string;
  tipo: "reuniao" | "caminhada" | "visita" | "evento" | "panfletagem" | "outro";
  data: ISODateString;
  horario?: string | null;
  municipioId: EntityId;
  bairroId?: EntityId | null;
  liderancaId?: EntityId | null;
  responsavelUserId?: EntityId | null;
  status: StatusAgenda;
  observacoes?: string | null;
}

export interface RankingMetrica {
  id: EntityId;
  nome: string;
  valor: number;
  secundario?: number | null;
}

export interface EvolucaoSemanalMetrica {
  semana: string;
  cadastros: number;
  liderancas: number;
  apoiadores: number;
}

export interface ComparativoEleitoralMetrica {
  bairroId: EntityId;
  bairro: string;
  eleitores: number;
  apoiadoresCadastrados: number;
  votosValidados: number;
  cobertura: number;
  meta: number;
  distanciaMeta: number;
  prioridade: Prioridade;
}

export interface DashboardMetricas {
  totalLiderancas: number;
  totalApoiadores: number;
  apoiadoresEstimados: number;
  votosDeclarados: number;
  votosValidados: number;
  indiceConfianca: number;
  municipiosAtuacao: number;
  bairrosCobertos: number;
  zonasEleitorais: number;
  regioesPrioritarias: number;
  evolucaoSemanal: EvolucaoSemanalMetrica[];
  rankingLiderancas: RankingMetrica[];
  rankingBairros: RankingMetrica[];
  comparativoEleitoral: ComparativoEleitoralMetrica[];
  distribuicaoStatusPolitico: Record<StatusPolitico, number>;
}

export interface BaseEleitoralDataset {
  usuarios: Usuario[];
  regioes: Regiao[];
  municipios: Municipio[];
  bairros: Bairro[];
  liderancas: Lideranca[];
  apoiadoresPessoas: ApoiadorPessoa[];
  prospeccao: ProspeccaoContato[];
  zonasEleitorais: ZonaEleitoral[];
  secoesEleitorais: SecaoEleitoral[];
  locaisVotacao: LocalVotacao[];
  demandas: Demanda[];
  agendaCampo: EventoAgenda[];
  metricasDashboard: DashboardMetricas;
}
