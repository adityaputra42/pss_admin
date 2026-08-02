import type {
  SeatClass,
  SeatClassInput,
  SeatClassUpdateInput,
  ApiResponse,
  ListResponse,
} from '../../types/api';
import api from '../api-client';

/**
 * Seat Class API Service.
 * Endpoints: internal/flight/interfaces/http/router.go's "---- Seat
 * Classes ----" block, all nested under /flights.
 *
 *   GET    /flights/seat-classes            (public read, no permission gate)
 *   GET    /flights/seat-classes/{id}
 *   POST   /flights/seat-classes             permission: flight.seat_class.create
 *   PUT    /flights/seat-classes/{id}        permission: flight.seat_class.update
 *   DELETE /flights/seat-classes/{id}        permission: flight.seat_class.delete
 *
 * List/Get go through MasterDataQueryService, same as Airport/Aircraft
 * -- response is capitalized {Items, Total} (see ListResponse<T> and
 * the note on SeatClass in types/api.ts), NOT {items, total}.
 */
export const seatClassesApi = {
  async getSeatClasses(page = 1, limit = 100): Promise<ListResponse<SeatClass>> {
    const response = await api.get<ApiResponse<ListResponse<SeatClass>>>(
      '/flights/seat-classes',
      { params: { page, limit } },
    );
    return response.data.data ?? { Items: [], Total: 0 };
  },

  async getSeatClassById(id: number): Promise<SeatClass | null> {
    const response = await api.get<ApiResponse<SeatClass>>(`/flights/seat-classes/${id}`);
    return response.data.data;
  },

  /** Body: { code, name } */
  async createSeatClass(payload: SeatClassInput): Promise<SeatClass | null> {
    const response = await api.post<ApiResponse<SeatClass>>('/flights/seat-classes', payload);
    return response.data.data;
  },

  /** Only `name` is editable -- code is immutable after creation. */
  async updateSeatClass(id: number, payload: SeatClassUpdateInput): Promise<SeatClass | null> {
    const response = await api.put<ApiResponse<SeatClass>>(`/flights/seat-classes/${id}`, payload);
    return response.data.data;
  },

  /**
   * DELETE /flights/seat-classes/{id}. NOTE: fare_classes.seat_class_id
   * has an FK to this table -- deleting a seat class still referenced by
   * a fare class will fail server-side with a foreign-key violation
   * (surfaces as a 500, the backend doesn't translate it to a friendly
   * 409 today). Reassign or delete dependent fare classes first.
   */
  async deleteSeatClass(id: number): Promise<void> {
    await api.delete(`/flights/seat-classes/${id}`);
  },
};
