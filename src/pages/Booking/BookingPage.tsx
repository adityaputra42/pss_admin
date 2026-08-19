import {  useEffect, useState } from 'react';

import {

  Search,
  Eye,
  Ban,
  X,
  FileText,

} from 'lucide-react';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import { bookingsApi } from '../../services/api-services/booking';
import DetailTable from '../../components/common/DetailTable';

import type { PNRDetail, PNRSummary} from '../../types/api';

const pnrStatusStyle: Record<string, string> = {
  HOLD: 'bg-amber-50 text-amber-600 ring-amber-100',
  BOOKED: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  CANCELLED: 'bg-rose-50 text-rose-600 ring-rose-100',
  EXPIRED: 'bg-slate-100 text-slate-500 ring-slate-200',
};

const BookingPage = () => {

  const [pnrs, setPnrs] = useState<PNRSummary[]>([]);
  const [pnrsTotal, setPnrsTotal] = useState(0);
  const [pnrsLoading, setPnrsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<PNRDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);


const loadPnrs = async () => {
  setPnrsLoading(true);
  try {
    const res = await bookingsApi.getBookings({ page: 1, limit: 100, status: statusFilter || undefined });
    setPnrs(res.items ?? []);
    setPnrsTotal(res.total ?? 0);
  } catch (err: any) {
    showErrorAlert(err?.response?.data?.message || 'Failed to load bookings');
  } finally {
    setPnrsLoading(false);
  }
};

  const filteredPnrs = pnrs.filter((p) =>
    p.booking_code.toLowerCase().includes(search.toLowerCase()),
  );

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await bookingsApi.getBookingById(id);
      setDetail(d);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load PNR detail');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async (pnr: PNRSummary) => {
    const confirmed = await showConfirmAlert(
      'Cancel PNR',
      `Cancel booking ${pnr.booking_code}? Held seats will be released. This only works while the PNR is still HOLD (not yet paid).`,
    );
    if (!confirmed) return;
    try {
      await bookingsApi.cancelBooking(pnr.id);
      showSuccessAlert('PNR cancelled');
      loadPnrs();
      if (detail && detail.ID === pnr.id) setDetailOpen(false);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to cancel PNR -- it may already be paid.');
    }
  };


useEffect(() => {
  loadPnrs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [statusFilter]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bookings</h1>
        <p className="text-slate-500 mt-1">Browse, inspect, and cancel PNRs.</p>
      </div>

        <div className="space-y-6">
          <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search booking code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border-none rounded px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="HOLD">Hold</option>
              <option value="BOOKED">Booked</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div className="premium-card overflow-hidden">
            {pnrsLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium italic">Loading bookings...</p>
              </div>
            ) : filteredPnrs.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-medium">No bookings found</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Code</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPnrs.map((pnr) => (
                    <tr key={pnr.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{pnr.booking_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${pnrStatusStyle[pnr.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                          {pnr.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{pnr.payment_status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{pnr.currency} {pnr.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">{new Date(pnr.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDetail(pnr.id)} className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all" title="View detail">
                            <Eye className="w-4 h-4" />
                          </button>
                          {pnr.status === 'HOLD' && (
                            <button onClick={() => handleCancel(pnr)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all" title="Cancel">
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {pnrsTotal > pnrs.length && (
              <div className="px-6 py-3 text-xs text-slate-400 border-t border-slate-50">
                Showing {pnrs.length} of {pnrsTotal}.
              </div>
            )}
          </div>
        </div>
      {/* )} */}

      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailOpen(false)} />
          <div className="relative w-full max-w-lg rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">PNR Detail</h2>
              <button onClick={() => setDetailOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {detailLoading || !detail ? (
                <div className="py-10 flex justify-center">
                  <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <DetailTable
                  rows={[
                    { label: 'Booking Code', value: detail.BookingCode },
                    { label: 'Status', value: detail.Status },
                    { label: 'Payment Status', value: detail.PaymentStatus },
                    { label: 'Total', value: `${detail.Currency} ${detail.TotalAmount}` },
                    { label: 'Hold Expires', value: detail.HoldExpiresAt ? new Date(detail.HoldExpiresAt).toLocaleString('id-ID') : '-' },
                    { label: 'Contact Name', value: detail.ContactName },
                    { label: 'Contact Email', value: detail.ContactEmail || '-' },
                    { label: 'Contact Phone', value: detail.ContactPhone },
                    { label: 'Created By User ID', value: detail.CreatedBy ?? 'Guest booking' },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
