create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  candidate_name text not null,
  candidate_number text,
  office text not null,
  party text,
  coalition text,
  main_state text not null,
  main_city text not null,
  election_year integer not null,
  general_vote_goal integer not null default 0,
  validated_vote_goal integer not null default 0,
  supporter_goal integer not null default 0,
  leader_goal integer not null default 0,
  start_date date,
  election_date date,
  status text not null default 'active',
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists users_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text not null,
  status text not null default 'active',
  linked_state text,
  linked_city text,
  linked_neighborhood text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists municipalities (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  state text not null,
  region text,
  status text not null default 'mapped',
  priority text not null default 'medium',
  coordinator_name text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists neighborhoods (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  municipality_id uuid not null references municipalities(id) on delete cascade,
  name text not null,
  city text not null,
  state text not null,
  region text,
  estimated_voters integer,
  priority text not null default 'medium',
  status text not null default 'mapped',
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists leaders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  full_name text not null,
  political_nickname text,
  phone text not null,
  email text,
  leader_type text not null,
  status text not null,
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  territory_region text,
  geographic_precision text not null,
  parent_leader_id uuid references leaders(id),
  internal_responsible text,
  registered_supporters integer not null default 0,
  estimated_direct_supporters integer not null default 0,
  estimated_indirect_supporters integer not null default 0,
  declared_votes integer not null default 0,
  validated_votes integer not null default 0,
  confidence_level text not null,
  estimate_source text,
  proof_type text,
  last_update date,
  next_action text,
  notes text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists supporters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  leader_id uuid references leaders(id) on delete set null,
  full_name text not null,
  nickname text,
  phone text not null,
  email text,
  birth_date date,
  gender text,
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  reference_point text,
  geographic_precision text not null,
  person_type text not null,
  political_status text not null,
  data_confidence text not null,
  source text not null,
  internal_responsible text,
  last_contact date,
  next_action text,
  next_action_date date,
  lgpd_consent boolean not null default false,
  notes text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  supporter_id uuid references supporters(id) on delete set null,
  leader_id uuid references leaders(id) on delete set null,
  contact_name text not null,
  phone text,
  neighborhood text not null,
  city text not null,
  funnel_stage text not null,
  origin text not null,
  priority text not null,
  confidence_level text not null,
  internal_responsible text,
  last_contact date,
  next_action text,
  next_action_date date,
  last_result text,
  loss_reason text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists electoral_zones (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  zone_number text not null,
  section_number text,
  voting_place text not null,
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  latitude numeric,
  longitude numeric,
  voters_count integer not null default 0,
  historical_votes integer,
  vote_goal integer not null default 0,
  estimated_campaign_votes integer not null default 0,
  validated_votes integer not null default 0,
  regional_responsible text,
  priority text not null,
  status text not null,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists field_agenda (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  leader_id uuid references leaders(id) on delete set null,
  electoral_zone_id uuid references electoral_zones(id) on delete set null,
  title text not null,
  action_type text not null,
  action_date date not null,
  start_time time,
  end_time time,
  location text,
  cep text,
  street text,
  number text,
  neighborhood text not null,
  city text not null,
  state text not null,
  internal_responsible text,
  estimated_public integer,
  actual_public integer,
  objective text,
  status text not null,
  priority text not null,
  result text,
  next_step text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists demands (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  supporter_id uuid references supporters(id) on delete set null,
  leader_id uuid references leaders(id) on delete set null,
  electoral_zone_id uuid references electoral_zones(id) on delete set null,
  title text not null,
  description text not null,
  person_name text,
  phone text,
  category text not null,
  priority text not null,
  status text not null,
  cep text,
  street text,
  number text,
  neighborhood text not null,
  city text not null,
  state text not null,
  opening_date date not null,
  return_date date,
  next_action text,
  result text,
  internal_responsible text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_profile_id uuid references users_profiles(id) on delete set null,
  action text not null,
  module text not null,
  record_id uuid,
  change_type text not null,
  device_info text,
  ip_address text,
  status text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists report_history (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  report_name text not null,
  report_type text not null,
  filters jsonb,
  generated_by text,
  status text not null,
  file_url text,
  created_at timestamp with time zone not null default now()
);

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

create index if not exists idx_leaders_campaign on leaders(campaign_id);
create index if not exists idx_supporters_campaign on supporters(campaign_id);
create index if not exists idx_supporters_leader on supporters(leader_id);
create index if not exists idx_prospects_campaign on prospects(campaign_id);
create index if not exists idx_electoral_zones_campaign on electoral_zones(campaign_id);
create index if not exists idx_demands_campaign on demands(campaign_id);
create index if not exists idx_field_agenda_campaign on field_agenda(campaign_id);
create index if not exists idx_import_history_campaign on import_history(campaign_id);

create trigger trg_campaigns_updated_at before update on campaigns for each row execute function set_updated_at();
create trigger trg_users_profiles_updated_at before update on users_profiles for each row execute function set_updated_at();
create trigger trg_municipalities_updated_at before update on municipalities for each row execute function set_updated_at();
create trigger trg_neighborhoods_updated_at before update on neighborhoods for each row execute function set_updated_at();
create trigger trg_leaders_updated_at before update on leaders for each row execute function set_updated_at();
create trigger trg_supporters_updated_at before update on supporters for each row execute function set_updated_at();
create trigger trg_prospects_updated_at before update on prospects for each row execute function set_updated_at();
create trigger trg_electoral_zones_updated_at before update on electoral_zones for each row execute function set_updated_at();
create trigger trg_field_agenda_updated_at before update on field_agenda for each row execute function set_updated_at();
create trigger trg_demands_updated_at before update on demands for each row execute function set_updated_at();

create or replace view view_dashboard_summary as
select
  c.id as campaign_id,
  c.name as campaign_name,
  count(distinct l.id) as total_leaders,
  count(distinct s.id) as total_supporters,
  coalesce(sum(distinct l.declared_votes), 0) as declared_votes,
  coalesce(sum(distinct l.validated_votes), 0) as validated_votes,
  c.general_vote_goal,
  greatest(c.general_vote_goal - coalesce(sum(distinct l.validated_votes), 0), 0) as distance_to_goal
from campaigns c
left join leaders l on l.campaign_id = c.id
left join supporters s on s.campaign_id = c.id
group by c.id;

create or replace view view_leader_performance as
select
  id,
  campaign_id,
  full_name,
  neighborhood,
  city,
  declared_votes,
  validated_votes,
  case when declared_votes > 0 then round((validated_votes::numeric / declared_votes::numeric) * 100, 2) else 0 end as validation_rate,
  estimated_direct_supporters + estimated_indirect_supporters as total_potential
from leaders;

create or replace view view_neighborhood_comparison as
select
  n.id,
  n.campaign_id,
  n.name,
  n.city,
  n.estimated_voters,
  count(distinct l.id) as leaders_count,
  count(distinct s.id) as supporters_count,
  coalesce(sum(l.validated_votes), 0) as validated_votes
from neighborhoods n
left join leaders l on l.campaign_id = n.campaign_id and l.neighborhood = n.name
left join supporters s on s.campaign_id = n.campaign_id and s.neighborhood = n.name
group by n.id;

create or replace view view_electoral_comparison as
select
  id,
  campaign_id,
  zone_number,
  section_number,
  voting_place,
  neighborhood,
  voters_count,
  vote_goal,
  validated_votes,
  case when voters_count > 0 then round((validated_votes::numeric / voters_count::numeric) * 100, 2) else 0 end as coverage,
  greatest(vote_goal - validated_votes, 0) as distance_to_goal
from electoral_zones;

create or replace view view_prospect_funnel as
select campaign_id, funnel_stage, count(*) as total
from prospects
group by campaign_id, funnel_stage;

create or replace view view_demand_summary as
select campaign_id, category, status, priority, count(*) as total
from demands
group by campaign_id, category, status, priority;

create or replace view view_field_agenda_summary as
select campaign_id, action_type, status, priority, count(*) as total
from field_agenda
group by campaign_id, action_type, status, priority;
