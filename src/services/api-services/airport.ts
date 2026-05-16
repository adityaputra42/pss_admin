
import api from '../api-client';

import type {
  Airport,
  ApiResponse,
} from '../../types/api';

export const airportsApi = {
  async getAirports(): Promise<Airport[]> {
    const response = await api.get<ApiResponse<Airport[]>>(
      '/airport',
    );

    return response.data.data ?? [];
  },

  async getAirportById(
    id: string,
  ): Promise<Airport | null> {

    const response = await api.get<ApiResponse<Airport>>(
      `/airport/${id}`,
    );

    return response.data.data;
  },

  async createAirport(
    payload: Partial<Airport>,
  ): Promise<Airport | null> {

    const response = await api.post<ApiResponse<Airport>>(
      '/airport',
      payload,
    );

    return response.data.data;
  },

  async updateAirport(
    id: string,
    payload: Partial<Airport>,
  ): Promise<Airport | null> {

    const response = await api.put<ApiResponse<Airport>>(
      `/airport/${id}`,
      payload,
    );

    return response.data.data;
  },

  async deleteAirport(
    id: string,
  ): Promise<void> {

    await api.delete(`/airport/${id}`);
  },
};
