import { useGetMapaMarica } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Target, CheckCircle } from "lucide-react";

export default function MapaMarica() {
  const { data: bairros, isLoading } = useGetMapaMarica();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mapa Maricá</h2>
        <p className="text-muted-foreground">Cobertura e prioridades por bairro em Maricá.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bairros?.map((b, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-gray-800">{b.nome}</CardTitle>
                  <Badge className={
                    b.prioridade === 'Alta' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                    b.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                    'bg-green-100 text-green-800 hover:bg-green-100'
                  }>
                    {b.prioridade}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Cobertura</span>
                    <span className="font-semibold">{b.cobertura}%</span>
                  </div>
                  <Progress value={b.cobertura} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Lideranças</div>
                    <div className="font-semibold">{b.liderancas}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Apoiadores</div>
                    <div className="font-semibold">{b.apoiadores}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Declarados</div>
                    <div className="font-semibold">{b.votosDeclarados}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-blue-600" /> Validados</div>
                    <div className="font-bold text-blue-700">{b.votosValidados}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}