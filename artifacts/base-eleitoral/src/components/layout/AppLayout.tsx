import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  ChevronRight,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Map,
  MapPinned,
  MapPin,
  Menu,
  Network,
  Settings,
  UploadCloud,
  Users,
  X,
  Zap,
} from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { canAccessModule, type PermissionModule } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";
import { useCampaignSettings } from "@/hooks/useCampaignSettings";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard, group: "Operação", module: "dashboard" },
  { href: "/operacional", label: "Operacional", icon: ListChecks, group: "Operação", module: "dashboard" },
  { href: "/mapa-forca", label: "Mapa de Força", icon: Network, group: "Operação", module: "mapa_forca" },
  { href: "/liderancas", label: "Cadastros", icon: Users, group: "Território", module: "liderancas" },
  { href: "/mapa-rj", label: "Mapa RJ", icon: Map, group: "Mapas", module: "mapa_rj" },
  { href: "/mapa-marica", label: "Mapa Maricá", icon: MapPin, group: "Mapas", module: "mapa_marica" },
  { href: "/comparativo", label: "Análises", icon: BarChart3, group: "Inteligência", module: "comparativo" },
  { href: "/relatorios", label: "Relatórios", icon: FileText, group: "Gestão", module: "relatorios" },
  { href: "/importacao", label: "Importação", icon: UploadCloud, group: "Gestão", module: "importacao_dados" },
  { href: "/geocodificacao", label: "Geocodificação", icon: MapPinned, group: "Gestão", module: "geocodificacao" },
  { href: "/diagnostico", label: "Diagnóstico", icon: Gauge, group: "Gestão", module: "diagnostico" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, group: "Gestão", module: "configuracoes" },
] as const;

const groups = ["Operação", "Território", "Mapas", "Inteligência", "Gestão"];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAuth();
  const { settings } = useCampaignSettings();
  const visibleNavItems = navItems.filter((item) => canAccessModule(profile, item.module as PermissionModule));
  const activeLabel = visibleNavItems.find((item) => item.href === location || (item.href === "/dashboard" && location === "/"))?.label ?? "Painel";
  const campaignSubtitle = `${settings.candidateName} - ${settings.office}`;
  const headerSubtitle = `${settings.name} - ${settings.mainCity}/${settings.mainState}`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-emerald-400 shadow-lg shadow-blue-950/25">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold leading-none tracking-tight text-white">{settings.systemName}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
              {campaignSubtitle}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Operação</span>
            <span className="text-emerald-300">Ativa</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => {
          const items = visibleNavItems.filter((item) => item.group === group);
          if (items.length === 0) return null;

          return (
            <div key={group}>
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{group}</div>
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = location === item.href || (item.href === "/dashboard" && location === "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                        isActive
                          ? "bg-white text-slate-950 shadow-lg shadow-blue-950/25"
                          : "text-slate-300 hover:bg-white/10 hover:text-white",
                      ].join(" ")}
                    >
                      {isActive ? <span className="absolute -left-3 h-6 w-1 rounded-r-full bg-emerald-400" /> : null}
                      <item.icon className={["h-4 w-4 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-white"].join(" ")} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive ? <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" /> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="rounded-lg bg-slate-950/30 p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">MVP</div>
          <div className="mt-1 text-xs font-semibold text-slate-200">Supabase Auth ativo</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-surface flex min-h-screen overflow-x-hidden font-sans">
      <aside className="fixed z-20 hidden h-full w-64 shrink-0 flex-col bg-slate-950 shadow-2xl shadow-slate-950/20 lg:flex">{sidebar}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 z-40 flex h-full w-72 max-w-[86vw] flex-col bg-slate-950 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex min-h-16 items-center gap-4 border-b border-white/60 bg-white/78 px-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-slate-950">{activeLabel}</span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">{headerSubtitle}</span>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 md:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]" />
            <span className="text-xs font-bold text-emerald-700">Sistema ativo</span>
          </div>
          <UserMenu />
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

