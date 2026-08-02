import api from '../api-client';

import type {
  Flight,
  FlightInput,
  FlightUpdateInput,
  ApiResponse,
  FlightsResponse,
  FlightSearchResult,
} from '../../types/api';

/**
 * Flight Instances API Service.
 *
 * BACKEND (internal/flight/interfaces/http/router.go, all mounted under
 * /flights):
 *   GET  /flights/search           (public flight search -- richer, joined-ish
 *        result incl. fares, but PascalCase fields, see FlightSearchResult)
 *   GET  /flights/instances        (list flight instances -- FLAT rows, only
 *        schedule_id/aircraft_id, no route/aircraft/price/seat info)
 *   GET  /flights/instances/{id}
 *   POST /flights/schedules/{id}/generate-flights (bulk create, with
 *        seats+fares, from a recurring schedule across a date range)
 *
 * As of CreateFlightHandler/UpdateFlightHandler/DeleteFlightHandler,
 * single flight instances are ALSO directly manageable:
 *   POST   /flights/instances            permission: flight.flight.create
 *   PUT    /flights/instances/{id}       permission: flight.flight.update
 *   DELETE /flights/instances/{id}       permission: flight.flight.delete
 *
 * IMPORTANT: manual create does NOT generate flight_seats/flight_fares
 * the way generate-flights does -- a manually created/edited flight has
 * no bookable seats/prices unless those already existed (e.g. editing a
 * flight that generate-flights produced). Use generate-flights to bring
 * a new sellable flight into existence; use create/update/delete here to
 * fix up or remove a bad instance.
 */
export const flightsApi = {
  /**
   * List flight instances.
   * GET /flights/instances?page=&limit=&schedule_id=
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
   * POST /flights/instances -- manual single-instance create. All
   * fields required except status (defaults SCHEDULED server-side).
   * See the module-level note above: no seats/fares are created here.
   */
  async createFlight(payload: FlightInput): Promise<Flight | null> {
    const response = await api.post<ApiResponse<Flight>>('/flights/instances', payload);
    return response.data.data;
  },

  /**
   * PUT /flights/instances/{id}. schedule_id is NOT editable (backend
   * silently ignores it if sent -- see FlightUpdateInput's Omit). Send
   * only the fields that changed; omitted fields keep their current
   * value server-side (COALESCE on the SQL side).
   */
  async updateFlight(id: number, payload: FlightUpdateInput): Promise<Flight | null> {
    const response = await api.put<ApiResponse<Flight>>(`/flights/instances/${id}`, payload);
    return response.data.data;
  },

  /**
   * DELETE /flights/instances/{id}. NOTE: if this flight already has
   * flight_seats/flight_fares/bookings referencing it and those FKs
   * aren't ON DELETE CASCADE, the delete will fail server-side with a
   * raw foreign-key violation (500, not a friendly 409) -- see
   * DeleteFlightHandler's comment. Safe for a flight that was created
   * manually and never booked.
   */
  async deleteFlight(id: number): Promise<void> {
    await api.delete(`/flights/instances/${id}`);
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
