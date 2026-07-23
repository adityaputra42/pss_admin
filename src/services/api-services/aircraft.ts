import type {
  Aircraft,
  ApiResponse,
} from '../../types/api';
import api from '../api-client';


export const aircraftsApi = {
  async getAircrafts(): Promise<Aircraft[]> {
    const response = await api.get<ApiResponse<Aircraft[]>>('/flights/aircrafts');
    return response.data.data ?? [];
  },

  async getAircraftById(id: number): Promise<Aircraft | null> {
    const response = await api.get<ApiResponse<Aircraft>>(`/flights/aircrafts/${id}`);
    return response.data.data;
  },
 async createAircraft(payload: {
    manufacturer: string;
    model: string;
    registration_number: string;
  }): Promise<Aircraft | null> {
    const response = await api.post<ApiResponse<Aircraft>>('/flights/aircrafts', payload);
    return response.data.data;
  },
async updateAircraft(
    id: number,
    payload: Partial<{ manufacturer: string; model: string }>,
  ): Promise<Aircraft | null> {
    const response = await api.put<ApiResponse<Aircraft>>(`/flights/aircrafts/${id}`, payload);
    return response.data.data;
  },

  async deleteAircraft(id: number): Promise<void> {
    await api.delete(`/flights/aircrafts/${id}`);
  },


  async generateSeatLayout(id: number, payload: unknown): Promise<void> {
    await api.post(`/flights/aircrafts/${id}/seats/generate`, payload);
  },
  async clearSeatLayout(id: number): Promise<void> {
    await api.delete(`/flights/aircrafts/${id}/seats`);
  },
};
