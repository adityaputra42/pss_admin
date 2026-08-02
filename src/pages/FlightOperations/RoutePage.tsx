import { useEffect, useMemo, useState } from 'react';

import type { Airport, FlightSchedule, ListResponse } from '../../types/api';

import {
  ArrowRight,
  Clock3,
  MapPin,
  Plane,
  Search,
  Filter,
  Route,
} from 'lucide-react';
import { flightSchedulesApi, airportsApi } from '../../services/api-services';


const RoutesPage = () => {
  const [schedules, setSchedules] = useState<
    FlightSchedule[]
  >([]);
  const [airports, setAirports] = useState<ListResponse<Airport>>();

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRoutes();
    airportsApi.getAirports().then(setAirports).catch(() => {});
  }, []);

  const airportById = useMemo(() => {
    const map = new Map<number, Airport>();
    for (const a of airports?.Items??[]) map.set(a.id, a);
    return map;
  }, [airports?.Items]);

  const fetchRoutes = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data =
        await flightSchedulesApi.getSchedules();

      setSchedules(data.items ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to fetch routes',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Group schedules by route
   * Example:
   * CGK -> DPS
   *
   * ⚠️ /flights/schedules only returns departure_airport_id/
   * arrival_airport_id (no joined airport data) -- resolved here against
   * the separately-fetched airports list.
   */
  const groupedRoutes = useMemo(() => {
    const map = new Map<
      string,
      {
        routeKey: string;
        departureAirport: Airport | undefined;
        arrivalAirport: Airport | undefined;
        schedules: FlightSchedule[];
      }
    >();

    for (const item of schedules) {
      const depAirport = airportById.get(item.departure_airport_id);
      const arrAirport = airportById.get(item.arrival_airport_id);

      const dep = depAirport?.code || `#${item.departure_airport_id}`;
      const arr = arrAirport?.code || `#${item.arrival_airport_id}`;

      const key = `${dep}-${arr}`;

      if (!map.has(key)) {
        map.set(key, {
          routeKey: key,
          departureAirport: depAirport,
          arrivalAirport: arrAirport,
          schedules: [],
        });
      }

      map.get(key)?.schedules.push(item);
    }

    return Array.from(map.values());
  }, [schedules, airportById]);

  const filteredRoutes = groupedRoutes.filter(
    (route) => {
      const keyword = search.toLowerCase();

      return (
        route.departureAirport?.code
          ?.toLowerCase()
          .includes(keyword) ||
        route.arrivalAirport?.code
          ?.toLowerCase()
          .includes(keyword) ||
        route.departureAirport?.city
          ?.toLowerCase()
          .includes(keyword) ||
        route.arrivalAirport?.city
          ?.toLowerCase()
          .includes(keyword)
      );
    },
  );

  // No formatOperatingDays needed -- schedule.operating_days_labels is
  // already decoded server-side.

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Flight Routes
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor airline route networks and
            connected destinations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded">
          <Route className="w-5 h-5" />

          <span className="font-semibold">
            {filteredRoutes.length} Active Routes
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="premium-card p-5">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search route, airport, city..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />

            <p className="text-sm text-slate-600">
              Showing{' '}
              <span className="font-bold text-slate-900">
                {filteredRoutes.length}
              </span>{' '}
              routes
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="premium-card p-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>

          <p className="text-slate-500 italic">
            Loading routes...
          </p>
        </div>
      ) : error ? (
        <div className="premium-card p-20 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-md flex items-center justify-center mx-auto mb-4">
            <Route className="w-8 h-8" />
          </div>

          <p className="text-red-500 font-medium">
            {error}
          </p>

          <button
            onClick={fetchRoutes}
            className="mt-4 text-primary font-semibold hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="premium-card p-20 text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8" />
          </div>

          <p className="text-slate-500 font-medium">
            No routes found
          </p>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Departure</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Arrival</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Schedules</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Flights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRoutes.map((route) => (
                <tr key={route.routeKey} className="hover:bg-slate-50/50 transition-colors align-top">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Plane className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900">
                        {route.departureAirport?.code}
                        <ArrowRight className="inline w-3.5 h-3.5 mx-1.5 text-slate-400" />
                        {route.arrivalAirport?.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                      <MapPin className="w-3.5 h-3.5" /> Departure
                    </div>
                    <div className="font-semibold text-slate-900">{route.departureAirport?.name}</div>
                    <div className="text-xs text-slate-500">
                      {route.departureAirport?.city}, {route.departureAirport?.country}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                      <MapPin className="w-3.5 h-3.5" /> Arrival
                    </div>
                    <div className="font-semibold text-slate-900">{route.arrivalAirport?.name}</div>
                    <div className="text-xs text-slate-500">
                      {route.arrivalAirport?.city}, {route.arrivalAirport?.country}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-50">
                        {route.schedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td className="py-1.5 pr-3 font-bold text-slate-900 whitespace-nowrap">{schedule.flight_number}</td>
                            <td className="py-1.5 pr-3 text-slate-500 whitespace-nowrap">
                              <Clock3 className="inline w-3 h-3 mr-1" />
                              {schedule.departure_time} - {schedule.arrival_time}
                            </td>
                            <td className="py-1.5">
                              <div className="flex flex-wrap gap-1">
                                {schedule.operating_days_labels.map((day) => (
                                  <span key={schedule.id + day} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-semibold">
                                    {day}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-semibold">
                      {route.schedules.length}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
