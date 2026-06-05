import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { canViewSensitiveData } from "@/lib/permissions";

type SensitiveKind = "phone" | "email" | "generic";

export function SensitiveText({
  value,
  kind = "generic",
  fallback = "-",
}: {
  value?: string | null;
  kind?: SensitiveKind;
  fallback?: ReactNode;
}) {
  const { profile } = useAuth();

  if (!value) return <>{fallback}</>;
  if (canViewSensitiveData(profile)) return <>{value}</>;

  return <>{maskSensitiveValue(value, kind)}</>;
}

export function maskSensitiveValue(value: string, kind: SensitiveKind = "generic") {
  if (kind === "phone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 4) return "***";
    return `${value.slice(0, 4)} *****-${digits.slice(-2)}`;
  }

  if (kind === "email") {
    const [name, domain] = value.split("@");
    if (!domain) return "****";
    return `${name.slice(0, 2)}***@${domain}`;
  }

  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}
