import api from '../api-client';
import type { ApiResponse, Me } from '../../types/api';

export const authApi = {
  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/auth/login', credentials);
    return response.data.data;
  },
  async getMe(): Promise<Me | null> {
    const response = await api.get<ApiResponse<Me>>('/auth/me');
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(payload: { token: string; new_password: string }): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },

  async updateMe(payload: Record<string, unknown>): Promise<any> {
    const response = await api.put<ApiResponse<any>>('/auth/me', payload);
    return response.data.data;
  },
  async logout(): Promise<void> {
    return Promise.resolve();
  },
};
