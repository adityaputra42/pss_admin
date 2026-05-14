// Dashboard types - using API types as source of truth
import type {
  DashboardStats,
  RevenueStats,
  OrderStats,
  RecentOrder,
  TopProduct,
  LowStockProduct,
  OrderAnalytic,
  UserGrowth,
  ActivityLog,
} from './api';

// Re-export API types for backward compatibility
export type {
  DashboardStats,
  RevenueStats,
  OrderStats,
  ActivityLog,
};

// Aliases for consistency
export type Order = RecentOrder;
export type ProductSummary = TopProduct;
export type OrderAnalytics = OrderAnalytic;
export type UserAnalytics = UserGrowth;

// Dashboard state interface
export interface DashboardState {
  stats: DashboardStats | null;
  revenue: RevenueStats | null;
  orderStats: OrderStats | null;

  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];

  orderAnalytics: OrderAnalytic[];
  userAnalytics: UserGrowth[];

  recentActivity: ActivityLog[];

  isLoading: boolean;
  error: string | null;
}
