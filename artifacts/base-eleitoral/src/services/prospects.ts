import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Database, Leader, Prospect, Supporter } from "@/types/database";
import { DEFAULT_CAMPAIGN_ID, listLeaders } from "./leaders";
import { listSupporters } from "./supporters";
import { createSupabaseServiceError } from "./supabaseErrors";

type ProspectInsert = Database["public"]["Tables"]["prospects"]["Insert"];
type ProspectUpdate = Database["public"]["Tables"]["prospects"]["Update"];

export type ProspectWithRelations = Prospect & {
  supporter: Supporter | null;
  leader: Leader | null;
};

export function isProspectsSupabaseReady() {
  return isSupabaseConfigured;
}

export async function listProspects(): Promise<Prospect[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw createProspectError(error);
  return data ?? [];
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw createProspectError(error);
  return data;
}

export async function createProspect(payload: ProspectInsert): Promise<Prospect> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("prospects")
    .insert(normalizeProspectPayload(payload) as ProspectInsert)
    .select("*")
    .single();

  if (error) throw createProspectError(error);
  return data;
}

export async function updateProspect(id: string, payload: ProspectUpdate): Promise<Prospect> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("prospects")
    .update(normalizeProspectPayload(payload) as ProspectUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw createProspectError(error);
  return data;
}

export async function updateProspectStage(id: string, funnelStage: string): Promise<Prospect> {
  return updateProspect(id, { funnel_stage: funnelStage });
}

export async function deleteProspect(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("prospects").delete().eq("id", id);
  if (error) throw createProspectError(error);
}

function createProspectError(error: unknown) {
  return createSupabaseServiceError(error, {
    tableName: "prospects",
    setupSql: "supabase/schema.sql",
    fallbackMessage: "Não foi possível salvar a prospecção no Supabase.",
  });
}

export async function listProspectsWithRelations(): Promise<{
  prospects: ProspectWithRelations[];
  supporters: Supporter[];
  leaders: Leader[];
}> {
  const [prospects, supporters, leaders] = await Promise.all([listProspects(), listSupporters(), listLeaders()]);
  const supportersById = new Map(supporters.map((supporter) => [supporter.id, supporter]));
  const leadersById = new Map(leaders.map((leader) => [leader.id, leader]));

  return {
    supporters,
    leaders,
    prospects: prospects.map((prospect) => ({
      ...prospect,
      supporter: prospect.supporter_id ? supportersById.get(prospect.supporter_id) ?? null : null,
      leader: prospect.leader_id ? leadersById.get(prospect.leader_id) ?? null : null,
    })),
  };
}

function normalizeProspectPayload<T extends ProspectInsert | ProspectUpdate>(payload: T): T {
  return {
    ...payload,
    campaign_id: payload.campaign_id ?? DEFAULT_CAMPAIGN_ID,
    supporter_id: payload.supporter_id || null,
    leader_id: payload.leader_id || null,
  };
}
