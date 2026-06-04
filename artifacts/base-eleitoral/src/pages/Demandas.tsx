import { useListDemandas } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Demandas() {
  const { data: demandas, isLoading } = useListDemandas();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Demandas da População</h2>
          <p className="text-muted-foreground">Gestão de solicitações e necessidades locais.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Demanda
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Tipo de Demanda</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : demandas?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhuma demanda cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                demandas?.map((demanda) => (
                  <TableRow key={demanda.id} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-medium text-gray-900">{demanda.tipoDemanda}</TableCell>
                    <TableCell className="text-gray-600">{demanda.bairro}</TableCell>
                    <TableCell className="text-gray-600">{demanda.pessoaVinculada || '-'}</TableCell>
                    <TableCell className="text-gray-600">{demanda.responsavel || '-'}</TableCell>
                    <TableCell>
                      <Badge className={
                        demanda.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                        demanda.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {demanda.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        demanda.status === 'Resolvida' ? 'bg-green-50 border-green-200 text-green-700' :
                        demanda.status === 'Em andamento' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        'bg-gray-50 border-gray-200'
                      }>
                        {demanda.status}
                      </Badge>
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