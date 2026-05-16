
import type {
  Aircraft,
  ApiResponse,
} from '../../types/api';
import api from '../api-client';

export const aircraftsApi = {
  async getAircrafts(): Promise<Aircraft[]> {

    const response = await api.get<ApiResponse<Aircraft[]>>(
      '/aircraft',
    );

    return response.data.data ?? [];
  },

  async getAircraftById(
    id: string,
  ): Promise<Aircraft | null> {

    const response = await api.get<ApiResponse<Aircraft>>(
      `/aircraft/${id}`,
    );

    return response.data.data;
  },

  async createAircraft(
    payload: Partial<Aircraft>,
  ): Promise<Aircraft | null> {

    const response = await api.post<ApiResponse<Aircraft>>(
      '/aircraft',
      payload,
    );

    return response.data.data;
  },

  async updateAircraft(
    id: string,
    payload: Partial<Aircraft>,
  ): Promise<Aircraft | null> {

    const response = await api.put<ApiResponse<Aircraft>>(
      `/aircraft/${id}`,
      payload,
    );

    return response.data.data;
  },

  async deleteAircraft(
    id: string,
  ): Promise<void> {

    await api.delete(`/aircraft/${id}`);
  },
};
