
import type {
  ApiResponse,
  Checkin,
} from '../../types/api';
import api from '../api-client';

export const checkinsApi = {
  async getCheckins(): Promise<Checkin[]> {

    const response = await api.get<ApiResponse<Checkin[]>>(
      '/checkins',
    );

    return response.data.data ?? [];
  },
};
