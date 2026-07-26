import type {
  ApiResponse,
  AssignPermissionsInput,
  PermissionListResponse,
  RoleDetailResponse,
  RoleInput,
  RoleListResponse,
  RoleUpdateInput,
} from '../../types/api';
import type { Role } from '../../types/rbac';
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

  /** Always creates a non-system, active role -- see RoleInput's doc comment. */
  async createRole(data: RoleInput): Promise<Role | null> {
    const response = await api.post<ApiResponse<Role>>('/roles', data);
    return response.data.data;
  },
  async updateRole(id: number, data: RoleUpdateInput): Promise<Role | null> {
    const response = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data;
  },

  /** Fails (422) for system roles, or any role still assigned to a user. */
  async deleteRole(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

  async replacePermissions(id: number, data: AssignPermissionsInput): Promise<RoleDetailResponse | null> {
    const response = await api.put<ApiResponse<RoleDetailResponse>>(`/roles/${id}/permissions`, data);
    return response.data.data;
  },

  async getAllPermissions(module?: string): Promise<PermissionListResponse> {
    const response = await api.get<ApiResponse<PermissionListResponse>>('/permissions', {
      params: { module, limit: 500 },
    });
    return response.data.data ?? { items: [], total: 0, page: 1, limit: 500 };
  },
};
