import { getSupabaseClient } from "@/lib/supabaseClient";
import type { UserProfile } from "@/types/database";

export type InviteCampaignUserInput = {
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  linkedState: string | null;
  linkedCity: string | null;
  linkedNeighborhood: string | null;
  redirectTo: string;
};

export type InviteCampaignUserResult = {
  authUserId: string;
  profile: UserProfile;
};

export async function inviteCampaignUser(input: InviteCampaignUserInput): Promise<InviteCampaignUserResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke("invite-user", {
    body: input,
  });

  if (error) {
    throw new Error(error.message || "Não foi possível convidar o usuário.");
  }

  return data as InviteCampaignUserResult;
}
