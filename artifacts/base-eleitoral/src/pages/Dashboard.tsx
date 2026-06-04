import { useGetDashboardStats, useGetDashboardEvolucao, useGetDashboardRankingLiderancas, useGetDashboardRankingBairros } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, BarChart2, CheckCircle2, Star, Building2, MapPin, Landmark, AlertCircle, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Area, AreaChart
} from "recharts";

const STAT_CARDS = [
  { key: "totalLiderancas", label: "Lideranças", icon: Users, color: "blue", bg: "bg-blue-50", text: "text-blue-600", border: "border-t-blue-500" },
  { key: "totalApoiadores", label: "Apoiadores", icon: UserPlus, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-t-emerald-500" },
  { key: "apoiadoresEstimados", label: "Estimados", icon: BarChart2, color: "violet", bg: "bg-violet-50", text: "text-violet-600", border: "border-t-violet-500" },
  { key: "votosDeclarados", label: "Declarados", icon: Star, color: "amber", bg: "bg-amber-50", text: "text-amber-600", border: "border-t-amber-500" },
  { key: "votosValidados", label: "Validados", icon: CheckCircle2, color: "green", bg: "bg-green-50", text: "text-green-600", border: "border-t-green-500" },
  { key: "indiceConfianca", label: "Confiança", icon: TrendingUp, color: "cyan", bg: "bg-cyan-50", text: "text-cyan-600", border: "border-t-cyan-500" },
  { key: "municipiosAtuacao", label: "Municípios", icon: Building2, color: "indigo", bg: "bg-indigo-50", text: "text-indigo-600", border: "border-t-indigo-500" },
  { key: "bairrosCobertos", label: "Bairros", icon: MapPin, color: "pink", bg: "bg-pink-50", text: "text-pink-600", border: "border-t-pink-500" },
  { key: "zonasEleitorais", label: "Zonas", icon: Landmark, color: "orange", bg: "bg-orange-50", text: "text-orange-600", border: "border-t-orange-500" },
  { key: "regioesPrioritarias", label: "Prioritárias", icon: AlertCircle, color: "red", bg: "bg-red-50", text: "text-red-600", border: "border-t-red-500" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <div className="font-semibold text-slate-700 mb-2">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats();
  const { data: evolucao, isLoading: loadingEvolucao } = useGetDashboardEvolucao();
  const { data: rankingLiderancas, isLoading: loadingRankLiderancas } = useGetDashboardRankingLiderancas();
  const { data: rankingBairros, isLoading: loadingRankBairros } = useGetDashboardRankingBairros();

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const statsMap = stats as Record<string, number> | undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Comando Geral</h1>
          <p className="text-sm text-slate-500 mt-1 capitalize">{today} · Visão territorial da campanha</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map(({ key, label, icon: Icon, bg, text, border }) => (
          <Card key={key} className={["border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl border-t-4 overflow-hidden", border].join(" ")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={["w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", bg].join(" ")}>
                  <Icon className={["h-4 w-4", text].join(" ")} />
                </div>
              </div>
              {loadingStats ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-slate-900 leading-none">
                  {statsMap?.[key] !== undefined ? Number(statsMap[key]).toLocaleString() : "—"}
                </div>
              )}
              <div className="text-xs text-slate-500 font-medium mt-1.5">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2 px-6 pt-6">
            <CardTitle className="text-base font-semibold text-slate-800">Evolução Semanal</CardTitle>
            <p className="text-xs text-slate-400 font-medium">Novos cadastros por semana</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {loadingEvolucao ? <Skeleton className="h-64 w-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={evolucao} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradLider" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradApoiador" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="liderancas" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradLider)" name="Lideranças" dot={false} />
                  <Area type="monotone" dataKey="apoiadores" stroke="#10b981" strokeWidth={2.5} fill="url(#gradApoiador)" name="Apoiadores" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2 px-6 pt-6">
            <CardTitle className="text-base font-semibold text-slate-800">Declarados vs Validados</CardTitle>
            <p className="text-xs text-slate-400 font-medium">Comparativo por semana</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {loadingEvolucao ? <Skeleton className="h-64 w-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={evolucao} margin={{ top: 5, right: 16, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="cadastros" name="Declarados" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="apoiadores" name="Validados" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-4 px-6 pt-6 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">Top Lideranças</CardTitle>
            <p className="text-xs text-slate-400 font-medium">Por votos validados</p>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {loadingRankLiderancas ? (
              <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
            ) : (
              <div className="space-y-1">
                {rankingLiderancas?.slice(0, 6).map((item, idx) => {
                  const max = rankingLiderancas[0]?.valor || 1;
                  const pct = Math.round((item.valor / max) * 100);
                  return (
                    <div key={idx} className="flex items-center gap-3 py-2.5 group">
                      <span className="w-5 text-xs font-bold text-slate-400 flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700 truncate">{item.nome}</span>
                          <span className="text-sm font-bold text-emerald-600 ml-2 flex-shrink-0">{item.valor}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-4 px-6 pt-6 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">Ranking Bairros</CardTitle>
            <p className="text-xs text-slate-400 font-medium">Por apoiadores cadastrados</p>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {loadingRankBairros ? (
              <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
            ) : (
              <div className="space-y-1">
                {rankingBairros?.slice(0, 6).map((item, idx) => {
                  const max = rankingBairros[0]?.valor || 1;
                  const pct = Math.round((item.valor / max) * 100);
                  return (
                    <div key={idx} className="flex items-center gap-3 py-2.5 group">
                      <span className="w-5 text-xs font-bold text-slate-400 flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700 truncate">{item.nome}</span>
                          <span className="text-sm font-bold text-blue-600 ml-2 flex-shrink-0">{item.valor}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
