import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Database, LeaderMonthlyMetric } from "@/types/database";
import { DEFAULT_CAMPAIGN_ID } from "./leaders";

type LeaderMonthlyMetricInsert = Database["public"]["Tables"]["leader_monthly_metrics"]["Insert"];
type LeaderMonthlyMetricUpdate = Database["public"]["Tables"]["leader_monthly_metrics"]["Update"];

export function isLeaderMonthlyMetricsSupabaseReady() {
  return isSupabaseConfigured;
}

export async function listLeaderMonthlyMetrics(campaignId = DEFAULT_CAMPAIGN_ID): Promise<LeaderMonthlyMetric[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leader_monthly_metrics")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("month_ref", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function upsertLeaderMonthlyMetric(payload: LeaderMonthlyMetricInsert): Promise<LeaderMonthlyMetric> {
  const supabase = getSupabaseClient();
  const normalized = normalizeMetricPayload(payload);
  const { data, error } = await supabase
    .from("leader_monthly_metrics")
    .upsert(normalized as LeaderMonthlyMetricInsert, { onConflict: "leader_id,month_ref" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateLeaderMonthlyMetric(id: string, payload: LeaderMonthlyMetricUpdate): Promise<LeaderMonthlyMetric> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leader_monthly_metrics")
    .update(normalizeMetricPayload(payload) as LeaderMonthlyMetricUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

function normalizeMetricPayload<T extends LeaderMonthlyMetricInsert | LeaderMonthlyMetricUpdate>(payload: T): T {
  return {
    ...payload,
    campaign_id: payload.campaign_id ?? DEFAULT_CAMPAIGN_ID,
    estimated_supporters: Number(payload.estimated_supporters ?? 0),
    min_votes: Number(payload.min_votes ?? 0),
    max_votes: Number(payload.max_votes ?? 0),
    base_cost: Number(payload.base_cost ?? 0),
    ceiling_cost: Number(payload.ceiling_cost ?? 0),
    extra_cost: Number(payload.extra_cost ?? 0),
  };
}
