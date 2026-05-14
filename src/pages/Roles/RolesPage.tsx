import { useState } from 'react';
import { useRoles } from '../../hooks/useRoles';
import RoleTable from '../../components/roles/RoleTable';
import RoleFormModal from '../../components/roles/RoleFormModal';
import RoleDetailModal from '../../components/roles/RoleDetailModal';
import { rolesApi } from '../../services/api-services';
import type { Role } from '../../types/api';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alerts';
import { Shield, Plus, Info } from 'lucide-react';

const RolesPage = () => {
  const { roles, isLoading, error, mutate } = useRoles();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailRole, setDetailRole] = useState<Role | null>(null);

  const handleOpenModal = (role: Role | null) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRole(null);
    setIsModalOpen(false);
  };

  const handleViewDetails = (role: Role) => {
    setDetailRole(role);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailRole(null);
    setIsDetailModalOpen(false);
  };

  const handleSave = async (data: any, roleId: number | null) => {
    try {
      if (roleId) {
        await rolesApi.updateRole(roleId, { name: data.name, description: data.description });
        await rolesApi.assignPermissions(roleId, { permission_ids: data.permission_ids });
        showSuccessAlert('Role updated successfully!');
      } else {
        const createdRole = await rolesApi.createRole({ name: data.name, description: data.description });
        if (createdRole && data.permission_ids && data.permission_ids.length > 0) {
          await rolesApi.assignPermissions(createdRole.id, { permission_ids: data.permission_ids });
        }
        showSuccessAlert('Role created successfully!');
      }
      mutate();
      handleCloseModal();
    } catch (error: any) {
      showErrorAlert(error.response?.data?.message || 'Failed to save role.');
    }
  };

  const handleDelete = async (role: Role) => {
    const confirmed = await showConfirmAlert('Delete Role', `Are you sure you want to delete role ${role.name}?`);
    if (confirmed) {
      try {
        await rolesApi.deleteRole(role.id);
        mutate();
        showSuccessAlert('Role deleted successfully!');
      } catch (error: any) {
        showErrorAlert(error.response?.data?.message || 'Failed to delete role.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Control</h1>
          <p className="text-slate-500 mt-1">Define roles and granular permissions for your administrative staff.</p>
        </div>
        <button
            onClick={() => handleOpenModal(null)}
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-6 bg-linear-to-br from-slate-800 to-slate-900 text-white">
                <Shield className="w-10 h-10 text-teal-400 mb-4" />
                <h3 className="text-lg font-bold">RBAC Policy</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                   Roles determine what actions users can perform. Always follow the principle of least privilege.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Defined</span>
                    <span className="text-xl font-bold">{roles.length} Roles</span>
                </div>
            </div>

            <div className="premium-card p-6 flex gap-3 border-l-4 border-teal-500">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                   System roles like <span className="text-slate-900 font-bold">Super Admin</span> cannot be deleted or modified to ensure system stability.
                </p>
            </div>
         </div>

         <div className="lg:col-span-3">
            <div className="premium-card overflow-hidden">
                {isLoading && (
                  <div className="p-20 flex flex-col items-center justify-center gap-4">
                     <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                     <p className="text-slate-500 font-medium italic">Loading permissions...</p>
                  </div>
                )}
                {error && (
                  <div className="p-20 text-center">
                     <p className="text-rose-500 font-medium">{error}</p>
                     <button onClick={() => mutate()} className="mt-4 text-primary font-semibold hover:underline">Retry</button>
                  </div>
                )}
                {!isLoading && !error && (
                  <RoleTable
                    roles={roles}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                  />
                )}
            </div>
         </div>
      </div>

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        role={editingRole}
        onSave={handleSave}
      />
      <RoleDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        role={detailRole}
      />
    </div>
  );
};

export default RolesPage;
