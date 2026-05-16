import api from '../api-client';

import type {

  RoleInput,
  RoleUpdateInput,
  AssignPermissionsInput,
  ApiResponse,
} from '../../types/api';
import type { Permission, Role } from '../../types/rbac';

/**
 * Roles API Service
 * Passenger Service System - RBAC Management
 */
export const rolesApi = {
  /**
   * Get all roles
   * GET /roles
   */
  async getRoles(): Promise<Role[]> {

    const response = await api.get<
      ApiResponse<Role[]>
    >('/roles');

    return response.data.data ?? [];
  },

  /**
   * Get role by ID
   * GET /roles/{id}
   */
  async getRoleById(
    id: number,
  ): Promise<Role | null> {

    const response = await api.get<
      ApiResponse<Role>
    >(`/roles/${id}`);

    return response.data.data;
  },

  /**
   * Create role
   * POST /roles
   */
  async createRole(
    data: RoleInput,
  ): Promise<Role | null> {

    const response = await api.post<
      ApiResponse<Role>
    >('/roles', data);

    return response.data.data;
  },

  /**
   * Update role
   * PUT /roles/{id}
   */
  async updateRole(
    id: number,
    data: RoleUpdateInput,
  ): Promise<Role | null> {

    const response = await api.put<
      ApiResponse<Role>
    >(`/roles/${id}`, data);

    return response.data.data;
  },

  /**
   * Delete role
   * DELETE /roles/{id}
   */
  async deleteRole(
    id: number,
  ): Promise<void> {

    await api.delete(
      `/roles/${id}`,
    );
  },

  /**
   * Get permissions assigned to role
   * GET /roles/{id}/permissions
   */
  async getRolePermissions(
    id: number,
  ): Promise<Permission[]> {

    const response = await api.get<
      ApiResponse<Permission[]>
    >(`/roles/${id}/permissions`);

    return response.data.data ?? [];
  },

  /**
   * Assign permissions to role
   * POST /roles/{id}/permissions
   */
  async assignPermissions(
    id: number,
    data: AssignPermissionsInput,
  ): Promise<void> {

    await api.post(
      `/roles/${id}/permissions`,
      data,
    );
  },

  /**
   * Replace all role permissions
   * PUT /roles/{id}/permissions
   */
  async replacePermissions(
    id: number,
    data: AssignPermissionsInput,
  ): Promise<void> {

    await api.put(
      `/roles/${id}/permissions`,
      data,
    );
  },

  /**
   * Remove permission from role
   * DELETE /roles/{id}/permissions/{permissionId}
   */
  async removePermission(
    roleId: number,
    permissionId: number,
  ): Promise<void> {

    await api.delete(
      `/roles/${roleId}/permissions/${permissionId}`,
    );
  },

  /**
   * Get all permissions
   * GET /permissions
   */
  async getAllPermissions(): Promise<Permission[]> {

    const response = await api.get<
      ApiResponse<Permission[]>
    >('/permissions');

    return response.data.data ?? [];
  },

  /**
   * Create permission
   * POST /permissions
   */
  async createPermission(
    data: {
      name: string;
      resource: string;
      action: string;
      description?: string;
    },
  ): Promise<Permission | null> {

    const response = await api.post<
      ApiResponse<Permission>
    >('/permissions', data);

    return response.data.data;
  },
};
