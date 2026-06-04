import { useState } from "react";
import { useListLiderancas } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Lideranças</h2>
          <p className="text-sm text-slate-500 font-medium">{filtered.length} lideranças cadastradas</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Liderança
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
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold py-4 px-6">Liderança</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Tipo</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Localidade</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Votos Est.</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Votos Val.</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Confiança</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-48 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-16 px-8 flex flex-col items-center justify-center">
                       <p className="text-slate-500 font-medium">Nenhuma liderança encontrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lideranca) => (
                  <TableRow key={lideranca.id} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {lideranca.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{lideranca.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{lideranca.tipoLideranca}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{lideranca.bairro}</span>
                    </TableCell>
                    <TableCell className="text-right text-slate-600 font-medium">{lideranca.apoiadoresEstimadosDiretos}</TableCell>
                    <TableCell className="text-right font-bold text-blue-700">{lideranca.votosValidados}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        lideranca.grauConfianca === 'alto' ? 'bg-emerald-100 text-emerald-800' :
                        lideranca.grauConfianca === 'médio' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lideranca.grauConfianca}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        lideranca.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {lideranca.status}
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
