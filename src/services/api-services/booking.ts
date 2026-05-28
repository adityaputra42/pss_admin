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
    const response =
      await api.get<
        ApiResponse<PNR[]>
      >('/bookings', {
        params: {
          page,
          limit,
        },
      });

    console.log(
      'GET BOOKINGS RESPONSE:',
      response.data,
    );

    const data =
      response.data?.data;

    return Array.isArray(data)
      ? data
      : [];
  },

  async getBookingById(
    id: string,
  ): Promise<PNR | null> {
    const response =
      await api.get<
        ApiResponse<PNR>
      >(`/bookings/${id}`);

    console.log(
      'GET BOOKING DETAIL RESPONSE:',
      response.data,
    );

    return (
      response.data?.data ??
      null
    );
  },

  async getBookingByLocator(
    locator: string,
  ): Promise<PNR | null> {
    const response =
      await api.get<
        ApiResponse<PNR>
      >(
        `/bookings/locator/${locator}`,
      );

    console.log(
      'GET BOOKING LOCATOR RESPONSE:',
      response.data,
    );

    return (
      response.data?.data ??
      null
    );
  },

  async cancelBooking(
    id: string,
  ): Promise<void> {
    await api.delete(
      `/bookings/${id}`,
    );
  },
};
