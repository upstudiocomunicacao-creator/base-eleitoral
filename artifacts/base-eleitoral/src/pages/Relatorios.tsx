import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileSpreadsheet } from "lucide-react";

export default function Relatorios() {
  const reports = [
    { title: "Consolidado Geral", desc: "Visão ampla de toda a base territorial e metas." },
    { title: "Lideranças por Bairro", desc: "Listagem de lideranças ativas cruzada com zonas de atuação." },
    { title: "Apoiadores Estimados x Validados", desc: "Relatório de conversão e confiança de votos." },
    { title: "Zonas Críticas", desc: "Locais de votação com distância da meta > 20%." },
    { title: "Pipeline de Prospecção", desc: "Volume de contatos por etapa do funil." },
    { title: "Demandas Abertas", desc: "Solicitações pendentes ordenadas por prioridade." },
    { title: "Agenda Semanal", desc: "Eventos confirmados e pendentes para os próximos 7 dias." },
    { title: "Mapa Maricá Detalhado", desc: "Extrato de cobertura e prioridades de cada bairro." },
    { title: "Atuação Estadual (RJ)", desc: "Métricas de alcance fora do município principal." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Geração de documentos e extração de dados para inteligência.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500 min-h-[40px]">{report.desc}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Download className="mr-2 h-3 w-3" /> PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <FileSpreadsheet className="mr-2 h-3 w-3" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}