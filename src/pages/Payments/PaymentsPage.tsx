import { useState } from 'react';

import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

import { showErrorAlert } from '../../utils/alerts';
import ScaleIn from '../../components/animations/ScaleIn';

import type { Payment } from '../../types/api';
import { paymentsApi } from '../../services/api-services';

/**
 * ⚠️ Backend reality: no GET /payments (list) and no refund endpoint of
 * any kind exist in pss_modular_cqrs (DOKU's Virtual Account product has
 * no refund flow). This page is a lookup tool (by payment id or PNR id),
 * not a browsable table. See payments.ts for the full endpoint inventory.
 */
const statusStyle: Record<string, { icon: React.ReactNode; className: string }> = {
  PAID: { icon: <CheckCircle2 className="w-4 h-4" />, className: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
  PENDING: { icon: <Clock3 className="w-4 h-4" />, className: 'bg-amber-50 text-amber-600 ring-amber-100' },
  FAILED: { icon: <XCircle className="w-4 h-4" />, className: 'bg-rose-50 text-rose-600 ring-rose-100' },
  EXPIRED: { icon: <AlertTriangle className="w-4 h-4" />, className: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

const PaymentsPage = () => {
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
        <p className="text-slate-500 mt-1">Look up a payment by its ID or by PNR ID.</p>
      </div>

      <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          No payments list and no refund action exist on the backend -- this is a lookup tool only.
        </p>
      </div>

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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-md p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</p>
                <h4 className="text-lg font-bold text-slate-900 mt-2">{payment.Currency} {payment.Amount}</h4>
              </div>
              <div className="bg-slate-50 rounded-md p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</p>
                <h4 className="text-lg font-bold text-slate-900 mt-2">{payment.Method}</h4>
              </div>
              <div className="bg-slate-50 rounded-md p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid At</p>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{payment.PaidAt ?? '-'}</h4>
              </div>
              <div className="bg-slate-50 rounded-md p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expires At</p>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{payment.ExpiredAt ?? '-'}</h4>
              </div>
            </div>
          </div>
          </ScaleIn>
        ) : (
          <div className="premium-card p-16 text-center">
            <p className="text-slate-500 font-medium">No payment found.</p>
          </div>
        )
      )}
    </div>
  );
};

export default PaymentsPage;
