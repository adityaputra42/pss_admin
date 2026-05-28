import { useEffect, useState } from 'react';

import {
  Search,
  Filter,
  Calendar,
  Users,
  Ticket,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  User,
} from 'lucide-react';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import { bookingsApi } from '../../services/api-services/booking';

import type {
  Passenger,
  PNR,
} from '../../types/api';

const BookingPage = () => {
  // =========================
  // state
  // =========================
  const [bookings, setBookings] =
    useState<PNR[]>([]);

  const [selectedBooking, setSelectedBooking] =
    useState<PNR | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  // =========================
  // pagination
  // =========================
  const [page] = useState(1);

  const [limit] = useState(10);

  // =========================
  // lifecycle
  // =========================
  useEffect(() => {
    fetchBookings();
  }, []);

  // =========================
  // api
  // =========================
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await bookingsApi.getBookings(
          page,
          limit,
        );

      setBookings(response ?? []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Failed to fetch bookings',
      );

      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBooking = async (
    bookingId: string,
  ) => {
    try {
      setIsLoading(true);

      const response =
        await bookingsApi.getBookingById(
          bookingId,
        );

      setSelectedBooking(response);
    } catch (err: any) {
      console.error(err);

      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to fetch booking detail',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (
    booking: PNR,
  ) => {
    const confirmed =
      await showConfirmAlert(
        'Cancel Booking',
        `Cancel booking ${booking.record_locator}?`,
      );

    if (!confirmed) return;

    try {
      setIsLoading(true);

      await bookingsApi.cancelBooking(
        booking.id,
      );

      showSuccessAlert(
        'Booking cancelled successfully',
      );

      await fetchBookings();

      if (
        selectedBooking?.id === booking.id
      ) {
        setSelectedBooking({
          ...selectedBooking,
          status: 'cancelled',
        });
      }
    } catch (err: any) {
      console.error(err);

      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to cancel booking',
      );
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

  const getStatusColor = (
    status?: string,
  ) => {
    switch (status) {
      case 'issued':
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';

      case 'pending':
        return 'bg-yellow-100 text-yellow-700';

      case 'cancelled':
        return 'bg-red-100 text-red-700';

      case 'expired':
        return 'bg-slate-100 text-slate-700';

      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusIcon = (
    status?: string,
  ) => {
    switch (status) {
      case 'issued':
      case 'paid':
        return (
          <CheckCircle2 className="w-4 h-4" />
        );

      case 'cancelled':
        return (
          <XCircle className="w-4 h-4" />
        );

      default:
        return (
          <Clock3 className="w-4 h-4" />
        );
    }
  };

  const getPassengerName = (
    passenger?: Passenger,
  ) => {
    if (!passenger) return '-';

    return `${passenger.first_name} ${passenger.last_name}`;
  };

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* header */}
      {/* ========================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            PNR Management
          </h1>

          <p className="text-slate-500 mt-1">
            Manage booking records and
            passengers inside each PNR.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="bg-primary hover:bg-secondary text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
        >
          <Search className="w-4 h-4" />

          Refresh
        </button>
      </div>

      {/* ========================= */}
      {/* summary */}
      {/* ========================= */}
      <div className="premium-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-primary" />

          <p className="text-sm text-slate-600">
            Showing{' '}
            <span className="font-bold text-slate-900">
              {bookings.length}
            </span>{' '}
            PNR records
          </p>
        </div>

        <div className="text-sm text-slate-500">
          Page {page}
        </div>
      </div>

      {/* ========================= */}
      {/* content */}
      {/* ========================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ========================= */}
        {/* left side */}
        {/* ========================= */}
        <div className="xl:col-span-2 premium-card overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

              <p className="text-slate-500 italic">
                Loading PNR data...
              </p>
            </div>
          ) : error ? (
            <div className="p-20 text-center">
              <p className="text-red-500 font-medium">
                {error}
              </p>

              <button
                onClick={fetchBookings}
                className="mt-4 text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-20 text-center">
              <Ticket className="w-14 h-14 text-slate-300 mx-auto mb-4" />

              <p className="text-slate-500">
                No PNR records found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-slate-50 transition-all"
                >
                  {/* top */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* left */}
                    <div className="space-y-4 flex-1">
                      {/* pnr */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-primary" />

                          <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                            {
                              booking.record_locator
                            }
                          </h2>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />

                          {formatDateTime(
                            booking.created_at,
                          )}
                        </div>
                      </div>

                      {/* passengers */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-slate-400" />

                          <p className="text-sm font-semibold text-slate-600">
                            Passengers (
                            {
                              booking.passengers
                                ?.length
                            }
                            )
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {booking.passengers
                            ?.length ? (
                            booking.passengers.map(
                              (
                                passenger,
                              ) => (
                                <div
                                  key={
                                    passenger.id
                                  }
                                  className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 text-slate-500" />

                                    <span className="text-sm font-medium text-slate-700">
                                      {getPassengerName(
                                        passenger,
                                      )}
                                    </span>
                                  </div>

                                  <div className="text-xs text-slate-500 mt-1 uppercase">
                                    {
                                      passenger.passenger_type
                                    }
                                  </div>
                                </div>
                              ),
                            )
                          ) : (
                            <p className="text-sm text-slate-400">
                              No passengers
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* right */}
                    <div className="flex flex-col items-end gap-3">
                      {/* status */}
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {getStatusIcon(
                          booking.status,
                        )}

                        {booking.status}
                      </span>

                      {/* actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleViewBooking(
                              booking.id,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {booking.status !==
                          'cancelled' && (
                          <button
                            onClick={() =>
                              handleCancelBooking(
                                booking,
                              )
                            }
                            className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
          {!selectedBooking ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Ticket className="w-14 h-14 text-slate-300 mb-4" />

              <p className="text-slate-500">
                Select a PNR to view detail
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* header */}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  PNR Detail
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  Passenger booking detail
                  and PNR information.
                </p>
              </div>

              {/* locator */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Record Locator
                </p>

                <p className="font-bold text-2xl tracking-widest text-slate-900">
                  {
                    selectedBooking.record_locator
                  }
                </p>
              </div>

              {/* status */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Status
                </p>

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                    selectedBooking.status,
                  )}`}
                >
                  {getStatusIcon(
                    selectedBooking.status,
                  )}

                  {selectedBooking.status}
                </span>
              </div>

              {/* created */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Created At
                </p>

                <p className="text-slate-700">
                  {formatDateTime(
                    selectedBooking.created_at,
                  )}
                </p>
              </div>

              {/* ttl */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  TTL
                </p>

                <p className="text-slate-700">
                  {formatDateTime(
                    selectedBooking.ttl,
                  )}
                </p>
              </div>

              {/* passengers */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-3">
                  Passengers
                </p>

                <div className="space-y-3">
                  {selectedBooking
                    .passengers?.length ? (
                    selectedBooking.passengers.map(
                      (
                        passenger,
                      ) => (
                        <div
                          key={passenger.id}
                          className="border border-slate-200 rounded-2xl p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-500" />
                            </div>

                            <div className="flex-1">
                              <div className="font-semibold text-slate-800">
                                {getPassengerName(
                                  passenger,
                                )}
                              </div>

                              <div className="text-sm text-slate-500 mt-1 uppercase">
                                {
                                  passenger.passenger_type
                                }
                              </div>

                              <div className="text-xs text-slate-400 mt-2">
                                Passport:{' '}
                                {passenger.passport_number ||
                                  '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-sm text-slate-400">
                      No passenger data
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
