import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/permissions";

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const email = user?.email ?? profile?.email ?? "";
  const name = profile?.full_name ?? email ?? "Usuário";
  const role = profile ? getRoleLabel(profile.role) : "Sem perfil";

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="min-w-0 text-right">
        <div className="max-w-32 truncate text-xs font-extrabold text-slate-900 sm:max-w-44 sm:text-sm">{name}</div>
        <div className="max-w-32 truncate text-[11px] font-semibold text-slate-500 sm:max-w-44">
          {role} ? {email}
        </div>
      </div>
      <div className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm sm:flex">
        <UserRound className="h-4 w-4" />
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
        title="Sair"
        aria-label="Sair"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
