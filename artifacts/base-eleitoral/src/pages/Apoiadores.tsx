import { useState } from "react";
import { useListApoiadores } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function Apoiadores() {
  const { data: apoiadores, isLoading } = useListApoiadores();
  const [search, setSearch] = useState("");

  const filtered = apoiadores?.filter(a => 
    a.nome.toLowerCase().includes(search.toLowerCase()) || 
    a.bairro.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Apoiadores</h2>
          <p className="text-muted-foreground">Base de contatos, voluntários e simpatizantes.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Apoiador
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
                <TableHead>Telefone</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confiança</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum apoiador encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((apoiador) => (
                  <TableRow key={apoiador.id} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-medium text-gray-900">{apoiador.nome}</TableCell>
                    <TableCell className="text-gray-600">{apoiador.telefone || '-'}</TableCell>
                    <TableCell className="text-gray-600">{apoiador.bairro}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-gray-100">{apoiador.tipoPessoa}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        apoiador.statusPolitico.includes('Confirmado') ? 'bg-green-100 text-green-800' :
                        apoiador.statusPolitico.includes('Prioridade') ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {apoiador.statusPolitico}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{apoiador.nivelConfianca}</Badge>
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