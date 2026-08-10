import type {
  ApiResponse,
  PNR,
  PNRDetail,
  PNRListResult,
} from '../../types/api';

import api from '../api-client';

export const bookingsApi = {

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

  async cancelBooking(id: number): Promise<void> {
    await api.post(`/bookings/pnrs/${id}/cancel`);
  },
};
