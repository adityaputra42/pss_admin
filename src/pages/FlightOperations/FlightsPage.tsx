import { useEffect, useMemo, useState } from 'react';

import type {
  Airport,
  Aircraft,
  FareClass,
  Flight,
  FlightSchedule,
  ListResponse,
} from '../../types/api';

import {
  CalendarRange,
  DollarSign,
  Edit3,
  Filter,
  Package,
  Plane,
  PlaneTakeoff,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import {
  flightsApi,
  airportsApi,
  flightSchedulesApi,
  aircraftsApi,
  fareClassesApi,
} from '../../services/api-services';

import FlightInstanceModal from '../../components/flight/FlightInstanceModal';
import FlightFareManagerModal from '../../components/flight/FlightFareManagerModal';
import FlightAncillaryManagerModal from '../../components/ancillary/FlightAncillaryManagerModal';
import GenerateFlightsModal from '../../components/flight/GenerateFlightsModal';

const PAGE_LIMIT = 10;

const FlightsPage = () => {
  // ============================================================
  // Manage Flight Instances
  // ============================================================

  const [instances, setInstances] = useState<ListResponse<Flight>>();
  const [instancesTotal, setInstancesTotal] = useState(0);
  const [instancesLoading, setInstancesLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // Search
  // ============================================================

  const [search, setSearch] = useState('');

  // ============================================================
  // Dependencies
  // ============================================================

  const [airports, setAirports] = useState<ListResponse<Airport>>();
  const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);

  // ============================================================
  // Modals
  // ============================================================

  const [instanceModalOpen, setInstanceModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<Flight | null>(null);

  const [fareModalOpen, setFareModalOpen] = useState(false);
  const [fareModalFlight, setFareModalFlight] = useState<Flight | null>(null);

  const [ancillaryModalOpen, setAncillaryModalOpen] = useState(false);
  const [ancillaryModalFlight, setAncillaryModalFlight] =
    useState<Flight | null>(null);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  // ============================================================
  // Lookup maps
  // ============================================================

  const airportById = useMemo(() => {
    const map = new Map<number, Airport>();

    for (const airport of airports?.Items ?? []) {
      map.set(airport.id, airport);
    }

    return map;
  }, [airports?.Items]);


  const scheduleById = useMemo(() => {
    const map = new Map<number, FlightSchedule>();

    for (const schedule of schedules) {
      map.set(schedule.id, schedule);
    }

    return map;
  }, [schedules]);

  const aircraftById = useMemo(() => {
    const map = new Map<number, Aircraft>();

    for (const aircraft of aircrafts) {
      map.set(aircraft.id, aircraft);
    }

    return map;
  }, [aircrafts]);

  // ============================================================
  // Load flight instances
  // ============================================================

  const loadInstances = async (page = currentPage) => {
    setInstancesLoading(true);

    try {
      const res = await flightsApi.getFlights(page, PAGE_LIMIT);

      setInstances(res);
      setInstancesTotal(res.Total ?? 0);
      setCurrentPage(page);
    } catch (err: any) {
      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to load flight instances',
      );
    } finally {
      setInstancesLoading(false);
    }
  };

  // ============================================================
  // Load dependencies
  // ============================================================

  const loadManageDeps = async () => {
    try {
      const [
        scheduleRes,
        aircraftRes,
        airportRes,
        fareClassRes,
      ] = await Promise.all([
        flightSchedulesApi.getSchedules({
          limit: 100,
        }),
        aircraftsApi.getAircrafts(),
        airportsApi.getAirports(),
        fareClassesApi.getFareClasses(1, 100),
      ]);

      setSchedules(scheduleRes.items ?? []);
      setAircrafts(aircraftRes.Items ?? []);
      setAirports(airportRes);
      setFareClasses(fareClassRes.Items ?? []);
    } catch (err: any) {
      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to load flight dependencies',
      );
    }
  };

  // ============================================================
  // Initial load
  // ============================================================

  useEffect(() => {
    loadInstances(1);
    loadManageDeps();
  }, []);

  // ============================================================
  // Search
  //
  // Search dilakukan seperti FlightSchedulesPage:
  // terhadap data yang sudah dimuat di current page.
  // ============================================================

  const filteredInstances = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return instances?.Items ?? [];
    }

    return (instances?.Items ?? []).filter((flight) => {
      const schedule = scheduleById.get(flight.schedule_id);
      const aircraft = aircraftById.get(flight.aircraft_id);

      const flightId = String(flight.id);

      const flightNumber =
        schedule?.flight_number?.toLowerCase() ?? '';

      const registrationNumber =
        aircraft?.registration_number?.toLowerCase() ?? '';

      const status =
        flight.status?.toLowerCase() ?? '';

      const departureTime =
        flight.departure_time?.toLowerCase() ?? '';

      const arrivalTime =
        flight.arrival_time?.toLowerCase() ?? '';

      return (
        flightId.includes(keyword) ||
        flightNumber.includes(keyword) ||
        registrationNumber.includes(keyword) ||
        status.includes(keyword) ||
        departureTime.includes(keyword) ||
        arrivalTime.includes(keyword)
      );
    });
  }, [
    instances?.Items,
    search,
    scheduleById,
    aircraftById,
  ]);

  // ============================================================
  // Pagination
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(instancesTotal / PAGE_LIMIT),
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    loadInstances(page);
  };

  // ============================================================
  // Save Flight Instance
  // ============================================================

  const handleSaveInstance = async (
    data: {
      schedule_id: number;
      aircraft_id: number;
      departure_time: string;
      arrival_time: string;
      status: string;
    },
    id: number | null,
  ) => {
    try {
      if (id) {
        const {
          schedule_id: _unused,
          ...updatePayload
        } = data;

        void _unused;

        await flightsApi.updateFlight(
          id,
          updatePayload,
        );
      } else {
        await flightsApi.createFlight(data);
      }

      showSuccessAlert(
        id
          ? 'Flight instance updated'
          : 'Flight instance created',
      );

      setInstanceModalOpen(false);

      await loadInstances(currentPage);
    } catch (err: any) {
      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to save flight instance',
      );
    }
  };

  // ============================================================
  // Delete Flight Instance
  // ============================================================

  const handleDeleteInstance = async (
    flight: Flight,
  ) => {
    const confirmed = await showConfirmAlert(
      'Delete Flight Instance',
      `Delete flight #${flight.id}? If it already has seats, fares, or bookings tied to it, this may fail.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await flightsApi.deleteFlight(flight.id);

      showSuccessAlert(
        'Flight instance deleted',
      );

      /*
       * Kalau page terakhir menjadi kosong setelah delete,
       * kembali ke page sebelumnya.
       */
      const currentItems =
        instances?.Items?.length ?? 0;

      if (
        currentItems === 1 &&
        currentPage > 1
      ) {
        await loadInstances(currentPage - 1);
      } else {
        await loadInstances(currentPage);
      }
    } catch (err: any) {
      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to delete flight instance',
      );
    }
  };

  // ============================================================
  // Helpers
  // ============================================================

  const formatDateTime = (
    value?: string,
  ) => {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString(
      'id-ID',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    );
  };

  const getStatusColor = (
    status?: string,
  ) => {
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
            Manage Flight Instances
          </h1>

          <p className="text-slate-500 mt-1">
            Create, edit, generate, and manage individual flight instances.
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* Generate */}

          <button
            onClick={() =>
              setGenerateModalOpen(true)
            }
            className="premium-button bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary flex items-center gap-2"
          >
            <CalendarRange className="w-5 h-5" />

            <span>
              Generate from Schedule
            </span>
          </button>

          {/* Add */}

          <button
            onClick={() => {
              setEditingInstance(null);
              setInstanceModalOpen(true);
            }}
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />

            <span>
              Add Flight Instance
            </span>
          </button>
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
              placeholder="Search flight ID, flight number, aircraft, status..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">

            <Filter className="w-4 h-4 text-slate-400" />

            <p className="text-sm text-slate-600">

              Showing{' '}

              <span className="font-bold text-slate-900">
                {filteredInstances.length}
              </span>{' '}

              of{' '}

              <span className="font-bold text-slate-900">
                {instancesTotal}
              </span>{' '}

              flights

            </p>

          </div>
        </div>
      </div>

      {/* ========================================================
          Table
      ======================================================== */}

      <div className="premium-card overflow-hidden">

        {instancesLoading ? (

          <div className="p-20 flex flex-col items-center justify-center gap-4">

            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

            <p className="text-slate-500 font-medium italic">
              Loading flight instances...
            </p>

          </div>

        ) : filteredInstances.length === 0 ? (

          <div className="p-20 text-center">

            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">

              <PlaneTakeoff className="w-8 h-8" />

            </div>

            <p className="text-slate-500 font-medium">
              {search
                ? 'No flights match your search'
                : 'No flight instances yet'}
            </p>

            <p className="text-slate-400 text-sm mt-1">

              {search
                ? 'Try another keyword.'
                : 'Generate some from a schedule, or add one manually.'}

            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full border-collapse">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    ID
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Schedule
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Aircraft
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Departure
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Arrival
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredInstances.map(
                  (flight) => {

                    const schedule =
                      scheduleById.get(
                        flight.schedule_id,
                      );

                    const aircraft =
                      aircraftById.get(
                        flight.aircraft_id,
                      );

                    return (
                      <tr
                        key={flight.id}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >

                        {/* ID */}

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                          #{flight.id}
                        </td>

                        {/* Schedule */}

                        <td className="px-6 py-4 whitespace-nowrap">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center">

                              <Plane className="w-5 h-5" />

                            </div>

                            <div>

                              <div className="font-semibold text-slate-800">

                                {schedule?.flight_number ??
                                  `Schedule #${flight.schedule_id}`}

                              </div>

                              <div className="text-xs text-slate-400 mt-1">

                                Schedule ID:{' '}

                                {flight.schedule_id}

                              </div>

                            </div>

                          </div>

                        </td>

                        {/* Aircraft */}

                        <td className="px-6 py-4 whitespace-nowrap">

                          <div className="font-medium text-slate-700">

                            {aircraft?.registration_number ??
                              `Aircraft #${flight.aircraft_id}`}

                          </div>

                          {aircraft && (
                            <div className="text-xs text-slate-400 mt-1">
                              {aircraft.model ?? '-'}
                            </div>
                          )}

                        </td>

                        {/* Departure */}

                        <td className="px-6 py-4 whitespace-nowrap">

                          <div className="text-sm text-slate-600">

                            {formatDateTime(
                              flight.departure_time,
                            )}

                          </div>

                        </td>

                        {/* Arrival */}

                        <td className="px-6 py-4 whitespace-nowrap">

                          <div className="text-sm text-slate-600">

                            {formatDateTime(
                              flight.arrival_time,
                            )}

                          </div>

                        </td>

                        {/* Status */}

                        <td className="px-6 py-4 whitespace-nowrap">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                              flight.status,
                            )}`}
                          >
                            {flight.status}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-4 text-right whitespace-nowrap">

                          <div className="flex items-center justify-end gap-1">

                            {/* Fares */}

                            <button
                              onClick={() => {
                                setFareModalFlight(
                                  flight,
                                );
                                setFareModalOpen(
                                  true,
                                );
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                              title="Manage Fares"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>

                            {/* Ancillary */}

                            <button
                              onClick={() => {
                                setAncillaryModalFlight(
                                  flight,
                                );
                                setAncillaryModalOpen(
                                  true,
                                );
                              }}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                              title="Manage Ancillaries"
                            >
                              <Package className="w-4 h-4" />
                            </button>

                            {/* Edit */}

                            <button
                              onClick={() => {
                                setEditingInstance(
                                  flight,
                                );
                                setInstanceModalOpen(
                                  true,
                                );
                              }}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}

                            <button
                              onClick={() =>
                                handleDeleteInstance(
                                  flight,
                                )
                              }
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
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

        )}

        {/* ======================================================
            Pagination
        ====================================================== */}

        {!instancesLoading &&
          instancesTotal > 0 && (
            <div className="border-t border-slate-100 px-6 py-4">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Info */}

                <p className="text-sm text-slate-500">

                  Page{' '}

                  <span className="font-semibold text-slate-800">
                    {currentPage}
                  </span>{' '}

                  of{' '}

                  <span className="font-semibold text-slate-800">
                    {totalPages}
                  </span>

                </p>

                {/* Pagination */}

                <div className="flex items-center gap-1">

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

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) =>
                      index + 1,
                  ).map((page) => {

                    /*
                     * Jangan tampilkan 100 tombol
                     * kalau data sangat banyak.
                     */

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
                        return (
                          <span
                            key={page}
                            className="px-2 text-slate-400"
                          >
                            ...
                          </span>
                        );
                      }

                      if (
                        page ===
                          totalPages - 1 &&
                        currentPage <
                          totalPages - 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-2 text-slate-400"
                          >
                            ...
                          </span>
                        );
                      }

                      return null;
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
                  })}

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

      {/* ========================================================
          Flight Instance Modal
      ======================================================== */}

      <FlightInstanceModal
        isOpen={instanceModalOpen}
        onClose={() =>
          setInstanceModalOpen(false)
        }
        flight={editingInstance}
        schedules={schedules}
        aircrafts={aircrafts}
        onSave={handleSaveInstance}
      />

      {/* ========================================================
          Fare Modal
      ======================================================== */}

      <FlightFareManagerModal
        isOpen={fareModalOpen}
        onClose={() =>
          setFareModalOpen(false)
        }
        flight={fareModalFlight}
        fareClasses={fareClasses}
      />

      {/* ========================================================
          Ancillary Modal
      ======================================================== */}

      <FlightAncillaryManagerModal
        isOpen={ancillaryModalOpen}
        onClose={() =>
          setAncillaryModalOpen(false)
        }
        flight={ancillaryModalFlight}
      />

      {/* ========================================================
          Generate Flights Modal
      ======================================================== */}

      <GenerateFlightsModal
        isOpen={generateModalOpen}
        onClose={() =>
          setGenerateModalOpen(false)
        }
        schedules={schedules}
        aircrafts={aircrafts}
        fareClasses={fareClasses}
        airportById={airportById}
        onGenerated={() =>
          loadInstances(currentPage)
        }
      />

    </div>
  );
};

export default FlightsPage;
