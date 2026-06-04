import { useListProspeccao } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MapPin, Clock } from "lucide-react";

export default function Prospeccao() {
  const { data: pipeline, isLoading } = useListProspeccao();

  const columns = [
    { id: "novoContato", title: "Novo Contato", items: pipeline?.novoContato || [], color: "slate" },
    { id: "primeiroAtendimento", title: "1º Atendimento", items: pipeline?.primeiroAtendimento || [], color: "blue" },
    { id: "simpatizante", title: "Simpatizante", items: pipeline?.simpatizante || [], color: "amber" },
    { id: "apoiadorConfirmado", title: "Confirmado", items: pipeline?.apoiadorConfirmado || [], color: "emerald" },
    { id: "multiplicador", title: "Multiplicador", items: pipeline?.multiplicador || [], color: "violet" },
    { id: "votoValidado", title: "Voto Validado", items: pipeline?.votoValidado || [], color: "green" },
  ];

  const getColorClasses = (color: string) => {
    const map: Record<string, { bg: string, text: string, borderTop: string, badgeBg: string }> = {
      slate: { bg: "bg-slate-100", text: "text-slate-700", borderTop: "bg-slate-400", badgeBg: "bg-slate-200" },
      blue: { bg: "bg-blue-100", text: "text-blue-700", borderTop: "bg-blue-400", badgeBg: "bg-blue-200" },
      amber: { bg: "bg-amber-100", text: "text-amber-700", borderTop: "bg-amber-400", badgeBg: "bg-amber-200" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-700", borderTop: "bg-emerald-400", badgeBg: "bg-emerald-200" },
      violet: { bg: "bg-violet-100", text: "text-violet-700", borderTop: "bg-violet-400", badgeBg: "bg-violet-200" },
      green: { bg: "bg-green-100", text: "text-green-700", borderTop: "bg-green-400", badgeBg: "bg-green-200" },
    };
    return map[color] || map.slate;
  };

  return (
    <div className="space-y-8 h-[calc(100vh-10rem)] flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Prospecção de Eleitores</h2>
        <p className="text-sm text-slate-500 font-medium">Pipeline de contato e engajamento eleitoral.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 bg-slate-100/60 p-4 rounded-3xl">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-80 shrink-0 bg-white/80 backdrop-blur rounded-2xl shadow-sm border-0 p-3 flex flex-col gap-3">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ))
        ) : (
          columns.map(col => {
            const colors = getColorClasses(col.color);
            return (
              <div key={col.id} className="w-80 shrink-0 bg-white/80 backdrop-blur rounded-2xl shadow-sm border-0 p-3 flex flex-col max-h-full">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className={`font-semibold text-sm uppercase tracking-wide ${colors.text}`}>{col.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${colors.badgeBg} ${colors.text}`}>
                    {col.items.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 px-1">
                  {col.items.map(prospecto => (
                    <div key={prospecto.id} className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-100 hover:border-blue-200 transition-all cursor-grab flex flex-col relative overflow-hidden group">
                      <div className={`h-1 w-full absolute top-0 left-0 ${colors.borderTop}`} />
                      <div className="p-4 pt-5 space-y-3">
                        <div className="font-semibold text-slate-800 text-sm">{prospecto.nome}</div>
                        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                          {prospecto.telefone && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {prospecto.telefone}</div>}
                          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {prospecto.bairro}</div>
                          {prospecto.dataContato && <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {prospecto.dataContato}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
