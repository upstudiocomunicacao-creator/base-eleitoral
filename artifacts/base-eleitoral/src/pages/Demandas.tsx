import { useListDemandas } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle2, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Demandas() {
  const { data: demandas, isLoading } = useListDemandas();

  const counts = {
    alta: demandas?.filter(d => d.prioridade === 'Alta').length || 0,
    media: demandas?.filter(d => d.prioridade === 'Média').length || 0,
    baixa: demandas?.filter(d => d.prioridade === 'Baixa').length || 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Demandas da População</h2>
          <p className="text-sm text-slate-500 font-medium">Gestão de solicitações e necessidades locais.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Demanda
        </Button>
      </div>

      <div className="flex gap-4">
         <div className="bg-white rounded-xl shadow-sm border-0 px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-slate-600">Alta prioridade: <span className="text-slate-900">{counts.alta}</span></span>
         </div>
         <div className="bg-white rounded-xl shadow-sm border-0 px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-slate-600">Média: <span className="text-slate-900">{counts.media}</span></span>
         </div>
         <div className="bg-white rounded-xl shadow-sm border-0 px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-slate-600">Baixa: <span className="text-slate-900">{counts.baixa}</span></span>
         </div>
      </div>

      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold py-4 px-6">Tipo de Demanda</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Bairro</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Solicitante</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Responsável</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Prioridade</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : demandas?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-16 px-8 flex flex-col items-center justify-center">
                      <p className="text-slate-500 font-medium">Nenhuma demanda cadastrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                demandas?.map((demanda) => (
                  <TableRow key={demanda.id} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                    <TableCell className="px-6 py-4">
                      <span className="font-semibold text-slate-900 border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white">
                        {demanda.tipoDemanda}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">{demanda.bairro}</TableCell>
                    <TableCell className="text-slate-600">{demanda.pessoaVinculada || '-'}</TableCell>
                    <TableCell className="text-slate-600">{demanda.responsavel || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${demanda.prioridade === 'Alta' ? 'bg-red-500' : demanda.prioridade === 'Média' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="font-medium text-slate-700 text-sm">{demanda.prioridade}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5">
                         {demanda.status === 'Resolvida' ? (
                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                         ) : (
                           <Circle className="h-4 w-4 text-slate-300" />
                         )}
                         <span className={`text-sm font-semibold ${demanda.status === 'Resolvida' ? 'text-emerald-700' : 'text-slate-600'}`}>
                           {demanda.status}
                         </span>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
