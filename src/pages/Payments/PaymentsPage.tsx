import { useEffect, useState } from 'react';

import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  RefreshCcw,
} from 'lucide-react';

import { showErrorAlert } from '../../utils/alerts';
import ScaleIn from '../../components/animations/ScaleIn';
import DetailTable from '../../components/common/DetailTable';

import type { Payment } from '../../types/api';
import { paymentsApi } from '../../services/api-services';

/**
 * GET /payments (admin, list across all PNRs) was added alongside
 * GetPaymentByID/GetPaymentByPNR -- "Browse" below is the new list view;
 * "Lookup" is the original by-id/by-pnr tool, unchanged. There is still
 * NO refund endpoint of any kind (DOKU's Virtual Account product this
 * integrates with has no refund flow) -- don't add a refund button
 * against this API.
 */
const statusStyle: Record<string, { icon: React.ReactNode; className: string }> = {
  PAID: { icon: <CheckCircle2 className="w-4 h-4" />, className: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
  PENDING: { icon: <Clock3 className="w-4 h-4" />, className: 'bg-amber-50 text-amber-600 ring-amber-100' },
  FAILED: { icon: <XCircle className="w-4 h-4" />, className: 'bg-rose-50 text-rose-600 ring-rose-100' },
  EXPIRED: { icon: <AlertTriangle className="w-4 h-4" />, className: 'bg-slate-100 text-slate-500 ring-slate-200' },
  REFUNDED: { icon: <RefreshCcw className="w-4 h-4" />, className: 'bg-sky-50 text-sky-600 ring-sky-100' },
};

type Tab = 'browse' | 'lookup';

const PaymentsPage = () => {
  const [tab, setTab] = useState<Tab>('browse');

  // ---- Browse (list) ----
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const loadPayments = async () => {
    setListLoading(true);
    try {
      const res = await paymentsApi.getPayments({ page: 1, limit: 100, status: statusFilter || undefined });
      setPayments(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load payments');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== 'browse') return;
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter]);

  // ---- Lookup (by id / by pnr) ----
  const [mode, setMode] = useState<'id' | 'pnr'>('pnr');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setSearched(true);
    setPayment(null);
    try {
      const result =
        mode === 'id'
          ? await paymentsApi.getPaymentById(Number(query))
          : await paymentsApi.getPaymentByPNR(Number(query));
      setPayment(result);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Payment not found');
    } finally {
      setIsLoading(false);
    }
  };

  const style = payment ? statusStyle[payment.Status] : undefined;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Payments</h1>
        <p className="text-slate-500 mt-1">
          {tab === 'browse' ? 'Browse payments across all PNRs.' : 'Look up a payment by its ID or by PNR ID.'}
        </p>
      </div>

      <div className="premium-card p-1.5 inline-flex gap-1">
        <button
          onClick={() => setTab('browse')}
          className={`px-5 py-2.5 rounded text-sm font-bold transition-colors ${tab === 'browse' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Browse
        </button>
        <button
          onClick={() => setTab('lookup')}
          className={`px-5 py-2.5 rounded text-sm font-bold transition-colors ${tab === 'lookup' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Lookup
        </button>
      </div>

      <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          No refund action exists on the backend -- DOKU's Virtual Account product has no refund
          flow. This page is read-only.
        </p>
      </div>

      {tab === 'browse' && (
        <>
          <div className="premium-card p-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border-none rounded px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="premium-card overflow-hidden">
            {listLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium italic">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-medium">No payments found</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Code</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">PNR ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Paid At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map((p) => {
                    const s = statusStyle[p.Status];
                    return (
                      <tr key={p.ID} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{p.PaymentCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">#{p.PNRID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{p.Currency} {p.Amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">{p.Method}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {s ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset inline-flex items-center gap-1.5 ${s.className}`}>
                              {s.icon}{p.Status}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{p.Status}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">{p.PaidAt ?? '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {total > payments.length && (
              <div className="px-6 py-3 text-xs text-slate-400 border-t border-slate-50">
                Showing {payments.length} of {total} -- increase the page limit in getPayments() to see more.
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'lookup' && (
        <>
          <div className="premium-card p-6 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('pnr')}
                className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'pnr' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                By PNR ID
              </button>
              <button
                onClick={() => setMode('id')}
                className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'id' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                By Payment ID
              </button>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={mode === 'pnr' ? 'PNR ID' : 'Payment ID'}
                  className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading || !query}
                className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {searched && !isLoading && (
            payment ? (
              <ScaleIn>
              <div className="premium-card p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{payment.PaymentCode}</h2>
                      <p className="text-sm text-slate-500">PNR #{payment.PNRID}</p>
                    </div>
                  </div>
                  {style && (
                    <span className={`px-3 py-1.5 ring-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${style.className}`}>
                      {style.icon}
                      {payment.Status}
                    </span>
                  )}
                </div>

                <DetailTable
                  rows={[
                    { label: 'Amount', value: `${payment.Currency} ${payment.Amount}` },
                    { label: 'Method', value: payment.Method },
                    { label: 'Paid At', value: payment.PaidAt ?? '-' },
                    { label: 'Expires At', value: payment.ExpiredAt ?? '-' },
                  ]}
                />
              </div>
              </ScaleIn>
            ) : (
              <div className="premium-card p-16 text-center">
                <p className="text-slate-500 font-medium">No payment found.</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default PaymentsPage;
