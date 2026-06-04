import { useGetMapaRJ } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, Users, Target, CheckCircle } from "lucide-react";

export default function MapaRJ() {
  const { data: municipios, isLoading } = useGetMapaRJ();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mapa Estado do RJ</h2>
        <p className="text-muted-foreground">Visão geral de atuação nos municípios fluminenses.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {municipios?.map((m, idx) => (
            <Card key={idx} className={m.comAtuacao ? "border-blue-200 shadow-sm" : "opacity-75"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-gray-800">{m.nome}</CardTitle>
                  <Badge variant={m.comAtuacao ? "default" : "secondary"} className={m.comAtuacao ? "bg-green-600 hover:bg-green-700" : ""}>
                    {m.comAtuacao ? "Ativo" : "Sem atuação"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mt-2">
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Lideranças</div>
                    <div className="font-semibold">{m.liderancas}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1"><Map className="w-3 h-3" /> Apoiadores</div>
                    <div className="font-semibold">{m.apoiadores}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Declarados</div>
                    <div className="font-semibold">{m.votosDeclarados}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-blue-600" /> Validados</div>
                    <div className="font-bold text-blue-700">{m.votosValidados}</div>
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