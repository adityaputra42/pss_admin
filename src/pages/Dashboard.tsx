import { useDashboardData } from '../hooks/useDashboardStats';
import {
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';

const DashboardPage = () => {
  const {
    stats,
    revenue,
    orderStats,
    userAnalytics,
    recentActivity,
    isLoading,
    error,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Preparing your insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="premium-card p-12 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
           <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight transition-all">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.total_users ?? 0}
          icon={<Users className="w-6 h-6" />}
          color="teal"
        />
        <StatCard
          title="Active Users"
          value={stats?.active_users ?? 0}
          icon={<Activity className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Total Revenue"
          value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(revenue?.total_revenue ?? 0)}
          icon={<DollarSign className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Total Orders"
          value={orderStats?.total_orders ?? 0}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="rose"
        />
      </div>

      {/* ===== ANALYTICS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">User Growth Analytics</h2>
            <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-1.5 focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
            </select>
          </div>

          {userAnalytics.length > 0 ? (
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userAnalytics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar
                    dataKey="user_count"
                    name="New Users"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-75 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
               <p className="text-slate-400 text-sm">No analytics data available</p>
            </div>
          )}
        </div>

        {/* ===== RECENT ACTIVITY ===== */}
        <div className="premium-card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h2>

          {recentActivity.length > 0 ? (
            <div className="flex-1 space-y-6 overflow-y-auto max-h-87.5 pr-2 custom-scrollbar">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="relative pl-6 pb-6 last:pb-0 border-l border-slate-100 last:border-0"
                >
                  <div className="absolute -left-1.25 top-1.5 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-white"></div>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.user?.username || 'System'}
                      <span className="font-normal text-slate-500 ml-1">
                        {activity.action} {activity.resource}
                      </span>
                    </p>
                    <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                      {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
               <Activity className="w-8 h-8 text-slate-300 mb-2" />
               <p className="text-slate-400 text-sm">No recent activity detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
