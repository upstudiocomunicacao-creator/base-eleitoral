type StatusTone = "slate" | "blue" | "emerald" | "amber" | "red" | "violet" | "green";

const toneClasses: Record<StatusTone, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-100",
  amber: "bg-amber-50 text-amber-800 border-amber-100 ring-amber-100",
  red: "bg-red-50 text-red-700 border-red-100 ring-red-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100 ring-violet-100",
  green: "bg-green-50 text-green-700 border-green-100 ring-green-100",
};

export function StatusPill({ label, tone = "slate" }: { label: string; tone?: StatusTone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ring-1 ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
