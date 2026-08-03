import { useEffect, useMemo, useState } from 'react';

import {
  Ticket,
  ShieldAlert,
  CheckCircle2,
  Search,
  Eye,
  Ban,
  X,
  FileText,
  MapPin,
  Plane,
  Calendar,
  ChevronDown,
} from 'lucide-react';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import { bookingsApi } from '../../services/api-services/booking';
import { flightsApi } from '../../services/api-services/flight';
import { airportsApi } from '../../services/api-services/airport';
import { fareClassesApi } from '../../services/api-services/fareClass';
import ScaleIn from '../../components/animations/ScaleIn';
import DetailTable from '../../components/common/DetailTable';
import ItineraryCard from '../../components/flight/ItineraryCard';

import type { PNR, PNRDetail, PNRSummary, Airport, FareClass, Itinerary, TripType, ListResponse } from '../../types/api';

type Tab = 'create' | 'manage';

const pnrStatusStyle: Record<string, string> = {
  HOLD: 'bg-amber-50 text-amber-600 ring-amber-100',
  BOOKED: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  CANCELLED: 'bg-rose-50 text-rose-600 ring-rose-100',
  EXPIRED: 'bg-slate-100 text-slate-500 ring-slate-200',
};

const BookingPage = () => {
  const [tab, setTab] = useState<Tab>('manage');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PNR | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [flightId, setFlightId] = useState('');
  const [fareClassId, setFareClassId] = useState('');
  const [flightSeatId, setFlightSeatId] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  // ---- Create tab: flight search ----
  const [airports, setAirports] = useState<ListResponse<Airport>>();
  const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
  const [searchDepId, setSearchDepId] = useState<number | ''>('');
  const [searchArrId, setSearchArrId] = useState<number | ''>('');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTripType, setSearchTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [searchReturnDate, setSearchReturnDate] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearchedFlights] = useState(false);
  const [outbound, setOutbound] = useState<Itinerary[]>([]);
  const [returnItins, setReturnItins] = useState<Itinerary[]>([]);
  const [tripTypeResult, setTripTypeResult] = useState<TripType>('ONE_WAY');

  const [selectedOutbound, setSelectedOutbound] = useState<{ itinerary: Itinerary; fareClassId: number } | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<{ itinerary: Itinerary; fareClassId: number } | null>(null);

  useEffect(() => {
    airportsApi.getAirports().then(setAirports).catch(() => {});
    fareClassesApi.getFareClasses(1, 100).then((r) => setFareClasses(r.Items ?? [])).catch(() => {});
  }, []);

  const airportById = useMemo(() => {
    const map = new Map<number, Airport>();
    for (const a of airports?.Items ?? []) map.set(a.id, a);
    return map;
  }, [airports?.Items]);

  const fareClassById = useMemo(() => {
    const map = new Map<number, FareClass>();
    for (const f of fareClasses) map.set(f.id, f);
    return map;
  }, [fareClasses]);

  const searchFlightsForBooking = async () => {
    if (!searchDepId || !searchArrId || !searchDate) {
      showErrorAlert('Departure, arrival and date are required');
      return;
    }
    if (searchTripType === 'round_trip' && !searchReturnDate) {
      showErrorAlert('Return date is required for a round trip');
      return;
    }
    setSearching(true);
    setSearchError('');
    setHasSearchedFlights(true);
    setSelectedOutbound(null);
    setSelectedReturn(null);
    try {
      const result = await flightsApi.searchFlights({
        departureAirportId: searchDepId,
        arrivalAirportId: searchArrId,
        date: searchDate,
        tripType: searchTripType,
        returnDate: searchTripType === 'round_trip' ? searchReturnDate : undefined,
      });
      setOutbound(result.outbound ?? []);
      setReturnItins(result.return ?? []);
      setTripTypeResult(result.trip_type);
    } catch (err: any) {
      setSearchError(err?.response?.data?.message || 'Failed to search flights');
      setOutbound([]);
      setReturnItins([]);
    } finally {
      setSearching(false);
    }
  };

  // Segments derived from the selected itinerary/fare (search flow) --
  // every segment in a chosen itinerary books at that itinerary's chosen
  // fare class, since combined pricing only exists for fare classes
  // offered on every leg (see backend combineFares).
  const selectionSegments = useMemo(() => {
    const segs: Array<{ flight_id: number; fare_class_id: number }> = [];
    if (selectedOutbound) {
      for (const s of selectedOutbound.itinerary.segments) {
        segs.push({ flight_id: s.flight_id, fare_class_id: selectedOutbound.fareClassId });
      }
    }
    if (selectedReturn) {
      for (const s of selectedReturn.itinerary.segments) {
        segs.push({ flight_id: s.flight_id, fare_class_id: selectedReturn.fareClassId });
      }
    }
    return segs;
  }, [selectedOutbound, selectedReturn]);

  const needsReturnSelection = tripTypeResult === 'ROUND_TRIP' && !!selectedOutbound && !selectedReturn;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passengerType, setPassengerType] = useState('ADULT');

  // ---- Manage tab: list / detail / cancel ----
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

  useEffect(() => {
    if (tab !== 'manage') return;
    loadPnrs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter]);

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

  const handleSubmit = async () => {
    // Prefer segments built from the search + fare selection; fall back
    // to the manual flight_id/fare_class_id inputs if nothing was
    // selected via search (e.g. the flight isn't turning up in search
    // for some reason and the user knows the IDs directly).
    const segments = selectionSegments.length > 0
      ? selectionSegments
      : (flightId && fareClassId ? [{ flight_id: Number(flightId), fare_class_id: Number(fareClassId) }] : []);

    if (!fullName || !phone || !firstName || !lastName || segments.length === 0) {
      showErrorAlert('Please fill in all required fields and select a flight.');
      return;
    }
    if (needsReturnSelection) {
      showErrorAlert('Pick a return flight and fare to complete this round trip.');
      return;
    }

    // Manual seat selection only makes sense against a single, unambiguous
    // segment -- a connecting or round-trip booking has more than one and
    // would need a proper per-segment seat picker, which this quick-create
    // form doesn't have yet. Seats stay unassigned in that case.
    const seatSelections = flightSeatId && segments.length === 1
      ? [{ passenger_index: 0, segment_index: 0, flight_seat_id: Number(flightSeatId) }]
      : [];

    setIsSubmitting(true);
    setResult(null);
    try {
      const pnr = await bookingsApi.createBooking({
        contact: { full_name: fullName, email: email || undefined, phone },
        passengers: [
          {
            passenger_type: passengerType,
            first_name: firstName,
            last_name: lastName,
          },
        ],
        segments,
        seat_selections: seatSelections,
      });
      setResult(pnr);
      showSuccessAlert('Booking created!');
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bookings</h1>
        <p className="text-slate-500 mt-1">
          {tab === 'manage'
            ? 'Browse, inspect, and cancel PNRs.'
            : 'Create a quick booking (single passenger, single segment).'}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="premium-card p-1.5 inline-flex gap-1">
        <button
          onClick={() => setTab('manage')}
          className={`px-5 py-2.5 rounded text-sm font-bold transition-colors ${tab === 'manage' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Manage
        </button>
        <button
          onClick={() => setTab('create')}
          className={`px-5 py-2.5 rounded text-sm font-bold transition-colors ${tab === 'create' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Create Booking
        </button>
      </div>

      {tab === 'manage' && (
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
      )}

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

      {tab === 'create' && (
      <>
      <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Search for a flight below and pick a fare. For a round trip, you'll pick both an
          outbound and a return itinerary before the booking can be created.
        </p>
      </div>

      <div className="premium-card p-8 space-y-8">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Passenger</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            <select value={passengerType} onChange={(e) => setPassengerType(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20">
              <option value="ADULT">Adult</option>
              <option value="CHILD">Child</option>
              <option value="INFANT">Infant</option>
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-2">This quick-create form is single-passenger only.</p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Flight</h2>

          {/* Search form */}
          <div className="bg-slate-50/70 rounded p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Departure</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={searchDepId}
                    onChange={(e) => setSearchDepId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none bg-white"
                  >
                    <option value="">Select airport</option>
                    {airports?.Items.map((a) => (
                      <option key={a.id} value={a.id}>{a.code} — {a.city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Arrival</label>
                <div className="relative">
                  <Plane className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={searchArrId}
                    onChange={(e) => setSearchArrId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none bg-white"
                  >
                    <option value="">Select airport</option>
                    {airports?.Items.map((a) => (
                      <option key={a.id} value={a.id}>{a.code} — {a.city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Trip Type</label>
                <select
                  value={searchTripType}
                  onChange={(e) => setSearchTripType(e.target.value as 'one_way' | 'round_trip')}
                  className="w-full px-3 py-2.5 rounded border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none bg-white"
                >
                  <option value="one_way">One-way</option>
                  <option value="round_trip">Round trip</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {searchTripType === 'round_trip' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Return Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={searchReturnDate}
                      min={searchDate}
                      onChange={(e) => setSearchReturnDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-end md:col-start-4">
                <button
                  onClick={searchFlightsForBooking}
                  disabled={searching}
                  className="w-full bg-primary hover:bg-secondary text-white py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  {searching ? 'Searching...' : 'Search Flights'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {hasSearched && (
            <div className="mt-4 space-y-6">
              {searchError ? (
                <p className="text-sm text-red-500">{searchError}</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {tripTypeResult === 'ROUND_TRIP' && (
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        1. Choose outbound
                      </h3>
                    )}
                    {outbound.length === 0 ? (
                      <p className="text-sm text-slate-400">No flights found for that route/date.</p>
                    ) : (
                      outbound.map((itin, i) => (
                        <ItineraryCard
                          key={i}
                          itinerary={itin}
                          airportById={airportById}
                          fareClassById={fareClassById}
                          selectedFareClassId={selectedOutbound?.itinerary === itin ? selectedOutbound.fareClassId : undefined}
                          onSelectFare={(fareClassId) => setSelectedOutbound({ itinerary: itin, fareClassId })}
                        />
                      ))
                    )}
                  </div>

                  {tripTypeResult === 'ROUND_TRIP' && selectedOutbound && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        2. Choose return
                      </h3>
                      {returnItins.length === 0 ? (
                        <p className="text-sm text-slate-400">No return flights found for that date.</p>
                      ) : (
                        returnItins.map((itin, i) => (
                          <ItineraryCard
                            key={i}
                            itinerary={itin}
                            airportById={airportById}
                            fareClassById={fareClassById}
                            selectedFareClassId={selectedReturn?.itinerary === itin ? selectedReturn.fareClassId : undefined}
                            onSelectFare={(fareClassId) => setSelectedReturn({ itinerary: itin, fareClassId })}
                          />
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Selection summary */}
          {(selectedOutbound || selectedReturn) && (
            <div className="mt-4 premium-card p-4 bg-teal-50/50 border border-teal-100 flex items-start justify-between gap-4">
              <div className="text-sm space-y-1">
                {selectedOutbound && (
                  <p className="text-teal-800">
                    <span className="font-bold">Outbound:</span>{' '}
                    {selectedOutbound.itinerary.segments.map((s) => s.flight_number).join(' + ')}
                    {' · '}
                    {fareClassById.get(selectedOutbound.fareClassId)?.code ?? `fare #${selectedOutbound.fareClassId}`}
                  </p>
                )}
                {selectedReturn && (
                  <p className="text-teal-800">
                    <span className="font-bold">Return:</span>{' '}
                    {selectedReturn.itinerary.segments.map((s) => s.flight_number).join(' + ')}
                    {' · '}
                    {fareClassById.get(selectedReturn.fareClassId)?.code ?? `fare #${selectedReturn.fareClassId}`}
                  </p>
                )}
                {needsReturnSelection && (
                  <p className="text-amber-600 text-xs font-semibold">Pick a return flight to continue.</p>
                )}
              </div>
              <button
                onClick={() => { setSelectedOutbound(null); setSelectedReturn(null); }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          {/* Manual fallback */}
          <button
            type="button"
            onClick={() => setShowManualEntry((v) => !v)}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManualEntry ? 'rotate-180' : ''}`} />
            Enter flight_id / fare_class_id manually instead
          </button>
          {showManualEntry && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <input type="number" placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
              <input type="number" placeholder="Fare Class ID" value={fareClassId} onChange={(e) => setFareClassId(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
              <input type="number" placeholder="Flight Seat ID (optional)" value={flightSeatId} onChange={(e) => setFlightSeatId(e.target.value)} className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
            </div>
          )}
          {!showManualEntry && selectionSegments.length === 1 && (
            <div className="mt-3">
              <input
                type="number"
                placeholder="Flight Seat ID (optional)"
                value={flightSeatId}
                onChange={(e) => setFlightSeatId(e.target.value)}
                className="bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 w-full md:w-1/3"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          {isSubmitting ? 'Creating booking...' : 'Create Booking'}
        </button>
      </div>

      {result && (
        <ScaleIn>
        <div className="premium-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Booking Created</h2>
          </div>
          <DetailTable
            rows={[
              { label: 'Booking Code', value: result.BookingCode },
              { label: 'PNR ID', value: result.PNRID },
              { label: 'Status', value: result.Status },
              { label: 'Total', value: `${result.Currency} ${result.TotalAmount}` },
            ]}
          />
        </div>
        </ScaleIn>
      )}
      </>
      )}
    </div>
  );
};

export default BookingPage;
