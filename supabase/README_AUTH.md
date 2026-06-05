# Supabase Auth - Base Eleitoral 360

Este guia ativa login real no sistema usando Supabase Auth e a tabela `users_profiles`.

## 1. Variaveis do app

O front-end usa apenas a chave publica/anonima:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
VITE_SUPABASE_CAMPAIGN_ID=UUID_DA_CAMPANHA
```

Nunca coloque `service_role` no front-end.

## 2. Criar o primeiro usuario no Supabase Auth

1. Abra o projeto no Supabase.
2. Entre em **Authentication > Users**.
3. Clique em **Add user** ou **Invite user**.
4. Cadastre o e-mail e uma senha.
5. Copie o **User UID** gerado.

## 3. Vincular o usuario a tabela users_profiles

No SQL Editor, rode este comando trocando os valores:

```sql
insert into users_profiles (
  auth_user_id,
  campaign_id,
  full_name,
  email,
  phone,
  role,
  status,
  linked_state,
  linked_city
) values (
  'UUID_DO_AUTH_USER',
  '00000000-0000-4000-8000-000000000001',
  'Administrador',
  'email@exemplo.com',
  null,
  'admin',
  'ativo',
  'RJ',
  'Marica'
);
```

Use o mesmo e-mail criado no Auth. O `campaign_id` acima e o ID da campanha mockada/seed atual.

## 4. Ativar politicas autenticadas

Depois de criar o admin, rode o arquivo:

```sql
supabase/auth-policies.sql
```

Ele remove as politicas publicas temporarias (`mvp_public_*`) e ativa politicas com usuario logado.

## 5. Testar login

1. Rode o app local.
2. Abra `http://localhost:25022/login`.
3. Entre com o e-mail e senha criados no Supabase Auth.
4. O sistema deve abrir o Dashboard Geral.
5. O menu do usuario deve mostrar nome, perfil e e-mail.

## 6. Erro "Perfil nao encontrado"

Esse erro aparece quando o login existe no Supabase Auth, mas nao existe linha correspondente em `users_profiles`.

Confira:

```sql
select id, auth_user_id, full_name, email, role, status
from users_profiles
where auth_user_id = 'UUID_DO_AUTH_USER';
```

Se nao retornar nada, rode o insert do passo 3.

## 7. Perfis iniciais

- `admin`: acesso total.
- `coordenacao_geral`: ve, cria, edita e exporta quase tudo, sem configuracoes criticas.
- `coordenador_regional`: opera dados da regiao vinculada, com refinamento territorial futuro.
- `operador_campo`: cria e edita apoiadores, prospeccao, demandas e agenda.
- `lideranca`: cadastra apoiadores/demandas vinculados e acessa leitura restrita.
- `visualizador`: leitura basica, sem exportacao e sem dados sensiveis.

## 8. O que ainda sera refinado

As politicas atuais sao seguras e simples: usuario autenticado so acessa a propria campanha, escrita depende do perfil e exclusao e apenas admin.

Na proxima etapa, as politicas podem evoluir para:

- filtro por cidade, bairro e regiao;
- vinculo direto entre lideranca e seus apoiadores;
- mascaramento de telefone/e-mail para visualizadores;
- convites reais de usuario pelo backend;
- auditoria automatica por acao.

## 9. Convites reais e limpeza de duplicidades

Agora o projeto tambem inclui:

- `supabase/cleanup-user-duplicates.sql`
- `supabase/functions/invite-user/index.ts`
- `supabase/README_INVITES.md`

Use `cleanup-user-duplicates.sql` para remover perfis repetidos em `users_profiles`.

Use `README_INVITES.md` para publicar a Edge Function `invite-user` e ativar o botao **Convidar usuario** no app.
