export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type RowBase = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type Campaign = RowBase & {
  name: string;
  candidate_name: string;
  candidate_number: string | null;
  office: string;
  party: string | null;
  coalition: string | null;
  main_state: string;
  main_city: string;
  election_year: number;
  general_vote_goal: number;
  validated_vote_goal: number;
  supporter_goal: number;
  leader_goal: number;
  start_date: string | null;
  election_date: string | null;
  status: string;
  notes: string | null;
};

export type UserProfile = RowBase & {
  auth_user_id: string | null;
  campaign_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  linked_state: string | null;
  linked_city: string | null;
  linked_neighborhood: string | null;
};

export type Municipality = RowBase & {
  campaign_id: string;
  name: string;
  state: string;
  region: string | null;
  status: string;
  priority: string;
  coordinator_name: string | null;
  notes: string | null;
};

export type Neighborhood = RowBase & {
  campaign_id: string;
  municipality_id: string;
  name: string;
  city: string;
  state: string;
  region: string | null;
  estimated_voters: number | null;
  priority: string;
  status: string;
  notes: string | null;
};

export type Leader = RowBase & {
  campaign_id: string;
  full_name: string;
  political_nickname: string | null;
  phone: string;
  email: string | null;
  leader_type: string;
  status: string;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  territory_region: string | null;
  geographic_precision: string;
  parent_leader_id: string | null;
  internal_responsible: string | null;
  registered_supporters: number;
  estimated_direct_supporters: number;
  estimated_indirect_supporters: number;
  declared_votes: number;
  validated_votes: number;
  confidence_level: string;
  estimate_source: string | null;
  proof_type: string | null;
  last_update: string | null;
  next_action: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  geocoding_status: string | null;
  geocoding_source: string | null;
  geocoding_confidence: number | null;
  geocoding_last_attempt_at: string | null;
  geocoding_error: string | null;
};

export type Supporter = RowBase & {
  campaign_id: string;
  leader_id: string | null;
  full_name: string;
  nickname: string | null;
  phone: string;
  email: string | null;
  birth_date: string | null;
  gender: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  reference_point: string | null;
  geographic_precision: string;
  person_type: string;
  political_status: string;
  data_confidence: string;
  source: string;
  internal_responsible: string | null;
  last_contact: string | null;
  next_action: string | null;
  next_action_date: string | null;
  lgpd_consent: boolean;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  geocoding_status: string | null;
  geocoding_source: string | null;
  geocoding_confidence: number | null;
  geocoding_last_attempt_at: string | null;
  geocoding_error: string | null;
};

export type Prospect = RowBase & {
  campaign_id: string;
  supporter_id: string | null;
  leader_id: string | null;
  contact_name: string;
  phone: string | null;
  neighborhood: string;
  city: string;
  funnel_stage: string;
  origin: string;
  priority: string;
  confidence_level: string;
  internal_responsible: string | null;
  last_contact: string | null;
  next_action: string | null;
  next_action_date: string | null;
  last_result: string | null;
  loss_reason: string | null;
  notes: string | null;
};

export type ElectoralZone = RowBase & {
  campaign_id: string;
  zone_number: string;
  section_number: string | null;
  voting_place: string;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  geographic_precision: string | null;
  voters_count: number;
  historical_votes: number | null;
  vote_goal: number;
  estimated_campaign_votes: number;
  validated_votes: number;
  regional_responsible: string | null;
  priority: string;
  status: string;
  notes: string | null;
  geocoding_status: string | null;
  geocoding_source: string | null;
  geocoding_confidence: number | null;
  geocoding_last_attempt_at: string | null;
  geocoding_error: string | null;
};

export type FieldAgenda = RowBase & {
  campaign_id: string;
  leader_id: string | null;
  electoral_zone_id: string | null;
  title: string;
  action_type: string;
  action_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  geographic_precision: string | null;
  internal_responsible: string | null;
  estimated_public: number | null;
  actual_public: number | null;
  objective: string | null;
  status: string;
  priority: string;
  result: string | null;
  next_step: string | null;
  notes: string | null;
  geocoding_status: string | null;
  geocoding_source: string | null;
  geocoding_confidence: number | null;
  geocoding_last_attempt_at: string | null;
  geocoding_error: string | null;
};

export type Demand = RowBase & {
  campaign_id: string;
  supporter_id: string | null;
  leader_id: string | null;
  electoral_zone_id: string | null;
  title: string;
  description: string;
  person_name: string | null;
  phone: string | null;
  category: string;
  priority: string;
  status: string;
  cep: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  geographic_precision: string | null;
  opening_date: string;
  return_date: string | null;
  next_action: string | null;
  result: string | null;
  internal_responsible: string | null;
  notes: string | null;
  geocoding_status: string | null;
  geocoding_source: string | null;
  geocoding_confidence: number | null;
  geocoding_last_attempt_at: string | null;
  geocoding_error: string | null;
};

export type AuditLog = {
  id: string;
  campaign_id: string;
  user_profile_id: string | null;
  action: string;
  module: string;
  record_id: string | null;
  change_type: string;
  device_info: string | null;
  ip_address: string | null;
  status: string;
  created_at: string;
};

export type ReportHistory = {
  id: string;
  campaign_id: string;
  report_name: string;
  report_type: string;
  filters: Json | null;
  generated_by: string | null;
  status: string;
  file_url: string | null;
  created_at: string;
};

export type ImportHistory = {
  id: string;
  campaign_id: string;
  user_profile_id: string | null;
  import_type: string;
  file_name: string;
  total_rows: number;
  imported_rows: number;
  error_rows: number;
  duplicate_rows: number;
  status: string;
  errors: Json | null;
  created_at: string;
};

export type LeaderMonthlyMetric = RowBase & {
  campaign_id: string;
  leader_id: string;
  month_ref: string;
  estimated_supporters: number;
  min_votes: number;
  max_votes: number;
  base_cost: number;
  ceiling_cost: number;
  extra_cost: number;
  notes: string | null;
};

export type Database = {
  public: {
    Tables: {
      campaigns: Table<Campaign>;
      users_profiles: Table<UserProfile>;
      municipalities: Table<Municipality>;
      neighborhoods: Table<Neighborhood>;
      leaders: Table<Leader>;
      supporters: Table<Supporter>;
      prospects: Table<Prospect>;
      electoral_zones: Table<ElectoralZone>;
      field_agenda: Table<FieldAgenda>;
      demands: Table<Demand>;
      audit_logs: Table<AuditLog>;
      report_history: Table<ReportHistory>;
      import_history: Table<ImportHistory>;
      leader_monthly_metrics: Table<LeaderMonthlyMetric>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type Table<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: Array<{
    foreignKeyName: string;
    columns: string[];
    referencedRelation: string;
    referencedColumns: string[];
  }>;
};
