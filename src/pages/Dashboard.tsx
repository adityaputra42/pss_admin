import { useDashboardData } from '../hooks/useDashboardStats';

import {
  Users,
  Banknote,
  Plane,
  Ticket,
  AlertTriangle,
  Clock3,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,

} from 'recharts';

import { StatCard } from '../components/common/StatCard';

const BOOKING_STATUS_COLORS = [
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#6366f1',
  '#0ea5e9',
];

const DashboardPage = () => {
  const {
    summary,
    revenueTrend,
    bookingStatus,
    todayFlights,
    recentBookings,
    alerts,
    isLoading,
    error,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>

          <p className="text-slate-500 font-medium">
            Loading operational dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="premium-card p-12 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Failed to load dashboard
        </h3>

        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ===== PAGE HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Operations Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor flights, bookings, revenue, and passenger operations in
            real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 focus:outline-none">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={summary?.total_bookings ?? 0}
          icon={<Ticket className="w-6 h-6" />}
          color="teal"
        />

        <StatCard
          title="Today's Flights"
          value={summary?.today_flights ?? 0}
          icon={<Plane className="w-6 h-6" />}
          color="teal"
        />

        <StatCard
          title="Passengers"
          value={summary?.total_passengers ?? 0}
          icon={<Users className="w-6 h-6" />}
          color="emerald"
        />

        <StatCard
          title="Revenue"
          value={new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(summary?.total_revenue ?? 0)}
          icon={<Banknote className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* ===== CHART SECTION ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Trend */}
        <div className="xl:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Revenue Trend
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Revenue performance over selected period
              </p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#14b8a6"
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status */}
        <div className="premium-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Booking Status
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Distribution of booking states
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatus}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {bookingStatus.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        BOOKING_STATUS_COLORS[
                          index % BOOKING_STATUS_COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-4">
            {bookingStatus.map((item, index) => (
              <div
                key={item.status}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background:
                        BOOKING_STATUS_COLORS[
                          index % BOOKING_STATUS_COLORS.length
                        ],
                    }}
                  />

                  <span className="text-sm text-slate-600">
                    {item.status}
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FLIGHT OPERATIONS ===== */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Today's Flights
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Active flight operations overview
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 text-sm font-semibold text-slate-500">
                  Flight
                </th>

                <th className="text-left py-4 text-sm font-semibold text-slate-500">
                  Route
                </th>

                <th className="text-left py-4 text-sm font-semibold text-slate-500">
                  Departure
                </th>

                <th className="text-left py-4 text-sm font-semibold text-slate-500">
                  Aircraft
                </th>

                <th className="text-left py-4 text-sm font-semibold text-slate-500">
                  Passengers
                </th>

                <th className="text-left py-4 text-sm font-semibold text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {todayFlights.map((flight) => (
                <tr
                  key={flight.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60"
                >
                  <td className="py-4 font-semibold text-slate-900">
                    {flight.flight_number}
                  </td>

                  <td className="py-4 text-slate-600">
                    {flight.origin} → {flight.destination}
                  </td>

                  <td className="py-4 text-slate-600">
                    {flight.departure_time}
                  </td>

                  <td className="py-4 text-slate-600">
                    {flight.aircraft}
                  </td>

                  <td className="py-4 text-slate-600">
                    {flight.passenger_count}
                  </td>

                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                      {flight.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== BOTTOM SECTION ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="premium-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Bookings
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Latest passenger booking activity
            </p>
          </div>

          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {booking.booking_code}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    {booking.passenger_name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {booking.route}
                  </p>

                  <span className="text-xs text-slate-500">
                    {booking.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="premium-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Operational Alerts
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Issues requiring immediate attention
            </p>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {alert.title}
                  </p>

                  <p className="text-sm text-slate-600 mt-1">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                    <Clock3 className="w-3 h-3" />
                    {alert.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
