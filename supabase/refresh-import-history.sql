create table if not exists import_history (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_profile_id uuid references users_profiles(id) on delete set null,
  import_type text not null,
  file_name text not null,
  total_rows integer not null default 0,
  imported_rows integer not null default 0,
  error_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  status text not null,
  errors jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_import_history_campaign on import_history(campaign_id);
create index if not exists idx_import_history_user_profile on import_history(user_profile_id);

alter table import_history enable row level security;

drop policy if exists "mvp_public_select" on import_history;
drop policy if exists "mvp_public_insert" on import_history;
drop policy if exists "mvp_public_update" on import_history;
drop policy if exists "mvp_public_delete" on import_history;

create policy "mvp_public_select" on import_history for select to anon, authenticated using (true);
create policy "mvp_public_insert" on import_history for insert to anon, authenticated with check (true);
create policy "mvp_public_update" on import_history for update to anon, authenticated using (true) with check (true);
create policy "mvp_public_delete" on import_history for delete to anon, authenticated using (true);

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
