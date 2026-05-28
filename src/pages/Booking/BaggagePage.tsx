import { useEffect, useState } from 'react';

import {
  BaggageClaim,
  User,
  Plane,
  Weight,
  Tag,
  RefreshCcw,
  Filter,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Eye,
  Save,
} from 'lucide-react';

import {
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import { baggageApi } from '../../services/api-services/baggage';

import type { Baggage } from '../../types/api';

const baggageStatuses = [
  'checked_in',
  'loaded',
  'in_transit',
  'arrived',
  'claimed',
  'lost',
];

const BaggagePage = () => {
  // =========================
  // state
  // =========================
  const [baggageList, setBaggageList] =
    useState<Baggage[]>([]);

  const [
    selectedBaggage,
    setSelectedBaggage,
  ] = useState<Baggage | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [selectedStatus, setSelectedStatus] =
    useState('');

  // =========================
  // lifecycle
  // =========================
  useEffect(() => {
    fetchBaggage();
  }, []);

  // =========================
  // api
  // =========================
  const fetchBaggage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await baggageApi.getBaggage();

      setBaggageList(response ?? []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Failed to fetch baggage data',
      );

      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to fetch baggage data',
      );

      setBaggageList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBaggage = (
    baggage: Baggage,
  ) => {
    setSelectedBaggage(baggage);

    setSelectedStatus(
      baggage.status,
    );
  };

  const handleUpdateStatus =
    async () => {
      if (!selectedBaggage) return;

      try {
        setIsUpdating(true);

        await baggageApi.updateBaggageStatus(
          selectedBaggage.id,
          selectedStatus,
        );

        showSuccessAlert(
          'Baggage status updated successfully',
        );

        const updatedList =
          baggageList.map((item) =>
            item.id ===
            selectedBaggage.id
              ? {
                  ...item,
                  status:
                    selectedStatus,
                }
              : item,
          );

        setBaggageList(updatedList);

        setSelectedBaggage({
          ...selectedBaggage,
          status: selectedStatus,
        });
      } catch (err: any) {
        console.error(err);

        showErrorAlert(
          err?.response?.data?.message ||
            'Failed to update baggage status',
        );
      } finally {
        setIsUpdating(false);
      }
    };

  // =========================
  // helpers
  // =========================
  const getStatusColor = (
    status?: string,
  ) => {
    switch (status) {
      case 'claimed':
      case 'arrived':
        return 'bg-emerald-100 text-emerald-700';

      case 'loaded':
      case 'in_transit':
        return 'bg-blue-100 text-blue-700';

      case 'checked_in':
        return 'bg-amber-100 text-amber-700';

      case 'lost':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (
    status?: string,
  ) => {
    switch (status) {
      case 'claimed':
      case 'arrived':
        return (
          <CheckCircle2 className="w-4 h-4" />
        );

      case 'lost':
        return (
          <AlertTriangle className="w-4 h-4" />
        );

      default:
        return (
          <Clock3 className="w-4 h-4" />
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* header */}
      {/* ========================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Baggage Management
          </h1>

          <p className="text-slate-500 mt-1">
            Track passenger baggage,
            baggage tags, and baggage
            movement status.
          </p>
        </div>

        <button
          onClick={fetchBaggage}
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
            Total Baggage:{' '}
            <span className="font-bold text-slate-900">
              {baggageList.length}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-blue-600">
          <BaggageClaim className="w-4 h-4" />

          <span className="text-sm font-medium">
            Baggage Tracking Active
          </span>
        </div>
      </div>

      {/* ========================= */}
      {/* content */}
      {/* ========================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ========================= */}
        {/* baggage list */}
        {/* ========================= */}
        <div className="xl:col-span-2 premium-card overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

              <p className="text-slate-500 italic">
                Loading baggage data...
              </p>
            </div>
          ) : error ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              <p className="text-red-500 font-medium">
                {error}
              </p>

              <button
                onClick={fetchBaggage}
                className="mt-4 text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : baggageList.length ===
            0 ? (
            <div className="p-20 text-center">
              <BaggageClaim className="w-14 h-14 text-slate-300 mx-auto mb-4" />

              <p className="text-slate-500">
                No baggage records found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {baggageList.map(
                (baggage) => (
                  <div
                    key={baggage.id}
                    className={`p-6 transition-all hover:bg-slate-50 ${
                      selectedBaggage?.id ===
                      baggage.id
                        ? 'bg-primary/5 border-l-4 border-primary'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* left */}
                      <div className="space-y-3 flex-1">
                        {/* passenger */}
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />

                          <span className="font-semibold text-slate-800">
                            Passenger ID:
                          </span>

                          <span className="font-mono text-sm text-slate-600">
                            {
                              baggage.passenger_id
                            }
                          </span>
                        </div>

                        {/* segment */}
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-slate-400" />

                          <span className="font-semibold text-slate-800">
                            Segment ID:
                          </span>

                          <span className="font-mono text-sm text-slate-600">
                            {
                              baggage.segment_id
                            }
                          </span>
                        </div>

                        {/* baggage info */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                            <Weight className="w-3 h-3" />

                            {
                              baggage.weight
                            }
                            kg
                          </div>

                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                            <Tag className="w-3 h-3" />

                            {
                              baggage.tag_number
                            }
                          </div>
                        </div>
                      </div>

                      {/* right */}
                      <div className="flex items-center gap-2">
                        {/* status */}
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                            baggage.status,
                          )}`}
                        >
                          {getStatusIcon(
                            baggage.status,
                          )}

                          {
                            baggage.status
                          }
                        </span>

                        {/* view */}
                        <button
                          onClick={() =>
                            handleSelectBaggage(
                              baggage,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* ========================= */}
        {/* detail panel */}
        {/* ========================= */}
        <div className="premium-card p-6">
          {!selectedBaggage ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BaggageClaim className="w-14 h-14 text-slate-300 mb-4" />

              <p className="text-slate-500">
                Select baggage record
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* title */}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Baggage Detail
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  Passenger baggage and
                  baggage tracking
                  information.
                </p>
              </div>

              {/* baggage id */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Baggage ID
                </p>

                <p className="font-mono text-sm text-slate-700 break-all">
                  {selectedBaggage.id}
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
                      selectedBaggage.passenger_id
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
                      selectedBaggage.segment_id
                    }
                  </p>
                </div>
              </div>

              {/* weight */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Weight
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100">
                  <Weight className="w-4 h-4 text-slate-600" />

                  <span className="font-bold text-slate-800">
                    {
                      selectedBaggage.weight
                    }
                    kg
                  </span>
                </div>
              </div>

              {/* tag number */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Tag Number
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-100">
                  <Tag className="w-4 h-4 text-indigo-700" />

                  <span className="font-bold text-indigo-700">
                    {
                      selectedBaggage.tag_number
                    }
                  </span>
                </div>
              </div>

              {/* current status */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Current Status
                </p>

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                    selectedBaggage.status,
                  )}`}
                >
                  {getStatusIcon(
                    selectedBaggage.status,
                  )}

                  {
                    selectedBaggage.status
                  }
                </span>
              </div>

              {/* update status */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Update Status
                </p>

                <select
                  value={
                    selectedStatus
                  }
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {baggageStatuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* save */}
              <button
                onClick={
                  handleUpdateStatus
                }
                disabled={isUpdating}
                className="w-full bg-primary hover:bg-secondary disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />

                {isUpdating
                  ? 'Updating...'
                  : 'Update Status'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaggagePage;
