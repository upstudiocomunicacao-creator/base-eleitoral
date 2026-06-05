import { StatusPill } from "@/components/common/StatusPill";

export function GeocodingStatusBadge({ status }: { status?: string | null }) {
  const normalized = (status ?? "pending").toLowerCase();
  if (normalized === "success") return <StatusPill label="Sucesso" tone="green" />;
  if (normalized === "approximate") return <StatusPill label="Aproximado" tone="amber" />;
  if (normalized === "failed") return <StatusPill label="Erro" tone="red" />;
  if (normalized === "manual") return <StatusPill label="Manual" tone="violet" />;
  if (normalized === "skipped") return <StatusPill label="Ignorado" tone="slate" />;
  return <StatusPill label="Pendente" tone="blue" />;
}
