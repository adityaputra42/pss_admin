/* =========================================================
   PAYMENT SERVICE
========================================================= */

import type {
  ApiResponse,
  Payment,
} from '../../types/api';
import api from '../api-client';

/**
 * ⚠️ BACKEND REALITY CHECK (internal/payment/interfaces/http/router.go):
 *   POST /payments             (open a DOKU Virtual Account for a PNR)
 *   GET  /payments/{id}
 *   GET  /payments/pnr/{pnr_id} (latest payment for a PNR)
 * plus two DOKU webhook endpoints not relevant to an admin UI.
 *
 * There is NO GET /payments (list all) and NO refund endpoint of any
 * kind -- DOKU's VA product this integrates with has no refund flow, see
 * infrastructure/doku/client.go's package comment. getPayments() and
 * refundPayment() are removed below; an admin "all payments" table isn't
 * buildable against this backend without a new list endpoint, and refund
 * isn't a feature that exists at all yet.
 *
 * Note also: both remaining reads are now ownership-gated server-side
 * (403 if the PNR belongs to a different logged-in user) -- see
 * platformauthz.CheckOwnership. As an admin caller this only matters if
 * you're testing with a non-admin token.
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
