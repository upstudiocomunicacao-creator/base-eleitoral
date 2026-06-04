import { useGetComparativo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Comparativo() {
  const { data: comparativo, isLoading } = useGetComparativo();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Comparativo Eleitoral</h2>
        <p className="text-muted-foreground">Análise de desempenho e metas por bairro.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados Comparativos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 border-t">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Bairro</TableHead>
                <TableHead className="text-right">Eleitores</TableHead>
                <TableHead className="text-right">Apoiadores</TableHead>
                <TableHead className="text-right">Votos Validados</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Dist. Meta</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Cobertura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  </TableRow>
                ))
              ) : (
                comparativo?.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{item.bairro}</TableCell>
                    <TableCell className="text-right text-gray-600">{item.eleitores}</TableCell>
                    <TableCell className="text-right text-gray-600">{item.apoiadoresCadastrados}</TableCell>
                    <TableCell className="text-right font-bold text-blue-700">{item.votosValidados}</TableCell>
                    <TableCell className="text-right text-gray-600">{item.meta}</TableCell>
                    <TableCell className="text-right text-red-600 font-medium">{item.distanciaMeta}</TableCell>
                    <TableCell>
                      <Badge className={
                        item.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                        item.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {item.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{item.cobertura}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cobertura por Bairro (%)</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoading ? <Skeleton className="h-full w-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativo} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="bairro" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cobertura" name="Cobertura %" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}