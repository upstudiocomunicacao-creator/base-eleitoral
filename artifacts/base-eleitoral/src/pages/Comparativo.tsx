import { useGetComparativo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <div className="font-semibold text-slate-700 mb-2">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.fill || '#3b82f6' }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function Comparativo() {
  const { data: comparativo, isLoading } = useGetComparativo();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Comparativo Eleitoral</h2>
        <p className="text-sm text-slate-500 font-medium">Análise de desempenho e metas por bairro.</p>
      </div>

      <Card className="border-0 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-white">
          <CardTitle className="text-lg font-bold text-slate-800">Dados Comparativos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold py-4 px-6">Bairro</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Eleitores</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Apoiadores</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Validados</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Meta</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold text-right">Dist. Meta</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Prioridade</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Cobertura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : (
                comparativo?.map((item, idx) => {
                  const pctMeta = Math.min(100, Math.round((item.votosValidados / item.meta) * 100));
                  return (
                    <TableRow key={idx} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                      <TableCell className="font-semibold text-slate-900 px-6 py-4">{item.bairro}</TableCell>
                      <TableCell className="text-right text-slate-600 font-medium">{item.eleitores.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-slate-600 font-medium">{item.apoiadoresCadastrados.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold text-blue-600">{item.votosValidados.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-slate-500">{item.meta.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-semibold ${item.distanciaMeta > 200 ? 'text-red-600' : item.distanciaMeta > 50 ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {item.distanciaMeta > 0 ? `-${item.distanciaMeta.toLocaleString()}` : 'Meta Atingida'}
                      </TableCell>
                      <TableCell>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.prioridade === 'Alta' ? 'bg-red-100 text-red-700' :
                          item.prioridade === 'Média' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {item.prioridade}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700 w-10 text-right">{item.cobertura}%</span>
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 inline-flex overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${item.cobertura}%` }} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-white">
          <CardTitle className="text-lg font-bold text-slate-800">Cobertura por Bairro (%)</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] p-6">
          {isLoading ? <Skeleton className="h-full w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativo} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis dataKey="bairro" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="cobertura" name="Cobertura" radius={[0, 4, 4, 0]}>
                  {comparativo?.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.cobertura < 2 ? '#ef4444' : entry.cobertura < 4 ? '#fbbf24' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
