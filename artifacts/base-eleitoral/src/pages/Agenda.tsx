import { useListAgenda } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon, MapPin, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Agenda() {
  const { data: eventos, isLoading } = useListAgenda();

  const getTipoStyle = (tipo: string) => {
    if (tipo.includes('Reunião')) return { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700' };
    if (tipo.includes('Caminhada')) return { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700' };
    if (tipo.includes('Visita')) return { border: 'border-l-violet-500', badge: 'bg-violet-100 text-violet-700' };
    return { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700' };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Agenda de Campo</h2>
          <p className="text-sm text-slate-500 font-medium">Reuniões, caminhadas e eventos da campanha.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all">
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl"><CardContent className="p-6"><Skeleton className="h-32 w-full rounded-xl" /></CardContent></Card>
          ))
        ) : eventos?.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-16 px-8 text-center text-slate-500 font-medium">
            Nenhum evento agendado.
          </div>
        ) : (
          eventos?.map((evento) => {
            const styles = getTipoStyle(evento.tipo);
            // Mocking date format to look like Portuguese as requested if the API sends string dates
            const formattedDate = evento.data.replace('2024', '').replace('-', ' de '); 

            return (
              <Card key={evento.id} className={`border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden border-l-4 ${styles.border}`}>
                <CardHeader className="pb-2 px-5 pt-5">
                  <div className="flex flex-col items-start gap-2.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                      {evento.tipo}
                    </span>
                    <CardTitle className="text-base font-bold text-slate-800 leading-snug">{evento.titulo}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pb-5">
                  <div className="space-y-2.5 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formattedDate || evento.data}</span>
                    </div>
                    {evento.horario && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{evento.horario}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{evento.bairro}{evento.cidade ? `, ${evento.cidade}` : ''}</span>
                    </div>
                    {evento.responsavel && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{evento.responsavel}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 flex justify-between items-center border-t border-slate-50">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      evento.status === 'Confirmado' ? 'bg-green-100 text-green-700' :
                      evento.status === 'Realizado' ? 'bg-slate-100 text-slate-600' :
                      evento.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {evento.status}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold text-xs rounded-lg">Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
