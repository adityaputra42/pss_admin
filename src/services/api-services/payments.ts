
/* =========================================================
   PAYMENT SERVICE
========================================================= */

import type {
  ApiResponse,
  Payment,
} from '../../types/api';
import api from '../api-client';

export const paymentsApi = {
  async getPayments(): Promise<Payment[]> {

    const response = await api.get<ApiResponse<Payment[]>>(
      '/payments',
    );

    return response.data.data ?? [];
  },

  async getPaymentById(
    id: string,
  ): Promise<Payment | null> {

    const response = await api.get<ApiResponse<Payment>>(
      `/payments/${id}`,
    );

    return response.data.data;
  },

  async refundPayment(
    id: string,
  ): Promise<void> {

    await api.patch(
      `/payments/${id}/refund`,
    );
  },
};
