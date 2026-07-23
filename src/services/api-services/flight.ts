import api from '../api-client';

import type {
  Flight,
  ApiResponse,
  FlightsResponse,
  FlightSearchResult,
} from '../../types/api';

/**
 * Flight Instances API Service.
 *
 * ⚠️ BACKEND REALITY CHECK (internal/flight/interfaces/http/router.go,
 * all mounted under /flights):
 *   GET  /flights/search    (public flight search -- richer, joined-ish
 *        result incl. fares, but PascalCase fields, see FlightSearchResult)
 *   GET  /flights/instances (list flight instances -- FLAT rows, only
 *        schedule_id/aircraft_id, no route/aircraft/price/seat info)
 *   GET  /flights/instances/{id}
 *   POST /flights/schedules/{id}/generate-flights (the ONLY way flights
 *        get created -- there is no direct POST /flights)
 *
 * There is NO PUT /flights/{id}, NO PATCH /flights/{id}/status, NO
 * DELETE /flights/{id}, and NO GET /flights/{id}/seat-map. A single
 * flight instance cannot be edited, status-changed, deleted, or seat-mapped
 * through this backend today -- those functions are removed below rather
 * than left pointing at endpoints that don't exist. If FlightsPage needs
 * any of them, they're new backend work, not a frontend fix.
 */
export const flightsApi = {
  /**
   * List flight instances.
   * GET /flights/instances?page=&limit=&schedule_id=
   * (This replaces the old, nonexistent GET /flights list.)
   */
  async getFlights(
    page: number = 1,
    limit: number = 10,
    scheduleId?: number,
  ): Promise<FlightsResponse> {
    const response = await api.get<ApiResponse<FlightsResponse>>('/flights/instances', {
      params: { page, limit, schedule_id: scheduleId || undefined },
    });
    return response.data.data ?? { items: [], total: 0 };
  },

  /** GET /flights/instances/{id} */
  async getFlightById(id: number): Promise<Flight | null> {
    const response = await api.get<ApiResponse<Flight>>(`/flights/instances/${id}`);
    return response.data.data;
  },

  /**
   * Materialize flight instances from a recurring schedule for a date
   * range, with aircraft assignment and fares.
   * POST /flights/schedules/{scheduleId}/generate-flights
   *
   * Body shape matches generateFlightsRequest exactly -- schedule_id goes
   * in the URL (not the body), segments each need their own aircraft_id
   * and date range (multiple segments = the aircraft rotates mid-range),
   * and fares are required (at least one fare class + price + currency).
   */
  async generateFlights(
    scheduleId: number,
    payload: {
      segments: Array<{ start_date: string; end_date: string; aircraft_id: number }>;
      fares: Array<{ fare_class_id: number; price: string; currency: string }>;
    },
  ): Promise<void> {
    await api.post(`/flights/schedules/${scheduleId}/generate-flights`, payload);
  },

  /**
   * Public flight search.
   * GET /flights/search?departure_airport_id=&arrival_airport_id=&date=&page=&limit=
   * NOTE: params are departure_airport_id / arrival_airport_id (airport
   * IDs, numbers), NOT dep/arr airport codes. Result fields are
   * PascalCase -- see the FlightSearchResult type comment.
   */
  async searchFlights(params: {
    departureAirportId: number;
    arrivalAirportId: number;
    date: string; // YYYY-MM-DD
    page?: number;
    limit?: number;
  }): Promise<FlightSearchResult[]> {
    const response = await api.get<ApiResponse<FlightSearchResult[]>>('/flights/search', {
      params: {
        departure_airport_id: params.departureAirportId,
        arrival_airport_id: params.arrivalAirportId,
        date: params.date,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    });
    return response.data.data ?? [];
  },
};
