# Convite real de usuarios

Esta etapa troca o convite mockado por um fluxo seguro:

1. O admin clica em **Configuracoes > Usuarios > Convidar usuario**.
2. O app chama a Edge Function `invite-user`.
3. A funcao usa `SUPABASE_SERVICE_ROLE_KEY` somente no servidor do Supabase.
4. O usuario e criado/convidado no Supabase Auth.
5. O perfil publico e criado em `users_profiles`.

## 1. Limpar duplicidades antes

Rode no SQL Editor:

```sql
supabase/cleanup-user-duplicates.sql
```

Esse arquivo:

- remove perfis duplicados por `auth_user_id`;
- mantem o perfil mais antigo;
- cria um indice unico para impedir duplicacao futura.

## 2. Publicar a Edge Function

No terminal, na raiz do projeto:

```powershell
cd C:\Users\Eduardo\Documents\Codex\2026-06-04\voc-edita-e-coda-arquivos-criados\work\Electoral-Base
supabase functions deploy invite-user
```

Se o Supabase CLI pedir login:

```powershell
supabase login
```

## 3. Configurar segredo da funcao

No Supabase, copie a **service_role key** em:

**Project Settings > API Keys > Secret keys**

Depois configure no terminal:

```powershell
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="COLE_A_SERVICE_ROLE_KEY"
```

Importante: essa chave nunca deve ir para `.env.local` do front-end.

## 4. Testar no app

1. Entre no app com um usuario `admin` ou `coordenacao_geral`.
2. Abra **Configuracoes > Usuarios**.
3. Clique em **Convidar usuario**.
4. Preencha nome, e-mail, telefone opcional, perfil e territorio.
5. Clique em **Enviar convite**.
6. O convidado recebera o e-mail do Supabase Auth.

## 5. Perfis aceitos

- `admin`
- `coordenacao_geral`
- `coordenador_regional`
- `operador_campo`
- `lideranca`
- `visualizador`

No app, esses valores aparecem como:

- Administrador
- Coordenacao Geral
- Coordenador Regional
- Operador de Campo
- Lideranca
- Visualizador

## 6. Se aparecer erro

**FunctionsHttpError ou Function not found**

A funcao ainda nao foi publicada. Rode `supabase functions deploy invite-user`.

**Supabase function secrets are not configured**

A `SUPABASE_SERVICE_ROLE_KEY` ainda nao foi configurada nos secrets.

**Only admin or coordenacao geral can invite users**

O usuario logado nao tem permissao para convidar.
