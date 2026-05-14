import api from '../api-client';
import type { Order, OrderUpdateInput, ApiResponse } from '../../types/api';

/**
 * Orders API Service
 * Handles all order-related API calls
 */
export const ordersApi = {
  /**
   * Get all orders
   * GET /orders
   */
  async getOrders(): Promise<Order[]> {
  const response = await api.get<ApiResponse<Order[]>>('/orders');
  return response.data.data ?? [];
},


  /**
   * Get order by ID
   * GET /orders/{id}
   */
async getOrderById(id: number): Promise<Order | null> {
  const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return response.data.data;
},


  /**
   * Update order (admin only)
   * PUT /orders/{id}
   */
  async updateOrder(id: number, data: OrderUpdateInput): Promise<Order| null> {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data.data;
  },

  /**
   * Cancel order
   * PATCH /orders/{id}/cancel
   */
  async cancelOrder(id: number): Promise<Order| null> {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return response.data.data;
  },

  /**
   * Delete order (admin only)
   * DELETE /orders/{id}
   */
  async deleteOrder(id: number): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
