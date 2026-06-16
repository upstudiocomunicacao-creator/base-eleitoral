import { ChangeEvent, useRef, useState } from "react";
import { Camera, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { getRoleLabel } from "@/lib/permissions";
import { updateUserProfile } from "@/services/userProfiles";

export function UserMenu() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const email = user?.email ?? profile?.email ?? "";
  const name = profile?.full_name ?? email ?? "Usuário";
  const role = profile ? getRoleLabel(profile.role) : "Sem perfil";
  const metadata = user?.user_metadata as { avatar_url?: string; picture?: string } | undefined;
  const avatarUrl = profile?.avatar_url ?? metadata?.avatar_url ?? metadata?.picture ?? "";
  const subtitle = [role, email].filter(Boolean).join(" - ");

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!profile?.id) {
      toast({
        title: "Perfil não encontrado",
        description: "Entre novamente ou peça para validar seu perfil antes de trocar a foto.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Escolha uma imagem em JPG, PNG ou WebP.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingAvatar(true);
      const avatarDataUrl = await resizeAvatar(file);
      await updateUserProfile(profile.id, { avatar_url: avatarDataUrl });
      await refreshProfile();
      toast({ title: "Foto atualizada", description: "Seu avatar foi salvo no perfil." });
    } catch (error) {
      toast({
        title: "Não foi possível trocar a foto",
        description: error instanceof Error ? error.message : "Tente usar uma imagem menor.",
        variant: "destructive",
      });
    } finally {
      setSavingAvatar(false);
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="min-w-0 text-right">
        <div className="max-w-32 truncate text-xs font-extrabold text-slate-900 sm:max-w-44 sm:text-sm">{name}</div>
        <div className="max-w-32 truncate text-[11px] font-semibold text-slate-500 sm:max-w-44">
          {subtitle}
        </div>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={savingAvatar}
        className="group relative hidden h-9 w-9 rounded-lg outline-none transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait sm:block"
        title="Trocar foto do perfil"
        aria-label="Trocar foto do perfil"
      >
        <Avatar className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm">
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
          <AvatarFallback className="rounded-lg bg-blue-50 text-xs font-extrabold text-blue-700">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 hidden items-center justify-center rounded-lg bg-slate-950/55 text-white opacity-0 transition group-hover:flex group-hover:opacity-100">
          <Camera className="h-4 w-4" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />
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

function resizeAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => {
      image.onload = () => {
        const size = 192;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Não foi possível preparar a imagem."));
          return;
        }

        const shortestSide = Math.min(image.width, image.height);
        const sourceX = (image.width - shortestSide) / 2;
        const sourceY = (image.height - shortestSide) / 2;

        canvas.width = size;
        canvas.height = size;
        context.drawImage(image, sourceX, sourceY, shortestSide, shortestSide, 0, 0, size, size);

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.onerror = () => reject(new Error("Formato de imagem não reconhecido."));
      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}
