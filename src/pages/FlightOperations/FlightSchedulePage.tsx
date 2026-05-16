import { useEffect, useState } from 'react';
import type { FlightSchedule } from '../../types/api';

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
} from 'lucide-react';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';
import { flightSchedulesApi } from '../../services/api-services';


const FlightSchedulesPage = () => {
  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // filter
  const [search, setSearch] = useState('');

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<FlightSchedule | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data =
        await flightSchedulesApi.getSchedules();

      setSchedules(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to fetch flight schedules',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchedules = schedules.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.flight_number
        ?.toLowerCase()
        .includes(keyword) ||
      item.departure_airport?.code
        ?.toLowerCase()
        .includes(keyword) ||
      item.arrival_airport?.code
        ?.toLowerCase()
        .includes(keyword) ||
      item.departure_airport?.city
        ?.toLowerCase()
        .includes(keyword) ||
      item.arrival_airport?.city
        ?.toLowerCase()
        .includes(keyword)
    );
  });

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

  const formatOperatingDays = (days?: string) => {
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
            Flight Schedules
          </h1>

          <p className="text-slate-500 mt-1">
            Manage recurring routes and operational
            schedules.
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
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search flight number, airport, city..."
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
                {filteredSchedules.length}
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
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>

            <p className="text-slate-500 italic">
              Loading schedules...
            </p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
        ) : filteredSchedules.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>

            <p className="text-slate-500 font-medium">
              No schedules found
            </p>
          </div>
        ) : (
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
                {filteredSchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* flight */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Plane className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="font-bold text-slate-900">
                            {schedule.flight_number}
                          </div>

                          <div className="text-xs text-slate-500 mt-1">
                            {schedule.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* route */}
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-800">
                        {
                          schedule.departure_airport
                            ?.code
                        }{' '}
                        →{' '}
                        {
                          schedule.arrival_airport?.code
                        }
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        {
                          schedule.departure_airport
                            ?.city
                        }{' '}
                        →{' '}
                        {
                          schedule.arrival_airport
                            ?.city
                        }
                      </div>
                    </td>

                    {/* departure */}
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5" />

                        <div>
                          <div className="font-medium text-slate-800">
                            {
                              schedule.departure_time
                            }
                          </div>

                          <div className="text-xs text-slate-500">
                            Departure Time
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* arrival */}
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

                    {/* operating days */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {formatOperatingDays(
                          schedule.operating_days,
                        )
                          .split(', ')
                          .map((day) => (
                            <span
                              key={day}
                              className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                            >
                              {day}
                            </span>
                          ))}
                      </div>
                    </td>

                    {/* actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleEditSchedule(
                              schedule,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteSchedule(
                              schedule,
                            )
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

      {/* modal */}
      {/*
      <FlightScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schedule={editingSchedule}
        onSuccess={fetchSchedules}
      />
      */}
    </div>
  );
};

export default FlightSchedulesPage;
