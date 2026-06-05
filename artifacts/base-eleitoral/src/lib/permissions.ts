import type { UserProfile } from "@/types/database";

export const USER_ROLES = {
  admin: "Administrador",
  coordenacao_geral: "Coordenação Geral",
  coordenador_regional: "Coordenador Regional",
  operador_campo: "Operador de Campo",
  lideranca: "Liderança",
  visualizador: "Visualizador",
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const MODULES = [
  "dashboard",
  "mapa_forca",
  "liderancas",
  "apoiadores",
  "prospeccao",
  "mapa_rj",
  "mapa_marica",
  "zonas_eleitorais",
  "comparativo",
  "agenda",
  "demandas",
  "relatorios",
  "importacao_dados",
  "geocodificacao",
  "configuracoes",
] as const;

export type PermissionModule = (typeof MODULES)[number];

export const ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "export",
  "import",
  "view_sensitive",
] as const;

export type PermissionAction = (typeof ACTIONS)[number];

const operationalModules: PermissionModule[] = ["apoiadores", "prospeccao", "agenda", "demandas"];
const readOnlyModules: PermissionModule[] = [
  "dashboard",
  "mapa_forca",
  "liderancas",
  "apoiadores",
  "prospeccao",
  "mapa_rj",
  "mapa_marica",
  "zonas_eleitorais",
  "comparativo",
  "agenda",
  "demandas",
  "relatorios",
  "geocodificacao",
];

function normalizeRole(role: string | null): UserRole {
  return role && role in USER_ROLES ? (role as UserRole) : "visualizador";
}

export function getRoleLabel(role: string | null): string {
  return USER_ROLES[normalizeRole(role)];
}

export function hasPermission(
  profile: UserProfile | null | undefined,
  moduleName: PermissionModule,
  action: PermissionAction,
): boolean {
  const role = normalizeRole(profile?.role ?? null);

  if (role === "admin") return true;

  if (role === "coordenacao_geral") {
    if (moduleName === "configuracoes" && ["create", "edit", "delete", "import"].includes(action)) {
      return false;
    }
    return action !== "delete";
  }

  if (role === "coordenador_regional") {
    if (moduleName === "configuracoes") return false;
    if (action === "delete" || action === "import") return false;
    if (action === "export") return ["dashboard", "comparativo", "relatorios"].includes(moduleName);
    return readOnlyModules.includes(moduleName);
  }

  if (role === "operador_campo") {
    if (moduleName === "configuracoes" || moduleName === "relatorios") return false;
    if (action === "view") return readOnlyModules.includes(moduleName);
    if (["create", "edit"].includes(action)) return operationalModules.includes(moduleName);
    return false;
  }

  if (role === "lideranca") {
    if (action === "view") return ["dashboard", "mapa_forca", "apoiadores", "prospeccao", "agenda", "demandas"].includes(moduleName);
    if (action === "create") return ["apoiadores", "demandas"].includes(moduleName);
    if (action === "edit") return ["apoiadores", "demandas"].includes(moduleName);
    return false;
  }

  if (role === "visualizador") {
    return action === "view" && readOnlyModules.includes(moduleName);
  }

  return false;
}

export function canAccessModule(profile: UserProfile | null | undefined, moduleName: PermissionModule): boolean {
  return hasPermission(profile, moduleName, "view");
}

export function canViewSensitiveData(profile: UserProfile | null | undefined): boolean {
  return hasPermission(profile, "dashboard", "view_sensitive");
}
