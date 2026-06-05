-- Base Eleitoral 360 - Geocoding support.
-- Run this in Supabase SQL Editor before using the geocoding panel.

alter table leaders
  add column if not exists geocoding_status text default 'pending',
  add column if not exists geocoding_source text,
  add column if not exists geocoding_confidence numeric,
  add column if not exists geocoding_last_attempt_at timestamp with time zone,
  add column if not exists geocoding_error text;

alter table supporters
  add column if not exists geocoding_status text default 'pending',
  add column if not exists geocoding_source text,
  add column if not exists geocoding_confidence numeric,
  add column if not exists geocoding_last_attempt_at timestamp with time zone,
  add column if not exists geocoding_error text;

alter table electoral_zones
  add column if not exists geographic_precision text,
  add column if not exists geocoding_status text default 'pending',
  add column if not exists geocoding_source text,
  add column if not exists geocoding_confidence numeric,
  add column if not exists geocoding_last_attempt_at timestamp with time zone,
  add column if not exists geocoding_error text;

alter table field_agenda
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists geographic_precision text,
  add column if not exists geocoding_status text default 'pending',
  add column if not exists geocoding_source text,
  add column if not exists geocoding_confidence numeric,
  add column if not exists geocoding_last_attempt_at timestamp with time zone,
  add column if not exists geocoding_error text;

alter table demands
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists geographic_precision text,
  add column if not exists geocoding_status text default 'pending',
  add column if not exists geocoding_source text,
  add column if not exists geocoding_confidence numeric,
  add column if not exists geocoding_last_attempt_at timestamp with time zone,
  add column if not exists geocoding_error text;

create index if not exists idx_leaders_geocoding_status on leaders(geocoding_status);
create index if not exists idx_supporters_geocoding_status on supporters(geocoding_status);
create index if not exists idx_electoral_zones_geocoding_status on electoral_zones(geocoding_status);
create index if not exists idx_field_agenda_geocoding_status on field_agenda(geocoding_status);
create index if not exists idx_demands_geocoding_status on demands(geocoding_status);
