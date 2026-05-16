import api from '../api-client';
import type { ApiResponse } from '../../types/api';

export const authApi = {

  async login(credentials: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/auth/admin/login', credentials);
    return response.data.data;
  },


  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
