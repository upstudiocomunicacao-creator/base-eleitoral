import { useGetMapaRJ } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, Users, Target, CheckCircle } from "lucide-react";

export default function MapaRJ() {
  const { data: municipios, isLoading } = useGetMapaRJ();
  
  const ativos = municipios?.filter(m => m.comAtuacao).length || 0;
  const inativos = (municipios?.length || 0) - ativos;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mapa Estado do RJ</h2>
        <p className="text-sm text-slate-500 font-medium">Visão geral de atuação nos municípios fluminenses. {ativos} municípios com atuação, {inativos} sem.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl"><CardContent className="p-6"><Skeleton className="h-32 w-full rounded-xl" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {municipios?.map((m, idx) => (
            <Card key={idx} className={`border border-slate-100 bg-white rounded-2xl overflow-hidden transition-all duration-200 ${m.comAtuacao ? 'hover:shadow-md hover:border-blue-200 shadow-sm' : 'opacity-60 grayscale-[30%] shadow-none'}`}>
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-bold text-slate-800 leading-tight">{m.nome}</CardTitle>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${m.comAtuacao ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {m.comAtuacao ? "Ativo" : "Sem atuação"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-y-5 gap-x-3 text-sm pt-2 border-t border-slate-50">
                  <div>
                    <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 uppercase tracking-wide mb-1"><Users className="w-3.5 h-3.5 text-blue-500" /> Lideranças</div>
                    <div className="font-bold text-slate-700">{m.liderancas}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 uppercase tracking-wide mb-1"><Map className="w-3.5 h-3.5 text-emerald-500" /> Apoiadores</div>
                    <div className="font-bold text-slate-700">{m.apoiadores}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 uppercase tracking-wide mb-1"><Target className="w-3.5 h-3.5 text-amber-500" /> Declarados</div>
                    <div className="font-bold text-slate-700">{m.votosDeclarados}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 uppercase tracking-wide mb-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Validados</div>
                    <div className="font-bold text-blue-600 text-lg leading-none">{m.votosValidados}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
