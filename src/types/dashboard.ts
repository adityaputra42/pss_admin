import type {
  DashboardSummary,
  RevenueTrend,
  BookingStatus,
  TodayFlight,
  RecentBooking,
  OperationalAlert,
} from './api';

export type {
  DashboardSummary,
  RevenueTrend,
  BookingStatus,
  TodayFlight,
  RecentBooking,
  OperationalAlert,
};

export interface DashboardState {
  summary: DashboardSummary | null;

  revenueTrend: RevenueTrend[];

  bookingStatus: BookingStatus[];

  todayFlights: TodayFlight[];

  recentBookings: RecentBooking[];

  alerts: OperationalAlert[];

  isLoading: boolean;
  error: string | null;
}
