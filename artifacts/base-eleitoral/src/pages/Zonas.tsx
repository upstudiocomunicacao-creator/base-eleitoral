import { useListZonas } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Zonas() {
  const { data: zonas, isLoading } = useListZonas();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Zonas Eleitorais</h2>
          <p className="text-muted-foreground">Mapeamento de seções, colégios e metas de votos.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Zona/Seção
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Zona / Seção</TableHead>
                <TableHead>Local de Votação</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead className="text-right">Eleitores</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Validados</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : zonas?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma zona eleitoral cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                zonas?.map((zona) => (
                  <TableRow key={zona.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-gray-900">
                      {zona.zona} {zona.secao ? `/ ${zona.secao}` : ''}
                    </TableCell>
                    <TableCell className="text-gray-700">{zona.localVotacao}</TableCell>
                    <TableCell className="text-gray-600">{zona.bairro}</TableCell>
                    <TableCell className="text-right text-gray-600">{zona.totalEleitores}</TableCell>
                    <TableCell className="text-right text-gray-600">{zona.metaVotos}</TableCell>
                    <TableCell className="text-right font-bold text-blue-700">{zona.votosValidados}</TableCell>
                    <TableCell><Badge variant="outline">{zona.responsavel || 'Não definido'}</Badge></TableCell>
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