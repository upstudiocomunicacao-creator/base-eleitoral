# Camada de dados do Base Eleitoral 360

Esta biblioteca prepara o sistema para sair dos dados fictícios e chegar em Supabase/PostgreSQL sem reescrever as telas.

## O que existe agora

- `src/types.ts`: modelos TypeScript do domínio eleitoral.
- `src/services.ts`: contratos de repositórios e serviço principal de dados.
- `src/mock-data.ts`: base fictícia normalizada para desenvolvimento.
- `src/mock-service.ts`: serviço em memória que implementa os contratos com os dados mockados.
- `src/supabase-adapter.ts`: ponto de entrada preparado para a futura integração com Supabase.

## Entidades cobertas

- Usuários
- Lideranças
- Apoiadores/Pessoas
- Prospecção
- Zonas eleitorais
- Seções eleitorais
- Locais de votação
- Demandas
- Agenda de campo
- Regiões
- Bairros
- Municípios
- Métricas do dashboard

## Uso atual com mock

```ts
import { createMockDataService } from "@workspace/data-core";

const dataService = createMockDataService();
const liderancas = await dataService.liderancas.list();
const metricas = await dataService.dashboard.getMetricas();
```

As telas atuais continuam usando os mocks já existentes no cliente de API. Esta biblioteca é a base organizada para a próxima migração, quando as rotas ou hooks passarem a consumir `BaseEleitoralDataService`.

## Caminho recomendado para Supabase

1. Criar as tabelas no Supabase usando nomes equivalentes aos de `supabaseTableNames`.
2. Manter os campos em snake_case no banco e mapear para camelCase nos modelos TypeScript.
3. Implementar os repositórios em `createSupabaseDataService`.
4. Trocar a criação do serviço de dados de `createMockDataService()` para `createSupabaseDataService(supabaseClient)`.
5. Manter as telas consumindo apenas os contratos de `services.ts`.

## Tabelas sugeridas

- `usuarios`
- `regioes`
- `municipios`
- `bairros`
- `liderancas`
- `apoiadores_pessoas`
- `prospeccao_contatos`
- `zonas_eleitorais`
- `secoes_eleitorais`
- `locais_votacao`
- `demandas`
- `agenda_campo`

## Preparação para PostGIS e Mapbox

Os modelos territoriais já possuem campo opcional `geometria` em formato GeoJSON. Na etapa PostgreSQL/PostGIS, esses campos podem ser persistidos como `geometry` ou `geography`, com conversão para GeoJSON na API para uso no Mapbox.

Entidades prioritárias para geometria:

- Municípios
- Bairros
- Regiões
- Locais de votação
- Apoiadores/Pessoas com precisão por coordenada

## Regra de arquitetura

As telas não devem conhecer diretamente Supabase, PostgreSQL ou Mapbox. Elas devem consumir dados por serviços, hooks ou rotas que implementem os contratos desta biblioteca. Isso mantém o MVP simples hoje e evita retrabalho quando o banco real entrar.
