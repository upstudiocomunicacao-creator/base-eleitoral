import { getSupabaseClient } from "@/lib/supabaseClient";
import type { UserProfile } from "@/types/database";
import { createSupabaseServiceError } from "./supabaseErrors";

export async function getUserProfileByAuthUserId(authUserId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users_profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw createUserProfileError(error);

  return data;
}

export async function listUserProfiles(): Promise<UserProfile[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users_profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw createUserProfileError(error);

  return data ?? [];
}

export async function updateUserProfile(
  id: string,
  changes: Partial<Pick<UserProfile, "full_name" | "phone" | "avatar_url" | "role" | "status" | "linked_state" | "linked_city" | "linked_neighborhood">>,
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users_profiles")
    .update(changes)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw createUserProfileError(error);

  return data;
}

function createUserProfileError(error: unknown) {
  return createSupabaseServiceError(error, {
    tableName: "users_profiles",
    setupSql: "supabase/schema.sql",
    fallbackMessage: "Não foi possível acessar o perfil do usuário no Supabase.",
  });
}
