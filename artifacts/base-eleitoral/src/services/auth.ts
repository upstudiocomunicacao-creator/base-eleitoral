import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

export type AuthSession = {
  user: User | null;
  session: Session | null;
};

export async function getCurrentSession(): Promise<AuthSession> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return {
    user: data.session?.user ?? null,
    session: data.session ?? null,
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user;
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;

  return {
    user: data.user,
    session: data.session,
  };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function sendPasswordReset(email: string, redirectTo: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) throw error;
}
