import type {
  ApiResponse,
  BoardingPass,
} from '../../types/api';
import api from '../api-client';

/**
 * ⚠️ BACKEND REALITY CHECK: there is no separate "boarding pass" module
 * or resource in pss_modular_cqrs -- a boarding pass is just a read on
 * the checkin module: GET /checkin/boarding-pass?passenger_id=&segment_id=
 * (see internal/checkin/interfaces/http/router.go).
 *
 * getBoardingPasses() (list all) and reprintBoardingPass() have NO
 * backend endpoint at all -- there's no boarding-pass list, and no
 * reprint action (a boarding pass is just re-fetched by the same
 * passenger_id/segment_id query, there's nothing to "reprint" server-
 * side). Both removed below. Use checkinsApi.getBoardingPass(passengerId,
 * segmentId) from checkIn.ts for single lookups -- this file is kept as a
 * thin re-export so BoardingPassPage.tsx doesn't need an import change,
 * but it is NOT a distinct backend resource.
 */
export const boardingPassApi = {
  async getBoardingPass(passengerId: string, segmentId: string): Promise<BoardingPass | null> {
    const response = await api.get<ApiResponse<BoardingPass>>('/checkin/boarding-pass', {
      params: { passenger_id: passengerId, segment_id: segmentId },
    });
    return response.data.data;
  },
};
