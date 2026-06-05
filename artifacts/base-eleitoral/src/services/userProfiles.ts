import { getSupabaseClient } from "@/lib/supabaseClient";
import type { UserProfile } from "@/types/database";

export async function getUserProfileByAuthUserId(authUserId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users_profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function listUserProfiles(): Promise<UserProfile[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users_profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function updateUserProfile(
  id: string,
  changes: Partial<Pick<UserProfile, "full_name" | "phone" | "role" | "status" | "linked_state" | "linked_city" | "linked_neighborhood">>,
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users_profiles")
    .update(changes)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}
