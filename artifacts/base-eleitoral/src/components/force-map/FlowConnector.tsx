export function FlowConnector({ branch = false }: { branch?: boolean }) {
  return (
    <div className="flex h-10 flex-col items-center justify-center md:h-12" aria-hidden="true">
      <div className="h-8 border-l-2 border-dashed border-blue-200 md:h-10" />
      <div className="h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500 shadow-md shadow-blue-600/25" />
      {branch ? <div className="hidden h-4 border-l-2 border-dashed border-blue-200 md:block" /> : null}
    </div>
  );
}

export function BranchConnector() {
  return (
    <div className="absolute left-1/2 top-[-22px] hidden h-[22px] w-[calc(100%-16rem)] -translate-x-1/2 border-x-2 border-t-2 border-dashed border-blue-200 md:block" />
  );
}
