import { useEffect, useMemo, useState } from 'react';

import type {
  Airport,
  FlightSchedule,
  ListResponse,
} from '../../types/api';

import {
  ArrowRight,
  Clock3,
  MapPin,
  Plane,
  Search,
  Filter,
  Route,
} from 'lucide-react';

import {
  flightSchedulesApi,
  airportsApi,
} from '../../services/api-services';

const PAGE_LIMIT = 10;

const RoutesPage = () => {
  // ============================================================
  // Routes
  // ============================================================

  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);

  const [airports, setAirports] =
    useState<ListResponse<Airport>>();

  // ============================================================
  // Loading / Error
  // ============================================================

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  // ============================================================
  // Search
  // ============================================================

  const [search, setSearch] = useState('');

  // ============================================================
  // Pagination
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // Initial Load
  // ============================================================

  useEffect(() => {
    fetchRoutes();
    fetchAirports();
  }, []);

  // ============================================================
  // Load Airports
  // ============================================================

  const fetchAirports = async () => {
    try {
      const data = await airportsApi.getAirports();

      setAirports(data);
    } catch {
      // Airport lookup failure should not block route loading.
    }
  };

  // ============================================================
  // Load Routes
  // ============================================================

  const fetchRoutes = async () => {
    setIsLoading(true);
    setError('');

    try {

      const data = await flightSchedulesApi.getSchedules();

      setSchedules(data.items ?? []);

      setCurrentPage(1);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to fetch routes',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // Airport Lookup Map
  // ============================================================

  const airportById = useMemo(() => {
    const map = new Map<number, Airport>();

    for (const airport of airports?.Items ?? []) {
      map.set(airport.id, airport);
    }

    return map;
  }, [airports?.Items]);

  // ============================================================
  // Group schedules by route
  // ============================================================

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
      const depAirport = airportById.get(
        item.departure_airport_id,
      );

      const arrAirport = airportById.get(
        item.arrival_airport_id,
      );

      const dep =
        depAirport?.code ||
        `#${item.departure_airport_id}`;

      const arr =
        arrAirport?.code ||
        `#${item.arrival_airport_id}`;

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

  // ============================================================
  // Search
  // ============================================================

  const filteredRoutes = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return groupedRoutes;
    }

    return groupedRoutes.filter((route) => {
      const departureCode =
        route.departureAirport?.code
          ?.toLowerCase() ?? '';

      const arrivalCode =
        route.arrivalAirport?.code
          ?.toLowerCase() ?? '';

      const departureCity =
        route.departureAirport?.city
          ?.toLowerCase() ?? '';

      const arrivalCity =
        route.arrivalAirport?.city
          ?.toLowerCase() ?? '';

      const departureName =
        route.departureAirport?.name
          ?.toLowerCase() ?? '';

      const arrivalName =
        route.arrivalAirport?.name
          ?.toLowerCase() ?? '';

      return (
        departureCode.includes(keyword) ||
        arrivalCode.includes(keyword) ||
        departureCity.includes(keyword) ||
        arrivalCity.includes(keyword) ||
        departureName.includes(keyword) ||
        arrivalName.includes(keyword)
      );
    });
  }, [groupedRoutes, search]);

  // ============================================================
  // Pagination
  // ============================================================

  const totalRoutes = filteredRoutes.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalRoutes / PAGE_LIMIT),
  );

  // ============================================================
  // Paginated Routes
  // ============================================================

  const paginatedRoutes = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PAGE_LIMIT;

    const endIndex =
      startIndex + PAGE_LIMIT;

    return filteredRoutes.slice(
      startIndex,
      endIndex,
    );
  }, [
    filteredRoutes,
    currentPage,
  ]);

  // ============================================================
  // Search Change
  // ============================================================

  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);

    /*
     * Search result set changes, therefore pagination
     * must start again from page 1.
     */
    setCurrentPage(1);
  };

  // ============================================================
  // Page Change
  // ============================================================

  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  // ============================================================
  // Keep Current Page Valid
  // ============================================================

  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ============================================================
  // Pagination Page Numbers
  // ============================================================

  const paginationPages = useMemo(() => {
    const pages: (
      | number
      | 'ellipsis-left'
      | 'ellipsis-right'
    )[] = [];

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      const shouldShow =
        page === 1 ||
        page === totalPages ||
        Math.abs(
          page - currentPage,
        ) <= 1;

      if (!shouldShow) {
        if (
          page === 2 &&
          currentPage > 3
        ) {
          pages.push(
            'ellipsis-left',
          );
        }

        if (
          page === totalPages - 1 &&
          currentPage <
            totalPages - 2
        ) {
          pages.push(
            'ellipsis-right',
          );
        }

        continue;
      }

      pages.push(page);
    }

    return pages;
  }, [
    totalPages,
    currentPage,
  ]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ========================================================
          Header
      ======================================================== */}

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
            {totalRoutes} Active Routes
          </span>

        </div>

      </div>

      {/* ========================================================
          Search
      ======================================================== */}

      <div className="premium-card p-5">

        <div className="flex flex-col md:flex-row gap-4 items-center">

          <div className="relative flex-1 w-full">

            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search route, airport, city..."
              value={search}
              onChange={(e) =>
                handleSearchChange(
                  e.target.value,
                )
              }
              className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">

            <Filter className="w-4 h-4 text-slate-400" />

            <p className="text-sm text-slate-600">

              Showing{' '}

              <span className="font-bold text-slate-900">
                {paginatedRoutes.length}
              </span>

              {' '}of{' '}

              <span className="font-bold text-slate-900">
                {totalRoutes}
              </span>

              {' '}routes

            </p>

          </div>

        </div>

      </div>

      {/* ========================================================
          Content
      ======================================================== */}

      {isLoading ? (

        <div className="premium-card p-20 flex flex-col items-center justify-center gap-4">

          <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

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
            type="button"
            onClick={fetchRoutes}
            className="mt-4 text-primary font-semibold hover:underline"
          >
            Try Again
          </button>

        </div>

      ) : totalRoutes === 0 ? (

        <div className="premium-card p-20 text-center">

          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">

            <Plane className="w-8 h-8" />

          </div>

          <p className="text-slate-500 font-medium">
            {search
              ? 'No routes match your search'
              : 'No routes found'}
          </p>

          {search && (
            <p className="text-slate-400 text-sm mt-1">
              Try another keyword.
            </p>
          )}

        </div>

      ) : (

        <div className="premium-card overflow-hidden">

          {/* ======================================================
              Table
          ====================================================== */}

          <div className="overflow-x-auto">

            <table className="w-full border-collapse">

              <thead>

                <tr className="border-b border-slate-50 bg-slate-50/50">

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Route
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Departure
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Arrival
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Schedules
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Flights
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-50">

                {paginatedRoutes.map(
                  (route) => (

                    <tr
                      key={route.routeKey}
                      className="hover:bg-slate-50/50 transition-colors align-top"
                    >

                      {/* ==================================================
                          Route
                      ================================================== */}

                      <td className="px-6 py-4 whitespace-nowrap">

                        <div className="flex items-center gap-2">

                          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">

                            <Plane className="w-4 h-4" />

                          </div>

                          <span className="font-bold text-slate-900">

                            {route.departureAirport?.code ??
                              `#${route.schedules[0]?.departure_airport_id}`}

                            <ArrowRight className="inline w-3.5 h-3.5 mx-1.5 text-slate-400" />

                            {route.arrivalAirport?.code ??
                              `#${route.schedules[0]?.arrival_airport_id}`}

                          </span>

                        </div>

                      </td>

                      {/* ==================================================
                          Departure
                      ================================================== */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">

                          <MapPin className="w-3.5 h-3.5" />

                          Departure

                        </div>

                        <div className="font-semibold text-slate-900">

                          {route.departureAirport?.name ??
                            `Airport #${route.schedules[0]?.departure_airport_id}`}

                        </div>

                        <div className="text-xs text-slate-500">

                          {route.departureAirport?.city
                            ? `${route.departureAirport.city}, ${route.departureAirport.country ?? ''}`
                            : '-'}

                        </div>

                      </td>

                      {/* ==================================================
                          Arrival
                      ================================================== */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">

                          <MapPin className="w-3.5 h-3.5" />

                          Arrival

                        </div>

                        <div className="font-semibold text-slate-900">

                          {route.arrivalAirport?.name ??
                            `Airport #${route.schedules[0]?.arrival_airport_id}`}

                        </div>

                        <div className="text-xs text-slate-500">

                          {route.arrivalAirport?.city
                            ? `${route.arrivalAirport.city}, ${route.arrivalAirport.country ?? ''}`
                            : '-'}

                        </div>

                      </td>

                      {/* ==================================================
                          Schedules
                      ================================================== */}

                      <td className="px-6 py-4">

                        <table className="w-full text-xs">

                          <tbody className="divide-y divide-slate-50">

                            {route.schedules.map(
                              (schedule) => (

                                <tr
                                  key={schedule.id}
                                >

                                  <td className="py-1.5 pr-3 font-bold text-slate-900 whitespace-nowrap">

                                    {schedule.flight_number}

                                  </td>

                                  <td className="py-1.5 pr-3 text-slate-500 whitespace-nowrap">

                                    <Clock3 className="inline w-3 h-3 mr-1" />

                                    {schedule.departure_time}
                                    {' - '}
                                    {schedule.arrival_time}

                                  </td>

                                  <td className="py-1.5">

                                    <div className="flex flex-wrap gap-1">

                                      {schedule.operating_days_labels.map(
                                        (day) => (

                                          <span
                                            key={`${schedule.id}-${day}`}
                                            className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-semibold"
                                          >
                                            {day}
                                          </span>

                                        ),
                                      )}

                                    </div>

                                  </td>

                                </tr>

                              ),
                            )}

                          </tbody>

                        </table>

                      </td>

                      {/* ==================================================
                          Flights
                      ================================================== */}

                      <td className="px-6 py-4 text-right whitespace-nowrap">

                        <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-semibold">

                          {route.schedules.length}

                        </span>

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

          {/* ======================================================
              Pagination
          ====================================================== */}

          {!isLoading &&
            totalRoutes > 0 && (

              <div className="border-t border-slate-100 px-6 py-4">

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                  {/* ==================================================
                      Pagination Info
                  ================================================== */}

                  <p className="text-sm text-slate-500">

                    Page{' '}

                    <span className="font-semibold text-slate-800">
                      {currentPage}
                    </span>

                    {' '}of{' '}

                    <span className="font-semibold text-slate-800">
                      {totalPages}
                    </span>

                  </p>

                  {/* ==================================================
                      Pagination Controls
                  ================================================== */}

                  <div className="flex items-center gap-1">

                    {/* Previous */}

                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        handlePageChange(
                          currentPage - 1,
                        )
                      }
                      className="px-3 py-2 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}

                    {paginationPages.map(
                      (page) => {

                        if (
                          page ===
                          'ellipsis-left'
                        ) {
                          return (
                            <span
                              key="ellipsis-left"
                              className="px-2 text-slate-400"
                            >
                              ...
                            </span>
                          );
                        }

                        if (
                          page ===
                          'ellipsis-right'
                        ) {
                          return (
                            <span
                              key="ellipsis-right"
                              className="px-2 text-slate-400"
                            >
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() =>
                              handlePageChange(
                                page,
                              )
                            }
                            className={`min-w-9 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                              currentPage === page
                                ? 'bg-primary text-white shadow'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      },
                    )}

                    {/* Next */}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        handlePageChange(
                          currentPage + 1,
                        )
                      }
                      className="px-3 py-2 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>

                  </div>

                </div>

              </div>

            )}

        </div>

      )}

    </div>
  );
};

export default RoutesPage;
