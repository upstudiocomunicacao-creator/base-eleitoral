import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Database, ElectoralZone, FieldAgenda, Leader } from "@/types/database";
import { listElectoralZones } from "./electoralZones";
import { DEFAULT_CAMPAIGN_ID, listLeaders } from "./leaders";
import { createSupabaseServiceError } from "./supabaseErrors";

type FieldAgendaInsert = Database["public"]["Tables"]["field_agenda"]["Insert"];
type FieldAgendaUpdate = Database["public"]["Tables"]["field_agenda"]["Update"];

export type FieldAgendaWithRelations = FieldAgenda & {
  leader: Leader | null;
  electoralZone: ElectoralZone | null;
};

export type FieldAgendaSummary = {
  scheduled: number;
  completed: number;
  delayed: number;
  leadershipMeetings: number;
  walks: number;
  neighborhoodEvents: number;
  strategicVisits: number;
  criticalActions: number;
  nextSevenDays: number;
  neighborhoodsWithAgenda: number;
};

export function isFieldAgendaSupabaseReady() {
  return isSupabaseConfigured;
}

export async function listFieldAgenda(): Promise<FieldAgenda[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("field_agenda")
    .select("*")
    .order("action_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false });

  if (error) throw createFieldAgendaError(error);
  return data ?? [];
}

export async function getFieldAgendaById(id: string): Promise<FieldAgenda | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("field_agenda")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw createFieldAgendaError(error);
  return data;
}

export async function createFieldAgenda(payload: FieldAgendaInsert): Promise<FieldAgenda> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("field_agenda")
    .insert(normalizeFieldAgendaPayload(payload) as FieldAgendaInsert)
    .select("*")
    .single();

  if (error) throw createFieldAgendaError(error);
  return data;
}

export async function updateFieldAgenda(id: string, payload: FieldAgendaUpdate): Promise<FieldAgenda> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("field_agenda")
    .update(normalizeFieldAgendaPayload(payload) as FieldAgendaUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw createFieldAgendaError(error);
  return data;
}

export async function deleteFieldAgenda(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("field_agenda").delete().eq("id", id);
  if (error) throw createFieldAgendaError(error);
}

function createFieldAgendaError(error: unknown) {
  return createSupabaseServiceError(error, {
    tableName: "field_agenda",
    setupSql: "supabase/schema.sql",
    fallbackMessage: "Não foi possível salvar a agenda de campo no Supabase.",
  });
}

export async function listFieldAgendaWithRelations(): Promise<{
  actions: FieldAgendaWithRelations[];
  leaders: Leader[];
  electoralZones: ElectoralZone[];
}> {
  const [actions, leaders, electoralZones] = await Promise.all([
    listFieldAgenda(),
    listLeaders(),
    listElectoralZones(),
  ]);
  const leadersById = new Map(leaders.map((leader) => [leader.id, leader]));
  const zonesById = new Map(electoralZones.map((zone) => [zone.id, zone]));

  return {
    leaders,
    electoralZones,
    actions: actions.map((action) => ({
      ...action,
      leader: action.leader_id ? leadersById.get(action.leader_id) ?? null : null,
      electoralZone: action.electoral_zone_id ? zonesById.get(action.electoral_zone_id) ?? null : null,
    })),
  };
}

export async function getFieldAgendaSummary(): Promise<FieldAgendaSummary> {
  const actions = await listFieldAgenda();
  return buildFieldAgendaSummary(actions);
}

export function buildFieldAgendaSummary(actions: FieldAgenda[]): FieldAgendaSummary {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextLimit = new Date(today);
  nextLimit.setDate(today.getDate() + 7);

  return {
    scheduled: actions.filter((item) => normalize(item.status) === "agendada").length,
    completed: actions.filter((item) => normalize(item.status) === "concluida").length,
    delayed: actions.filter((item) => isDelayed(item, today)).length,
    leadershipMeetings: actions.filter((item) => normalize(item.action_type).includes("lideranca")).length,
    walks: actions.filter((item) => normalize(item.action_type) === "caminhada").length,
    neighborhoodEvents: actions.filter((item) => normalize(item.action_type).includes("evento")).length,
    strategicVisits: actions.filter((item) => normalize(item.action_type).includes("visita")).length,
    criticalActions: actions.filter((item) => normalize(item.priority).includes("crit")).length,
    nextSevenDays: actions.filter((item) => {
      const date = parseDate(item.action_date);
      return date >= today && date <= nextLimit;
    }).length,
    neighborhoodsWithAgenda: unique(actions.map((item) => item.neighborhood)).length,
  };
}

function normalizeFieldAgendaPayload<T extends FieldAgendaInsert | FieldAgendaUpdate>(payload: T): T {
  return {
    ...payload,
    campaign_id: payload.campaign_id ?? DEFAULT_CAMPAIGN_ID,
    leader_id: payload.leader_id || null,
    electoral_zone_id: payload.electoral_zone_id || null,
    start_time: payload.start_time || null,
    end_time: payload.end_time || null,
    location: payload.location || null,
    cep: payload.cep || null,
    street: payload.street || null,
    number: payload.number || null,
    internal_responsible: payload.internal_responsible || null,
    estimated_public: payload.estimated_public === undefined || payload.estimated_public === null ? null : Number(payload.estimated_public),
    actual_public: payload.actual_public === undefined || payload.actual_public === null ? null : Number(payload.actual_public),
    objective: payload.objective || null,
    result: payload.result || null,
    next_step: payload.next_step || null,
    notes: payload.notes || null,
  };
}

function isDelayed(item: FieldAgenda, today: Date) {
  const status = normalize(item.status);
  if (status === "atrasada") return true;
  return parseDate(item.action_date) < today && !["concluida", "cancelada"].includes(status);
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
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
