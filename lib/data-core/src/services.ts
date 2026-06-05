import type {
  ApoiadorPessoa,
  Bairro,
  DashboardMetricas,
  Demanda,
  EntityId,
  EventoAgenda,
  Lideranca,
  LocalVotacao,
  Municipio,
  ProspeccaoContato,
  ProspeccaoEtapa,
  Regiao,
  SecaoEleitoral,
  Usuario,
  ZonaEleitoral,
} from "./types";

export interface ListQuery {
  search?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, string | number | boolean | null | undefined>;
}

export interface CrudRepository<TRecord extends { id: EntityId }, TCreate = Omit<TRecord, "id">, TUpdate = Partial<TCreate>> {
  list(query?: ListQuery): Promise<TRecord[]>;
  getById(id: EntityId): Promise<TRecord | null>;
  create(input: TCreate): Promise<TRecord>;
  update(id: EntityId, input: TUpdate): Promise<TRecord>;
  remove(id: EntityId): Promise<void>;
}

export interface ProspeccaoRepository extends CrudRepository<ProspeccaoContato> {
  moveToEtapa(id: EntityId, etapa: ProspeccaoEtapa): Promise<ProspeccaoContato>;
  getPipeline(): Promise<Record<ProspeccaoEtapa, ProspeccaoContato[]>>;
}

export interface DashboardRepository {
  getMetricas(): Promise<DashboardMetricas>;
}

export interface BaseEleitoralDataService {
  usuarios: CrudRepository<Usuario>;
  regioes: CrudRepository<Regiao>;
  municipios: CrudRepository<Municipio>;
  bairros: CrudRepository<Bairro>;
  liderancas: CrudRepository<Lideranca>;
  apoiadoresPessoas: CrudRepository<ApoiadorPessoa>;
  prospeccao: ProspeccaoRepository;
  zonasEleitorais: CrudRepository<ZonaEleitoral>;
  secoesEleitorais: CrudRepository<SecaoEleitoral>;
  locaisVotacao: CrudRepository<LocalVotacao>;
  demandas: CrudRepository<Demanda>;
  agendaCampo: CrudRepository<EventoAgenda>;
  dashboard: DashboardRepository;
}
