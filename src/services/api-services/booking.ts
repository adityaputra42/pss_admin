import type {
  ApiResponse,
  PNR,
} from '../../types/api';

import api from '../api-client';

/**
 * ⚠️ BACKEND REALITY CHECK (internal/booking/interfaces/http/router.go):
 * the booking module exposes exactly ONE HTTP endpoint:
 *   POST /bookings/pnrs
 * That's it. There is NO GET /bookings (list), NO GET /bookings/{id}, NO
 * GET /bookings/locator/{code}, and NO DELETE/cancel endpoint. An admin
 * "browse all bookings" or "look up one booking" page CANNOT be built
 * against this backend today -- the closest thing that exists is
 * dashboardApi.getRecentBookings() (dashboard.ts), which returns a
 * limited, non-paginated summary view (10-100 rows, a handful of fields),
 * not a real bookings list/search/detail/cancel API. getBookings,
 * getBookingById, getBookingByLocator, and cancelBooking are removed
 * below rather than left pointing at endpoints that don't exist -- this
 * is new backend work (booking module needs read + cancel endpoints
 * added), not something fixable by changing this file.
 */
export const bookingsApi = {
  /**
   * POST /bookings/pnrs
   * Body: { contact: {full_name, email, phone}, passengers: [...],
   *         segments: [{flight_id, fare_class_id}, ...],
   *         seat_selections: [{passenger_index, segment_index,
   *         flight_seat_id}, ...], hold_ttl_seconds? }
   * Uses OptionalAuthenticate server-side: if called with a bearer token,
   * the PNR is recorded as owned by that user (see
   * bookingcontract.PNRInfo.CreatedBy); without one it's a guest booking.
   */
  async createBooking(payload: {
    contact: { full_name: string; email?: string; phone: string };
    passengers: Array<Record<string, unknown>>;
    segments: Array<{ flight_id: number; fare_class_id: number }>;
    seat_selections: Array<{ passenger_index: number; segment_index: number; flight_seat_id: number }>;
    hold_ttl_seconds?: number;
  }): Promise<PNR | null> {
    const response = await api.post<ApiResponse<PNR>>('/bookings/pnrs', payload);
    return response.data.data;
  },
};
