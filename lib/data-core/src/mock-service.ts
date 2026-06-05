import type { BaseEleitoralDataService, CrudRepository, ListQuery, ProspeccaoRepository } from "./services";
import type { EntityId, ProspeccaoContato, ProspeccaoEtapa } from "./types";
import { mockDataset } from "./mock-data";

const prospeccaoEtapas: ProspeccaoEtapa[] = [
  "novo_contato",
  "primeiro_atendimento",
  "simpatizante",
  "apoiador_confirmado",
  "multiplicador",
  "voto_validado",
];

function matchesQuery<TRecord>(record: TRecord, query?: ListQuery): boolean {
  if (!query?.search && !query?.filters) {
    return true;
  }

  const serialized = JSON.stringify(record).toLowerCase();
  const searchOk = query.search ? serialized.includes(query.search.toLowerCase()) : true;
  const filtersOk = Object.entries(query.filters ?? {}).every(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return true;
    }

    return (record as Record<string, unknown>)[key] === value;
  });

  return searchOk && filtersOk;
}

function clone<TRecord>(record: TRecord): TRecord {
  return JSON.parse(JSON.stringify(record)) as TRecord;
}

function createMemoryRepository<TRecord extends { id: EntityId }>(records: TRecord[]): CrudRepository<TRecord> {
  const store = new Map<EntityId, TRecord>(records.map((record) => [record.id, clone(record)]));
  let nextId = store.size + 1;

  return {
    async list(query) {
      const offset = query?.offset ?? 0;
      const limit = query?.limit ?? Number.POSITIVE_INFINITY;
      return Array.from(store.values()).filter((record) => matchesQuery(record, query)).slice(offset, offset + limit).map(clone);
    },
    async getById(id) {
      const record = store.get(id);
      return record ? clone(record) : null;
    },
    async create(input) {
      const id = `mock-${nextId++}`;
      const record = { ...input, id } as TRecord;
      store.set(id, clone(record));
      return clone(record);
    },
    async update(id, input) {
      const current = store.get(id);

      if (!current) {
        throw new Error(`Registro nao encontrado: ${id}`);
      }

      const next = { ...current, ...input, id } as TRecord;
      store.set(id, clone(next));
      return clone(next);
    },
    async remove(id) {
      store.delete(id);
    },
  };
}

function createProspeccaoRepository(records: ProspeccaoContato[]): ProspeccaoRepository {
  const repository = createMemoryRepository<ProspeccaoContato>(records);

  return {
    ...repository,
    async moveToEtapa(id, etapa) {
      return repository.update(id, { etapa });
    },
    async getPipeline() {
      const contatos = await repository.list();
      return prospeccaoEtapas.reduce<Record<ProspeccaoEtapa, ProspeccaoContato[]>>((pipeline, etapa) => {
        pipeline[etapa] = contatos.filter((contato) => contato.etapa === etapa);
        return pipeline;
      }, {
        novo_contato: [],
        primeiro_atendimento: [],
        simpatizante: [],
        apoiador_confirmado: [],
        multiplicador: [],
        voto_validado: [],
      });
    },
  };
}

export function createMockDataService(): BaseEleitoralDataService {
  return {
    usuarios: createMemoryRepository(mockDataset.usuarios),
    regioes: createMemoryRepository(mockDataset.regioes),
    municipios: createMemoryRepository(mockDataset.municipios),
    bairros: createMemoryRepository(mockDataset.bairros),
    liderancas: createMemoryRepository(mockDataset.liderancas),
    apoiadoresPessoas: createMemoryRepository(mockDataset.apoiadoresPessoas),
    prospeccao: createProspeccaoRepository(mockDataset.prospeccao),
    zonasEleitorais: createMemoryRepository(mockDataset.zonasEleitorais),
    secoesEleitorais: createMemoryRepository(mockDataset.secoesEleitorais),
    locaisVotacao: createMemoryRepository(mockDataset.locaisVotacao),
    demandas: createMemoryRepository(mockDataset.demandas),
    agendaCampo: createMemoryRepository(mockDataset.agendaCampo),
    dashboard: {
      async getMetricas() {
        return clone(mockDataset.metricasDashboard);
      },
    },
  };
}
