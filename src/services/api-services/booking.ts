import type {
  ApiResponse,
  PNR,
  PNRDetail,
  PNRListResult,
} from '../../types/api';

import api from '../api-client';

/**
 * BACKEND (internal/booking/interfaces/http/router.go):
 *   POST /bookings/pnrs                  (create -- OptionalAuthenticate,
 *        works for both logged-in and guest bookings)
 *
 * Admin visibility/management, added alongside CreatePNRHandler:
 *   GET  /bookings/pnrs                  permission: booking.pnr.view
 *   GET  /bookings/pnrs/{id}             permission: booking.pnr.view
 *   POST /bookings/pnrs/{id}/cancel      permission: booking.pnr.cancel
 *
 * IMPORTANT SCOPE LIMIT on cancel: CancelPNRHandler only allows
 * cancelling a PNR that is still HOLD (not yet paid). A PNR that's
 * already BOOKED (paid) will come back with a 400 -- there is still no
 * refund flow in the payment module, so cancelling a paid booking isn't
 * safe to expose here. See CancelPNRHandler.Handle's comment for why.
 *
 * dashboardApi.getRecentBookings() (dashboard.ts) still exists as a
 * separate, lighter, non-paginated summary view -- prefer getBookings()
 * here for an actual admin bookings list/search page.
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

  /**
   * GET /bookings/pnrs?page=&limit=&status=
   * Summary rows (no contact info) -- follow up with getBookingById for
   * one PNR's full detail. status is optional (e.g. "HOLD", "BOOKED",
   * "CANCELLED", "EXPIRED"); omit for all statuses.
   */
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PNRListResult> {
    const response = await api.get<ApiResponse<PNRListResult>>('/bookings/pnrs', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        status: params?.status || undefined,
      },
    });
    return response.data.data ?? { items: [], total: 0, page: 1, limit: 10 };
  },

  /** GET /bookings/pnrs/{id} -- full detail incl. contact info. */
  async getBookingById(id: number): Promise<PNRDetail | null> {
    const response = await api.get<ApiResponse<PNRDetail>>(`/bookings/pnrs/${id}`);
    return response.data.data;
  },

  /**
   * POST /bookings/pnrs/{id}/cancel. Releases held seats. Only works if
   * the PNR is still HOLD -- expect a 400 (utils.WriteError, message
   * from ErrPNRNotCancellable) if it's already BOOKED, CANCELLED, or
   * EXPIRED. Let that error surface to the admin rather than swallowing
   * it; there's no safe automatic fallback here.
   */
  async cancelBooking(id: number): Promise<void> {
    await api.post(`/bookings/pnrs/${id}/cancel`);
  },
};
