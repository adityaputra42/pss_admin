import api from '../api-client';
import type { PaymentMethod, PaymentMethodInput, PaymentMethodUpdateInput, ApiResponse } from '../../types/api';

/**
 * Payment Methods API Service
 * Handles all payment method-related API calls
 */
export const paymentMethodsApi = {
  /**
   * Get all payment methods
   * GET /payment-methods
   */
  async getPaymentMethods(page: number = 1, limit: number = 10, sortBy?: string): Promise<PaymentMethod[]> {
    const response = await api.get<ApiResponse<PaymentMethod[]>>('/payment-methods', {
      params: { page, limit, sort_by: sortBy },
    });
    return response.data.data??[];
  },

  /**
   * Get payment method by ID
   * GET /payment-methods/{id}
   */
  async getPaymentMethodById(id: number): Promise<PaymentMethod| null> {
    const response = await api.get<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`);
    return response.data.data;
  },

  /**
   * Create payment method
   * POST /payment-methods
   * Accepts multipart/form-data
   */
  async createPaymentMethod(data: PaymentMethodInput): Promise<PaymentMethod| null> {
    const formData = new FormData();
    formData.append('account_name', data.account_name);
    formData.append('account_number', data.account_number);
    formData.append('bank_name', data.bank_name);
    formData.append('bank_image', data.bank_image);

    const response = await api.post<ApiResponse<PaymentMethod>>('/payment-methods', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Update payment method
   * PUT /payment-methods/{id}
   * Accepts multipart/form-data
   */
  async updatePaymentMethod(id: number, data: PaymentMethodUpdateInput): Promise<PaymentMethod| null> {
    const formData = new FormData();
    
    if (data.account_name) formData.append('account_name', data.account_name);
    if (data.account_number) formData.append('account_number', data.account_number);
    if (data.bank_name) formData.append('bank_name', data.bank_name);
    if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
    if (data.bank_image) formData.append('bank_image', data.bank_image);

    const response = await api.put<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Delete payment method
   * DELETE /payment-methods/{id}
   */
  async deletePaymentMethod(id: number): Promise<void> {
    await api.delete(`/payment-methods/${id}`);
  },
};
