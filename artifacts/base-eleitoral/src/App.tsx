import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Operacional = lazy(() => import("./pages/Operacional"));
const MapaForca = lazy(() => import("./pages/MapaForca"));
const Liderancas = lazy(() => import("./pages/Liderancas"));
const Apoiadores = lazy(() => import("./pages/Apoiadores"));
const Prospeccao = lazy(() => import("./pages/Prospeccao"));
const MapaRJ = lazy(() => import("./pages/MapaRJ"));
const MapaMarica = lazy(() => import("./pages/MapaMarica"));
const Zonas = lazy(() => import("./pages/Zonas"));
const Comparativo = lazy(() => import("./pages/Comparativo"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Demandas = lazy(() => import("./pages/Demandas"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Importacao = lazy(() => import("./pages/Importacao"));
const Geocodificacao = lazy(() => import("./pages/Geocodificacao"));
const Diagnostico = lazy(() => import("./pages/Diagnostico"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route>
        <ProtectedRoute>
          <AppLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/painel" component={Dashboard} />
              <Route path="/operacional" component={Operacional} />
              <Route path="/mapa-forca" component={MapaForca} />
              <Route path="/liderancas" component={Liderancas} />
              <Route path="/apoiadores" component={Apoiadores} />
              <Route path="/prospeccao" component={Prospeccao} />
              <Route path="/mapa-rj" component={MapaRJ} />
              <Route path="/mapa-marica" component={MapaMarica} />
              <Route path="/zonas" component={Zonas} />
              <Route path="/comparativo" component={Comparativo} />
              <Route path="/agenda" component={Agenda} />
              <Route path="/demandas" component={Demandas} />
              <Route path="/relatorios" component={Relatorios} />
              <Route path="/importacao" component={Importacao} />
              <Route path="/geocodificacao" component={Geocodificacao} />
              <Route path="/diagnostico" component={Diagnostico} />
              <Route path="/configuracoes" component={Configuracoes} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function PageLoading() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        Carregando mÃ³dulo
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Suspense fallback={<PageLoading />}>
              <Router />
            </Suspense>
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

