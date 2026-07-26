import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, KeyRound, ShieldCheck, ShieldOff, Lock } from 'lucide-react';

import { rolesApi } from '../../services/api-services';
import type { Permission, Role } from '../../types/rbac';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import ScaleIn from '../../components/animations/ScaleIn';
import RoleFormModal from '../../components/roles/RoleFormModal';
import RolePermissionsModal from '../../components/roles/RolePermissionsModal';

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permTargetRole, setPermTargetRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [currentPermissionIds, setCurrentPermissionIds] = useState<number[]>([]);
  const [permLoading, setPermLoading] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await rolesApi.getRoles(1, 100);
      setRoles(res.items ?? []);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleSaveRole = async (
    data: { name?: string; description?: string; level?: number; is_active?: boolean },
    id: number | null,
  ) => {
    try {
      if (id) {
        await rolesApi.updateRole(id, data);
      } else {
        await rolesApi.createRole(data as { name: string; description?: string; level: number });
      }
      showSuccessAlert(id ? 'Role updated' : 'Role created');
      setFormModalOpen(false);
      loadRoles();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system_role) {
      showErrorAlert("System roles can't be deleted.");
      return;
    }
    const confirmed = await showConfirmAlert(
      'Delete role?',
      `"${role.name}" will be removed. This fails if any user still has this role.`,
    );
    if (!confirmed) return;
    try {
      await rolesApi.deleteRole(role.id);
      showSuccessAlert('Role deleted');
      loadRoles();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to delete role');
    }
  };

  const openPermissionsModal = async (role: Role) => {
    setPermTargetRole(role);
    setPermModalOpen(true);
    setPermLoading(true);
    try {
      const [detail, permissionList] = await Promise.all([
        rolesApi.getRoleById(role.id),
        allPermissions.length > 0 ? Promise.resolve(null) : rolesApi.getAllPermissions(),
      ]);
      setCurrentPermissionIds(detail?.permissions.map((p) => p.id) ?? []);
      if (permissionList) setAllPermissions(permissionList.items ?? []);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load permissions');
    } finally {
      setPermLoading(false);
    }
  };

  const handleSavePermissions = async (permissionIds: number[]) => {
    if (!permTargetRole) return;
    try {
      await rolesApi.replacePermissions(permTargetRole.id, { permission_ids: permissionIds });
      showSuccessAlert('Permissions updated');
      setPermModalOpen(false);
      loadRoles();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to update permissions');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-slate-500 mt-1">Manage roles and what each one can access.</p>
        </div>
        <button
          onClick={() => {
            setEditingRole(null);
            setFormModalOpen(true);
          }}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Role
        </button>
      </div>

      <ScaleIn>
        <div className="premium-card overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-sm text-slate-400">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="p-20 text-center text-sm text-slate-400">No roles yet.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Users</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{role.name}</span>
                        {role.is_system_role && (
                          <span title="System role" className="text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      {role.description && <div className="text-xs text-slate-500 mt-0.5">{role.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{role.level}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${
                          role.is_active ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-slate-100 text-slate-500 ring-slate-200'
                        }`}
                      >
                        {role.is_active ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{role.user_count}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openPermissionsModal(role)}
                          title="Manage permissions"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setFormModalOpen(true);
                          }}
                          title="Edit"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role)}
                          disabled={role.is_system_role}
                          title={role.is_system_role ? "System roles can't be deleted" : 'Delete'}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ScaleIn>

      <RoleFormModal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} role={editingRole} onSave={handleSaveRole} />
      <RolePermissionsModal
        isOpen={permModalOpen}
        onClose={() => setPermModalOpen(false)}
        role={permTargetRole}
        allPermissions={allPermissions}
        currentPermissionIds={currentPermissionIds}
        loading={permLoading}
        onSave={handleSavePermissions}
      />
    </div>
  );
};

export default RolesPage;
