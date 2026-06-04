import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  UserPlus, 
  Kanban, 
  Map, 
  MapPin, 
  Landmark, 
  BarChart3, 
  Calendar, 
  MessageSquareWarning, 
  FileText, 
  Settings,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard Geral", icon: LayoutDashboard },
  { href: "/mapa-forca", label: "Mapa de Força", icon: Network },
  { href: "/liderancas", label: "Lideranças", icon: Users },
  { href: "/apoiadores", label: "Apoiadores", icon: UserPlus },
  { href: "/prospeccao", label: "Prospecção", icon: Kanban },
  { href: "/mapa-rj", label: "Mapa RJ", icon: Map },
  { href: "/mapa-marica", label: "Mapa Maricá", icon: MapPin },
  { href: "/zonas", label: "Zonas Eleitorais", icon: Landmark },
  { href: "/comparativo", label: "Comparativo", icon: BarChart3 },
  { href: "/agenda", label: "Agenda de Campo", icon: Calendar },
  { href: "/demandas", label: "Demandas", icon: MessageSquareWarning },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0f2241] text-white shadow-xl z-10">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-[#1c355d]">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Landmark className="h-6 w-6 text-blue-400" />
            Base 360
          </h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-300 hover:bg-[#1c355d] hover:text-white"}`}>
                <item.icon className={`h-5 w-5 ${isActive ? "text-blue-200" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="md:hidden text-gray-500">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 font-semibold text-gray-800">
            {navItems.find(i => i.href === location)?.label || "Comando Geral"}
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