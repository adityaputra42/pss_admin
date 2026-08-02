import type {
  ApiResponse,
  AssignPermissionsInput,
  PermissionListResponse,
  RoleDetailResponse,
  RoleInput,
  RoleListResponse,
  RoleUpdateInput,
} from '../../types/api';
import type { Permission, Role } from '../../types/rbac';
import api from '../api-client';


export const rolesApi = {
  async getRoles(page = 1, limit = 50): Promise<RoleListResponse> {
    const response = await api.get<ApiResponse<RoleListResponse>>('/roles', { params: { page, limit } });
    return response.data.data ?? { items: [], total: 0, page, limit };
  },

  async getRoleById(id: number): Promise<RoleDetailResponse | null> {
    const response = await api.get<ApiResponse<RoleDetailResponse>>(`/roles/${id}`);
    return response.data.data;
  },

  async createRole(data: RoleInput): Promise<Role | null> {
    const response = await api.post<ApiResponse<Role>>('/roles', data);
    return response.data.data;
  },

   async updateRole(id: number, data: RoleUpdateInput): Promise<Role | null> {
    const response = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data;
  },

  async deleteRole(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

   async replacePermissions(id: number, data: AssignPermissionsInput): Promise<RoleDetailResponse | null> {
    const response = await api.put<ApiResponse<RoleDetailResponse>>(`/roles/${id}/permissions`, data);
    return response.data.data;
  },

  /**
   * GET /permissions?module=&page=&limit= -- master list of every
   * permission tuple, used both to build the "assign to role" UI
   * (RolePermissionsModal) and the standalone permission management
   * table below.
   */
  async getAllPermissions(module?: string): Promise<PermissionListResponse> {
    const response = await api.get<ApiResponse<PermissionListResponse>>('/permissions', {
      params: { module, limit: 500 },
    });
    return response.data.data ?? { items: [], total: 0, page: 1, limit: 500 };
  },

  /** GET /permissions/{id} */
  async getPermissionById(id: number): Promise<Permission | null> {
    const response = await api.get<ApiResponse<Permission>>(`/permissions/${id}`);
    return response.data.data;
  },

  /**
   * POST /permissions -- registers a new module/resource/action tuple.
   * Gated by role:permission:create, superadmin-only (see
   * 000032_seed_permission_crud_permissions.up.sql) -- expect a 403 for
   * anyone logged in as 'admin', not just customer/agent. This only
   * registers the tuple; assign it to a role afterward via
   * replacePermissions/RolePermissionsModal.
   */
  async createPermission(data: {
    module: string;
    resource: string;
    action: string;
    description?: string;
  }): Promise<Permission | null> {
    const response = await api.post<ApiResponse<Permission>>('/permissions', data);
    return response.data.data;
  },

  /**
   * PUT /permissions/{id} -- description only. module/resource/action
   * are immutable once created (they're the exact tuple every
   * RequirePermission(...) call and every seed migration matches
   * against) -- create a new permission instead if those need to change.
   */
  async updatePermission(id: number, data: { description?: string }): Promise<Permission | null> {
    const response = await api.put<ApiResponse<Permission>>(`/permissions/${id}`, data);
    return response.data.data;
  },

  /**
   * DELETE /permissions/{id}. Server refuses (422) if the permission is
   * still assigned to any role -- remove it from every role via
   * RolePermissionsModal first.
   */
  async deletePermission(id: number): Promise<void> {
    await api.delete(`/permissions/${id}`);
  },
};
