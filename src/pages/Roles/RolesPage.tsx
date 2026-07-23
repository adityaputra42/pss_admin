import { ShieldAlert } from 'lucide-react';

/**
 * ⚠️ Backend reality: pss_modular_cqrs has NO roles/permissions HTTP API
 * at all -- see the comment at the top of services/api-services/roles.ts
 * for the full explanation. This page previously called that API for a
 * full CRUD roles/permissions UI; none of it can work against this
 * backend, so it's replaced with an honest "unavailable" state instead
 * of a UI that silently 404s on every action.
 *
 * To bring this feature back: add role/permission CRUD endpoints to
 * pss_modular_cqrs's auth module first, then rebuild this page (and
 * roles.ts, useRoles.ts, and components/roles/*) against them.
 */
const RolesPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Roles & Permissions</h1>
        <p className="text-slate-500 mt-1">Manage system roles and their permissions.</p>
      </div>

      <div className="premium-card p-10 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-md bg-amber-50 text-amber-500 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-lg font-bold text-slate-900">Not available yet</h2>
          <p className="text-sm text-slate-500">
            The backend (pss_modular_cqrs) doesn't expose any role or permission management
            endpoints. Roles/permissions there are currently seeded by hand-written SQL migrations
            only. This page will come back once a real API exists for it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
