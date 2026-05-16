import api from '../api-client';

import type {
   ApiResponse,
   BookingStatus,
   DashboardSummary,
   OperationalAlert,
   RecentBooking,
   RevenueTrend,
   TodayFlight,
} from '../../types/api';


export const dashboardApi = {

  async getSummary(): Promise<DashboardSummary | null> {
    const response = await api.get<ApiResponse<DashboardSummary>>(
      '/dashboard/summary'
    );

    return response.data.data;
  },

  async getRevenueTrend(
    days: number = 7
  ): Promise<RevenueTrend[]> {
    const response = await api.get<ApiResponse<RevenueTrend[]>>(
      '/dashboard/revenue-trend',
      {
        params: { days },
      }
    );

    return response.data.data ?? [];
  },

  async getBookingStatus(): Promise<BookingStatus[]> {
    const response = await api.get<ApiResponse<BookingStatus[]>>(
      '/dashboard/booking-status'
    );

    return response.data.data ?? [];
  },

  async getTodayFlights(): Promise<TodayFlight[]> {
    const response = await api.get<ApiResponse<TodayFlight[]>>(
      '/dashboard/flights/today'
    );

    return response.data.data ?? [];
  },

  async getRecentBookings(
    limit: number = 10
  ): Promise<RecentBooking[]> {
    const response = await api.get<ApiResponse<RecentBooking[]>>(
      '/dashboard/bookings/recent',
      {
        params: { limit },
      }
    );

    return response.data.data ?? [];
  },

  async getAlerts(): Promise<OperationalAlert[]> {
    const response = await api.get<ApiResponse<OperationalAlert[]>>(
      '/dashboard/alerts'
    );

    return response.data.data ?? [];
  },
};
