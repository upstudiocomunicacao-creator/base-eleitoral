# Supabase - Base Eleitoral 360

Esta pasta prepara o Base Eleitoral 360 para usar Supabase, PostgreSQL e futuramente Supabase Auth, RLS, Storage, PostGIS, Mapbox e exportacoes reais.

As telas usam Supabase automaticamente quando as variaveis de ambiente estao configuradas. Se as variaveis nao existirem, se uma tabela estiver vazia ou se houver erro de conexao, o app continua usando os dados mockados atuais.

## 1. Criar o projeto no Supabase

1. Acesse https://supabase.com.
2. Crie um novo projeto.
3. Guarde a Project URL e a anon public key.

## 2. Executar o schema

No painel do Supabase:

1. Abra o SQL Editor.
2. Cole o conteudo de `supabase/schema.sql`.
3. Execute o script.

O schema cria tabelas principais, indices, triggers de `updated_at` e views de apoio.

## 3. Executar o seed

Depois do schema:

1. Abra uma nova query no SQL Editor.
2. Cole o conteudo de `supabase/seed.sql`.
3. Execute o script.

O seed cria uma campanha ficticia, municipios do RJ, bairros de Marica, liderancas, apoiadores, prospeccoes, zonas, demandas, agenda e historico de relatorio.

## 4. Configurar variaveis de ambiente

Crie `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
VITE_SUPABASE_CAMPAIGN_ID=00000000-0000-4000-8000-000000000001
VITE_ENABLE_API_MOCKS=true
```

O projeto usa Vite, por isso as variaveis comecam com `VITE_`.
Use `VITE_ENABLE_API_MOCKS=false` apenas quando quiser testar sem fallback local. O Supabase continua sendo consultado primeiro.
`VITE_SUPABASE_CAMPAIGN_ID` aponta para a campanha criada no seed. Troque esse valor quando criar uma campanha real.

## 5. Conexao atual do app

Arquivos principais:

- `src/lib/supabaseClient.ts`
- `src/types/database.ts`
- `src/services/*.ts`
- `lib/api-client-react/src/mock-api.ts`

O cliente usado pelas telas possui fallback inteligente:

- Com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, ele tenta ler do Supabase via REST.
- Sem essas variaveis, ele usa os mocks.
- Se uma tabela/view retornar erro ou estiver vazia, ele usa os mocks.
- As telas principais continuam funcionando localmente sem backend separado.

Endpoints ja preparados para leitura real:

- `/api/dashboard/stats`
- `/api/dashboard/ranking-liderancas`
- `/api/dashboard/ranking-bairros`
- `/api/liderancas`
- `/api/apoiadores`
- `/api/prospeccao`
- `/api/zonas`
- `/api/agenda`
- `/api/demandas`
- `/api/mapas/rj`
- `/api/mapas/marica`
- `/api/mapas/comparativo`

Operacoes ja preparadas para gravacao real:

- Criar, editar e excluir liderancas.
- Criar, editar e excluir apoiadores/pessoas.
- Criar, editar e excluir zonas eleitorais.
- Criar, editar e excluir acoes da agenda de campo.
- Criar, editar e excluir demandas.
- Avancar ou retroceder etapa de prospeccao.

Enquanto o Supabase nao estiver configurado, essas operacoes continuam funcionando visualmente com fallback local/mockado.

## 6. RLS futuramente

Quando a autenticacao real estiver pronta:

1. Ative Row Level Security nas tabelas.
2. Relacione `users_profiles.auth_user_id` com `auth.users.id`.
3. Crie politicas por `campaign_id`, `role`, territorio vinculado e permissao.
4. Restrinja exportacoes e dados sensiveis para perfis autorizados.

Exemplo futuro:

```sql
alter table supporters enable row level security;
```

## 7. Proximas etapas recomendadas

1. Implementar criacao, edicao e exclusao reais nos formularios.
2. Ativar Supabase Auth.
3. Implementar RLS por campanha e perfil.
4. Criar importacao CSV/XLSX.
5. Criar exportacao PDF/Excel via Supabase Storage.
6. Preparar PostGIS e Mapbox para mapas reais.
