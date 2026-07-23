import api from '../api-client';

import type {
  User,
  UserInput,
  UserUpdateInput,
  ApiResponse,
} from '../../types/api';

export const usersApi = {
  /**
   * Create user.
   * POST /auth/register
   * Body: { username, email, full_name, password, role_id }
   */
  async createUser(data: UserInput): Promise<User | null> {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data.data;
  },

  /**
   * Update another user's profile (admin).
   * PUT /auth/users/{id}
   * Body: { full_name, email } only -- NOT username/role_id/password.
   */
  async updateUser(id: string, data: UserUpdateInput): Promise<User | null> {
    const response = await api.put<ApiResponse<User>>(`/auth/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Change a user's status.
   * PATCH /auth/users/{id}/status
   * Body: { status: "ACTIVE" | "LOCKED" | "INACTIVE" } (see
   * domain/user's Status type for the exact allowed values/transitions --
   * SetUserStatusCommand rejects invalid transitions with 422).
   */
  async setUserStatus(
    id: string,
    status: 'ACTIVE' | 'LOCKED' | 'INACTIVE',
  ): Promise<void> {
    await api.patch(`/auth/users/${id}/status`, { status });
  },

  /**
   * Update the CURRENTLY LOGGED-IN user's own profile.
   * PUT /auth/me
   * Body: { full_name, email }
   */
  async updateMe(data: UserUpdateInput): Promise<User | null> {
    const response = await api.put<ApiResponse<User>>('/auth/me', data);
    return response.data.data;
  },
};
