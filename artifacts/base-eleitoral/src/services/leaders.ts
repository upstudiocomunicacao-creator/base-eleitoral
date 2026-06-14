import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Database, Leader } from "@/types/database";
import { createSupabaseServiceError } from "./supabaseErrors";

type LeaderInsert = Database["public"]["Tables"]["leaders"]["Insert"];
type LeaderUpdate = Database["public"]["Tables"]["leaders"]["Update"];

export const DEFAULT_CAMPAIGN_ID =
  import.meta.env.VITE_SUPABASE_CAMPAIGN_ID || "00000000-0000-4000-8000-000000000001";

export function isLeadersSupabaseReady() {
  return isSupabaseConfigured;
}

export async function listLeaders(): Promise<Leader[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leaders")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw createLeaderServiceError(error);
  return data ?? [];
}

export async function getLeaderById(id: string): Promise<Leader | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leaders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw createLeaderServiceError(error);
  return data;
}

export async function createLeader(payload: LeaderInsert): Promise<Leader> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leaders")
    .insert(normalizeLeaderPayload(payload) as LeaderInsert)
    .select("*")
    .single();

  if (error) throw createLeaderServiceError(error);
  return data;
}

export async function updateLeader(id: string, payload: LeaderUpdate): Promise<Leader> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leaders")
    .update(normalizeLeaderPayload(payload) as LeaderUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw createLeaderServiceError(error);
  return data;
}

export async function deleteLeader(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("leaders").delete().eq("id", id);
  if (error) throw createLeaderServiceError(error);
}

function createLeaderServiceError(error: unknown) {
  return createSupabaseServiceError(error, {
    tableName: "leaders",
    setupSql: "supabase/schema.sql",
    fallbackMessage: "Não foi possível salvar o cadastro territorial no Supabase.",
  });
}

function normalizeLeaderPayload<T extends LeaderInsert | LeaderUpdate>(payload: T): T {
  return {
    ...payload,
    campaign_id: payload.campaign_id ?? DEFAULT_CAMPAIGN_ID,
    registered_supporters: Number(payload.registered_supporters ?? 0),
    estimated_direct_supporters: Number(payload.estimated_direct_supporters ?? 0),
    estimated_indirect_supporters: Number(payload.estimated_indirect_supporters ?? 0),
    declared_votes: Number(payload.declared_votes ?? 0),
    validated_votes: Number(payload.validated_votes ?? 0),
    latitude: payload.latitude === undefined || payload.latitude === null ? null : Number(payload.latitude),
    longitude: payload.longitude === undefined || payload.longitude === null ? null : Number(payload.longitude),
  };
}
