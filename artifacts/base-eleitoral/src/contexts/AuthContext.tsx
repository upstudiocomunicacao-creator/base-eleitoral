import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getCurrentSession, signInWithPassword, signOut as signOutService } from "@/services/auth";
import { getUserProfileByAuthUserId } from "@/services/userProfiles";
import type { UserProfile } from "@/types/database";

type SignInResult = { error: string | null };

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser || !isSupabaseConfigured) {
      setProfile(null);
      return;
    }

    const currentProfile = await getUserProfileByAuthUserId(currentUser.id);
    setProfile(currentProfile);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const current = await getCurrentSession();
        if (!active) return;
        setUser(current.user);
        setSession(current.session);
        await loadProfile(current.user);
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrap();

    if (!isSupabaseConfigured) {
      return () => {
        active = false;
      };
    }

    const supabase = getSupabaseClient();
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      void loadProfile(nextUser);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    setLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      setUser(result.user);
      setSession(result.session);
      await loadProfile(result.user);
      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error) };
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOutService();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    loading,
    isAuthenticated: Boolean(user && session),
    isConfigured: isSupabaseConfigured,
    signIn,
    signOut,
    refreshProfile,
  }), [loading, profile, refreshProfile, session, signIn, signOut, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function formatAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha inválidos. Confira os dados e tente novamente.";
  }

  if (normalized.includes("email not confirmed")) {
    return "E-mail ainda não confirmado. Verifique a caixa de entrada antes de entrar.";
  }

  if (normalized.includes("rate limit")) {
    return "Muitas tentativas em sequência. Aguarde um pouco e tente novamente.";
  }

  return message || "Não foi possível entrar.";
}
