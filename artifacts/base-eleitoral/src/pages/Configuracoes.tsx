import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Configuracoes() {
  return (
    <div className="space-y-8 max-w-4xl pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h2>
        <p className="text-sm text-slate-500 font-medium">Parâmetros globais da plataforma e definições da campanha.</p>
      </div>

      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50 px-6 pt-6">
          <CardTitle className="text-lg font-bold text-slate-800">Dados do Candidato</CardTitle>
          <CardDescription className="text-slate-500">Informações principais exibidas no topo do painel e em relatórios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-wide font-semibold text-slate-400">Nome de Urna</Label>
              <Input defaultValue="Candidato Exemplo" className="rounded-xl border-slate-200 h-11 bg-slate-50 focus:bg-white" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-wide font-semibold text-slate-400">Número</Label>
              <Input defaultValue="00000" className="rounded-xl border-slate-200 h-11 bg-slate-50 focus:bg-white font-mono text-lg tracking-widest text-slate-700" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-wide font-semibold text-slate-400">Partido</Label>
              <Input defaultValue="Partido Modelo" className="rounded-xl border-slate-200 h-11 bg-slate-50 focus:bg-white" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-wide font-semibold text-slate-400">Cargo Disputado</Label>
              <Input defaultValue="Vereador" className="rounded-xl border-slate-200 h-11 bg-slate-50 focus:bg-white" />
            </div>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all font-semibold">Salvar Alterações</Button>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50 px-6 pt-6">
          <CardTitle className="text-lg font-bold text-slate-800">Metas Globais</CardTitle>
          <CardDescription className="text-slate-500">Defina os objetivos gerais para os painéis de comparativo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-wide font-semibold text-slate-400">Meta de Votos (Total)</Label>
              <Input type="number" defaultValue="5000" className="rounded-xl border-slate-200 h-11 bg-slate-50 focus:bg-white font-semibold text-slate-700" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-wide font-semibold text-slate-400">Meta de Apoiadores</Label>
              <Input type="number" defaultValue="2000" className="rounded-xl border-slate-200 h-11 bg-slate-50 focus:bg-white font-semibold text-slate-700" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-wide font-semibold text-slate-400">Índice Segurança (%)</Label>
              <Input type="number" defaultValue="30" className="rounded-xl border-slate-200 h-11 bg-slate-50 focus:bg-white font-semibold text-slate-700" />
            </div>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all font-semibold">Atualizar Metas</Button>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50 px-6 pt-6">
          <CardTitle className="text-lg font-bold text-slate-800">Sistema e Banco de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-6 py-6">
          <div className="space-y-3">
             <Label className="text-xs uppercase tracking-wide font-semibold text-slate-400">Cor Primária da Interface</Label>
             <div className="flex gap-4 items-center">
                <Input defaultValue="#2563eb" className="w-32 rounded-xl border-slate-200 h-11 bg-slate-50 focus:bg-white font-mono uppercase text-slate-600" />
                <div className="w-11 h-11 rounded-xl bg-blue-600 border border-black/5 shadow-inner"></div>
             </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-red-50/50 p-5 rounded-2xl border border-red-100">
            <div>
              <Label className="text-red-700 font-bold text-base">Exportar Banco de Dados</Label>
              <p className="text-sm text-red-600/80 font-medium mt-1">Gera um arquivo CSV/SQL completo com todos os cadastros e mapeamentos.</p>
            </div>
            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-600 hover:text-white rounded-xl shadow-sm transition-all font-bold shrink-0">Solicitar Backup</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
