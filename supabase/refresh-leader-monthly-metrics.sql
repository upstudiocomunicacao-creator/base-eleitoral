-- Maintenance script for the lean operational model.
-- Run this in Supabase SQL Editor if the app can read leader_monthly_metrics
-- but inserts/updates fail with a PostgREST schema cache message.

create table if not exists leader_monthly_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  leader_id uuid not null references leaders(id) on delete cascade,
  month_ref date not null,
  estimated_supporters integer not null default 0,
  min_votes integer not null default 0,
  max_votes integer not null default 0,
  base_cost numeric not null default 0,
  ceiling_cost numeric not null default 0,
  extra_cost numeric not null default 0,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (leader_id, month_ref)
);

create index if not exists idx_leader_monthly_metrics_campaign on leader_monthly_metrics(campaign_id);
create index if not exists idx_leader_monthly_metrics_leader on leader_monthly_metrics(leader_id);
create index if not exists idx_leader_monthly_metrics_month on leader_monthly_metrics(month_ref);

drop trigger if exists trg_leader_monthly_metrics_updated_at on leader_monthly_metrics;
create trigger trg_leader_monthly_metrics_updated_at
before update on leader_monthly_metrics
for each row execute function set_updated_at();

alter table leader_monthly_metrics enable row level security;

drop policy if exists "mvp_public_select" on leader_monthly_metrics;
drop policy if exists "mvp_public_insert" on leader_monthly_metrics;
drop policy if exists "mvp_public_update" on leader_monthly_metrics;
drop policy if exists "mvp_public_delete" on leader_monthly_metrics;

create policy "mvp_public_select" on leader_monthly_metrics for select to anon using (true);
create policy "mvp_public_insert" on leader_monthly_metrics for insert to anon with check (true);
create policy "mvp_public_update" on leader_monthly_metrics for update to anon using (true) with check (true);
create policy "mvp_public_delete" on leader_monthly_metrics for delete to anon using (true);

notify pgrst, 'reload schema';
