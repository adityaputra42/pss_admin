import type {
  FareClass,
  FareClassInput,
  FareClassUpdateInput,
  ApiResponse,
  ListResponse,
} from '../../types/api';
import api from '../api-client';

/**
 * Fare Class API Service.
 * Endpoints: internal/flight/interfaces/http/router.go's "---- Fare
 * Classes ----" block, all nested under /flights.
 *
 *   GET    /flights/fare-classes             (public read, no permission gate)
 *   GET    /flights/fare-classes/{id}
 *   POST   /flights/fare-classes             permission: flight.fare_class.create
 *   PUT    /flights/fare-classes/{id}        permission: flight.fare_class.update
 *   DELETE /flights/fare-classes/{id}        permission: flight.fare_class.delete
 *
 * List/Get go through MasterDataQueryService, same as Airport/Aircraft
 * -- response is capitalized {Items, Total}, NOT {items, total}.
 */
export const fareClassesApi = {
  async getFareClasses(page = 1, limit = 100): Promise<ListResponse<FareClass>> {
    const response = await api.get<ApiResponse<ListResponse<FareClass>>>(
      '/flights/fare-classes',
      { params: { page, limit } },
    );
    return response.data.data ?? { Items: [], Total: 0 };
  },

  async getFareClassById(id: number): Promise<FareClass | null> {
    const response = await api.get<ApiResponse<FareClass>>(`/flights/fare-classes/${id}`);
    return response.data.data;
  },

  /** Body: { code, name, seat_class_id, refundable, rescheduleable, baggage_kg } */
  async createFareClass(payload: FareClassInput): Promise<FareClass | null> {
    const response = await api.post<ApiResponse<FareClass>>('/flights/fare-classes', payload);
    return response.data.data;
  },

  /** code and seat_class_id are NOT editable -- create a new fare class instead if either needs to change. */
  async updateFareClass(id: number, payload: FareClassUpdateInput): Promise<FareClass | null> {
    const response = await api.put<ApiResponse<FareClass>>(`/flights/fare-classes/${id}`, payload);
    return response.data.data;
  },

  /**
   * DELETE /flights/fare-classes/{id}. NOTE: flight_fares.fare_class_id
   * (and pnr_segments.fare_class_id, once a booking references it) FK
   * this table -- deleting a fare class already used by a generated
   * flight or an existing booking will fail server-side with a raw
   * foreign-key violation (500, not a friendly 409), same tradeoff as
   * seat classes and airports. Safe to delete a fare class that was
   * never used in generate-flights.
   */
  async deleteFareClass(id: number): Promise<void> {
    await api.delete(`/flights/fare-classes/${id}`);
  },
};
