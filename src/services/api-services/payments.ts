/* =========================================================
   PAYMENT SERVICE
========================================================= */

import type {
  ApiResponse,
  Payment,
  PaymentListResult,
} from '../../types/api';
import api from '../api-client';

/**
 * BACKEND (internal/payment/interfaces/http/router.go):
 *   POST /payments                (open a DOKU Virtual Account for a PNR)
 *   GET  /payments/{id}
 *   GET  /payments/pnr/{pnr_id}   (latest payment for a PNR)
 *   GET  /payments                permission: payment.payment.view (admin, list all)
 * plus two DOKU webhook endpoints not relevant to an admin UI.
 *
 * GET /payments (list) was added alongside the other three -- admin
 * visibility across all PNRs, not gated by PNR ownership the way the
 * other three routes are (see platformauthz.CheckOwnership on those).
 *
 * There is still NO refund endpoint of any kind -- DOKU's VA product
 * this integrates with has no refund flow (see infrastructure/doku/
 * client.go's package comment). refundPayment() is not something this
 * file can add without new backend work; don't build a refund button
 * against this API.
 */
export const paymentsApi = {
  /** GET /payments/{id} */
  async getPaymentById(id: number): Promise<Payment | null> {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  /** GET /payments/pnr/{pnrId} -- most recent payment attempt for a PNR. */
  async getPaymentByPNR(pnrId: number): Promise<Payment | null> {
    const response = await api.get<ApiResponse<Payment>>(`/payments/pnr/${pnrId}`);
    return response.data.data;
  },

  /**
   * List payments (admin), across all PNRs.
   * GET /payments?page=&limit=&status=
   * status is optional (e.g. "PENDING", "PAID", "FAILED", "EXPIRED",
   * "REFUNDED"); omit for all statuses.
   */
  async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaymentListResult> {
    const response = await api.get<ApiResponse<PaymentListResult>>('/payments', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        status: params?.status || undefined,
      },
    });
    return response.data.data ?? { items: [], total: 0, page: 1, limit: 10 };
  },

  /**
   * POST /payments -- opens a DOKU Virtual Account covering whatever's
   * currently unpaid for the PNR (ticket + any active unpaid ancillary
   * charges). channel is optional (defaults server-side).
   */
  async createPayment(pnrId: number, channel?: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/payments', {
      pnr_id: pnrId,
      channel,
    });
    return response.data.data;
  },
};
