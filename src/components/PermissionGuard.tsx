import React from 'react';
import { useAuthStore } from '../hooks/useAuth';

/**
 * ⚠️ Backend reality: pss_modular_cqrs has NO client-facing "what are my
 * permissions" endpoint -- RBAC is enforced entirely server-side, per
 * request, by RequirePermission checking role_permissions in Postgres
 * (see PostgresPermissionChecker). The JWT only embeds `id` and
 * `role_id`, not a role name or a permission list, and there's no roles
 * API either (see roles.ts) to resolve role_id -> name/permissions
 * client-side. useAuthStore.permissions is therefore always [] --
 * there's nothing real to check here.
 *
 * This guard is now a no-op that always renders its children. That's not
 * a security regression: the server enforces every protected action
 * regardless of what this component does, so a hidden-vs-shown button is
 * a UX nicety, not an authorization boundary. If you want real
 * permission-based UI gating, it needs a new backend endpoint (e.g.
 * GET /auth/me/permissions) first.
 */
interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return null;
  return <>{children}</>;
};

export default PermissionGuard;
