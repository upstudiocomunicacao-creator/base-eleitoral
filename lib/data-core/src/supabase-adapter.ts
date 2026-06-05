import type { BaseEleitoralDataService } from "./services";

export const supabaseTableNames = {
  usuarios: "usuarios",
  regioes: "regioes",
  municipios: "municipios",
  bairros: "bairros",
  liderancas: "liderancas",
  apoiadoresPessoas: "apoiadores_pessoas",
  prospeccao: "prospeccao_contatos",
  zonasEleitorais: "zonas_eleitorais",
  secoesEleitorais: "secoes_eleitorais",
  locaisVotacao: "locais_votacao",
  demandas: "demandas",
  agendaCampo: "agenda_campo",
} as const;

export interface SupabaseClientLike {
  from(table: string): unknown;
}

export interface SupabaseDataServiceOptions {
  schema?: string;
}

export function createSupabaseDataService(
  _client: SupabaseClientLike,
  _options: SupabaseDataServiceOptions = {},
): BaseEleitoralDataService {
  throw new Error(
    "A integracao Supabase esta preparada, mas ainda nao foi conectada. Implemente os repositorios usando os contratos de @workspace/data-core.",
  );
}
