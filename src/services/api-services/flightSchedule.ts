
import type {
  ApiResponse,
  FlightSchedule,
} from '../../types/api';
import api from '../api-client';

export const flightSchedulesApi = {

  async getSchedules(params?: {
    page?: number;
    limit?: number;
    departureAirportId?: number;
    arrivalAirportId?: number;
  }): Promise<FlightSchedule[]> {
    const response = await api.get<ApiResponse<{ items: FlightSchedule[]; total: number }>>(
      '/flights/schedules',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
          departure_airport_id: params?.departureAirportId,
          arrival_airport_id: params?.arrivalAirportId,
        },
      },
    );
    return response.data.data?.items ?? [];
  },

  /** GET /flights/schedules/{id} */
  async getScheduleById(id: number): Promise<FlightSchedule | null> {
    const response = await api.get<ApiResponse<FlightSchedule>>(`/flights/schedules/${id}`);
    return response.data.data;
  },

  async createSchedule(payload: {
    flight_number: string;
    departure_airport_id: number;
    arrival_airport_id: number;
    departure_time: string;
    arrival_time: string;
    operating_days: number;
  }): Promise<FlightSchedule | null> {
    const response = await api.post<ApiResponse<FlightSchedule>>('/flights/schedules', payload);
    return response.data.data;
  },

  async updateSchedule(
    id: number,
    payload: Partial<{
      departure_time: string;
      arrival_time: string;
      operating_days: number;
    }>,
  ): Promise<FlightSchedule | null> {
    const response = await api.put<ApiResponse<FlightSchedule>>(`/flights/schedules/${id}`, payload);
    return response.data.data;
  },

  /** DELETE /flights/schedules/{id} */
  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`/flights/schedules/${id}`);
  },
};
