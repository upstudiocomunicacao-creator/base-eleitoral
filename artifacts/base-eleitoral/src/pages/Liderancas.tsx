import { useState } from "react";
import { useListLiderancas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function Liderancas() {
  const { data: liderancas, isLoading } = useListLiderancas();
  const [search, setSearch] = useState("");

  const filtered = liderancas?.filter(l => 
    l.nome.toLowerCase().includes(search.toLowerCase()) || 
    (l.bairro && l.bairro.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lideranças</h2>
          <p className="text-muted-foreground">Gestão de coordenadores e lideranças territoriais.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Liderança
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Buscar por nome ou bairro..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-md border-0 shadow-none focus-visible:ring-0 px-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localidade</TableHead>
                <TableHead className="text-right">Votos Est.</TableHead>
                <TableHead className="text-right">Votos Val.</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma liderança encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lideranca) => (
                  <TableRow key={lideranca.id} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-medium text-gray-900">{lideranca.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-gray-100">{lideranca.tipoLideranca}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{lideranca.bairro}</TableCell>
                    <TableCell className="text-right text-gray-600">{lideranca.apoiadoresEstimadosDiretos}</TableCell>
                    <TableCell className="text-right font-semibold text-blue-700">{lideranca.votosValidados}</TableCell>
                    <TableCell>
                      <Badge className={
                        lideranca.grauConfianca === 'alto' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                        lideranca.grauConfianca === 'médio' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                        'bg-red-100 text-red-800 hover:bg-red-100'
                      }>
                        {lideranca.grauConfianca}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{lideranca.status}</Badge>
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