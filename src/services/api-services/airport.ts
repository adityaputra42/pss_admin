import api from '../api-client';

import type {
  Airport,
  ApiResponse,
} from '../../types/api';

/**
 * Airport API Service.
 * Real path is /flights/airports (plural, nested under /flights) --
 * was /airport (singular, top-level) before, which doesn't exist.
 */
export const airportsApi = {
  async getAirports(): Promise<Airport[]> {
    const response = await api.get<ApiResponse<Airport[]>>('/flights/airports');
    return response.data.data ?? [];
  },

  async getAirportById(id: number): Promise<Airport | null> {
    const response = await api.get<ApiResponse<Airport>>(`/flights/airports/${id}`);
    return response.data.data;
  },

  /** Body: { code (3-letter, uppercase), name, city, country, timezone } */
  async createAirport(payload: {
    code: string;
    name: string;
    city: string;
    country: string;
    timezone: string;
  }): Promise<Airport | null> {
    const response = await api.post<ApiResponse<Airport>>('/flights/airports', payload);
    return response.data.data;
  },

  /** code is NOT editable once created -- only name/city/country/timezone. */
  async updateAirport(
    id: number,
    payload: Partial<{ name: string; city: string; country: string; timezone: string }>,
  ): Promise<Airport | null> {
    const response = await api.put<ApiResponse<Airport>>(`/flights/airports/${id}`, payload);
    return response.data.data;
  },

  async deleteAirport(id: number): Promise<void> {
    await api.delete(`/flights/airports/${id}`);
  },
};
