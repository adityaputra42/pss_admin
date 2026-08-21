import { useEffect, useMemo, useState } from 'react';

import type {
  Airport,
  FlightSchedule,
  ListResponse,
} from '../../types/api';

import {
  Calendar,
  Clock,
  Edit3,
  Filter,
  MapPin,
  Plane,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import {
  flightSchedulesApi,
  airportsApi,
} from '../../services/api-services';

import FlightScheduleFormModal from '../../components/flight/FlightScheduleFormModal';

const FlightSchedulesPage = () => {
  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
  const [airports, setAirports] =
    useState<ListResponse<Airport>>();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<FlightSchedule | null>(null);

  useEffect(() => {
    fetchSchedules();

    airportsApi
      .getAirports()
      .then(setAirports)
      .catch(() => {});
  }, []);

  /**
   * API returns only airport IDs.
   * Resolve airport information client-side.
   */
  const airportById = useMemo(() => {
    const map = new Map<number, Airport>();

    for (const airport of airports?.Items ?? []) {
      map.set(airport.id, airport);
    }

    return map;
  }, [airports?.Items]);

  /**
   * Load schedules.
   *
   * Search is intentionally client-side.
   * We load a large page so search can operate
   * across the returned schedules.
   */
  const fetchSchedules = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await flightSchedulesApi.getSchedules({
        page: 1,
        limit: 100,
      });

      setSchedules(data.items ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to fetch flight schedules',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Client-side search.
   */
  const filteredSchedules = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return schedules;
    }

    return schedules.filter((item) => {
      const dep = airportById.get(
        item.departure_airport_id,
      );

      const arr = airportById.get(
        item.arrival_airport_id,
      );

      return (
        item.flight_number
          ?.toLowerCase()
          .includes(keyword) ||

        dep?.code
          ?.toLowerCase()
          .includes(keyword) ||

        arr?.code
          ?.toLowerCase()
          .includes(keyword) ||

        dep?.city
          ?.toLowerCase()
          .includes(keyword) ||

        arr?.city
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [schedules, search, airportById]);

  /**
   * Pagination calculation.
   */
  const totalItems = filteredSchedules.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / limit),
  );

  /**
   * Current page items.
   */
  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;

    return filteredSchedules.slice(start, end);
  }, [filteredSchedules, page, limit]);

  /**
   * Reset pagination when search changes.
   */
  useEffect(() => {
    setPage(1);
  }, [search]);

  /**
   * Protect against current page becoming invalid
   * after filtering/deleting data.
   */
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditSchedule = async (
    schedule: FlightSchedule,
  ) => {
    try {
      const detail =
        await flightSchedulesApi.getScheduleById(
          schedule.id,
        );

      setEditingSchedule(detail);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);

      setEditingSchedule(schedule);
      setIsModalOpen(true);
    }
  };

  const handleDeleteSchedule = async (
    schedule: FlightSchedule,
  ) => {
    const confirmed = await showConfirmAlert(
      'Delete Schedule',
      `Delete schedule ${schedule.flight_number}?`,
    );

    if (!confirmed) return;

    try {
      await flightSchedulesApi.deleteSchedule(
        schedule.id,
      );

      showSuccessAlert(
        'Flight schedule deleted successfully',
      );

      fetchSchedules();
    } catch (err: any) {
      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to delete schedule',
      );
    }
  };

  const handleSaveSchedule = async (
    data: {
      flight_number?: string;
      departure_airport_id?: number;
      arrival_airport_id?: number;
      departure_time: string;
      arrival_time: string;
      operating_days: number;
    },
    id: number | null,
  ) => {
    try {
      if (id) {
        await flightSchedulesApi.updateSchedule(id, {
          departure_time: data.departure_time,
          arrival_time: data.arrival_time,
          operating_days: data.operating_days,
        });
      } else {
        await flightSchedulesApi.createSchedule(
          data as {
            flight_number: string;
            departure_airport_id: number;
            arrival_airport_id: number;
            departure_time: string;
            arrival_time: string;
            operating_days: number;
          },
        );
      }

      showSuccessAlert(
        id
          ? 'Flight schedule updated'
          : 'Flight schedule created',
      );

      setIsModalOpen(false);

      fetchSchedules();
    } catch (err: any) {
      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to save flight schedule',
      );
    }
  };

  const startItem =
    totalItems === 0
      ? 0
      : (page - 1) * limit + 1;

  const endItem =
    Math.min(page * limit, totalItems);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Flight Schedules
          </h1>

          <p className="text-slate-500 mt-1">
            Manage recurring routes and operational schedules.
          </p>
        </div>

        <button
          onClick={handleAddSchedule}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Search */}
      <div className="premium-card p-5">
        <div className="flex flex-col md:flex-row gap-4 items-center">

          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search flight number, airport, city..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />

            <p className="text-sm text-slate-600">
              Showing{' '}
              <span className="font-bold text-slate-900">
                {totalItems}
              </span>{' '}
              schedules
            </p>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="premium-card overflow-hidden">

        {isLoading ? (

          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

            <p className="text-slate-500 italic">
              Loading schedules...
            </p>
          </div>

        ) : error ? (

          <div className="p-20 text-center">

            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-md flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>

            <p className="text-red-500 font-medium">
              {error}
            </p>

            <button
              onClick={fetchSchedules}
              className="mt-4 text-primary font-semibold hover:underline"
            >
              Try Again
            </button>

          </div>

        ) : paginatedSchedules.length === 0 ? (

          <div className="p-20 text-center">

            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>

            <p className="text-slate-500 font-medium">
              No schedules found
            </p>

            {search && (
              <p className="text-sm text-slate-400 mt-2">
                Try another search keyword.
              </p>
            )}

          </div>

        ) : (

          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Flight Number
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Route
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Departure
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Arrival
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Operating Days
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {paginatedSchedules.map(
                    (schedule) => {
                      const dep =
                        airportById.get(
                          schedule.departure_airport_id,
                        );

                      const arr =
                        airportById.get(
                          schedule.arrival_airport_id,
                        );

                      return (
                        <tr
                          key={schedule.id}
                          className="hover:bg-slate-50 transition-colors"
                        >

                          {/* Flight */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">

                              <div className="w-11 h-11 rounded bg-primary/10 text-primary flex items-center justify-center">
                                <Plane className="w-5 h-5" />
                              </div>

                              <div>
                                <div className="font-bold text-slate-900">
                                  {schedule.flight_number}
                                </div>

                                <div className="text-xs text-slate-500 mt-1">
                                  ID: {schedule.id}
                                </div>
                              </div>

                            </div>
                          </td>

                          {/* Route */}
                          <td className="px-6 py-5">
                            <div className="font-semibold text-slate-800">
                              {dep?.code ??
                                `#${schedule.departure_airport_id}`}{' '}
                              →{' '}
                              {arr?.code ??
                                `#${schedule.arrival_airport_id}`}
                            </div>

                            <div className="text-xs text-slate-500 mt-1">
                              {dep?.city ?? '-'} →{' '}
                              {arr?.city ?? '-'}
                            </div>
                          </td>

                          {/* Departure */}
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-2">

                              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />

                              <div>
                                <div className="font-medium text-slate-800">
                                  {schedule.departure_time}
                                </div>

                                <div className="text-xs text-slate-500">
                                  Departure Time
                                </div>
                              </div>

                            </div>
                          </td>

                          {/* Arrival */}
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-2">

                              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />

                              <div>
                                <div className="font-medium text-slate-800">
                                  {schedule.arrival_time}
                                </div>

                                <div className="text-xs text-slate-500">
                                  Arrival Time
                                </div>
                              </div>

                            </div>
                          </td>

                          {/* Operating Days */}
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">

                              {schedule.operating_days_labels.map(
                                (day) => (
                                  <span
                                    key={day}
                                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold"
                                  >
                                    {day}
                                  </span>
                                ),
                              )}

                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                onClick={() =>
                                  handleEditSchedule(
                                    schedule,
                                  )
                                }
                                className="p-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-all"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteSchedule(
                                    schedule,
                                  )
                                }
                                className="p-2 rounded hover:bg-red-50 hover:text-red-600 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    },
                  )}

                </tbody>

              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">

              {/* Info */}
              <div className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {startItem}
                </span>
                {' '}to{' '}
                <span className="font-semibold text-slate-700">
                  {endItem}
                </span>
                {' '}of{' '}
                <span className="font-semibold text-slate-700">
                  {totalItems}
                </span>
                {' '}schedules
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">

                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(
                      Number(e.target.value),
                    );
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={10}>
                    10 / page
                  </option>

                  <option value={25}>
                    25 / page
                  </option>

                  <option value={50}>
                    50 / page
                  </option>

                  <option value={100}>
                    100 / page
                  </option>
                </select>

                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (prev) => prev - 1,
                    )
                  }
                  className="p-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="min-w-22.5 text-center text-sm font-semibold text-slate-700">
                  Page {page} of {totalPages}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage(
                      (prev) => prev + 1,
                    )
                  }
                  className="p-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>
            </div>
          </>
        )}

      </div>

      {/* Modal */}
      <FlightScheduleFormModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        schedule={editingSchedule}
        airports={airports?.Items ?? []}
        onSave={handleSaveSchedule}
      />

    </div>
  );
};

export default FlightSchedulesPage;
