import { useEffect, useMemo, useState } from 'react';

import type { FlightSchedule } from '../../types/api';

import {
  ArrowRight,
  Clock3,
  MapPin,
  Plane,
  Search,
  Filter,
  Route,
  CalendarDays,
} from 'lucide-react';
import { flightSchedulesApi } from '../../services/api-services';


const RoutesPage = () => {
  const [schedules, setSchedules] = useState<
    FlightSchedule[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data =
        await flightSchedulesApi.getSchedules();

      setSchedules(Array.isArray(data) ? data : []);
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
   */
  const groupedRoutes = useMemo(() => {
    const map = new Map<
      string,
      {
        routeKey: string;
        departureAirport: any;
        arrivalAirport: any;
        schedules: FlightSchedule[];
      }
    >();

    for (const item of schedules) {
      const dep =
        item.departure_airport?.code || 'UNK';

      const arr =
        item.arrival_airport?.code || 'UNK';

      const key = `${dep}-${arr}`;

      if (!map.has(key)) {
        map.set(key, {
          routeKey: key,
          departureAirport:
            item.departure_airport,
          arrivalAirport: item.arrival_airport,
          schedules: [],
        });
      }

      map.get(key)?.schedules.push(item);
    }

    return Array.from(map.values());
  }, [schedules]);

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

  const formatOperatingDays = (
    days?: string,
  ) => {
    if (!days) return '-';

    const map: Record<string, string> = {
      '1': 'Mon',
      '2': 'Tue',
      '3': 'Wed',
      '4': 'Thu',
      '5': 'Fri',
      '6': 'Sat',
      '7': 'Sun',
    };

    return days
      .split(',')
      .map((d) => map[d] || d)
      .join(', ');
  };

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

        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
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
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8" />
          </div>

          <p className="text-slate-500 font-medium">
            No routes found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredRoutes.map((route) => (
            <div
              key={route.routeKey}
              className="premium-card p-6 hover:shadow-xl transition-all duration-300"
            >
              {/* top */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Plane className="w-5 h-5" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {
                          route.departureAirport
                            ?.code
                        }

                        <ArrowRight className="inline w-4 h-4 mx-2" />

                        {
                          route.arrivalAirport?.code
                        }
                      </h2>

                      <p className="text-sm text-slate-500">
                        {
                          route.departureAirport
                            ?.city
                        }{' '}
                        →{' '}
                        {
                          route.arrivalAirport
                            ?.city
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-sm font-semibold">
                  {route.schedules.length} Flights
                </div>
              </div>

              {/* airports */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <MapPin className="w-4 h-4" />

                    Departure
                  </div>

                  <div className="font-bold text-slate-900">
                    {
                      route.departureAirport
                        ?.name
                    }
                  </div>

                  <div className="text-sm text-slate-500 mt-1">
                    {
                      route.departureAirport
                        ?.country
                    }
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <MapPin className="w-4 h-4" />

                    Arrival
                  </div>

                  <div className="font-bold text-slate-900">
                    {
                      route.arrivalAirport
                        ?.name
                    }
                  </div>

                  <div className="text-sm text-slate-500 mt-1">
                    {
                      route.arrivalAirport
                        ?.country
                    }
                  </div>
                </div>
              </div>

              {/* schedules */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-primary" />

                  <h3 className="font-semibold text-slate-800">
                    Available Schedules
                  </h3>
                </div>

                <div className="space-y-3">
                  {route.schedules.map(
                    (schedule) => (
                      <div
                        key={schedule.id}
                        className="border border-slate-100 rounded-2xl p-4 hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-bold text-slate-900">
                              {
                                schedule.flight_number
                              }
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                              <Clock3 className="w-4 h-4" />

                              {
                                schedule.departure_time
                              }{' '}
                              -{' '}
                              {
                                schedule.arrival_time
                              }
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-slate-400 mb-1">
                              Operating Days
                            </div>

                            <div className="flex flex-wrap justify-end gap-1">
                              {formatOperatingDays(
                                schedule.operating_days,
                              )
                                .split(', ')
                                .map((day) => (
                                  <span
                                    key={
                                      schedule.id +
                                      day
                                    }
                                    className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold"
                                  >
                                    {day}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
