/**
 * Roles API Service — Passenger Service System RBAC Management.
 *
 * ⚠️ BACKEND REALITY CHECK: this ENTIRE file has no backend to call.
 * pss_modular_cqrs's auth module has NO HTTP endpoints for roles or
 * permissions at all -- grep internal/auth/interfaces/http/router.go
 * yourself, there is no /roles or /permissions route of any kind, in
 * either direction (read or write). RBAC there is enforced entirely
 * server-side, per protected request, by RequirePermission(module,
 * resource, action) checking the `role_permissions` table directly in
 * Postgres (see PostgresPermissionChecker). Roles/permissions are
 * currently only managed by hand-written SQL migrations (see
 * internal/auth/persistence/postgres/migration/000020_seed_roles.up.sql
 * and friends) -- there is no API surface for an admin UI to manage them.
 *
 * This is not a "wrong path" bug I can fix by editing this file --
 * building a Roles admin page against this backend requires NEW backend
 * endpoints (CRUD for roles, CRUD for permissions, assign/revoke
 * role<->permission) that don't exist yet. Every function below throws
 * instead of silently hitting a 404, so RolesPage/useRoles fail loudly
 * and legibly instead of with an unexplained network error. Either build
 * those backend endpoints first, or remove the Roles feature from this
 * admin app until they exist.
 */

const NOT_IMPLEMENTED =
  'Roles/Permissions management has no backend endpoint in pss_modular_cqrs yet. ' +
  'See the comment at the top of roles.ts.';

function notImplemented(): never {
  throw new Error(NOT_IMPLEMENTED);
}

export const rolesApi = {
  async getRoles(): Promise<never> { return notImplemented(); },
  async getRoleById(_id: number): Promise<never> { return notImplemented(); },
  async createRole(_data: unknown): Promise<never> { return notImplemented(); },
  async updateRole(_id: number, _data: unknown): Promise<never> { return notImplemented(); },
  async deleteRole(_id: number): Promise<never> { return notImplemented(); },
  async getRolePermissions(_id: number): Promise<never> { return notImplemented(); },
  async assignPermissions(_id: number, _data: unknown): Promise<never> { return notImplemented(); },
  async replacePermissions(_id: number, _data: unknown): Promise<never> { return notImplemented(); },
  async removePermission(_roleId: number, _permissionId: number): Promise<never> { return notImplemented(); },
  async getAllPermissions(): Promise<never> { return notImplemented(); },
  async createPermission(_data: unknown): Promise<never> { return notImplemented(); },
};
