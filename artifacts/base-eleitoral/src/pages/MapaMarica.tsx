import { useGetMapaMarica } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Target, CheckCircle } from "lucide-react";

export default function MapaMarica() {
  const { data: bairros, isLoading } = useGetMapaMarica();
  
  const mediaCobertura = bairros ? (bairros.reduce((acc, b) => acc + b.cobertura, 0) / bairros.length).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mapa Maricá</h2>
        <p className="text-sm text-slate-500 font-medium">Cobertura e prioridades por bairro em Maricá. {bairros?.length || 0} bairros · {mediaCobertura}% cobertura média.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl"><CardContent className="p-6"><Skeleton className="h-40 w-full rounded-xl" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bairros?.map((b, idx) => {
            const barColor = b.cobertura < 2 ? 'bg-red-500' : b.cobertura < 4 ? 'bg-amber-400' : 'bg-emerald-500';
            return (
              <Card key={idx} className="border-0 bg-white shadow-sm hover:shadow-md hover:border-blue-200 border border-transparent transition-all duration-200 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 px-5 pt-5">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold text-slate-800 leading-tight">{b.nome}</CardTitle>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${
                      b.prioridade === 'Alta' ? 'bg-red-100 text-red-700' :
                      b.prioridade === 'Média' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {b.prioridade}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 px-5 pb-5">
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl">
                    <div className="flex justify-between text-xs text-slate-500 font-semibold uppercase tracking-wide">
                      <span>Cobertura</span>
                      <span className="font-bold text-slate-700">{b.cobertura}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                       <div className={`h-full ${barColor}`} style={{ width: `${b.cobertura}%` }} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
                    <div className="border-r border-slate-100 pr-2">
                      <div className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5 uppercase tracking-wide mb-1"><Users className="w-3.5 h-3.5 text-blue-500" /> Lideranças</div>
                      <div className="font-bold text-slate-700">{b.liderancas}</div>
                    </div>
                    <div className="pl-1">
                      <div className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5 uppercase tracking-wide mb-1"><Users className="w-3.5 h-3.5 text-emerald-500" /> Apoiadores</div>
                      <div className="font-bold text-slate-700">{b.apoiadores}</div>
                    </div>
                    <div className="border-r border-slate-100 pr-2 pt-2 border-t">
                      <div className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5 uppercase tracking-wide mb-1"><Target className="w-3.5 h-3.5 text-amber-500" /> Declarados</div>
                      <div className="font-bold text-slate-700">{b.votosDeclarados}</div>
                    </div>
                    <div className="pl-1 pt-2 border-t border-slate-100">
                      <div className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5 uppercase tracking-wide mb-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Validados</div>
                      <div className="font-bold text-blue-600 text-lg leading-none">{b.votosValidados}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
