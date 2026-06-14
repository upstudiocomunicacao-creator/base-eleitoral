import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Database, Leader, Supporter } from "@/types/database";
import { DEFAULT_CAMPAIGN_ID, listLeaders } from "./leaders";
import { createSupabaseServiceError } from "./supabaseErrors";

type SupporterInsert = Database["public"]["Tables"]["supporters"]["Insert"];
type SupporterUpdate = Database["public"]["Tables"]["supporters"]["Update"];

export type SupporterWithLeader = Supporter & {
  leader: Leader | null;
};

export function isSupportersSupabaseReady() {
  return isSupabaseConfigured;
}

export async function listSupporters(): Promise<Supporter[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("supporters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw createSupporterError(error);
  return data ?? [];
}

export async function getSupporterById(id: string): Promise<Supporter | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("supporters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw createSupporterError(error);
  return data;
}

export async function createSupporter(payload: SupporterInsert): Promise<Supporter> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("supporters")
    .insert(normalizeSupporterPayload(payload) as SupporterInsert)
    .select("*")
    .single();

  if (error) throw createSupporterError(error);
  return data;
}

export async function updateSupporter(id: string, payload: SupporterUpdate): Promise<Supporter> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("supporters")
    .update(normalizeSupporterPayload(payload) as SupporterUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw createSupporterError(error);
  return data;
}

export async function deleteSupporter(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("supporters").delete().eq("id", id);
  if (error) throw createSupporterError(error);
}

function createSupporterError(error: unknown) {
  return createSupabaseServiceError(error, {
    tableName: "supporters",
    setupSql: "supabase/schema.sql",
    fallbackMessage: "Não foi possível salvar o apoiador no Supabase.",
  });
}

export async function listSupportersWithLeaders(): Promise<{ supporters: SupporterWithLeader[]; leaders: Leader[] }> {
  const [supporters, leaders] = await Promise.all([listSupporters(), listLeaders()]);
  const leadersById = new Map(leaders.map((leader) => [leader.id, leader]));
  return {
    leaders,
    supporters: supporters.map((supporter) => ({
      ...supporter,
      leader: supporter.leader_id ? leadersById.get(supporter.leader_id) ?? null : null,
    })),
  };
}

function normalizeSupporterPayload<T extends SupporterInsert | SupporterUpdate>(payload: T): T {
  return {
    ...payload,
    campaign_id: payload.campaign_id ?? DEFAULT_CAMPAIGN_ID,
    leader_id: payload.leader_id || null,
    lgpd_consent: Boolean(payload.lgpd_consent),
    latitude: payload.latitude === undefined || payload.latitude === null ? null : Number(payload.latitude),
    longitude: payload.longitude === undefined || payload.longitude === null ? null : Number(payload.longitude),
  };
}
