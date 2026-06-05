-- Development policies for Base Eleitoral 360 MVP.
-- Use these only while the app does not have Supabase Auth and role-based access.
-- In production, replace these policies with authenticated, campaign-scoped rules.

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

drop policy if exists "mvp_public_select" on campaigns;
drop policy if exists "mvp_public_insert" on campaigns;
drop policy if exists "mvp_public_update" on campaigns;
drop policy if exists "mvp_public_delete" on campaigns;
create policy "mvp_public_select" on campaigns for select to anon using (true);
create policy "mvp_public_insert" on campaigns for insert to anon with check (true);
create policy "mvp_public_update" on campaigns for update to anon using (true) with check (true);
create policy "mvp_public_delete" on campaigns for delete to anon using (true);

drop policy if exists "mvp_public_select" on users_profiles;
drop policy if exists "mvp_public_insert" on users_profiles;
drop policy if exists "mvp_public_update" on users_profiles;
drop policy if exists "mvp_public_delete" on users_profiles;
create policy "mvp_public_select" on users_profiles for select to anon using (true);
create policy "mvp_public_insert" on users_profiles for insert to anon with check (true);
create policy "mvp_public_update" on users_profiles for update to anon using (true) with check (true);
create policy "mvp_public_delete" on users_profiles for delete to anon using (true);

drop policy if exists "mvp_public_select" on municipalities;
drop policy if exists "mvp_public_insert" on municipalities;
drop policy if exists "mvp_public_update" on municipalities;
drop policy if exists "mvp_public_delete" on municipalities;
create policy "mvp_public_select" on municipalities for select to anon using (true);
create policy "mvp_public_insert" on municipalities for insert to anon with check (true);
create policy "mvp_public_update" on municipalities for update to anon using (true) with check (true);
create policy "mvp_public_delete" on municipalities for delete to anon using (true);

drop policy if exists "mvp_public_select" on neighborhoods;
drop policy if exists "mvp_public_insert" on neighborhoods;
drop policy if exists "mvp_public_update" on neighborhoods;
drop policy if exists "mvp_public_delete" on neighborhoods;
create policy "mvp_public_select" on neighborhoods for select to anon using (true);
create policy "mvp_public_insert" on neighborhoods for insert to anon with check (true);
create policy "mvp_public_update" on neighborhoods for update to anon using (true) with check (true);
create policy "mvp_public_delete" on neighborhoods for delete to anon using (true);

drop policy if exists "mvp_public_select" on leaders;
drop policy if exists "mvp_public_insert" on leaders;
drop policy if exists "mvp_public_update" on leaders;
drop policy if exists "mvp_public_delete" on leaders;
create policy "mvp_public_select" on leaders for select to anon using (true);
create policy "mvp_public_insert" on leaders for insert to anon with check (true);
create policy "mvp_public_update" on leaders for update to anon using (true) with check (true);
create policy "mvp_public_delete" on leaders for delete to anon using (true);

drop policy if exists "mvp_public_select" on supporters;
drop policy if exists "mvp_public_insert" on supporters;
drop policy if exists "mvp_public_update" on supporters;
drop policy if exists "mvp_public_delete" on supporters;
create policy "mvp_public_select" on supporters for select to anon using (true);
create policy "mvp_public_insert" on supporters for insert to anon with check (true);
create policy "mvp_public_update" on supporters for update to anon using (true) with check (true);
create policy "mvp_public_delete" on supporters for delete to anon using (true);

drop policy if exists "mvp_public_select" on prospects;
drop policy if exists "mvp_public_insert" on prospects;
drop policy if exists "mvp_public_update" on prospects;
drop policy if exists "mvp_public_delete" on prospects;
create policy "mvp_public_select" on prospects for select to anon using (true);
create policy "mvp_public_insert" on prospects for insert to anon with check (true);
create policy "mvp_public_update" on prospects for update to anon using (true) with check (true);
create policy "mvp_public_delete" on prospects for delete to anon using (true);

drop policy if exists "mvp_public_select" on electoral_zones;
drop policy if exists "mvp_public_insert" on electoral_zones;
drop policy if exists "mvp_public_update" on electoral_zones;
drop policy if exists "mvp_public_delete" on electoral_zones;
create policy "mvp_public_select" on electoral_zones for select to anon using (true);
create policy "mvp_public_insert" on electoral_zones for insert to anon with check (true);
create policy "mvp_public_update" on electoral_zones for update to anon using (true) with check (true);
create policy "mvp_public_delete" on electoral_zones for delete to anon using (true);

drop policy if exists "mvp_public_select" on field_agenda;
drop policy if exists "mvp_public_insert" on field_agenda;
drop policy if exists "mvp_public_update" on field_agenda;
drop policy if exists "mvp_public_delete" on field_agenda;
create policy "mvp_public_select" on field_agenda for select to anon using (true);
create policy "mvp_public_insert" on field_agenda for insert to anon with check (true);
create policy "mvp_public_update" on field_agenda for update to anon using (true) with check (true);
create policy "mvp_public_delete" on field_agenda for delete to anon using (true);

drop policy if exists "mvp_public_select" on demands;
drop policy if exists "mvp_public_insert" on demands;
drop policy if exists "mvp_public_update" on demands;
drop policy if exists "mvp_public_delete" on demands;
create policy "mvp_public_select" on demands for select to anon using (true);
create policy "mvp_public_insert" on demands for insert to anon with check (true);
create policy "mvp_public_update" on demands for update to anon using (true) with check (true);
create policy "mvp_public_delete" on demands for delete to anon using (true);

drop policy if exists "mvp_public_select" on audit_logs;
drop policy if exists "mvp_public_insert" on audit_logs;
drop policy if exists "mvp_public_update" on audit_logs;
drop policy if exists "mvp_public_delete" on audit_logs;
create policy "mvp_public_select" on audit_logs for select to anon using (true);
create policy "mvp_public_insert" on audit_logs for insert to anon with check (true);
create policy "mvp_public_update" on audit_logs for update to anon using (true) with check (true);
create policy "mvp_public_delete" on audit_logs for delete to anon using (true);

drop policy if exists "mvp_public_select" on report_history;
drop policy if exists "mvp_public_insert" on report_history;
drop policy if exists "mvp_public_update" on report_history;
drop policy if exists "mvp_public_delete" on report_history;
create policy "mvp_public_select" on report_history for select to anon using (true);
create policy "mvp_public_insert" on report_history for insert to anon with check (true);
create policy "mvp_public_update" on report_history for update to anon using (true) with check (true);
create policy "mvp_public_delete" on report_history for delete to anon using (true);

drop policy if exists "mvp_public_select" on import_history;
drop policy if exists "mvp_public_insert" on import_history;
drop policy if exists "mvp_public_update" on import_history;
drop policy if exists "mvp_public_delete" on import_history;
create policy "mvp_public_select" on import_history for select to anon using (true);
create policy "mvp_public_insert" on import_history for insert to anon with check (true);
create policy "mvp_public_update" on import_history for update to anon using (true) with check (true);
create policy "mvp_public_delete" on import_history for delete to anon using (true);
