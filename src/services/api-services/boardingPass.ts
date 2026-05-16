
import type {
  ApiResponse,
  BoardingPass,
} from '../../types/api';
import api from '../api-client';

export const boardingPassApi = {
  async getBoardingPasses(): Promise<BoardingPass[]> {

    const response = await api.get<ApiResponse<BoardingPass[]>>(
      '/boarding-passes',
    );

    return response.data.data ?? [];
  },

  async reprintBoardingPass(
    id: string,
  ): Promise<void> {

    await api.post(
      `/boarding-passes/${id}/reprint`,
    );
  },
};
