import api from '../api-client';
import type { ShippingMethod, ShippingInput, ShippingUpdateInput, ApiResponse } from '../../types/api';

/**
 * Shipping API Service
 * Handles all shipping method-related API calls
 */
export const shippingApi = {
  /**
   * Get all shipping methods
   * GET /shipping
   */
  async getShippingMethods(): Promise<ShippingMethod[]> {
    const response = await api.get<ApiResponse<ShippingMethod[]>>('/shipping');
    return response.data.data??[];
  },

  /**
   * Get shipping method by ID
   * GET /shipping/{id}
   */
  async getShippingById(id: number): Promise<ShippingMethod| null> {
    const response = await api.get<ApiResponse<ShippingMethod>>(`/shipping/${id}`);
    return response.data.data;
  },

  /**
   * Create shipping method (admin only)
   * POST /shipping
   */
  async createShipping(data: ShippingInput): Promise<ShippingMethod| null> {
    const response = await api.post<ApiResponse<ShippingMethod>>('/shipping', data);
    return response.data.data;
  },

  /**
   * Update shipping method (admin only)
   * PUT /shipping/{id}
   */
  async updateShipping(id: number, data: ShippingUpdateInput): Promise<ShippingMethod| null> {
    const response = await api.put<ApiResponse<ShippingMethod>>(`/shipping/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete shipping method (admin only)
   * DELETE /shipping/{id}
   */
  async deleteShipping(id: number): Promise<void> {
    await api.delete(`/shipping/${id}`);
  },
};
