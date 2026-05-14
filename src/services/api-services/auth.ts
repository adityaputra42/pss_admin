import api from '../api-client';
import type { ApiResponse } from '../../types/api';

/**
 * Auth API Service
 * Handles authentication related API calls
 */
export const authApi = {
  /**
   * Login user
   * POST /auth/login
   */
  async login(credentials: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/auth/admin/login', credentials);
    return response.data.data;
  },

  /**
   * Logout user (optional, handled client-side mostly)
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
