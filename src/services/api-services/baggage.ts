
import type {
  ApiResponse,
  Baggage,
} from '../../types/api';
import api from '../api-client';

export const baggageApi = {
  async getBaggage(): Promise<Baggage[]> {

    const response = await api.get<ApiResponse<Baggage[]>>(
      '/baggage',
    );

    return response.data.data ?? [];
  },

  async updateBaggageStatus(
    id: string,
    status: string,
  ): Promise<void> {

    await api.patch(
      `/baggage/${id}/status`,
      { status },
    );
  },
};
