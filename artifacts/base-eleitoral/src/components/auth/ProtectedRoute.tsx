import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading, profile, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="app-surface flex min-h-screen items-center justify-center p-6">
        <div className="rounded-lg border border-white/70 bg-white/80 px-5 py-4 text-sm font-bold text-slate-700 shadow-sm">
          Carregando acesso...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!profile) {
    return (
      <div className="app-surface flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-lg border border-amber-200 bg-white p-6 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-950">
            Usuário autenticado, mas sem perfil cadastrado
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            Solicite acesso ao administrador. O login foi confirmado pelo Supabase Auth, mas ainda não existe um
            registro correspondente em users_profiles para liberar os módulos do sistema.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" /> Sair
            </Button>
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> Auth conectado
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
