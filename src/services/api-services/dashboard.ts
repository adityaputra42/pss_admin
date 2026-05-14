import api from '../api-client';
import type {
  DashboardStats,
  RevenueStats,
  OrderStats,
  OrderAnalytic,
  UserGrowth,
  TopProduct,
  LowStockProduct,
  RecentOrder,
  SystemHealth,
  ActivityLog,
  ApiResponse,
} from '../../types/api';

/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 */
export const dashboardApi = {
  /**
   * Get dashboard overview statistics
   * GET /dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStats| null> {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data;
  },

  /**
   * Get revenue statistics
   * GET /dashboard/revenue
   */
  async getRevenueStats(): Promise<RevenueStats| null> {
    const response = await api.get<ApiResponse<RevenueStats>>('/dashboard/revenue');
    return response.data.data;
  },

  /**
   * Get order statistics
   * GET /dashboard/orders/stats
   */
  async getOrderStats(): Promise<OrderStats| null> {
    const response = await api.get<ApiResponse<OrderStats>>('/dashboard/orders/stats');
    return response.data.data;
  },

  /**
   * Get recent orders
   * GET /dashboard/orders/recent
   */
  async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    const response = await api.get<ApiResponse<RecentOrder[]>>('/dashboard/orders/recent', {
      params: { limit },
    });
    return response.data.data??[];
  },

  /**
   * Get top selling products
   * GET /dashboard/products/top
   */
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const response = await api.get<ApiResponse<TopProduct[]>>('/dashboard/products/top', {
      params: { limit },
    });
    return response.data.data??[];
  },

  /**
   * Get low stock products
   * GET /dashboard/products/low-stock
   */
  async getLowStockProducts(threshold: number = 10, limit: number = 10): Promise<LowStockProduct[]> {
    const response = await api.get<ApiResponse<LowStockProduct[]>>('/dashboard/products/low-stock', {
      params: { threshold, limit },
    });
    return response.data.data??[];
  },

  /**
   * Get order analytics
   * GET /dashboard/analytics/orders
   */
  async getOrderAnalytics(days: number = 30): Promise<OrderAnalytic[]> {
    const response = await api.get<ApiResponse<OrderAnalytic[]>>('/dashboard/analytics/orders', {
      params: { days },
    });
    return response.data.data??[];
  },

  /**
   * Get user growth analytics
   * GET /dashboard/analytics/users
   */
  async getUserGrowth(days: number = 30): Promise<UserGrowth[]> {
    const response = await api.get<ApiResponse<UserGrowth[]>>('/dashboard/analytics/users', {
      params: { days },
    });
    return response.data.data??[];
  },

  /**
   * Get system health status
   * GET /dashboard/health
   */
  async getSystemHealth(): Promise<SystemHealth| null> {
    const response = await api.get<ApiResponse<SystemHealth>>('/dashboard/health');
    return response.data.data;
  },

  /**
   * Get recent activity logs
   * GET /dashboard/activity
   */
  async getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
    const response = await api.get<ApiResponse<ActivityLog[]>>('/dashboard/activity', {
      params: { limit },
    });
    return response.data.data??[];
  },
};
