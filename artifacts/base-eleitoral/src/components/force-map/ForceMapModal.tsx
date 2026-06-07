import { CheckCircle2 } from "lucide-react";
import { StatusPill } from "@/components/common/StatusPill";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getStatusTone, toneClasses } from "./forceMapStyles";
import type { ForceNode } from "./types";

type ForceMapModalProps = {
  node?: ForceNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ForceMapModal({ node, open, onOpenChange }: ForceMapModalProps) {
  if (!node) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const tone = toneClasses[node.tone];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-0 bg-slate-50 p-0 sm:max-w-xl">
        <SheetHeader className={`bg-gradient-to-br ${tone.gradient} p-6 pb-8 text-white`}>
          <SheetTitle className="flex items-center gap-3 text-2xl font-extrabold text-white">
            <div className="rounded-lg bg-white/15 p-2 ring-1 ring-white/20">
              <node.icon className="h-6 w-6 text-white" />
            </div>
            {node.title}
          </SheetTitle>
          <SheetDescription className="text-sm font-medium leading-6 text-white/82">{node.summary}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="-mt-4 rounded-lg border border-slate-100 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{node.countLabel}</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">{node.count}</div>
              </div>
              <StatusPill label={node.status} tone={getStatusTone(node.status)} />
            </div>

            {node.progress ? (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  <span>{node.progress.label}</span>
                  <span>{node.progress.value}%</span>
                </div>
                <Progress value={node.progress.value} className="h-2 bg-slate-100 [&>div]:bg-blue-600" />
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Resumo do bloco</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {node.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{metric.label}</div>
                  <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">{metric.value}</div>
                  {metric.helper ? <div className="mt-1 text-xs font-medium text-slate-500">{metric.helper}</div> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Leitura estratégica</div>
            <div className="space-y-2">
              {node.insights.map((insight) => (
                <div key={insight} className="flex gap-2 text-sm font-semibold leading-6 text-blue-950">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium leading-6 text-slate-600">
            Este fluxo reflete a versão enxuta: coordenações, lideranças, votos estimados, centro de custos e leitura territorial por cidade ou bairro.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
