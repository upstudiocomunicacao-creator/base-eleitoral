-- Base Eleitoral 360 - authenticated RLS policies.
-- Run this after creating the first admin profile in users_profiles.
-- This replaces the temporary dev public policies from dev-rls-policies.sql.

alter table campaigns enable row level security;
alter table users_profiles enable row level security;
alter table municipalities enable row level security;
alter table neighborhoods enable row level security;
alter table leaders enable row level security;
alter table supporters enable row level security;
alter table prospects enable row level security;
alter table electoral_zones enable row level security;
alter table field_agenda enable row level security;
alter table demands enable row level security;
alter table audit_logs enable row level security;
alter table report_history enable row level security;
alter table import_history enable row level security;

create or replace function app_current_campaign_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select up.campaign_id
  from users_profiles up
  where up.auth_user_id = auth.uid()
    and lower(up.status) in ('active', 'ativo')
  limit 1
$$;

create or replace function app_current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select up.role
  from users_profiles up
  where up.auth_user_id = auth.uid()
    and lower(up.status) in ('active', 'ativo')
  limit 1
$$;

create or replace function app_has_campaign(target_campaign_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select target_campaign_id = app_current_campaign_id()
$$;

create or replace function app_has_any_role(allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(app_current_role() = any(allowed_roles), false)
$$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'campaigns',
    'users_profiles',
    'municipalities',
    'neighborhoods',
    'leaders',
    'supporters',
    'prospects',
    'electoral_zones',
    'field_agenda',
    'demands',
    'audit_logs',
    'report_history',
    'import_history'
  ]
  loop
    execute format('drop policy if exists "mvp_public_select" on %I', tbl);
    execute format('drop policy if exists "mvp_public_insert" on %I', tbl);
    execute format('drop policy if exists "mvp_public_update" on %I', tbl);
    execute format('drop policy if exists "mvp_public_delete" on %I', tbl);
    execute format('drop policy if exists "auth_select" on %I', tbl);
    execute format('drop policy if exists "auth_insert" on %I', tbl);
    execute format('drop policy if exists "auth_update" on %I', tbl);
    execute format('drop policy if exists "auth_delete" on %I', tbl);
  end loop;
end $$;

-- Campaigns use id instead of campaign_id.
create policy "auth_select" on campaigns
for select to authenticated
using (app_has_campaign(id));

create policy "auth_insert" on campaigns
for insert to authenticated
with check (app_has_any_role(array['admin']));

create policy "auth_update" on campaigns
for update to authenticated
using (app_has_campaign(id) and app_has_any_role(array['admin', 'coordenacao_geral']))
with check (app_has_campaign(id) and app_has_any_role(array['admin', 'coordenacao_geral']));

create policy "auth_delete" on campaigns
for delete to authenticated
using (app_has_campaign(id) and app_has_any_role(array['admin']));

-- Public user profiles for authenticated app users.
create policy "auth_select" on users_profiles
for select to authenticated
using (app_has_campaign(campaign_id));

create policy "auth_insert" on users_profiles
for insert to authenticated
with check (
  app_has_campaign(campaign_id)
  and app_has_any_role(array['admin', 'coordenacao_geral'])
);

create policy "auth_update" on users_profiles
for update to authenticated
using (
  app_has_campaign(campaign_id)
  and app_has_any_role(array['admin', 'coordenacao_geral'])
)
with check (
  app_has_campaign(campaign_id)
  and app_has_any_role(array['admin', 'coordenacao_geral'])
);

create policy "auth_delete" on users_profiles
for delete to authenticated
using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

-- Campaign-scoped reference and operation tables.
create policy "auth_select" on municipalities for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on municipalities for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_update" on municipalities for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_delete" on municipalities for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on neighborhoods for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on neighborhoods for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_update" on neighborhoods for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_delete" on neighborhoods for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on leaders for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on leaders for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_update" on leaders for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_delete" on leaders for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on supporters for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on supporters for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo', 'lideranca']));
create policy "auth_update" on supporters for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo']));
create policy "auth_delete" on supporters for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on prospects for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on prospects for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo']));
create policy "auth_update" on prospects for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo']));
create policy "auth_delete" on prospects for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on electoral_zones for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on electoral_zones for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_update" on electoral_zones for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_delete" on electoral_zones for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on field_agenda for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on field_agenda for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo', 'lideranca']));
create policy "auth_update" on field_agenda for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo']));
create policy "auth_delete" on field_agenda for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on demands for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on demands for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo', 'lideranca']));
create policy "auth_update" on demands for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional', 'operador_campo']));
create policy "auth_delete" on demands for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on audit_logs for select to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral']));
create policy "auth_insert" on audit_logs for insert to authenticated with check (app_has_campaign(campaign_id));
create policy "auth_update" on audit_logs for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));
create policy "auth_delete" on audit_logs for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on report_history for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on report_history for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_update" on report_history for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral']));
create policy "auth_delete" on report_history for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

create policy "auth_select" on import_history for select to authenticated using (app_has_campaign(campaign_id));
create policy "auth_insert" on import_history for insert to authenticated with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral', 'coordenador_regional']));
create policy "auth_update" on import_history for update to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral'])) with check (app_has_campaign(campaign_id) and app_has_any_role(array['admin', 'coordenacao_geral']));
create policy "auth_delete" on import_history for delete to authenticated using (app_has_campaign(campaign_id) and app_has_any_role(array['admin']));

-- Next refinement:
-- Add region/city/neighborhood filters for coordenador_regional, lideranca and visualizador.
-- Add column-level masking for sensitive data in API/backend or secure views.
