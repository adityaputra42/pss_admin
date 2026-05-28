import { useMemo, useState } from 'react';

import {
  Shield,
  Plus,
  Info,
  Users,
  Lock,
  Search,
  Pencil,
  Trash2,
  Eye,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { useRoles } from '../../hooks/useRoles';

import RoleDetailModal from '../../components/roles/RoleDetailModal';

import { rolesApi } from '../../services/api-services';

import type {
  Role,
  Permission,
} from '../../types/rbac';

import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from '../../utils/alerts';

interface RoleFormData {
  name: string;

  description?: string;

  level: number;

  permission_ids: number[];
}

const RolesPage = () => {
  // =========================
  // hooks
  // =========================
  const {
    roles,
    isLoading,
    error,
    mutate,
  } = useRoles();

  // =========================
  // state
  // =========================
  const [search, setSearch] =
    useState('');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingRole, setEditingRole] =
    useState<Role | null>(null);

  const [
    isDetailModalOpen,
    setIsDetailModalOpen,
  ] = useState(false);

  const [detailRole, setDetailRole] =
    useState<Role | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =========================
  // computed
  // =========================
  const filteredRoles = useMemo(() => {
    const keyword =
      search.toLowerCase();

    return roles.filter(
      (role: Role) =>
        role.name
          ?.toLowerCase()
          .includes(keyword) ||
        role.description
          ?.toLowerCase()
          .includes(keyword),
    );
  }, [roles, search]);

  // unique permission count
  const totalPermissions =
    useMemo(() => {
      const ids =
        new Set<number>();

      roles.forEach(
        (role: Role) => {
          role.permissions?.forEach(
            (
              permission: Permission,
            ) => {
              ids.add(
                permission.id,
              );
            },
          );
        },
      );

      return ids.size;
    }, [roles]);

  // =========================
  // helpers
  // =========================
  const formatDate = (
    value?: string | number | Date,
  ) => {
    if (!value) return '-';

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return '-';
    }

    return date.toLocaleDateString(
      'id-ID',
      {
        dateStyle: 'medium',
      },
    );
  };

  const groupPermissions = (
    permissions: Permission[] = [],
  ) => {
    return permissions.reduce(
      (
        acc: Record<
          string,
          Permission[]
        >,
        permission,
      ) => {
        const resource =
          permission.resource;

        if (!acc[resource]) {
          acc[resource] = [];
        }

        acc[resource].push(
          permission,
        );

        return acc;
      },
      {},
    );
  };

  // =========================
  // modal handlers
  // =========================
  const handleOpenModal = (
    role: Role | null,
  ) => {
    setEditingRole(role);

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRole(null);

    setIsModalOpen(false);
  };

  const handleViewDetails = (
    role: Role,
  ) => {
    setDetailRole(role);

    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal =
    () => {
      setDetailRole(null);

      setIsDetailModalOpen(false);
    };

  // =========================
  // save
  // =========================
  const handleSave = async (
    data: RoleFormData,
    roleId: number | null,
  ) => {
    try {
      setIsSubmitting(true);

      if (roleId) {
        await rolesApi.updateRole(
          roleId,
          {
            name: data.name,
            description:
              data.description,
            level: data.level,
            permission_ids:
              data.permission_ids ??
              [],
          },
        );

        showSuccessAlert(
          'Role updated successfully',
        );
      } else {
        await rolesApi.createRole({
          name: data.name,
          description:
            data.description,
          level: data.level,
          permission_ids:
            data.permission_ids ??
            [],
        });

        showSuccessAlert(
          'Role created successfully',
        );
      }

      await mutate();

      handleCloseModal();
    } catch (error: any) {
      console.error(error);

      showErrorAlert(
        error?.response?.data
          ?.message ||
          'Failed to save role',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // delete
  // =========================
  const handleDelete = async (
    role: Role,
  ) => {
    if (role.is_system_role) {
      showErrorAlert(
        'System role cannot be deleted',
      );

      return;
    }

    const confirmed =
      await showConfirmAlert(
        'Delete Role',
        `Delete role ${role.name}?`,
      );

    if (!confirmed) return;

    try {
      await rolesApi.deleteRole(
        role.id,
      );

      await mutate();

      showSuccessAlert(
        'Role deleted successfully',
      );
    } catch (error: any) {
      console.error(error);

      showErrorAlert(
        error?.response?.data
          ?.message ||
          'Failed to delete role',
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ========================= */}
      {/* header */}
      {/* ========================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Role & Permission
            Management
          </h1>

          <p className="text-slate-500 mt-1">
            Manage RBAC access,
            permissions, and
            administrative role
            hierarchy.
          </p>
        </div>

        <button
          onClick={() =>
            handleOpenModal(null)
          }
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />

          <span>Create Role</span>
        </button>
      </div>

      {/* ========================= */}
      {/* stats */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* total roles */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Roles
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {roles.length}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
          </div>
        </div>

        {/* permissions */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Unique Permissions
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {totalPermissions}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Lock className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        {/* system */}
        <div className="premium-card p-6 bg-linear-to-br from-slate-800 to-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                RBAC Security
              </p>

              <h3 className="text-2xl font-bold mt-2">
                Protected
              </h3>
            </div>

            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* info */}
      {/* ========================= */}
      <div className="premium-card p-5 flex items-start gap-4 border-l-4 border-primary">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />

        <div>
          <p className="text-sm font-semibold text-slate-800">
            System Protection Policy
          </p>

          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            System roles cannot be
            deleted to prevent RBAC
            corruption and accidental
            privilege escalation.
          </p>
        </div>
      </div>

      {/* ========================= */}
      {/* search */}
      {/* ========================= */}
      <div className="premium-card p-5">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            placeholder="Search role name or description..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* ========================= */}
      {/* table */}
      {/* ========================= */}
      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

            <p className="text-slate-500 italic font-medium">
              Loading roles...
            </p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <p className="text-red-500 font-medium">
              {error}
            </p>

            <button
              onClick={() =>
                mutate()
              }
              className="mt-4 text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : filteredRoles.length ===
          0 ? (
          <div className="p-20 text-center">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />

            <p className="text-slate-500 font-medium">
              No roles found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Permissions
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Level
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Created
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRoles.map(
                  (role: Role) => (
                    <tr
                      key={role.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* role */}
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>

                          <div>
                            <div className="font-bold text-slate-900">
                              {role.name}
                            </div>

                            <div className="text-sm text-slate-500 mt-1 max-w-md">
                              {role.description ||
                                '-'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* permissions */}
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          {Object.entries(
                            groupPermissions(
                              role.permissions ??
                                [],
                            ),
                          ).length ===
                          0 ? (
                            <span className="text-xs italic text-slate-400">
                              No permissions
                            </span>
                          ) : (
                            Object.entries(
                              groupPermissions(
                                role.permissions ??
                                  [],
                              ),
                            ).map(
                              ([
                                resource,
                                permissions,
                              ]) => (
                                <div
                                  key={
                                    resource
                                  }
                                  className="flex flex-wrap items-center gap-2"
                                >
                                  <span className="px-2 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold uppercase">
                                    {
                                      resource
                                    }
                                  </span>

                                  {permissions.map(
                                    (
                                      permission: Permission,
                                    ) => (
                                      <span
                                        key={
                                          permission.id
                                        }
                                        className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold"
                                      >
                                        {
                                          permission.action
                                        }
                                      </span>
                                    ),
                                  )}
                                </div>
                              ),
                            )
                          )}
                        </div>
                      </td>

                      {/* level */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          Lvl{' '}
                          {
                            role.level
                          }
                        </span>
                      </td>

                      {/* type */}
                      <td className="px-6 py-5">
                        {role.is_system_role ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            <Lock className="w-3 h-3" />

                            System
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <Users className="w-3 h-3" />

                            Custom
                          </span>
                        )}
                      </td>

                      {/* created */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="w-4 h-4 text-slate-400" />

                          {formatDate(
                            role.created_at,
                          )}
                        </div>
                      </td>

                      {/* actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {/* detail */}
                          <button
                            onClick={() =>
                              handleViewDetails(
                                role,
                              )
                            }
                            className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* edit */}
                          <button
                            onClick={() =>
                              handleOpenModal(
                                role,
                              )
                            }
                            className="p-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* delete */}
                          {!role.is_system_role && (
                            <button
                              onClick={() =>
                                handleDelete(
                                  role,
                                )
                              }
                              className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* modals */}
      {/* ========================= */}
      {/* <RoleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        role={editingRole}
        onSave={handleSave}
        isLoading={isSubmitting}
      /> */}

      <RoleDetailModal
        isOpen={
          isDetailModalOpen
        }
        onClose={
          handleCloseDetailModal
        }
        role={detailRole}
      />
    </div>
  );
};

export default RolesPage;
