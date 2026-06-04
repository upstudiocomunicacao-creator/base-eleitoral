import { useListAgenda } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon, MapPin, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Agenda() {
  const { data: eventos, isLoading } = useListAgenda();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agenda de Campo</h2>
          <p className="text-muted-foreground">Reuniões, caminhadas e eventos da campanha.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))
        ) : eventos?.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
            Nenhum evento agendado.
          </div>
        ) : (
          eventos?.map((evento) => (
            <Card key={evento.id} className="hover:border-blue-300 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {evento.tipo}
                    </Badge>
                    <CardTitle className="text-lg leading-tight">{evento.titulo}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{evento.data}</span>
                  </div>
                  {evento.horario && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{evento.horario}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{evento.bairro}{evento.cidade ? `, ${evento.cidade}` : ''}</span>
                  </div>
                  {evento.responsavel && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{evento.responsavel}</span>
                    </div>
                  )}
                </div>
                <div className="pt-2 flex justify-between items-center border-t">
                  <Badge className={
                    evento.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
                    evento.status === 'Realizado' ? 'bg-gray-100 text-gray-800' :
                    evento.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {evento.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 text-blue-600">Detalhes</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}