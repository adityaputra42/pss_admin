import type {
  Aircraft,
  AircraftSeat,
  ApiResponse,
  GenerateSeatLayoutInput,
  ListResponse,
} from '../../types/api';
import api from '../api-client';

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
   * GET /flights/aircrafts/{id}/seats -- the physical seat map. Bare
   * array, not paginated (added alongside GetAircraftSeatLayout --
   * previously only Generate/Clear existed, no way to read the current
   * layout back). Empty array if nothing's been generated yet.
   */
  async getSeatLayout(id: number): Promise<AircraftSeat[]> {
    const response = await api.get<ApiResponse<AircraftSeat[]>>(`/flights/aircrafts/${id}/seats`);
    return response.data.data ?? [];
  },

  /**
   * Generate the seat layout for an aircraft.
   * POST /flights/aircrafts/{id}/seats/generate
   * Body: { layout: [{ seat_class_id, row_start, row_end, seat_letters,
   *         seat_type, exit_rows? }, ...] } -- each entry is a block of
   * rows sharing one seat class (e.g. rows 1-4 Business "AC", rows
   * 5-30 Economy "ABCDEF"). Fails (400) if the layout overlaps an
   * existing one -- clear first if replacing.
   */
  async generateSeatLayout(id: number, payload: GenerateSeatLayoutInput): Promise<void> {
    await api.post(`/flights/aircrafts/${id}/seats/generate`, payload);
  },

  /**
   * DELETE /flights/aircrafts/{id}/seats -- clears the seat layout.
   * Blocked server-side if flights already exist for this aircraft.
   */
  async clearSeatLayout(id: number): Promise<void> {
    await api.delete(`/flights/aircrafts/${id}/seats`);
  },
};
