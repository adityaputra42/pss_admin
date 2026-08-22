import api from '../api-client';
import type {
  ApiResponse,
  TopupInput,
  TopupResult,
  TopupStatus,
  WalletBalance,
  WalletTransactionsResult,
} from '../../types/api';

export const walletApi = {
  async getBalance(): Promise<WalletBalance | null> {
    const response = await api.get<ApiResponse<WalletBalance>>('/wallet/balance');
    return response.data.data;
  },

  async listTransactions(page = 1, limit = 10): Promise<WalletTransactionsResult | null> {
    const response = await api.get<ApiResponse<WalletTransactionsResult>>('/wallet/transactions', {
      params: { page, limit },
    });
    return response.data.data;
  },

  async topup(payload: TopupInput): Promise<TopupResult | null> {
    const response = await api.post<ApiResponse<TopupResult>>('/wallet/topup', payload);
    return response.data.data;
  },

  async getTopupStatus(code: string): Promise<TopupStatus | null> {
    const response = await api.get<ApiResponse<TopupStatus>>(`/wallet/topup/${code}`);
    return response.data.data;
  },

  async getBalanceForUser(userId: number): Promise<WalletBalance | null> {
    const response = await api.get<ApiResponse<WalletBalance>>(`/wallet/users/${userId}/balance`);
    return response.data.data;
  },
};
