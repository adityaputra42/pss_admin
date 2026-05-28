import { useEffect, useState } from 'react';

import {
  Plane,
  Ticket,
  User,
  Clock3,
  QrCode,
  RefreshCcw,
  Printer,
  CheckCircle2,
  Filter,
  Eye,
} from 'lucide-react';

import {
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';


import type { BoardingPass } from '../../types/api';
import { boardingPassApi } from '../../services/api-services';

const BoardingPassPage = () => {
  // =========================
  // state
  // =========================
  const [boardingPasses, setBoardingPasses] =
    useState<BoardingPass[]>([]);

  const [
    selectedBoardingPass,
    setSelectedBoardingPass,
  ] = useState<BoardingPass | null>(
    null,
  );

  const [isLoading, setIsLoading] =
    useState(false);

  const [isPrinting, setIsPrinting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  // =========================
  // lifecycle
  // =========================
  useEffect(() => {
    fetchBoardingPasses();
  }, []);

  // =========================
  // api
  // =========================
  const fetchBoardingPasses =
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await boardingPassApi.getBoardingPasses();

        setBoardingPasses(response);
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            'Failed to fetch boarding passes',
        );

        showErrorAlert(
          err?.response?.data?.message ||
            'Failed to fetch boarding passes',
        );

        setBoardingPasses([]);
      } finally {
        setIsLoading(false);
      }
    };

  const handleSelectBoardingPass = (
    boardingPass: BoardingPass,
  ) => {
    setSelectedBoardingPass(
      boardingPass,
    );
  };

  const handleReprint = async (
    boardingPass: BoardingPass,
  ) => {
    try {
      setIsPrinting(true);

      await boardingPassApi.reprintBoardingPass(
        boardingPass.id,
      );

      showSuccessAlert(
        'Boarding pass reprinted successfully',
      );
    } catch (err: any) {
      console.error(err);

      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to reprint boarding pass',
      );
    } finally {
      setIsPrinting(false);
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

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* header */}
      {/* ========================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Boarding Pass Management
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor boarding passes and
            reprint passenger boarding
            documents.
          </p>
        </div>

        <button
          onClick={fetchBoardingPasses}
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
            Total Boarding Passes:{' '}
            <span className="font-bold text-slate-900">
              {boardingPasses.length}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />

          <span className="text-sm font-medium">
            Boarding Active
          </span>
        </div>
      </div>

      {/* ========================= */}
      {/* content */}
      {/* ========================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ========================= */}
        {/* boarding pass list */}
        {/* ========================= */}
        <div className="xl:col-span-2 premium-card overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

              <p className="text-slate-500 italic">
                Loading boarding passes...
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
                onClick={
                  fetchBoardingPasses
                }
                className="mt-4 text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : boardingPasses.length ===
            0 ? (
            <div className="p-20 text-center">
              <Ticket className="w-14 h-14 text-slate-300 mx-auto mb-4" />

              <p className="text-slate-500">
                No boarding passes found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {boardingPasses.map(
                (boardingPass) => (
                  <div
                    key={boardingPass.id}
                    className={`p-6 transition-all hover:bg-slate-50 ${
                      selectedBoardingPass?.id ===
                      boardingPass.id
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

                          <span className="text-sm font-mono text-slate-600">
                            {
                              boardingPass.passenger_id
                            }
                          </span>
                        </div>

                        {/* segment */}
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-slate-400" />

                          <span className="font-semibold text-slate-800">
                            Segment ID:
                          </span>

                          <span className="text-sm font-mono text-slate-600">
                            {
                              boardingPass.segment_id
                            }
                          </span>
                        </div>

                        {/* boarding info */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            Group{' '}
                            {
                              boardingPass.boarding_group
                            }
                          </div>

                          <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            Gate{' '}
                            {
                              boardingPass.gate
                            }
                          </div>
                        </div>

                        {/* time */}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 className="w-4 h-4" />

                          {formatDateTime(
                            boardingPass.boarding_time,
                          )}
                        </div>
                      </div>

                      {/* actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleSelectBoardingPass(
                              boardingPass,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleReprint(
                              boardingPass,
                            )
                          }
                          disabled={
                            isPrinting
                          }
                          className="p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:opacity-60"
                        >
                          <Printer className="w-4 h-4" />
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
          {!selectedBoardingPass ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Ticket className="w-14 h-14 text-slate-300 mb-4" />

              <p className="text-slate-500">
                Select boarding pass
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* title */}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Boarding Pass Detail
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  Passenger boarding and
                  gate information.
                </p>
              </div>

              {/* id */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Boarding Pass ID
                </p>

                <p className="font-mono text-sm text-slate-700 break-all">
                  {
                    selectedBoardingPass.id
                  }
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
                      selectedBoardingPass.passenger_id
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
                      selectedBoardingPass.segment_id
                    }
                  </p>
                </div>
              </div>

              {/* boarding group */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Boarding Group
                </p>

                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                  Group{' '}
                  {
                    selectedBoardingPass.boarding_group
                  }
                </span>
              </div>

              {/* gate */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Boarding Gate
                </p>

                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                  Gate{' '}
                  {
                    selectedBoardingPass.gate
                  }
                </span>
              </div>

              {/* time */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Boarding Time
                </p>

                <div className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-primary" />

                  <p className="font-medium text-slate-800">
                    {formatDateTime(
                      selectedBoardingPass.boarding_time,
                    )}
                  </p>
                </div>
              </div>

              {/* qr */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  QR Code
                </p>

                {selectedBoardingPass.qr_code ? (
                  <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-slate-600" />

                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-slate-500 mb-1">
                        QR Content
                      </p>

                      <p className="font-mono text-xs text-slate-700 break-all">
                        {
                          selectedBoardingPass.qr_code
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />

                    <p className="text-sm text-slate-400">
                      No QR code available
                    </p>
                  </div>
                )}
              </div>

              {/* reprint */}
              <button
                onClick={() =>
                  handleReprint(
                    selectedBoardingPass,
                  )
                }
                disabled={isPrinting}
                className="w-full bg-primary hover:bg-secondary disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />

                {isPrinting
                  ? 'Reprinting...'
                  : 'Reprint Boarding Pass'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardingPassPage;
