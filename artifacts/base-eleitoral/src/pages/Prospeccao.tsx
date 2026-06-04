import { useListProspeccao } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MapPin, Clock } from "lucide-react";

export default function Prospeccao() {
  const { data: pipeline, isLoading } = useListProspeccao();

  const columns = [
    { id: "novoContato", title: "Novo Contato", items: pipeline?.novoContato || [] },
    { id: "primeiroAtendimento", title: "1º Atendimento", items: pipeline?.primeiroAtendimento || [] },
    { id: "simpatizante", title: "Simpatizante", items: pipeline?.simpatizante || [] },
    { id: "apoiadorConfirmado", title: "Confirmado", items: pipeline?.apoiadorConfirmado || [] },
    { id: "multiplicador", title: "Multiplicador", items: pipeline?.multiplicador || [] },
    { id: "votoValidado", title: "Voto Validado", items: pipeline?.votoValidado || [] },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Prospecção de Eleitores</h2>
        <p className="text-muted-foreground">Pipeline de contato e engajamento eleitoral.</p>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0 bg-gray-100 rounded-lg p-2 flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))
        ) : (
          columns.map(col => (
            <div key={col.id} className="w-80 shrink-0 bg-gray-100 rounded-xl p-3 flex flex-col max-h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-gray-700">{col.title}</h3>
                <Badge variant="secondary" className="bg-white">{col.items.length}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 px-1">
                {col.items.map(prospecto => (
                  <Card key={prospecto.id} className="cursor-grab hover:shadow-md transition-shadow">
                    <CardContent className="p-3 space-y-2">
                      <div className="font-medium text-sm text-gray-900">{prospecto.nome}</div>
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        {prospecto.telefone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {prospecto.telefone}</div>}
                        <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {prospecto.bairro}</div>
                        {prospecto.dataContato && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {prospecto.dataContato}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}