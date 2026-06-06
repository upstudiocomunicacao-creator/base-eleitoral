import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, MapPinned } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GeocodingPanel } from "@/components/geocoding/GeocodingPanel";
import { getGeocodingProvider, getGeocodingProviderLabel } from "@/services/geocoding";

export default function Geocodificacao() {
  const provider = getGeocodingProvider();
  const providerLabel = getGeocodingProviderLabel();
  const isRealProvider = provider === "mapbox";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Geocodificação"
        title="Preparação para Mapas Reais"
        description="Transforme endereços em latitude/longitude com geocodificação aproximada e estrutura pronta para Mapbox ou Google Maps."
        actions={
          <div className={`rounded-full border px-3 py-1.5 text-xs font-bold ${isRealProvider ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
            <MapPinned className="mr-1 inline h-3.5 w-3.5" /> Provider {providerLabel} ativo
          </div>
        }
      />
      <GeocodingErrorBoundary>
        <GeocodingPanel />
      </GeocodingErrorBoundary>
    </div>
  );
}

class GeocodingErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Erro ao carregar a geocodificação.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Geocoding runtime error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Card className="border-red-200 bg-red-50 shadow-sm">
        <CardContent className="space-y-4 p-5 text-red-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              <div className="font-extrabold">Não foi possível carregar a geocodificação.</div>
              <p className="mt-1 text-sm font-semibold opacity-80">{this.state.message}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>Recarregar página</Button>
        </CardContent>
      </Card>
    );
  }
}
