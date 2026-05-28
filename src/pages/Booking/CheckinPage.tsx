import { useEffect, useState } from 'react';

import {

  Filter,
  Calendar,
  Clock3,
  CheckCircle2,
  User,
  Plane,
  Ticket,
  RefreshCcw,
} from 'lucide-react';

import { showErrorAlert } from '../../utils/alerts';

import type { Checkin } from '../../types/api';
import { checkinsApi } from '../../services/api-services';

const CheckinPage = () => {
  // =========================
  // state
  // =========================
  const [checkins, setCheckins] =
    useState<Checkin[]>([]);

  const [selectedCheckin, setSelectedCheckin] =
    useState<Checkin | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  // =========================
  // lifecycle
  // =========================
  useEffect(() => {
    fetchCheckins();
  }, []);

  // =========================
  // api
  // =========================
  const fetchCheckins = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await checkinsApi.getCheckins()

      setCheckins(response ?? []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Failed to fetch check-in data',
      );

      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to fetch check-in data',
      );

      setCheckins([]);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // helpers
  // =========================
  const formatDateTime = (
    value?: string,
  ) => {
    if (!value) return '-';

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return '-';
    }

    return date.toLocaleString(
      'id-ID',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    );
  };

  const handleSelectCheckin = (
    checkin: Checkin,
  ) => {
    setSelectedCheckin(checkin);
  };

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* header */}
      {/* ========================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Check-In Management
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor passenger check-in
            activity and boarding records.
          </p>
        </div>

        <button
          onClick={fetchCheckins}
          disabled={isLoading}
          className="bg-primary hover:bg-secondary disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCcw
            className={`w-4 h-4 ${
              isLoading
                ? 'animate-spin'
                : ''
            }`}
          />

          Refresh Data
        </button>
      </div>

      {/* ========================= */}
      {/* summary */}
      {/* ========================= */}
      <div className="premium-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-primary" />

          <p className="text-sm text-slate-600">
            Total Check-ins:{' '}
            <span className="font-bold text-slate-900">
              {checkins.length}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />

          <span className="text-sm font-medium">
            Active Monitoring
          </span>
        </div>
      </div>

      {/* ========================= */}
      {/* content */}
      {/* ========================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ========================= */}
        {/* list */}
        {/* ========================= */}
        <div className="xl:col-span-2 premium-card overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

              <p className="text-slate-500 italic">
                Loading check-in data...
              </p>
            </div>
          ) : error ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-red-500" />
              </div>

              <p className="text-red-500 font-medium">
                {error}
              </p>

              <button
                onClick={fetchCheckins}
                className="mt-4 text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : checkins.length === 0 ? (
            <div className="p-20 text-center">
              <Ticket className="w-14 h-14 text-slate-300 mx-auto mb-4" />

              <p className="text-slate-500">
                No check-in records found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {checkins.map((checkin) => (
                <div
                  key={checkin.id}
                  onClick={() =>
                    handleSelectCheckin(
                      checkin,
                    )
                  }
                  className={`p-6 cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedCheckin?.id ===
                    checkin.id
                      ? 'bg-primary/5 border-l-4 border-primary'
                      : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* left */}
                    <div className="space-y-3">
                      {/* passenger */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />

                        <span className="font-semibold text-slate-800">
                          Passenger ID:
                        </span>

                        <span className="text-slate-600 font-mono text-sm">
                          {
                            checkin.passenger_id
                          }
                        </span>
                      </div>

                      {/* segment */}
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-slate-400" />

                        <span className="font-semibold text-slate-800">
                          Segment ID:
                        </span>

                        <span className="text-slate-600 font-mono text-sm">
                          {
                            checkin.segment_id
                          }
                        </span>
                      </div>

                      {/* time */}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />

                        {formatDateTime(
                          checkin.checkin_time,
                        )}
                      </div>
                    </div>

                    {/* status */}
                    <div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />

                        Checked In
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================= */}
        {/* detail panel */}
        {/* ========================= */}
        <div className="premium-card p-6">
          {!selectedCheckin ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Ticket className="w-14 h-14 text-slate-300 mb-4" />

              <p className="text-slate-500">
                Select a check-in record
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* title */}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Check-In Detail
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  Passenger check-in
                  information and boarding
                  activity.
                </p>
              </div>

              {/* checkin id */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Check-In ID
                </p>

                <p className="font-mono text-sm text-slate-700 break-all">
                  {selectedCheckin.id}
                </p>
              </div>

              {/* passenger */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Passenger ID
                </p>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />

                  <p className="font-medium text-slate-800 break-all">
                    {
                      selectedCheckin.passenger_id
                    }
                  </p>
                </div>
              </div>

              {/* segment */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Segment ID
                </p>

                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-primary" />

                  <p className="font-medium text-slate-800 break-all">
                    {
                      selectedCheckin.segment_id
                    }
                  </p>
                </div>
              </div>

              {/* time */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Check-In Time
                </p>

                <div className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-primary" />

                  <p className="font-medium text-slate-800">
                    {formatDateTime(
                      selectedCheckin.checkin_time,
                    )}
                  </p>
                </div>
              </div>

              {/* status */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Status
                </p>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />

                  Checked In
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckinPage;
