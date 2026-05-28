import { useEffect, useState } from 'react';
import type { Flight } from '../../types/api';
import {
  Plane,
  Search,
  Filter,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
} from 'lucide-react';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import { flightsApi } from '../../services/api-services/flight';

const FlightsPage = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // filter state
  const [dep, setDep] = useState('CGK');
  const [arr, setArr] = useState('DPS');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  useEffect(() => {
    fetchFlights();
  }, []);

const fetchFlights = async () => {
  if (!dep || !arr || !date) {
    showErrorAlert('Departure, arrival and date are required');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const response = await flightsApi.getFlights(dep, arr, date);
  setFlights(response);
  } catch (err: any) {
    setError(err?.response?.data?.message || 'Failed to fetch flights');
    setFlights([]);
  } finally {
    setIsLoading(false);
  }
};
  const handleSearch = () => {
    fetchFlights();
  };

  const handleAddFlight = () => {
    setEditingFlight(null);
    setIsModalOpen(true);
  };

  const handleEditFlight = async (flight: Flight) => {
    try {
      const detail = await flightsApi.getFlightById(flight.id);

      setEditingFlight(detail);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);

      setEditingFlight(flight);
      setIsModalOpen(true);
    }
  };

  const handleDeleteFlight = async (flight: Flight) => {
    const confirmed = await showConfirmAlert(
      'Delete Flight',
      `Delete flight ${flight.schedule?.flight_number}?`,
    );

    if (!confirmed) return;

    try {
      await flightsApi.deleteFlight(flight.id);

      showSuccessAlert('Flight deleted successfully');

      fetchFlights();
    } catch (err: any) {
      showErrorAlert(
        err?.response?.data?.message || 'Failed to delete flight',
      );
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
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';

      case 'boarding':
        return 'bg-yellow-100 text-yellow-700';

      case 'departed':
        return 'bg-indigo-100 text-indigo-700';

      case 'arrived':
        return 'bg-emerald-100 text-emerald-700';

      case 'cancelled':
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
            Flight Management
          </h1>

          <p className="text-slate-500 mt-1">
            Manage schedules, aircraft and operational flights.
          </p>
        </div>

        <button
          onClick={handleAddFlight}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />

          <span>Add Flight</span>
        </button>
      </div>

      {/* Filters */}
      <div className="premium-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Departure */}
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Departure
            </label>

            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={dep}
                onChange={(e) => setDep(e.target.value.toUpperCase())}
                placeholder="CGK"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Arrival */}
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Arrival
            </label>

            <div className="relative">
              <Plane className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={arr}
                onChange={(e) => setArr(e.target.value.toUpperCase())}
                placeholder="DPS"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Date */}
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
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Search className="w-4 h-4" />

              Search Flights
            </button>
          </div>
        </div>
      </div>

      {/* Result Summary */}
      <div className="premium-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-primary" />

          <p className="text-sm text-slate-600">
            Showing{' '}
            <span className="font-bold text-slate-900">
              {flights.length}
            </span>{' '}
            flights
          </p>
        </div>

        <div className="text-sm text-slate-500">
          {dep} → {arr}
        </div>
      </div>

      {/* Content */}
      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>

            <p className="text-slate-500 font-medium italic">
              Loading flights...
            </p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>

            <p className="text-red-500 font-medium">{error}</p>

            <button
              onClick={fetchFlights}
              className="mt-4 text-primary font-semibold hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : flights.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8" />
            </div>

            <p className="text-slate-500 font-medium">
              No flights found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Flight
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Route
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Schedule
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Aircraft
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Seats
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {flights.map((flight) => (
                  <tr
                    key={flight.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* flight */}
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-bold text-slate-900">
                          {flight.schedule?.flight_number}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {flight.id}
                        </div>
                      </div>
                    </td>

                    {/* route */}
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-800">
                        {
                          flight.schedule?.departure_airport?.code
                        }{' '}
                        →{' '}
                        {
                          flight.schedule?.arrival_airport?.code
                        }
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        {
                          flight.schedule?.departure_airport?.city
                        }{' '}
                        →{' '}
                        {
                          flight.schedule?.arrival_airport?.city
                        }
                      </div>
                    </td>

                    {/* schedule */}
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5" />

                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {formatDateTime(
                              flight.departure_time,
                            )}
                          </div>

                          <div className="text-xs text-slate-500 mt-1">
                            Arrival:{' '}
                            {formatDateTime(
                              flight.arrival_time,
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* aircraft */}
                    <td className="px-6 py-5">
                      <div className="font-medium text-slate-800">
                        {flight.aircraft?.manufacturer}{' '}
                        {flight.aircraft?.model}
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        Total Seats:{' '}
                        {flight.aircraft?.total_seats}
                      </div>
                    </td>

                    {/* seats */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <Users className="w-4 h-4 text-slate-400" />

                        {flight.arrival_time}
                      </div>
                    </td>

                    {/* price */}
                    {/* <td className="px-6 py-5">
                      <div className="font-bold text-primary">
                        {formatCurrency(
                          flight.,
                        )}
                      </div>
                    </td> */}

                    {/* status */}
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                          flight.status,
                        )}`}
                      >
                        {flight.status}
                      </span>
                    </td>

                    {/* actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleEditFlight(flight)
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteFlight(flight)
                          }
                          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* modal nanti */}
      {/*
      <FlightFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        flight={editingFlight}
      />
      */}
    </div>
  );
};

export default FlightsPage;
