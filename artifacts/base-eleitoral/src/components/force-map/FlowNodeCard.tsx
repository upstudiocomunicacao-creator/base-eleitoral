import { motion } from "framer-motion";
import { StatusPill } from "@/components/common/StatusPill";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getStatusTone, toneClasses } from "./forceMapStyles";
import type { ForceNode } from "./types";

type FlowNodeCardProps = {
  node: ForceNode;
  selected: boolean;
  index: number;
  onClick: () => void;
};

export function FlowNodeCard({ node, selected, index, onClick }: FlowNodeCardProps) {
  const tone = toneClasses[node.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      className="relative w-full md:w-68"
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
        className={cn(
          "group relative h-full cursor-pointer overflow-hidden rounded-lg bg-white shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_18px_44px_rgba(37,99,235,0.16)]",
          selected ? "border-blue-400 ring-4 ring-blue-100" : "border-slate-200",
        )}
      >
        <div className={cn("h-1.5 bg-gradient-to-r", tone.gradient)} />
        <CardContent className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg shadow-slate-950/15", tone.gradient)}>
              <node.icon className="h-5 w-5" />
            </div>
            <StatusPill label={node.status} tone={getStatusTone(node.status)} />
          </div>

          <div>
            <div className="text-sm font-extrabold leading-tight text-slate-950">{node.title}</div>
            <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500">{node.subtitle}</p>
          </div>

          <div className={cn("mt-auto rounded-lg border p-3", tone.soft, tone.border)}>
            <div className="text-2xl font-extrabold leading-none tracking-tight text-slate-950">{node.count}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{node.countLabel}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
