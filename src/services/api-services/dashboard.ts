import api from '../api-client';

import type {
  ApiResponse,
  BookingStatus,
  DashboardSummary,
  RecentBooking,
  RevenueTrend,
  TodayFlight,
} from '../../types/api';

/**
 * Dashboard API Service.
 *
 * Matches internal/dashboard's 5 real endpoints, all under
 * RequirePermission("dashboard", "dashboard", "view") -- caller must be
 * superadmin/admin (see migration 000023_seed_dashboard_permission).
 *
 * ⚠️ getAlerts() below has NO backend endpoint (removed) -- there is no
 * "operational alerts" concept anywhere in pss_modular_cqrs's dashboard
 * module. If the Dashboard page needs it, it has to be built server-side
 * first.
 */
export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary | null> {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return response.data.data;
  },

  async getRevenueTrend(days: number = 7): Promise<RevenueTrend[]> {
    const response = await api.get<ApiResponse<RevenueTrend[]>>('/dashboard/revenue-trend', {
      params: { days },
    });
    return response.data.data ?? [];
  },

  async getBookingStatus(): Promise<BookingStatus[]> {
    const response = await api.get<ApiResponse<BookingStatus[]>>('/dashboard/booking-status');
    return response.data.data ?? [];
  },

  async getTodayFlights(): Promise<TodayFlight[]> {
    const response = await api.get<ApiResponse<TodayFlight[]>>('/dashboard/today-flights');
    return response.data.data ?? [];
  },

  /**
   * NOTE: real path is /dashboard/recent-bookings (flat), NOT
   * /dashboard/bookings/recent (nested) -- fixed here.
   */
  async getRecentBookings(limit: number = 10): Promise<RecentBooking[]> {
    const response = await api.get<ApiResponse<RecentBooking[]>>('/dashboard/recent-bookings', {
      params: { limit },
    });
    return response.data.data ?? [];
  },
};
