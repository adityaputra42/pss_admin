import { useEffect, useState } from 'react';

import {
  CreditCard,
  Wallet,
  Receipt,
  RefreshCcw,
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  Eye,
  RotateCcw,
  Calendar,
  BadgeDollarSign,
} from 'lucide-react';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';


import type { Payment } from '../../types/api';
import { paymentsApi } from '../../services/api-services';

const PaymentPage = () => {
  // =========================
  // state
  // =========================
  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isRefunding, setIsRefunding] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  // =========================
  // lifecycle
  // =========================
  useEffect(() => {
    fetchPayments();
  }, []);

  // =========================
  // api
  // =========================
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await paymentsApi .getPayments();

      setPayments(response ?? []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Failed to fetch payment data',
      );

      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to fetch payment data',
      );

      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPayment =
    async (payment: Payment) => {
      try {
        setIsLoading(true);

        const response =
          await paymentsApi.getPaymentById(
            payment.id,
          );

        if (response) {
          setSelectedPayment(
            response,
          );
        }
      } catch (err: any) {
        console.error(err);

        showErrorAlert(
          err?.response?.data?.message ||
            'Failed to fetch payment detail',
        );
      } finally {
        setIsLoading(false);
      }
    };

  const handleRefund = async (
    payment: Payment,
  ) => {
    if (
      payment.status ===
      'refunded'
    ) {
      showErrorAlert(
        'Payment already refunded',
      );

      return;
    }

    const confirmed =
      await showConfirmAlert(
        'Refund Payment',
        `Refund payment ${payment.id}?`,
      );

    if (!confirmed) return;

    try {
      setIsRefunding(true);

      await paymentsApi.refundPayment(
        payment.id,
      );

      showSuccessAlert(
        'Payment refunded successfully',
      );

      const updatedPayments =
        payments.map((item) =>
          item.id === payment.id
            ? {
                ...item,
                status: 'refunded',
              }
            : item,
        );

      setPayments(updatedPayments);

      if (
        selectedPayment?.id ===
        payment.id
      ) {
        setSelectedPayment({
          ...selectedPayment,
          status: 'refunded',
        });
      }
    } catch (err: any) {
      console.error(err);

      showErrorAlert(
        err?.response?.data?.message ||
          'Failed to refund payment',
      );
    } finally {
      setIsRefunding(false);
    }
  };

  // =========================
  // helpers
  // =========================
  const formatCurrency = (
    value?: number,
  ) => {
    if (
      value === undefined ||
      value === null
    ) {
      return '-';
    }

    return new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      },
    ).format(value);
  };

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
      case 'paid':
      case 'success':
        return 'bg-emerald-100 text-emerald-700';

      case 'pending':
        return 'bg-amber-100 text-amber-700';

      case 'failed':
        return 'bg-red-100 text-red-700';

      case 'refunded':
        return 'bg-slate-200 text-slate-700';

      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusIcon = (
    status?: string,
  ) => {
    switch (status) {
      case 'paid':
      case 'success':
        return (
          <CheckCircle2 className="w-4 h-4" />
        );

      case 'failed':
      case 'refunded':
        return (
          <XCircle className="w-4 h-4" />
        );

      default:
        return (
          <Clock3 className="w-4 h-4" />
        );
    }
  };

  const getMethodIcon = (
    method?: string,
  ) => {
    switch (method) {
      case 'cash':
        return (
          <Wallet className="w-4 h-4" />
        );

      default:
        return (
          <CreditCard className="w-4 h-4" />
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
            Payment Management
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor transactions,
            payment status, and process
            payment refunds.
          </p>
        </div>

        <button
          onClick={fetchPayments}
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
            Total Payments:{' '}
            <span className="font-bold text-slate-900">
              {payments.length}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-emerald-600">
          <BadgeDollarSign className="w-4 h-4" />

          <span className="text-sm font-medium">
            Financial Monitoring
            Active
          </span>
        </div>
      </div>

      {/* ========================= */}
      {/* content */}
      {/* ========================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ========================= */}
        {/* payment list */}
        {/* ========================= */}
        <div className="xl:col-span-2 premium-card overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

              <p className="text-slate-500 italic">
                Loading payment data...
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
                onClick={fetchPayments}
                className="mt-4 text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : payments.length ===
            0 ? (
            <div className="p-20 text-center">
              <Receipt className="w-14 h-14 text-slate-300 mx-auto mb-4" />

              <p className="text-slate-500">
                No payment records found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map(
                (payment) => (
                  <div
                    key={payment.id}
                    className={`p-6 transition-all hover:bg-slate-50 ${
                      selectedPayment?.id ===
                      payment.id
                        ? 'bg-primary/5 border-l-4 border-primary'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* left */}
                      <div className="space-y-3 flex-1">
                        {/* pnr */}
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-primary" />

                          <span className="font-semibold text-slate-800">
                            PNR ID:
                          </span>

                          <span className="font-mono text-sm text-slate-600">
                            {
                              payment.pnr_id
                            }
                          </span>
                        </div>

                        {/* amount */}
                        <div className="flex items-center gap-2">
                          <BadgeDollarSign className="w-4 h-4 text-emerald-600" />

                          <span className="font-bold text-emerald-700 text-lg">
                            {formatCurrency(
                              payment.amount,
                            )}
                          </span>
                        </div>

                        {/* method */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold capitalize">
                            {getMethodIcon(
                              payment.method,
                            )}

                            {
                              payment.method
                            }
                          </div>
                        </div>

                        {/* paid date */}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />

                          {formatDateTime(
                            payment.paid_at,
                          )}
                        </div>
                      </div>

                      {/* right */}
                      <div className="flex items-center gap-2">
                        {/* status */}
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                            payment.status,
                          )}`}
                        >
                          {getStatusIcon(
                            payment.status,
                          )}

                          {
                            payment.status
                          }
                        </span>

                        {/* detail */}
                        <button
                          onClick={() =>
                            handleSelectPayment(
                              payment,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* refund */}
                        {payment.status !==
                          'refunded' && (
                          <button
                            onClick={() =>
                              handleRefund(
                                payment,
                              )
                            }
                            disabled={
                              isRefunding
                            }
                            className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-60"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
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
          {!selectedPayment ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Receipt className="w-14 h-14 text-slate-300 mb-4" />

              <p className="text-slate-500">
                Select payment record
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* title */}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Payment Detail
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  Transaction and payment
                  information detail.
                </p>
              </div>

              {/* payment id */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Payment ID
                </p>

                <p className="font-mono text-sm text-slate-700 break-all">
                  {selectedPayment.id}
                </p>
              </div>

              {/* pnr */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  PNR ID
                </p>

                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />

                  <p className="font-medium text-slate-800 break-all">
                    {
                      selectedPayment.pnr_id
                    }
                  </p>
                </div>
              </div>

              {/* amount */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Amount
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-100">
                  <BadgeDollarSign className="w-5 h-5 text-emerald-700" />

                  <span className="font-bold text-lg text-emerald-700">
                    {formatCurrency(
                      selectedPayment.amount,
                    )}
                  </span>
                </div>
              </div>

              {/* payment method */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Payment Method
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold capitalize">
                  {getMethodIcon(
                    selectedPayment.method,
                  )}

                  {
                    selectedPayment.method
                  }
                </div>
              </div>

              {/* payment status */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Payment Status
                </p>

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                    selectedPayment.status,
                  )}`}
                >
                  {getStatusIcon(
                    selectedPayment.status,
                  )}

                  {
                    selectedPayment.status
                  }
                </span>
              </div>

              {/* paid at */}
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Paid At
                </p>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />

                  <p className="font-medium text-slate-800">
                    {formatDateTime(
                      selectedPayment.paid_at,
                    )}
                  </p>
                </div>
              </div>

              {/* refund */}
              {selectedPayment.status !==
                'refunded' && (
                <button
                  onClick={() =>
                    handleRefund(
                      selectedPayment,
                    )
                  }
                  disabled={
                    isRefunding
                  }
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />

                  {isRefunding
                    ? 'Processing Refund...'
                    : 'Refund Payment'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
