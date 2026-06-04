import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileSpreadsheet, Users, MapPin, BarChart3, Landmark, TrendingUp, AlertCircle, Calendar, Map } from "lucide-react";

export default function Relatorios() {
  const reports = [
    { title: "Consolidado Geral", desc: "Visão ampla de toda a base territorial e metas.", icon: BarChart3, color: "blue", mockData: "12 métricas · Todas regiões" },
    { title: "Lideranças por Bairro", desc: "Listagem de lideranças ativas cruzada com zonas de atuação.", icon: Users, color: "emerald", mockData: "142 lideranças · 21 bairros" },
    { title: "Apoiadores Estimados x Validados", desc: "Relatório de conversão e confiança de votos.", icon: TrendingUp, color: "violet", mockData: "3.450 registros" },
    { title: "Zonas Críticas", desc: "Locais de votação com distância da meta > 20%.", icon: AlertCircle, color: "red", mockData: "8 zonas em alerta" },
    { title: "Pipeline de Prospecção", desc: "Volume de contatos por etapa do funil.", icon: Target, color: "amber", mockData: "6 etapas · 450 contatos" },
    { title: "Demandas Abertas", desc: "Solicitações pendentes ordenadas por prioridade.", icon: FileText, color: "cyan", mockData: "45 demandas ativas" },
    { title: "Agenda Semanal", desc: "Eventos confirmados e pendentes para os próximos 7 dias.", icon: Calendar, color: "orange", mockData: "12 eventos previstos" },
    { title: "Mapa Maricá Detalhado", desc: "Extrato de cobertura e prioridades de cada bairro.", icon: MapPin, color: "pink", mockData: "21 bairros analisados" },
    { title: "Atuação Estadual (RJ)", desc: "Métricas de alcance fora do município principal.", icon: Map, color: "indigo", mockData: "14 municípios com atuação" },
  ];

  function Target(props: any) {
     return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  }

  const getColorClasses = (color: string) => {
    const map: Record<string, { bg: string, text: string, cardBg: string, btnHover: string }> = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", cardBg: "bg-blue-50/30", btnHover: "hover:bg-blue-50 hover:text-blue-700 border-blue-200" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-600", cardBg: "bg-emerald-50/30", btnHover: "hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200" },
      violet: { bg: "bg-violet-100", text: "text-violet-600", cardBg: "bg-violet-50/30", btnHover: "hover:bg-violet-50 hover:text-violet-700 border-violet-200" },
      red: { bg: "bg-red-100", text: "text-red-600", cardBg: "bg-red-50/30", btnHover: "hover:bg-red-50 hover:text-red-700 border-red-200" },
      amber: { bg: "bg-amber-100", text: "text-amber-600", cardBg: "bg-amber-50/30", btnHover: "hover:bg-amber-50 hover:text-amber-700 border-amber-200" },
      cyan: { bg: "bg-cyan-100", text: "text-cyan-600", cardBg: "bg-cyan-50/30", btnHover: "hover:bg-cyan-50 hover:text-cyan-700 border-cyan-200" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", cardBg: "bg-orange-50/30", btnHover: "hover:bg-orange-50 hover:text-orange-700 border-orange-200" },
      pink: { bg: "bg-pink-100", text: "text-pink-600", cardBg: "bg-pink-50/30", btnHover: "hover:bg-pink-50 hover:text-pink-700 border-pink-200" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600", cardBg: "bg-indigo-50/30", btnHover: "hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200" },
    };
    return map[color] || map.blue;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios</h2>
        <p className="text-sm text-slate-500 font-medium">Geração de documentos e extração de dados para inteligência.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, idx) => {
          const colors = getColorClasses(report.color);
          const Icon = report.icon;
          return (
            <Card key={idx} className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group hover:-translate-y-1 ${colors.cardBg}`}>
              <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div>
                     <CardTitle className="text-lg font-bold text-slate-800 leading-tight mb-1">{report.title}</CardTitle>
                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{report.mockData}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 px-6 pb-6">
                <p className="text-sm text-slate-600 font-medium min-h-[40px]">{report.desc}</p>
                <div className="flex gap-3">
                  <Button variant="outline" className={`w-full rounded-xl bg-white shadow-sm transition-colors font-semibold ${colors.btnHover}`}>
                    <Download className="mr-2 h-4 w-4" /> PDF
                  </Button>
                  <Button variant="outline" className={`w-full rounded-xl bg-white shadow-sm transition-colors font-semibold ${colors.btnHover}`}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
