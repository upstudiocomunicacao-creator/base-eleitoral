import { useState } from "react";
import { useListApoiadores } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Apoiadores</h2>
          <p className="text-sm text-slate-500 font-medium">{filtered.length} apoiadores cadastrados</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all">
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Apoiador
        </Button>
      </div>

      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden p-2 flex items-center max-w-md">
        <Search className="h-5 w-5 text-slate-400 ml-3 mr-2" />
        <Input 
          placeholder="Buscar por nome ou bairro..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 px-0 flex-1"
        />
      </Card>

      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold py-4 px-6">Nome</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Telefone</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Bairro</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Tipo</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Confiança</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-48 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-16 px-8 flex flex-col items-center justify-center">
                      <p className="text-slate-500 font-medium">Nenhum apoiador encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((apoiador) => (
                  <TableRow key={apoiador.id} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {apoiador.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{apoiador.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{apoiador.telefone || '-'}</TableCell>
                    <TableCell className="text-slate-600">{apoiador.bairro}</TableCell>
                    <TableCell>
                       <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                         apoiador.tipoPessoa === 'Simpatizante' ? 'bg-blue-100 text-blue-800' :
                         apoiador.tipoPessoa === 'Multiplicador' ? 'bg-violet-100 text-violet-800' :
                         'bg-slate-100 text-slate-800'
                       }`}>
                         {apoiador.tipoPessoa}
                       </span>
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        apoiador.statusPolitico.includes('Confirmado') ? 'bg-emerald-100 text-emerald-800' :
                        apoiador.statusPolitico.includes('Prioridade') ? 'bg-red-100 text-red-800' :
                        apoiador.statusPolitico.includes('Indeciso') ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {apoiador.statusPolitico}
                      </span>
                    </TableCell>
                    <TableCell>
                       <span className="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600">
                         {apoiador.nivelConfianca}
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
