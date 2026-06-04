import { useListZonas } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Zonas() {
  const { data: zonas, isLoading } = useListZonas();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Zonas Eleitorais</h2>
          <p className="text-sm text-slate-500 font-medium">Mapeamento de seções, colégios e metas de votos.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Zona/Seção
        </Button>
      </div>

      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold py-4 px-6">Zona / Seção</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Local de Votação</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Bairro</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Eleitores</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Meta</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Validados</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : zonas?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-16 px-8 flex flex-col items-center justify-center">
                      <p className="text-slate-500 font-medium">Nenhuma zona eleitoral cadastrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                zonas?.map((zona) => (
                  <TableRow key={zona.id} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                    <TableCell className="px-6 py-4 font-bold text-slate-900">
                      {zona.zona} {zona.secao ? <span className="text-slate-400 font-normal">/ {zona.secao}</span> : ''}
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium">{zona.localVotacao}</TableCell>
                    <TableCell className="text-slate-600">{zona.bairro}</TableCell>
                    <TableCell className="text-right text-slate-600 font-medium">{zona.totalEleitores.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-slate-600 font-medium">{zona.metaVotos.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-blue-600 text-lg leading-none">{zona.votosValidados.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                        {zona.responsavel || 'Não definido'}
                      </span>
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
