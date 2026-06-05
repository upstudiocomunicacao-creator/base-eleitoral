import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

import Dashboard from "./pages/Dashboard";
import MapaForca from "./pages/MapaForca";
import Liderancas from "./pages/Liderancas";
import Apoiadores from "./pages/Apoiadores";
import Prospeccao from "./pages/Prospeccao";
import MapaRJ from "./pages/MapaRJ";
import MapaMarica from "./pages/MapaMarica";
import Zonas from "./pages/Zonas";
import Comparativo from "./pages/Comparativo";
import Agenda from "./pages/Agenda";
import Demandas from "./pages/Demandas";
import Relatorios from "./pages/Relatorios";
import Importacao from "./pages/Importacao";
import Geocodificacao from "./pages/Geocodificacao";
import Configuracoes from "./pages/Configuracoes";

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
              <Route path="/configuracoes" component={Configuracoes} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
