import { useEffect, useMemo, useState } from 'react';
import type { Airport, FlightSearchResult, ListResponse } from '../../types/api';
import {
  Plane,
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';

import { showErrorAlert } from '../../utils/alerts';

import { flightsApi, airportsApi } from '../../services/api-services';


const FlightsPage = () => {
  const [flights, setFlights] = useState<FlightSearchResult[]>([]);
  const [airports, setAirports] = useState<ListResponse<Airport>>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [depId, setDepId] = useState<number | ''>('');
  const [arrId, setArrId] = useState<number | ''>('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  useEffect(() => {
    airportsApi.getAirports().then(setAirports).catch(() => {});
  }, []);

  const airportById = useMemo(() => {
    const map = new Map<number, Airport>();
    for (const a of airports?.Items??[]) map.set(a.id, a);
    return map;
  }, [airports?.Items]);

  const fetchFlights = async () => {
    if (!depId || !arrId || !date) {
      showErrorAlert('Departure, arrival and date are required');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const results = await flightsApi.searchFlights({
        departureAirportId: depId,
        arrivalAirportId: arrId,
        date,
      });
      setFlights(results);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch flights');
      setFlights([]);
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
            Flight Search
          </h1>

          <p className="text-slate-500 mt-1">
            Search operational flights by route and date.
          </p>
        </div>
      </div>

      <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          There's no add/edit/delete here: individual flights aren't created directly --
          they're generated in bulk from a schedule on the Flight Schedules page.
        </p>
      </div>

      {/* Filters */}
      <div className="premium-card p-5">
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
              Date
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

          <div className="flex items-end">
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
              Showing{' '}
              <span className="font-bold text-slate-900">{flights.length}</span>{' '}
              flights
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {hasSearched && (
        <div className="premium-card overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium italic">Loading flights...</p>
            </div>
          ) : error ? (
            <div className="p-20 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={fetchFlights} className="mt-4 text-primary font-semibold hover:underline">
                Try Again
              </button>
            </div>
          ) : flights.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">No flights found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Flight</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Route</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Schedule</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fares</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flights.map((flight) => {
                    const dep = airportById.get(flight.DepartureAirportID);
                    const arr = airportById.get(flight.ArrivalAirportID);
                    return (
                      <tr key={flight.FlightID} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-900">{flight.FlightNumber}</div>
                          <div className="text-xs text-slate-500 mt-1">#{flight.FlightID}</div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="font-semibold text-slate-800">
                            {dep?.code ?? `#${flight.DepartureAirportID}`}{' '}→{' '}{arr?.code ?? `#${flight.ArrivalAirportID}`}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {dep?.city ?? '-'} → {arr?.city ?? '-'}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-slate-800">
                                {formatDateTime(flight.DepartureTime)}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Arrival: {formatDateTime(flight.ArrivalTime)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {flight.Fares.length === 0 ? (
                            <span className="text-xs text-slate-400">No fares</span>
                          ) : (
                            <div className="space-y-1">
                              {flight.Fares.map((fare) => (
                                <div key={fare.id} className="text-xs font-medium text-slate-700">
                                  {fare.currency} {fare.price} · {fare.available_seats} seats
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(flight.Status)}`}>
                            {flight.Status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightsPage;
