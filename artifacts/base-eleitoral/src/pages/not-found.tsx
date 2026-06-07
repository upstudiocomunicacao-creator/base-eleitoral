import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl shadow-slate-950/10">
        <CardContent className="p-6">
          <div className="mb-4 flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-950">Página não encontrada</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                Este endereço não faz parte da versão enxuta do Base Eleitoral 360.
              </p>
            </div>
          </div>

          <Button asChild className="mt-2 w-full">
            <a href="/dashboard">Voltar para o painel</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
