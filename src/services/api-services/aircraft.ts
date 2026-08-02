import type {
  Aircraft,
  ApiResponse,
  ListResponse,
} from '../../types/api';
import api from '../api-client';

/**
 * Aircraft API Service.
 * Real path is /flights/aircrafts (plural, nested under /flights) --
 * was /aircraft (singular, top-level) before, which doesn't exist.
 */
export const aircraftsApi = {
  async getAircrafts(): Promise<ListResponse<Aircraft>> {
    const response = await api.get<ApiResponse<ListResponse<Aircraft>>>('/flights/aircrafts');
    return response.data.data ?? { Items: [], Total: 0 };
  },

  async getAircraftById(id: number): Promise<Aircraft | null> {
    const response = await api.get<ApiResponse<Aircraft>>(`/flights/aircrafts/${id}`);
    return response.data.data;
  },

  /** Body: { manufacturer, model, registration_number } */
  async createAircraft(payload: {
    manufacturer: string;
    model: string;
    registration_number: string;
  }): Promise<Aircraft | null> {
    const response = await api.post<ApiResponse<Aircraft>>('/flights/aircrafts', payload);
    return response.data.data;
  },

  /** Only manufacturer/model are editable -- registration_number is NOT. */
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

  /**
   * Generate the seat layout for an aircraft.
   * POST /flights/aircrafts/{id}/seats/generate
   * This endpoint EXISTS on the backend but wasn't used anywhere in this
   * file before -- added since aircraft management is incomplete without
   * it (an aircraft has no bookable seats until this is called).
   */
  async generateSeatLayout(id: number, payload: unknown): Promise<void> {
    await api.post(`/flights/aircrafts/${id}/seats/generate`, payload);
  },

  /** DELETE /flights/aircrafts/{id}/seats -- clears the seat layout. */
  async clearSeatLayout(id: number): Promise<void> {
    await api.delete(`/flights/aircrafts/${id}/seats`);
  },
};
