import type {
  ApiResponse,
  BoardingPass,
  Checkin,
} from '../../types/api';
import api from '../api-client';

/**
 * ⚠️ BACKEND REALITY CHECK (internal/checkin/interfaces/http/router.go):
 *   POST /checkin              (check in a passenger by ticket_number)
 *   GET  /checkin/boarding-pass?passenger_id=&segment_id=
 * There is NO GET /checkin (list all check-ins) -- getCheckins() below
 * is removed, not left pointing at a nonexistent endpoint. If a
 * check-in activity list is needed, that's a new backend read endpoint,
 * not a frontend fix.
 */
export const checkinsApi = {
  /**
   * POST /checkin
   * Body: { ticket_number, baggage_count?, baggage_weight_kg? }
   * ticket_number is itself the credential (same model real airlines use
   * for e-ticket check-in) -- no PNR-ownership check is applied here by
   * design, see the comment on checkin's router.go. If called with a
   * bearer token, checked_in_by records the agent who performed it
   * (agent-assisted check-in); omitted for self-service.
   */
  async checkIn(payload: {
    ticket_number: string;
    baggage_count?: number;
    baggage_weight_kg?: string;
  }): Promise<Checkin | null> {
    const response = await api.post<ApiResponse<Checkin>>('/checkin', payload);
    return response.data.data;
  },

  /** GET /checkin/boarding-pass?passenger_id=&segment_id= */
  async getBoardingPass(passengerId: string, segmentId: string): Promise<BoardingPass | null> {
    const response = await api.get<ApiResponse<BoardingPass>>('/checkin/boarding-pass', {
      params: { passenger_id: passengerId, segment_id: segmentId },
    });
    return response.data.data;
  },
};
