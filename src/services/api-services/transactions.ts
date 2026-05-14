import api from '../api-client';
import type { Transaction, TransactionUpdateInput, CreateTransactionInput, ApiResponse } from '../../types/api';

/**
 * Transactions API Service
 * Handles all transaction-related API calls
 * Note: Backend uses tx_id as URL parameter, not id
 */
export const transactionsApi = {
  /**
   * Get all transactions
   * GET /transactions
   */
  async getTransactions(page: number = 1, limit: number = 10, sortBy?: string, search?: string): Promise<Transaction[]> {
    const response = await api.get<ApiResponse<Transaction[]>>('/transactions', {
      params: { page, limit, sort_by: sortBy, search },
    });
    return response.data.data??[];
  },

  /**
   * Get transaction by ID
   * GET /transactions/{tx_id}
   * Note: Uses tx_id parameter
   */
  async getTransactionById(txId: string): Promise<Transaction| null> {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${txId}`);
    return response.data.data;
  },

  /**
   * Create transaction
   * POST /transactions
   */
  async createTransaction(data: CreateTransactionInput): Promise<Transaction| null> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', data);
    return response.data.data;
  },

  /**
   * Update transaction (admin only)
   * PUT /transactions/{tx_id}
   * Note: Uses tx_id parameter
   */
  async updateTransaction(txId: string, data: TransactionUpdateInput): Promise<Transaction| null> {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${txId}`, data);
    return response.data.data;
  },
};
