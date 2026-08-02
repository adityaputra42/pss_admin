import api from '../api-client';

import type {
  User,
  UserInput,
  UserUpdateInput,
  UserListResult,
  ApiResponse,
} from '../../types/api';

/**
 * Users API Service — Passenger Service System Admin User Management.
 *
 * BACKEND (internal/auth/interfaces/http/router.go):
 *   POST   /auth/register           permission: user.account.create
 *   GET    /auth/users              permission: user.account.view   (list, admin)
 *   GET    /auth/users/{id}         permission: user.account.view   (get, admin)
 *   PUT    /auth/users/{id}         permission: user.account.update
 *   PATCH  /auth/users/{id}/status  permission: user.account.status
 *   PUT    /auth/me                 self-service, any authenticated user
 *
 * List/Get were added alongside ListUsersHandler/GetUserHandler --
 * GetUserHandler itself existed earlier (used internally by /me) but
 * wasn't reachable for any user other than the caller until now.
 *
 * Still NO DELETE /users/{id} and NO hard-delete of any kind -- status
 * ("ACTIVE" | "LOCKED" | "INACTIVE") is the deliberate soft-delete
 * mechanism, since a user row is referenced by booking_history, and hard
 * deleting it would break that trail. Use setUserStatus('INACTIVE') for
 * "remove this user", not a DELETE call that doesn't exist.
 */
export const usersApi = {
  /**
   * List users (admin).
   * GET /auth/users?page=&limit=
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<UserListResult> {
    const response = await api.get<ApiResponse<UserListResult>>('/auth/users', {
      params: { page, limit },
    });
    return response.data.data ?? { items: [], total: 0, page: 1, limit: 10 };
  },

  /** GET /auth/users/{id} (admin) */
  async getUserById(id: number): Promise<User | null> {
    const response = await api.get<ApiResponse<User>>(`/auth/users/${id}`);
    return response.data.data;
  },

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
