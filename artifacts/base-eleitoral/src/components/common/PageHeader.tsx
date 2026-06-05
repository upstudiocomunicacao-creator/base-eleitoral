import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-white/70 bg-white/70 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:p-5">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-2 inline-flex rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm font-medium leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
