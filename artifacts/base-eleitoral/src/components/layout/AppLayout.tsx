import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Network, Users, UserPlus, Kanban, Map, MapPin, 
  Landmark, BarChart3, Calendar, MessageSquareWarning, FileText, 
  Settings, Menu, X, ChevronRight, Zap
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, group: "Visão Geral" },
  { href: "/mapa-forca", label: "Mapa de Força", icon: Network, group: "Visão Geral" },
  { href: "/liderancas", label: "Lideranças", icon: Users, group: "Base Territorial" },
  { href: "/apoiadores", label: "Apoiadores", icon: UserPlus, group: "Base Territorial" },
  { href: "/prospeccao", label: "Prospecção", icon: Kanban, group: "Base Territorial" },
  { href: "/mapa-rj", label: "Mapa RJ", icon: Map, group: "Mapas" },
  { href: "/mapa-marica", label: "Mapa Maricá", icon: MapPin, group: "Mapas" },
  { href: "/zonas", label: "Zonas Eleitorais", icon: Landmark, group: "Mapas" },
  { href: "/comparativo", label: "Comparativo", icon: BarChart3, group: "Inteligência" },
  { href: "/agenda", label: "Agenda de Campo", icon: Calendar, group: "Inteligência" },
  { href: "/demandas", label: "Demandas", icon: MessageSquareWarning, group: "Inteligência" },
  { href: "/relatorios", label: "Relatórios", icon: FileText, group: "Sistema" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, group: "Sistema" },
];

const groups = ["Visão Geral", "Base Territorial", "Mapas", "Inteligência", "Sistema"];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg shadow-md">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-none tracking-tight">Base 360</div>
          <div className="text-blue-300 text-[10px] font-medium mt-0.5 tracking-wide uppercase">Campanha Eleitoral</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map(group => {
          const items = navItems.filter(i => i.group === group);
          return (
            <div key={group}>
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-blue-400/70">{group}</div>
              <div className="space-y-0.5">
                {items.map(item => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      ].join(" ")}
                    >
                      <item.icon className={["h-4 w-4 flex-shrink-0 transition-colors", isActive ? "text-blue-100" : "text-slate-400 group-hover:text-white"].join(" ")} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <ChevronRight className="h-3 w-3 text-blue-200 flex-shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="text-[10px] text-blue-400/50 font-medium">v1.0 · Base Eleitoral 360</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 bg-[#0f2241] fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#0f2241] z-40 flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:pl-60 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <span className="text-sm font-semibold text-slate-800">
              {navItems.find(i => i.href === location)?.label || "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Sistema ativo</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
