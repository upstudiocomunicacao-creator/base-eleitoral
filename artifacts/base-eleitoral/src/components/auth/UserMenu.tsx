import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/permissions";

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const email = user?.email ?? profile?.email ?? "";
  const name = profile?.full_name ?? email ?? "Usuário";
  const role = profile ? getRoleLabel(profile.role) : "Sem perfil";
  const metadata = user?.user_metadata as { avatar_url?: string; picture?: string } | undefined;
  const avatarUrl = profile?.avatar_url ?? metadata?.avatar_url ?? metadata?.picture ?? "";
  const subtitle = [role, email].filter(Boolean).join(" - ");

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="min-w-0 text-right">
        <div className="max-w-32 truncate text-xs font-extrabold text-slate-900 sm:max-w-44 sm:text-sm">{name}</div>
        <div className="max-w-32 truncate text-[11px] font-semibold text-slate-500 sm:max-w-44">
          {subtitle}
        </div>
      </div>
      <Avatar className="hidden h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm sm:flex">
        <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
        <AvatarFallback className="rounded-lg bg-blue-50 text-xs font-extrabold text-blue-700">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
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

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}
