import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Database, Demand, ElectoralZone, Leader, Supporter } from "@/types/database";
import { listElectoralZones } from "./electoralZones";
import { DEFAULT_CAMPAIGN_ID, listLeaders } from "./leaders";
import { listSupporters } from "./supporters";
import { createSupabaseServiceError } from "./supabaseErrors";

type DemandInsert = Database["public"]["Tables"]["demands"]["Insert"];
type DemandUpdate = Database["public"]["Tables"]["demands"]["Update"];

export type DemandWithRelations = Demand & {
  supporter: Supporter | null;
  leader: Leader | null;
  electoralZone: ElectoralZone | null;
};

export type DemandSummary = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  withoutResponsible: number;
  neighborhoods: number;
  withLeader: number;
  pendingReturn: number;
  topTheme: string;
};

export function isDemandsSupabaseReady() {
  return isSupabaseConfigured;
}

export async function listDemands(): Promise<Demand[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("demands")
    .select("*")
    .order("opening_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw createDemandError(error);
  return data ?? [];
}

export async function getDemandById(id: string): Promise<Demand | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("demands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw createDemandError(error);
  return data;
}

export async function createDemand(payload: DemandInsert): Promise<Demand> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("demands")
    .insert(normalizeDemandPayload(payload) as DemandInsert)
    .select("*")
    .single();

  if (error) throw createDemandError(error);
  return data;
}

export async function updateDemand(id: string, payload: DemandUpdate): Promise<Demand> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("demands")
    .update(normalizeDemandPayload(payload) as DemandUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw createDemandError(error);
  return data;
}

export async function deleteDemand(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("demands").delete().eq("id", id);
  if (error) throw createDemandError(error);
}

function createDemandError(error: unknown) {
  return createSupabaseServiceError(error, {
    tableName: "demands",
    setupSql: "supabase/schema.sql",
    fallbackMessage: "Não foi possível salvar a demanda no Supabase.",
  });
}

export async function listDemandsWithRelations(): Promise<{
  demands: DemandWithRelations[];
  supporters: Supporter[];
  leaders: Leader[];
  electoralZones: ElectoralZone[];
}> {
  const [demands, supporters, leaders, electoralZones] = await Promise.all([
    listDemands(),
    listSupporters(),
    listLeaders(),
    listElectoralZones(),
  ]);
  const supportersById = new Map(supporters.map((supporter) => [supporter.id, supporter]));
  const leadersById = new Map(leaders.map((leader) => [leader.id, leader]));
  const zonesById = new Map(electoralZones.map((zone) => [zone.id, zone]));

  return {
    supporters,
    leaders,
    electoralZones,
    demands: demands.map((demand) => ({
      ...demand,
      supporter: demand.supporter_id ? supportersById.get(demand.supporter_id) ?? null : null,
      leader: demand.leader_id ? leadersById.get(demand.leader_id) ?? null : null,
      electoralZone: demand.electoral_zone_id ? zonesById.get(demand.electoral_zone_id) ?? null : null,
    })),
  };
}

export async function getDemandSummary(): Promise<DemandSummary> {
  const demands = await listDemands();
  return buildDemandSummary(demands);
}

export async function getDemandCategoriesSummary(): Promise<Array<{ label: string; value: number }>> {
  const demands = await listDemands();
  return countBy(demands.map((demand) => demand.category));
}

export async function getDemandNeighborhoodSummary(): Promise<Array<{ label: string; value: number }>> {
  const demands = await listDemands();
  return countBy(demands.map((demand) => demand.neighborhood));
}

export function buildDemandSummary(demands: Demand[]): DemandSummary {
  return {
    total: demands.length,
    open: demands.filter((item) => normalize(item.status) === "aberta").length,
    inProgress: demands.filter((item) => ["em analise", "em andamento", "encaminhada", "aguardando retorno"].includes(normalize(item.status))).length,
    resolved: demands.filter((item) => normalize(item.status) === "resolvida").length,
    critical: demands.filter((item) => normalize(item.priority).includes("crit")).length,
    withoutResponsible: demands.filter((item) => !item.internal_responsible?.trim()).length,
    neighborhoods: unique(demands.map((item) => item.neighborhood)).length,
    withLeader: demands.filter((item) => Boolean(item.leader_id)).length,
    pendingReturn: demands.filter((item) => item.return_date && normalize(item.status) !== "resolvida").length,
    topTheme: countBy(demands.map((item) => item.category))[0]?.label ?? "-",
  };
}

function normalizeDemandPayload<T extends DemandInsert | DemandUpdate>(payload: T): T {
  return {
    ...payload,
    campaign_id: payload.campaign_id ?? DEFAULT_CAMPAIGN_ID,
    supporter_id: payload.supporter_id || null,
    leader_id: payload.leader_id || null,
    electoral_zone_id: payload.electoral_zone_id || null,
    person_name: payload.person_name || null,
    phone: payload.phone || null,
    cep: payload.cep || null,
    street: payload.street || null,
    number: payload.number || null,
    return_date: payload.return_date || null,
    next_action: payload.next_action || null,
    result: payload.result || null,
    internal_responsible: payload.internal_responsible || null,
    notes: payload.notes || null,
  };
}

function countBy(values: Array<string | null | undefined>) {
  const counts = values.reduce<Record<string, number>>((acc, rawValue) => {
    const value = rawValue?.trim() || "Não definido";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
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
