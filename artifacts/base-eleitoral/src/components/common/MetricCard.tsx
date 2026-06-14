import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type MetricTone = "blue" | "emerald" | "violet" | "amber" | "green" | "cyan" | "indigo" | "rose" | "orange" | "red";

const toneClasses: Record<MetricTone, { icon: string; iconBg: string; border: string }> = {
  blue: { icon: "text-blue-600", iconBg: "bg-blue-50", border: "border-t-blue-500" },
  emerald: { icon: "text-emerald-600", iconBg: "bg-emerald-50", border: "border-t-emerald-500" },
  violet: { icon: "text-violet-600", iconBg: "bg-violet-50", border: "border-t-violet-500" },
  amber: { icon: "text-amber-600", iconBg: "bg-amber-50", border: "border-t-amber-500" },
  green: { icon: "text-green-600", iconBg: "bg-green-50", border: "border-t-green-500" },
  cyan: { icon: "text-cyan-600", iconBg: "bg-cyan-50", border: "border-t-cyan-500" },
  indigo: { icon: "text-indigo-600", iconBg: "bg-indigo-50", border: "border-t-indigo-500" },
  rose: { icon: "text-rose-600", iconBg: "bg-rose-50", border: "border-t-rose-500" },
  orange: { icon: "text-orange-600", iconBg: "bg-orange-50", border: "border-t-orange-500" },
  red: { icon: "text-red-600", iconBg: "bg-red-50", border: "border-t-red-500" },
};

type MetricCardProps = {
  label: string;
  value: number | string | null;
  icon: LucideIcon;
  tone?: MetricTone;
  loading?: boolean;
  helper?: string;
};

export function MetricCard({ label, value, icon: Icon, tone = "blue", loading = false, helper }: MetricCardProps) {
  const classes = toneClasses[tone];
  const displayValue =
    typeof value === "number" ? value.toLocaleString("pt-BR") : value ?? "-";
  const valueText = String(displayValue);
  const valueSize =
    valueText.length > 16 ? "text-lg" : valueText.length > 9 ? "text-xl" : "text-2xl";

  return (
    <Card className={`premium-card premium-card-hover overflow-hidden border-t-4 ${classes.border}`}>
      <CardContent className="flex min-h-[132px] flex-col p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${classes.iconBg} ring-1 ring-black/5`}>
            <Icon className={`h-4 w-4 ${classes.icon}`} />
          </div>
        </div>
        {loading ? (
          <Skeleton className="mb-1 h-8 w-20" />
        ) : (
          <div className={`${valueSize} max-w-full break-words font-extrabold leading-tight tracking-tight text-slate-950 [overflow-wrap:anywhere]`} title={valueText}>{displayValue}</div>
        )}
        <div className="mt-1.5 max-w-full break-words text-xs font-bold uppercase leading-snug tracking-[0.08em] text-slate-500 [overflow-wrap:anywhere]" title={label}>{label}</div>
        {helper ? <div className="mt-2 max-w-full break-words text-xs font-medium leading-snug text-slate-400 [overflow-wrap:anywhere]">{helper}</div> : null}
      </CardContent>
    </Card>
  );
}
