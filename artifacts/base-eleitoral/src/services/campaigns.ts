import { createCrudService } from "./supabaseCrud";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Campaign, Database } from "@/types/database";
import { DEFAULT_CAMPAIGN_ID } from "./leaders";

export const campaignsService = createCrudService("campaigns");

type CampaignUpdate = Database["public"]["Tables"]["campaigns"]["Update"];

export type CampaignSettings = {
  id: string;
  systemName: string;
  name: string;
  candidateName: string;
  candidateNumber: string;
  office: string;
  party: string;
  coalition: string;
  mainState: string;
  mainCity: string;
  electionYear: number;
  generalResponsible: string;
  contactPhone: string;
  contactEmail: string;
  generalVoteGoal: number;
  validatedVoteGoal: number;
  supporterGoal: number;
  leaderGoal: number;
  startDate: string;
  electionDate: string;
  status: string;
  notes: string;
};

export const DEFAULT_CAMPAIGN_SETTINGS: CampaignSettings = {
  id: DEFAULT_CAMPAIGN_ID,
  systemName: "Base Eleitoral 360",
  name: "Campanha Marica 2026",
  candidateName: "Candidato Exemplo",
  candidateNumber: "00000",
  office: "Vereador",
  party: "Partido Modelo",
  coalition: "",
  mainState: "RJ",
  mainCity: "Marica",
  electionYear: 2026,
  generalResponsible: "Coordenacao Geral",
  contactPhone: "(21) 99999-0000",
  contactEmail: "contato@campanha.local",
  generalVoteGoal: 7410,
  validatedVoteGoal: 7410,
  supporterGoal: 5000,
  leaderGoal: 180,
  startDate: "2026-05-01",
  electionDate: "2026-10-04",
  status: "active",
  notes: "Ambiente operacional para campanha, preparado para autenticacao, banco real e auditoria.",
};

export function isCampaignsSupabaseReady() {
  return isSupabaseConfigured;
}

export async function getCurrentCampaignSettings(campaignId = DEFAULT_CAMPAIGN_ID): Promise<CampaignSettings> {
  if (!isSupabaseConfigured) return DEFAULT_CAMPAIGN_SETTINGS;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .maybeSingle();

  if (error) throw createCampaignSettingsError(error);
  if (!data) return DEFAULT_CAMPAIGN_SETTINGS;

  return mapCampaignToSettings(data as Campaign);
}

export async function updateCurrentCampaignSettings(settings: CampaignSettings): Promise<CampaignSettings> {
  const supabase = getSupabaseClient();
  const payload = mapSettingsToCampaignUpdate(settings);

  const { data, error } = await supabase
    .from("campaigns")
    .update(payload)
    .eq("id", settings.id || DEFAULT_CAMPAIGN_ID)
    .select("*")
    .single();

  if (error) throw createCampaignSettingsError(error);
  return mapCampaignToSettings(data as Campaign);
}

function createCampaignSettingsError(error: unknown): Error {
  const message = getSupabaseErrorMessage(error);

  if (isCampaignSettingsSchemaError(message)) {
    return new Error(
      `A tabela campaigns ainda precisa receber os campos de configurações. Rode supabase/add-campaign-settings.sql no SQL Editor do Supabase e tente novamente. Detalhe: ${message}`,
    );
  }

  if (message) return new Error(message);
  return new Error("Não foi possível acessar as configurações da campanha no Supabase.");
}

function getSupabaseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "";

  const details = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
  return [details.message, details.details, details.hint, details.code]
    .filter(Boolean)
    .map(String)
    .join(" ");
}

function isCampaignSettingsSchemaError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("schema cache")
    || (normalized.includes("could not find") && normalized.includes("campaigns"))
    || (normalized.includes("column") && normalized.includes("campaigns"))
  );
}

function mapCampaignToSettings(campaign: Campaign): CampaignSettings {
  return {
    id: campaign.id,
    systemName: campaign.system_name || DEFAULT_CAMPAIGN_SETTINGS.systemName,
    name: campaign.name || DEFAULT_CAMPAIGN_SETTINGS.name,
    candidateName: campaign.candidate_name || DEFAULT_CAMPAIGN_SETTINGS.candidateName,
    candidateNumber: campaign.candidate_number || "",
    office: campaign.office || DEFAULT_CAMPAIGN_SETTINGS.office,
    party: campaign.party || "",
    coalition: campaign.coalition || "",
    mainState: campaign.main_state || DEFAULT_CAMPAIGN_SETTINGS.mainState,
    mainCity: campaign.main_city || DEFAULT_CAMPAIGN_SETTINGS.mainCity,
    electionYear: campaign.election_year || DEFAULT_CAMPAIGN_SETTINGS.electionYear,
    generalResponsible: campaign.general_responsible || DEFAULT_CAMPAIGN_SETTINGS.generalResponsible,
    contactPhone: campaign.contact_phone || DEFAULT_CAMPAIGN_SETTINGS.contactPhone,
    contactEmail: campaign.contact_email || DEFAULT_CAMPAIGN_SETTINGS.contactEmail,
    generalVoteGoal: campaign.general_vote_goal ?? DEFAULT_CAMPAIGN_SETTINGS.generalVoteGoal,
    validatedVoteGoal: campaign.validated_vote_goal ?? DEFAULT_CAMPAIGN_SETTINGS.validatedVoteGoal,
    supporterGoal: campaign.supporter_goal ?? DEFAULT_CAMPAIGN_SETTINGS.supporterGoal,
    leaderGoal: campaign.leader_goal ?? DEFAULT_CAMPAIGN_SETTINGS.leaderGoal,
    startDate: campaign.start_date || DEFAULT_CAMPAIGN_SETTINGS.startDate,
    electionDate: campaign.election_date || DEFAULT_CAMPAIGN_SETTINGS.electionDate,
    status: campaign.status || DEFAULT_CAMPAIGN_SETTINGS.status,
    notes: campaign.notes || DEFAULT_CAMPAIGN_SETTINGS.notes,
  };
}

function mapSettingsToCampaignUpdate(settings: CampaignSettings): CampaignUpdate {
  return {
    name: settings.name,
    system_name: settings.systemName,
    candidate_name: settings.candidateName,
    candidate_number: settings.candidateNumber || null,
    office: settings.office,
    party: settings.party || null,
    coalition: settings.coalition || null,
    main_state: settings.mainState,
    main_city: settings.mainCity,
    election_year: Number(settings.electionYear) || DEFAULT_CAMPAIGN_SETTINGS.electionYear,
    general_responsible: settings.generalResponsible,
    contact_phone: settings.contactPhone,
    contact_email: settings.contactEmail,
    general_vote_goal: Number(settings.generalVoteGoal) || 0,
    validated_vote_goal: Number(settings.validatedVoteGoal) || 0,
    supporter_goal: Number(settings.supporterGoal) || 0,
    leader_goal: Number(settings.leaderGoal) || 0,
    start_date: settings.startDate || null,
    election_date: settings.electionDate || null,
    status: settings.status || "active",
    notes: settings.notes || null,
  };
}
