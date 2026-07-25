import { useEffect, useState } from 'react';
import {
  Banknote,
  Ticket,
  ClipboardCheck,
  ShoppingBag,
  AlertTriangle,
  CalendarRange,
} from 'lucide-react';
import { reportApi } from '../../services/api-services';
import type { ReportOverview, ReportDailyCountRevenuePoint } from '../../types/api';
import { StatCard } from '../../components/common/StatCard';
import Skeleton from '../../components/animations/Skeleton';
import ScaleIn from '../../components/animations/ScaleIn';
import DetailTable from '../../components/common/DetailTable';

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const formatMoney = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

const ReportPage = () => {
  const [from, setFrom] = useState(daysAgoISO(29));
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState<ReportOverview | null>(null);
  const [trend, setTrend] = useState<ReportDailyCountRevenuePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overview, bookings] = await Promise.all([
        reportApi.getOverview({ from, to }),
        reportApi.getBookingsReport({ from, to }),
      ]);
      setData(overview);
      setTrend(bookings?.daily_trend ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="premium-card p-12 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-md flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to load report</h3>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-slate-500 mt-1">
            Bookings, check-ins, payments and ancillary sales combined for {data.period.from} → {data.period.to}.
          </p>
        </div>
        <div className="premium-card p-2 flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none px-1"
          />
          <span className="text-slate-300">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none px-1"
          />
          <button onClick={load} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100">
            Apply
          </button>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Net Revenue" value={formatMoney(data.net_revenue)} icon={<Banknote className="w-6 h-6" />} color="teal" />
        <StatCard title="Bookings" value={`${data.bookings.total} (${data.bookings.paid} paid)`} icon={<Ticket className="w-6 h-6" />} color="blue" />
        <StatCard title="Check-ins" value={data.checkins.total} icon={<ClipboardCheck className="w-6 h-6" />} color="emerald" />
        <StatCard title="Ancillary Sales" value={formatMoney(data.ancillaries.total_revenue)} icon={<ShoppingBag className="w-6 h-6" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ===== BOOKINGS BY STATUS ===== */}
        <ScaleIn>
          <div className="premium-card p-6 h-full">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Bookings by Status</h2>
            <p className="text-xs text-slate-500 mb-4">Created within the selected range.</p>
            {data.bookings.by_status.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No bookings in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="text-left pb-2">Status</th>
                    <th className="text-right pb-2">Count</th>
                    <th className="text-right pb-2">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.bookings.by_status.map((s) => {
                    const pct = data.bookings.total > 0 ? Math.round((s.count / data.bookings.total) * 100) : 0;
                    return (
                      <tr key={s.status}>
                        <td className="py-2 font-bold text-slate-700">{s.status}</td>
                        <td className="py-2 text-right text-slate-600">{s.count}</td>
                        <td className="py-2 text-right font-bold text-slate-900">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </ScaleIn>

        {/* ===== PAYMENTS BY STATUS ===== */}
        <ScaleIn>
          <div className="premium-card p-6 h-full">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Payments by Status</h2>
            <p className="text-xs text-slate-500 mb-4">
              {data.payments.total} created · {formatMoney(data.payments.total_paid)} paid · {formatMoney(data.payments.total_refunded)} refunded
            </p>
            {data.payments.by_status.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No payments in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="text-left pb-2">Status</th>
                    <th className="text-right pb-2">Count</th>
                    <th className="text-right pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.payments.by_status.map((s) => (
                    <tr key={s.status}>
                      <td className="py-2 font-bold text-slate-700">{s.status}</td>
                      <td className="py-2 text-right text-slate-600">{s.count}</td>
                      <td className="py-2 text-right font-bold text-slate-900">{formatMoney(s.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ScaleIn>

        {/* ===== TOP ANCILLARIES ===== */}
        <ScaleIn>
          <div className="premium-card p-6 h-full">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Top Ancillaries</h2>
            <p className="text-xs text-slate-500 mb-4">{data.ancillaries.total_purchases} purchases in this period.</p>
            {data.ancillaries.top_ancillaries.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No ancillary sales in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="text-left pb-2">Ancillary</th>
                    <th className="text-right pb-2">Qty</th>
                    <th className="text-right pb-2">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.ancillaries.top_ancillaries.map((a) => (
                    <tr key={a.ancillary_code}>
                      <td className="py-2">
                        <div className="font-bold text-slate-800">{a.ancillary_name}</div>
                        <div className="text-[11px] text-slate-400">{a.category_name}</div>
                      </td>
                      <td className="py-2 text-right text-slate-600">{a.quantity}</td>
                      <td className="py-2 text-right font-bold text-slate-900">{formatMoney(a.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ScaleIn>
      </div>

      {/* ===== CHECK-INS SUMMARY ===== */}
      <ScaleIn>
        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Check-ins & Baggage</h2>
          <DetailTable
            rows={[
              { label: 'Total Check-ins', value: data.checkins.total },
              { label: 'Bags Checked', value: data.checkins.total_baggage_count },
              { label: 'Total Baggage Weight', value: `${data.checkins.total_baggage_kg.toFixed(1)} kg` },
            ]}
          />
        </div>
      </ScaleIn>

      {/* ===== DAILY BOOKING REVENUE TREND ===== */}
      <ScaleIn>
        <div className="premium-card overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Booking Revenue Trend</h2>
            <p className="text-xs text-slate-500 mb-4">Paid fare revenue by day (excludes ancillary sales).</p>
          </div>
          {trend.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No booking revenue in this period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-right px-6 py-3">Bookings</th>
                  <th className="text-right px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {trend.map((point) => (
                  <tr key={point.date} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-700">{point.date}</td>
                    <td className="px-6 py-3 text-right text-slate-600">{point.count}</td>
                    <td className="px-6 py-3 text-right font-bold text-slate-900">{formatMoney(point.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ScaleIn>

      {/* ===== NOTE ===== */}
      <div className="premium-card p-6 flex items-start gap-4 bg-slate-50/60">
        <p className="text-xs text-slate-500">
          This page covers the combined overview plus a booking revenue trend. Check-ins, payments and ancillary sales
          each also have their own dedicated report endpoint with daily trend data at{' '}
          <code className="font-mono">/reports/checkins</code>, <code className="font-mono">/reports/payments</code> and{' '}
          <code className="font-mono">/reports/ancillaries</code> for future drill-down views.
        </p>
      </div>
    </div>
  );
};

export default ReportPage;
