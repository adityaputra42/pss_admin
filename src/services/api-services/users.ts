import api from '../api-client';

import type {
  User,
  UserInput,
  UserUpdateInput,
  ApiResponse,
} from '../../types/api';

/**
 * Users API Service — Passenger Service System Admin User Management.
 *
 * ⚠️ BACKEND REALITY CHECK (internal/auth/interfaces/http/router.go):
 * the auth module only exposes FOUR user-management endpoints, total:
 *   POST   /auth/register           (permission: user.account.create)
 *   PUT    /auth/users/{id}         (permission: user.account.update)
 *   PATCH  /auth/users/{id}/status  (permission: user.account.status)
 *   PUT    /auth/me                 (self-service, any authenticated user)
 *
 * There is NO GET /users (list), NO GET /users/{id}, NO DELETE /users/{id},
 * NO /users/{id}/activate|deactivate (status changes go through the one
 * generic /status endpoint with a status string), NO /users/bulk, and NO
 * /profile or /profile/password endpoints at all. A user list/detail page
 * cannot be built against this backend today without new read endpoints
 * being added there first -- this file does NOT paper over that with fake
 * data; functions with no backend counterpart are removed below, not kept
 * pointing at a 404.
 */
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
