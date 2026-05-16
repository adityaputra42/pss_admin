import api from '../api-client';

import type {
  User,
  UserInput,
  UserUpdateInput,
  PasswordUpdateInput,
  UserListResponse,
  ApiResponse,
} from '../../types/api';

/**
 * Users API Service
 * Passenger Service System - Admin User Management
 */
export const usersApi = {
  /**
   * Get paginated users
   * GET /users
   */
  async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role_id?: number,
  ): Promise<UserListResponse | null> {

    const response = await api.get<
      ApiResponse<UserListResponse>
    >('/users', {
      params: {
        page,
        limit,
        search,
        role_id,
      },
    });

    return response.data.data;
  },

  /**
   * Get user by UID
   * GET /users/{id}
   */
  async getUserById(
    id: string,
  ): Promise<User | null> {

    const response = await api.get<
      ApiResponse<User>
    >(`/users/${id}`);

    return response.data.data;
  },

  /**
   * Create user
   * POST /users
   */
  async createUser(
    data: UserInput,
  ): Promise<User | null> {

    const response = await api.post<
      ApiResponse<User>
    >('/users', data);

    return response.data.data;
  },

  /**
   * Update user
   * PUT /users/{id}
   */
  async updateUser(
    id: string,
    data: UserUpdateInput,
  ): Promise<User | null> {

    const response = await api.put<
      ApiResponse<User>
    >(`/users/${id}`, data);

    return response.data.data;
  },

  /**
   * Delete user
   * DELETE /users/{id}
   */
  async deleteUser(
    id: string,
  ): Promise<void> {

    await api.delete(
      `/users/${id}`,
    );
  },

  /**
   * Activate user
   * PATCH /users/{id}/activate
   */
  async activateUser(
    id: string,
  ): Promise<User | null> {

    const response = await api.patch<
      ApiResponse<User>
    >(`/users/${id}/activate`);

    return response.data.data;
  },

  /**
   * Deactivate user
   * PATCH /users/{id}/deactivate
   */
  async deactivateUser(
    id: string,
  ): Promise<User | null> {

    const response = await api.patch<
      ApiResponse<User>
    >(`/users/${id}/deactivate`);

    return response.data.data;
  },

  /**
   * Update user password
   * PATCH /users/{id}/password
   */
  async updatePassword(
    id: string,
    data: PasswordUpdateInput,
  ): Promise<void> {

    await api.patch(
      `/users/${id}/password`,
      data,
    );
  },

  /**
   * Bulk action
   * POST /users/bulk
   */
  async bulkUserActions(
    action:
      | 'activate'
      | 'deactivate'
      | 'delete',
    userIds: string[],
  ): Promise<void> {

    await api.post(
      '/users/bulk',
      {
        action,
        user_ids: userIds,
      },
    );
  },

  /**
   * Get current profile
   * GET /profile
   */
  async getProfile(): Promise<User | null> {

    const response = await api.get<
      ApiResponse<User>
    >('/profile');

    return response.data.data;
  },

  /**
   * Update current profile
   * PUT /profile
   */
  async updateProfile(
    data: UserUpdateInput,
  ): Promise<User | null> {

    const response = await api.put<
      ApiResponse<User>
    >('/profile', data);

    return response.data.data;
  },

  /**
   * Update current profile password
   * PATCH /profile/password
   */
  async updateProfilePassword(
    data: {
      old_password: string;
      new_password: string;
      confirm_password: string;
    },
  ): Promise<void> {

    await api.patch(
      '/profile/password',
      data,
    );
  },
};
