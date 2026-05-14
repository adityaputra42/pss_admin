import api from '../api-client';
import type { Payment, ApiResponse } from '../../types/api';

/**
 * Payments API Service
 * Handles all payment-related API calls
 */
export const paymentsApi = {
  /**
   * Get all payments
   * GET /payments
   */
  async getPayments(): Promise<Payment[]> {
    const response = await api.get<ApiResponse<Payment[]>>('/payments');
    return response.data.data??[];
  },

  /**
   * Get payment by ID
   * GET /payments/{id}
   */
  async getPaymentById(id: number): Promise<Payment| null> {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  /**
   * Create payment
   * POST /payments
   */
  async createPayment(data: { transaction_id: string; amount: number; payment_method_id: number }): Promise<Payment| null> {
    const response = await api.post<ApiResponse<Payment>>('/payments', data);
    return response.data.data;
  },

  /**
   * Update payment (admin only)
   * PUT /payments/{id}
   */
  async updatePayment(id: number, data: { status: string }): Promise<Payment| null> {
    const response = await api.put<ApiResponse<Payment>>(`/payments/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete payment (admin only)
   * DELETE /payments/{id}
   */
  async deletePayment(id: number): Promise<void> {
    await api.delete(`/payments/${id}`);
  },
};
