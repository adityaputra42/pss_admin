import { useEffect, useState, useCallback } from 'react';

import { dashboardApi } from '../services/api-services/dashboard';

import type { DashboardState } from '../types/dashboard';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardState>({
    summary: null,

    revenueTrend: [],

    bookingStatus: [],

    todayFlights: [],

    recentBookings: [],

    alerts: [],

    isLoading: true,
    error: null,
  });

  const fetchDashboard = useCallback(async () => {
    setData((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const results = await Promise.allSettled([
        dashboardApi.getSummary(),
        dashboardApi.getRevenueTrend(),
        dashboardApi.getBookingStatus(),
        dashboardApi.getTodayFlights(),
        dashboardApi.getRecentBookings(),
        dashboardApi.getAlerts(),
      ]);

      const [
        summaryRes,
        revenueTrendRes,
        bookingStatusRes,
        todayFlightsRes,
        recentBookingsRes,
        alertsRes,
      ] = results;

      setData({
        summary:
          summaryRes.status === 'fulfilled'
            ? summaryRes.value ?? null
            : null,

        revenueTrend:
          revenueTrendRes.status === 'fulfilled'
            ? revenueTrendRes.value ?? []
            : [],

        bookingStatus:
          bookingStatusRes.status === 'fulfilled'
            ? bookingStatusRes.value ?? []
            : [],

        todayFlights:
          todayFlightsRes.status === 'fulfilled'
            ? todayFlightsRes.value ?? []
            : [],

        recentBookings:
          recentBookingsRes.status === 'fulfilled'
            ? recentBookingsRes.value ?? []
            : [],

        alerts:
          alertsRes.status === 'fulfilled'
            ? alertsRes.value ?? []
            : [],

        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);

      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load dashboard data',
      }));
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    ...data,
    refetch: fetchDashboard,
  };
};
