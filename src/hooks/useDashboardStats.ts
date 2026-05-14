import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '../services/api-services/dashboard';
import type { DashboardState } from '../types/dashboard';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardState>({
    stats: null,
    revenue: null,
    orderStats: null,

    recentOrders: [],
    topProducts: [],
    lowStockProducts: [],

    orderAnalytics: [],
    userAnalytics: [],

    recentActivity: [],

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
        dashboardApi.getDashboardStats(),
        dashboardApi.getRevenueStats(),
        dashboardApi.getOrderStats(),
        dashboardApi.getRecentOrders(),
        dashboardApi.getTopProducts(),
        dashboardApi.getLowStockProducts(),
        dashboardApi.getOrderAnalytics(),
        dashboardApi.getUserGrowth(),
        dashboardApi.getRecentActivity(),
      ]);

      const [
        statsRes,
        revenueRes,
        orderStatsRes,
        recentOrdersRes,
        topProductsRes,
        lowStockRes,
        orderAnalyticsRes,
        userAnalyticsRes,
        activityRes,
      ] = results;

      setData({
        stats:
          statsRes.status === 'fulfilled'
            ? statsRes.value ?? null
            : null,

        revenue:
          revenueRes.status === 'fulfilled'
            ? revenueRes.value ?? null
            : null,

        orderStats:
          orderStatsRes.status === 'fulfilled'
            ? orderStatsRes.value ?? null
            : null,

        recentOrders:
          recentOrdersRes.status === 'fulfilled'
            ? recentOrdersRes.value ?? []
            : [],

        topProducts:
          topProductsRes.status === 'fulfilled'
            ? topProductsRes.value ?? []
            : [],

        lowStockProducts:
          lowStockRes.status === 'fulfilled'
            ? lowStockRes.value ?? []
            : [],

        orderAnalytics:
          orderAnalyticsRes.status === 'fulfilled'
            ? orderAnalyticsRes.value ?? []
            : [],

        userAnalytics:
          userAnalyticsRes.status === 'fulfilled'
            ? userAnalyticsRes.value ?? []
            : [],

        recentActivity:
          activityRes.status === 'fulfilled'
            ? activityRes.value ?? []
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
