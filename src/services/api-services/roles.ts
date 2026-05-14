import api from '../api-client';
import type { Role, Permission, RoleInput, RoleUpdateInput, AssignPermissionsInput, ApiResponse } from '../../types/api';

/**
 * Roles API Service
 * Handles all role and permission-related API calls
 */
export const rolesApi = {
  /**
   * Get all roles
   * GET /roles
   */
  async getRoles(): Promise<Role[]> {
    const response = await api.get<ApiResponse<Role[]>>('/roles');
    return response.data.data??[];
  },

  /**
   * Get role by ID
   * GET /roles/{id}
   */
  async getRoleById(id: number): Promise<Role| null> {
    const response = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },

  /**
   * Create role (admin only)
   * POST /roles
   */
  async createRole(data: RoleInput): Promise<Role| null> {
    const response = await api.post<ApiResponse<Role>>('/roles', data);
    return response.data.data;
  },

  /**
   * Update role (admin only)
   * PUT /roles/{id}
   */
  async updateRole(id: number, data: RoleUpdateInput): Promise<Role| null> {
    const response = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete role (admin only)
   * DELETE /roles/{id}
   */
  async deleteRole(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

  /**
   * Get role permissions
   * GET /roles/{id}/permissions
   */
  async getRolePermissions(id: number): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>(`/roles/${id}/permissions`);
    return response.data.data??[];
  },

  /**
   * Assign permissions to role (admin only)
   * POST /roles/{id}/permissions
   */
  async assignPermissions(id: number, data: AssignPermissionsInput): Promise<void> {
    await api.post(`/roles/${id}/permissions`, data);
  },

  /**
   * Get all available permissions
   * GET /roles/permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>('/roles/permissions');
    return response.data.data??[];
  },
};
