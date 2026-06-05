import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Database, ElectoralZone } from "@/types/database";
import { DEFAULT_CAMPAIGN_ID } from "./leaders";

type ElectoralZoneInsert = Database["public"]["Tables"]["electoral_zones"]["Insert"];
type ElectoralZoneUpdate = Database["public"]["Tables"]["electoral_zones"]["Update"];

export type ElectoralZoneSummary = {
  totalZones: number;
  totalSections: number;
  totalVotingPlaces: number;
  totalVoters: number;
  totalVoteGoal: number;
  totalValidatedVotes: number;
  distanceToGoal: number;
  estimatedCoverage: number;
  priorityZones: number;
  attentionSections: number;
};

export function isElectoralZonesSupabaseReady() {
  return isSupabaseConfigured;
}

export async function listElectoralZones(): Promise<ElectoralZone[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("electoral_zones")
    .select("*")
    .order("zone_number", { ascending: true })
    .order("section_number", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export async function getElectoralZoneById(id: string): Promise<ElectoralZone | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("electoral_zones")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createElectoralZone(payload: ElectoralZoneInsert): Promise<ElectoralZone> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("electoral_zones")
    .insert(normalizeElectoralZonePayload(payload) as ElectoralZoneInsert)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateElectoralZone(id: string, payload: ElectoralZoneUpdate): Promise<ElectoralZone> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("electoral_zones")
    .update(normalizeElectoralZonePayload(payload) as ElectoralZoneUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteElectoralZone(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("electoral_zones").delete().eq("id", id);
  if (error) throw error;
}

export async function getElectoralZoneSummary(): Promise<ElectoralZoneSummary> {
  const records = await listElectoralZones();
  return buildElectoralZoneSummary(records);
}

export function buildElectoralZoneSummary(records: ElectoralZone[]): ElectoralZoneSummary {
  const totalVoteGoal = sum(records, "vote_goal");
  const totalValidatedVotes = sum(records, "validated_votes");
  const totalVoters = sum(records, "voters_count");

  return {
    totalZones: unique(records.map((record) => record.zone_number)).length,
    totalSections: records.length,
    totalVotingPlaces: unique(records.map((record) => record.voting_place)).length,
    totalVoters,
    totalVoteGoal,
    totalValidatedVotes,
    distanceToGoal: Math.max(totalVoteGoal - totalValidatedVotes, 0),
    estimatedCoverage: totalVoters > 0 ? Math.round((totalValidatedVotes / totalVoters) * 1000) / 10 : 0,
    priorityZones: records.filter((record) => ["alta", "critica"].includes(normalize(record.priority))).length,
    attentionSections: records.filter((record) => {
      const status = normalize(record.status);
      const coverage = record.voters_count > 0 ? record.validated_votes / record.voters_count : 0;
      return (
        normalize(record.priority).includes("crit") ||
        status.includes("baixa") ||
        status.includes("sem lideranca") ||
        status.includes("revisar") ||
        coverage < 0.03
      );
    }).length,
  };
}

function normalizeElectoralZonePayload<T extends ElectoralZoneInsert | ElectoralZoneUpdate>(payload: T): T {
  return {
    ...payload,
    campaign_id: payload.campaign_id ?? DEFAULT_CAMPAIGN_ID,
    section_number: payload.section_number || null,
    cep: payload.cep || null,
    street: payload.street || null,
    number: payload.number || null,
    complement: payload.complement || null,
    latitude: payload.latitude === undefined || payload.latitude === null ? null : Number(payload.latitude),
    longitude: payload.longitude === undefined || payload.longitude === null ? null : Number(payload.longitude),
    voters_count: Number(payload.voters_count ?? 0),
    historical_votes: payload.historical_votes === undefined || payload.historical_votes === null ? null : Number(payload.historical_votes),
    vote_goal: Number(payload.vote_goal ?? 0),
    estimated_campaign_votes: Number(payload.estimated_campaign_votes ?? 0),
    validated_votes: Number(payload.validated_votes ?? 0),
    regional_responsible: payload.regional_responsible || null,
    notes: payload.notes || null,
  };
}

function sum(records: ElectoralZone[], key: "voters_count" | "vote_goal" | "validated_votes") {
  return records.reduce((total, record) => total + Number(record[key] ?? 0), 0);
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
