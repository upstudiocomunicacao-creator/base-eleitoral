import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Configuracoes() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Parâmetros globais da plataforma e definições da campanha.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Candidato</CardTitle>
          <CardDescription>Informações principais exibidas no topo do painel e em relatórios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome de Urna</Label>
              <Input defaultValue="Candidato Exemplo" />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input defaultValue="00000" />
            </div>
            <div className="space-y-2">
              <Label>Partido</Label>
              <Input defaultValue="Partido Modelo" />
            </div>
            <div className="space-y-2">
              <Label>Cargo Disputado</Label>
              <Input defaultValue="Vereador" />
            </div>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 mt-4">Salvar Alterações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metas Globais</CardTitle>
          <CardDescription>Defina os objetivos gerais para os painéis de comparativo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Meta de Votos (Total)</Label>
              <Input type="number" defaultValue="5000" />
            </div>
            <div className="space-y-2">
              <Label>Meta de Apoiadores</Label>
              <Input type="number" defaultValue="2000" />
            </div>
            <div className="space-y-2">
              <Label>Índice de Segurança (%)</Label>
              <Input type="number" defaultValue="30" />
            </div>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 mt-4">Atualizar Metas</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
             <Label>Cor Primária da Interface (Hex)</Label>
             <div className="flex gap-2">
                <Input defaultValue="#2563eb" className="w-32" />
                <div className="w-10 h-10 rounded bg-[#2563eb] border shadow-sm"></div>
             </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <div>
              <Label className="text-red-600">Exportar Banco de Dados</Label>
              <p className="text-sm text-gray-500">Gera um arquivo completo com todos os cadastros.</p>
            </div>
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Solicitar Backup</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}