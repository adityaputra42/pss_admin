/* =========================================================
   FLIGHT SCHEDULE SERVICE
   Real endpoints, all nested under /flights (NOT top-level /schedules
   or /flight-schedules -- both wrong before, and inconsistent with each
   other in the old file).
========================================================= */

import type {
  ApiResponse,
  FlightSchedule,
} from '../../types/api';
import api from '../api-client';

export const flightSchedulesApi = {
  /**
   * GET /flights/schedules?page=&limit=&departure_airport_id=&arrival_airport_id=
   * Real response is paginated: { items: [...], total: N } (see
   * FlightScheduleHandler.List's `map[string]any{"items":..., "total":...}`)
   * -- lowercase, and NOT the same shape as the generic capitalized
   * ListResponse<T> used by Airport/Aircraft/SeatClass/FareClass (those
   * go through MasterDataQueryService/ListResult[T], which has no json
   * tags; flight schedules build their own map by hand instead). This
   * was previously mistyped as ListResponse<T> here -- fixed to match
   * what the handler actually sends.
   */
  async getSchedules(params?: {
    page?: number;
    limit?: number;
    departureAirportId?: number;
    arrivalAirportId?: number;
  }): Promise<{ items: FlightSchedule[]; total: number }> {
    const response = await api.get<ApiResponse<{ items: FlightSchedule[]; total: number }>>(
      '/flights/schedules',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
          departure_airport_id: params?.departureAirportId,
          arrival_airport_id: params?.arrivalAirportId,
        },
      },
    );
    return response.data.data ?? { items: [], total: 0 };
  },

  /** GET /flights/schedules/{id} */
  async getScheduleById(id: number): Promise<FlightSchedule | null> {
    const response = await api.get<ApiResponse<FlightSchedule>>(`/flights/schedules/${id}`);
    return response.data.data;
  },

  /**
   * POST /flights/schedules
   * Body: { flight_number, departure_airport_id, arrival_airport_id,
   *         departure_time: "HH:MM", arrival_time: "HH:MM",
   *         operating_days } -- operating_days is a bitmask (int16), NOT
   * a string/array of day names.
   */
  async createSchedule(payload: {
    flight_number: string;
    departure_airport_id: number;
    arrival_airport_id: number;
    departure_time: string;
    arrival_time: string;
    operating_days: number;
  }): Promise<FlightSchedule | null> {
    const response = await api.post<ApiResponse<FlightSchedule>>('/flights/schedules', payload);
    return response.data.data;
  },

  /**
   * PUT /flights/schedules/{id}
   * Only departure_time/arrival_time/operating_days are editable --
   * flight_number and the two airport ids are NOT (create a new schedule
   * instead if the route itself changes).
   */
  async updateSchedule(
    id: number,
    payload: Partial<{
      departure_time: string;
      arrival_time: string;
      operating_days: number;
    }>,
  ): Promise<FlightSchedule | null> {
    const response = await api.put<ApiResponse<FlightSchedule>>(`/flights/schedules/${id}`, payload);
    return response.data.data;
  },

  /** DELETE /flights/schedules/{id} */
  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`/flights/schedules/${id}`);
  },
};
