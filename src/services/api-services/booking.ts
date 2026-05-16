
import type {
  ApiResponse,
  PNR,
} from '../../types/api';
import api from '../api-client';

export const bookingsApi = {
  async getBookings(
    page: number = 1,
    limit: number = 10,
  ): Promise<PNR[]> {

    const response = await api.get<ApiResponse<PNR[]>>(
      '/bookings',
      {
        params: {
          page,
          limit,
        },
      },
    );

    return response.data.data ?? [];
  },

  async getBookingById(
    id: string,
  ): Promise<PNR | null> {

    const response = await api.get<ApiResponse<PNR>>(
      `/bookings/${id}`,
    );

    return response.data.data;
  },

  async cancelBooking(
    id: string,
  ): Promise<void> {

    await api.patch(
      `/bookings/${id}/cancel`,
    );
  },
};
