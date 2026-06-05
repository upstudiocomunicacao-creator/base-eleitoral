import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, type PermissionAction, type PermissionModule } from "@/lib/permissions";

export function PermissionGate({
  module,
  action,
  children,
  fallback = null,
}: {
  module: PermissionModule;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { profile } = useAuth();

  if (!hasPermission(profile, module, action)) return <>{fallback}</>;

  return <>{children}</>;
}
