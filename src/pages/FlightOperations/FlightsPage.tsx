import { useEffect, useMemo, useState } from 'react';
import type { Airport, Flight, FlightSchedule, Aircraft, Itinerary, TripType, FareClass, ListResponse } from '../../types/api';
import {
  Plane,
  Search,
  Filter,
  Calendar,
  CalendarRange,
  MapPin,
  ShieldAlert,
  Plus,
  Edit3,
  Trash2,
  PlaneTakeoff,
  DollarSign,
} from 'lucide-react';

import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';

import { flightsApi, airportsApi, flightSchedulesApi, aircraftsApi, fareClassesApi } from '../../services/api-services';
import FlightInstanceModal from '../../components/flight/FlightInstanceModal';
import ItineraryCard from '../../components/flight/ItineraryCard';
import FlightFareManagerModal from '../../components/flight/FlightFareManagerModal';
import GenerateFlightsModal from '../../components/flight/GenerateFlightsModal';

type Tab = 'search' | 'manage';

const FlightsPage = () => {
  const [tab, setTab] = useState<Tab>('search');

  const [outbound, setOutbound] = useState<Itinerary[]>([]);
  const [returnItins, setReturnItins] = useState<Itinerary[]>([]);
  const [tripTypeResult, setTripTypeResult] = useState<TripType>('ONE_WAY');
  const [airports, setAirports] = useState<ListResponse<Airport>>();
  const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [depId, setDepId] = useState<number | ''>('');
  const [arrId, setArrId] = useState<number | ''>('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [returnDate, setReturnDate] = useState('');
  const [maxStops, setMaxStops] = useState<0 | 1>(1);

  // ---- Manage Instances tab ----
  const [instances, setInstances] = useState<ListResponse<Flight>>();
  const [instancesTotal, setInstancesTotal] = useState(0);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [instanceModalOpen, setInstanceModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<Flight | null>(null);
  const [fareModalOpen, setFareModalOpen] = useState(false);
  const [fareModalFlight, setFareModalFlight] = useState<Flight | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  useEffect(() => {
    airportsApi.getAirports().then(setAirports).catch(() => {});
    fareClassesApi.getFareClasses(1, 100).then((r) => setFareClasses(r.Items ?? [])).catch(() => {});
  }, []);

  const airportById = useMemo(() => {
    const map = new Map<number, Airport>();
    for (const a of airports?.Items??[]) map.set(a.id, a);
    return map;
  }, [airports?.Items]);

  const fareClassById = useMemo(() => {
    const map = new Map<number, FareClass>();
    for (const f of fareClasses) map.set(f.id, f);
    return map;
  }, [fareClasses]);

  const scheduleById = useMemo(() => {
    const map = new Map<number, FlightSchedule>();
    for (const s of schedules) map.set(s.id, s);
    return map;
  }, [schedules]);

  const aircraftById = useMemo(() => {
    const map = new Map<number, Aircraft>();
    for (const a of aircrafts) map.set(a.id, a);
    return map;
  }, [aircrafts]);

  const loadInstances = async () => {
    setInstancesLoading(true);
    try {
      const res = await flightsApi.getFlights(1, 100);
      console.log('Loaded flight instances:', res);
      setInstances(res);
      setInstancesTotal(res.Total ?? 0);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load flight instances');
    } finally {
      setInstancesLoading(false);
    }
  };

  const loadManageDeps = async () => {
    try {
      const [scheduleRes, aircraftRes] = await Promise.all([
        flightSchedulesApi.getSchedules({ limit: 100 }),
        aircraftsApi.getAircrafts(),
      ]);
      setSchedules(scheduleRes.items ?? []);
      setAircrafts(aircraftRes.Items ?? []);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load schedules/aircraft');
    }
  };

  useEffect(() => {
    if (tab !== 'manage') return;
    loadInstances();
    loadManageDeps();
  }, [tab]);

  const handleSaveInstance = async (
    data: { schedule_id: number; aircraft_id: number; departure_time: string; arrival_time: string; status: string },
    id: number | null,
  ) => {
    try {
      if (id) {
        const { schedule_id: _unused, ...updatePayload } = data;
        void _unused;
        await flightsApi.updateFlight(id, updatePayload);
      } else {
        await flightsApi.createFlight(data);
      }
      showSuccessAlert(id ? 'Flight instance updated' : 'Flight instance created');
      setInstanceModalOpen(false);
      loadInstances();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to save flight instance');
    }
  };

  const handleDeleteInstance = async (flight: Flight) => {
    const confirmed = await showConfirmAlert(
      'Delete Flight Instance',
      `Delete flight #${flight.id}? If it already has seats, fares, or bookings tied to it, this may fail.`,
    );
    if (!confirmed) return;
    try {
      await flightsApi.deleteFlight(flight.id);
      showSuccessAlert('Flight instance deleted');
      loadInstances();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to delete flight instance');
    }
  };

  const fetchFlights = async () => {
    if (!depId || !arrId || !date) {
      showErrorAlert('Departure, arrival and date are required');
      return;
    }
    if (tripType === 'round_trip' && !returnDate) {
      showErrorAlert('Return date is required for a round trip search');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const result = await flightsApi.searchFlights({
        departureAirportId: depId,
        arrivalAirportId: arrId,
        date,
        tripType,
        returnDate: tripType === 'round_trip' ? returnDate : undefined,
        maxStops,
      });
      setOutbound(result.outbound ?? []);
      setReturnItins(result.return ?? []);
      setTripTypeResult(result.trip_type);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch flights');
      setOutbound([]);
      setReturnItins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700';
      case 'BOARDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'DEPARTED':
        return 'bg-indigo-100 text-indigo-700';
      case 'ARRIVED':
        return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {tab === 'search' ? 'Flight Search' : 'Manage Flight Instances'}
          </h1>

          <p className="text-slate-500 mt-1">
            {tab === 'search'
              ? 'Search operational flights by route and date.'
              : 'Create, edit, or remove individual flight instances directly.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'manage' && (
            <>
              <button
                onClick={() => setGenerateModalOpen(true)}
                className="premium-button bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary flex items-center gap-2"
              >
                <CalendarRange className="w-5 h-5" />
                <span>Generate from Schedule</span>
              </button>
              <button
                onClick={() => { setEditingInstance(null); setInstanceModalOpen(true); }}
                className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Flight Instance</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="premium-card p-1.5 inline-flex gap-1">
        <button
          onClick={() => setTab('search')}
          className={`px-5 py-2.5 rounded text-sm font-bold transition-colors ${tab === 'search' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Search
        </button>
        <button
          onClick={() => setTab('manage')}
          className={`px-5 py-2.5 rounded text-sm font-bold transition-colors ${tab === 'manage' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Manage Instances
        </button>
      </div>

      {tab === 'search' && (
        <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This search view is read-only. For bulk creation from a recurring schedule, use the
            Flight Schedules page's "Generate Flights" action; for editing or removing ONE
            instance directly, use the "Manage Instances" tab above.
          </p>
        </div>
      )}

      {tab === 'search' && (
      <>
      {/* Filters */}
      <div className="premium-card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Departure
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={depId}
                onChange={(e) => setDepId(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
              >
                <option value="">Select airport</option>
                {airports?.Items.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} — {a.city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Arrival
            </label>
            <div className="relative">
              <Plane className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={arrId}
                onChange={(e) => setArrId(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
              >
                <option value="">Select airport</option>
                {airports?.Items.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} — {a.city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Trip Type
            </label>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as 'one_way' | 'round_trip')}
              className="w-full px-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
            >
              <option value="one_way">One-way</option>
              <option value="round_trip">Round trip</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tripType === 'round_trip' && (
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 block">
                Return Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={returnDate}
                  min={date}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Connections
            </label>
            <select
              value={maxStops}
              onChange={(e) => setMaxStops(Number(e.target.value) as 0 | 1)}
              className="w-full px-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
            >
              <option value={0}>Direct flights only</option>
              <option value={1}>Allow 1 connection</option>
            </select>
          </div>

          <div className="flex items-end md:col-start-4">
            <button
              onClick={fetchFlights}
              className="w-full bg-primary hover:bg-secondary text-white py-3 rounded font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Search className="w-4 h-4" />
              Search Flights
            </button>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="premium-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-primary" />
            <p className="text-sm text-slate-600">
              {tripTypeResult === 'ROUND_TRIP' ? (
                <>
                  <span className="font-bold text-slate-900">{outbound.length}</span> outbound ·{' '}
                  <span className="font-bold text-slate-900">{returnItins.length}</span> return itineraries
                </>
              ) : (
                <>
                  <span className="font-bold text-slate-900">{outbound.length}</span> itineraries found
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {hasSearched && (
        isLoading ? (
          <div className="premium-card p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium italic">Loading flights...</p>
          </div>
        ) : error ? (
          <div className="premium-card p-20 text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={fetchFlights} className="mt-4 text-primary font-semibold hover:underline">
              Try Again
            </button>
          </div>
        ) : outbound.length === 0 ? (
          <div className="premium-card p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No flights found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {tripTypeResult === 'ROUND_TRIP' && (
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Outbound</h3>
              )}
              {outbound.map((itin, i) => (
                <ItineraryCard key={i} itinerary={itin} airportById={airportById} fareClassById={fareClassById} />
              ))}
            </div>

            {tripTypeResult === 'ROUND_TRIP' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Return</h3>
                {returnItins.length === 0 ? (
                  <p className="text-sm text-slate-400">No return itineraries found for that date.</p>
                ) : (
                  returnItins.map((itin, i) => (
                    <ItineraryCard key={i} itinerary={itin} airportById={airportById} fareClassById={fareClassById} />
                  ))
                )}
              </div>
            )}
          </div>
        )
      )}
      </>
      )}

      {tab === 'manage' && (
        <div className="premium-card overflow-hidden">
          {instancesLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium italic">Loading flight instances...</p>
            </div>
          ) : (instances?.Items??[]).length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
                <PlaneTakeoff className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">No flight instances yet</p>
              <p className="text-slate-400 text-sm mt-1">Generate some from a schedule, or add one manually.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Schedule</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Aircraft</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Departure</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Arrival</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(instances?.Items ?? []).map((flight) => {
                    const schedule = scheduleById.get(flight.schedule_id);
                    const aircraft = aircraftById.get(flight.aircraft_id);
                    return (
                      <tr key={flight.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">#{flight.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                          {schedule?.flight_number ?? `Schedule #${flight.schedule_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {aircraft?.registration_number ?? `Aircraft #${flight.aircraft_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateTime(flight.departure_time)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateTime(flight.arrival_time)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(flight.status)}`}>
                            {flight.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setFareModalFlight(flight); setFareModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                              title="Manage Fares"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingInstance(flight); setInstanceModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInstance(flight)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {instancesTotal > ((instances?.Items??[]).length ?? 0) && (
            <div className="px-6 py-3 text-xs text-slate-400 border-t border-slate-50">
              Showing {((instances?.Items??[]).length ?? 0)} of {instancesTotal} -- increase the page limit in getFlights() to see more.
            </div>
          )}
        </div>
      )}

      <FlightInstanceModal
        isOpen={instanceModalOpen}
        onClose={() => setInstanceModalOpen(false)}
        flight={editingInstance}
        schedules={schedules}
        aircrafts={aircrafts}
        onSave={handleSaveInstance}
      />

      <FlightFareManagerModal
        isOpen={fareModalOpen}
        onClose={() => setFareModalOpen(false)}
        flight={fareModalFlight}
        fareClasses={fareClasses}
      />

      <GenerateFlightsModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        schedules={schedules}
        aircrafts={aircrafts}
        fareClasses={fareClasses}
        airportById={airportById}
        onGenerated={loadInstances}
      />
    </div>
  );
};

export default FlightsPage;
