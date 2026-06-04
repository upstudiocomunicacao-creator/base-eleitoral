import { useGetDashboardStats, useGetDashboardEvolucao, useGetDashboardRankingLiderancas, useGetDashboardRankingBairros } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, FileText, CheckCircle, BarChart, Map, MapPin, Landmark, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Legend } from "recharts";

function StatCard({ title, value, icon: Icon, loading }: { title: string, value?: number, icon: any, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-gray-900">{value?.toLocaleString() || 0}</div>}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats();
  const { data: evolucao, isLoading: loadingEvolucao } = useGetDashboardEvolucao();
  const { data: rankingLiderancas, isLoading: loadingRankLiderancas } = useGetDashboardRankingLiderancas();
  const { data: rankingBairros, isLoading: loadingRankBairros } = useGetDashboardRankingBairros();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Comando Geral</h2>
        <p className="text-muted-foreground">Visão geral das operações territoriais e metas eleitorais.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Lideranças" value={stats?.totalLiderancas} icon={Users} loading={loadingStats} />
        <StatCard title="Apoiadores" value={stats?.totalApoiadores} icon={UserPlus} loading={loadingStats} />
        <StatCard title="Ap. Estimados" value={stats?.apoiadoresEstimados} icon={BarChart} loading={loadingStats} />
        <StatCard title="Votos Declarados" value={stats?.votosDeclarados} icon={FileText} loading={loadingStats} />
        <StatCard title="Votos Validados" value={stats?.votosValidados} icon={CheckCircle} loading={loadingStats} />
        
        <StatCard title="Índice Confiança" value={stats?.indiceConfianca} icon={Target} loading={loadingStats} />
        <StatCard title="Municípios" value={stats?.municipiosAtuacao} icon={Map} loading={loadingStats} />
        <StatCard title="Bairros Cobertos" value={stats?.bairrosCobertos} icon={MapPin} loading={loadingStats} />
        <StatCard title="Zonas Eleitorais" value={stats?.zonasEleitorais} icon={Landmark} loading={loadingStats} />
        <StatCard title="Áreas Prioritárias" value={stats?.regioesPrioritarias} icon={MapPin} loading={loadingStats} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Semanal</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {loadingEvolucao ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucao}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="liderancas" stroke="#2563eb" strokeWidth={2} name="Lideranças" />
                  <Line type="monotone" dataKey="apoiadores" stroke="#16a34a" strokeWidth={2} name="Apoiadores" />
                  <Line type="monotone" dataKey="cadastros" stroke="#eab308" strokeWidth={2} name="Cadastros" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Declarados vs Validados</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {loadingEvolucao ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={evolucao}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Legend />
                  <Bar dataKey="cadastros" name="Declarados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="apoiadores" name="Validados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Lideranças (Votos Validados)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRankLiderancas ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {rankingLiderancas?.slice(0, 5).map((lideranca, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="font-medium text-sm text-gray-800">{lideranca.nome}</div>
                    <div className="font-bold text-sm text-green-600">{lideranca.valor}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking Bairros (Cobertura %)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRankBairros ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {rankingBairros?.slice(0, 5).map((bairro, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="font-medium text-sm text-gray-800">{bairro.nome}</div>
                    <div className="font-bold text-sm text-blue-600">{bairro.valor}%</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}