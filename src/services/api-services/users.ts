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
 * Handles all user-related API calls
 */
export const usersApi = {
  /**
   * Get paginated list of users
   * GET /users
   */
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<UserListResponse|null> {
    const response = await api.get<ApiResponse<UserListResponse>>('/users', {
      params: { page, limit, search },
    });
    return response.data.data;
  },

  /**
   * Get user by ID
   * GET /users/{id}
   */
  async getUserById(id: number): Promise<User|null> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Create a new user
   * POST /users
   */
  async createUser(data: UserInput): Promise<User|null> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },

  /**
   * Update user
   * PUT /users/{id}
   */
  async updateUser(id: number, data: UserUpdateInput): Promise<User|null> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete user
   * DELETE /users/{id}/delete
   * Note: Backend uses /delete suffix
   */
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}/delete`);
  },

  /**
   * Activate user
   * PUT /users/{id}/activate
   */
  async activateUser(id: number): Promise<User|null> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/activate`);
    return response.data.data;
  },

  /**
   * Deactivate user
   * PUT /users/{id}/deactivate
   */
  async deactivateUser(id: number): Promise<User|null> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/deactivate`);
    return response.data.data;
  },

  /**
   * Update user password (admin)
   * PUT /users/{id}/password
   */
  async updatePassword(id: number, data: PasswordUpdateInput): Promise<void> {
    await api.put(`/users/${id}/password`, data);
  },

  /**
   * Bulk user actions
   * POST /users/bulk
   */
  async bulkUserActions(action: string, userIds: number[]): Promise<void> {
    await api.post('/users/bulk', { action, user_ids: userIds });
  },

  /**
   * Get current user profile
   * GET /profile
   */
  async getProfile(): Promise<User|null> {
    const response = await api.get<ApiResponse<User>>('/profile');
    return response.data.data;
  },

  /**
   * Update current user profile
   * PUT /profile
   */
  async updateProfile(data: UserUpdateInput): Promise<User|null> {
    const response = await api.put<ApiResponse<User>>('/profile', data);
    return response.data.data;
  },

  /**
   * Update current user profile password
   * PUT /profile/password
   */
  async updateProfilePassword(data: any): Promise<void> {
    await api.put('users/me/password', data);
  },
};
