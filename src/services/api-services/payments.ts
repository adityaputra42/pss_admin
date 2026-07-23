/* =========================================================
   PAYMENT SERVICE
========================================================= */

import type {
  ApiResponse,
  Payment,
} from '../../types/api';
import api from '../api-client';


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
