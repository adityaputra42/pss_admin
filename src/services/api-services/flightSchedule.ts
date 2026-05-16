
/* =========================================================
   FLIGHT SCHEDULE SERVICE
========================================================= */

import type {
  ApiResponse,
  FlightSchedule,
} from '../../types/api';
import api from '../api-client';

export const flightSchedulesApi = {
  async getSchedules(): Promise<FlightSchedule[]> {

    const response = await api.get<ApiResponse<FlightSchedule[]>>(
      '/schedules',
    );

    return response.data.data ?? [];
  },

  async getScheduleById(
    id: string,
  ): Promise<FlightSchedule | null> {

    const response = await api.get<ApiResponse<FlightSchedule>>(
      `/schedules/${id}`,
    );

    return response.data.data;
  },

  async createSchedule(
    payload: Partial<FlightSchedule>,
  ): Promise<FlightSchedule | null> {

    const response = await api.post<ApiResponse<FlightSchedule>>(
      '/schedules',
      payload,
    );

    return response.data.data;
  },

  async updateSchedule(
    id: string,
    payload: Partial<FlightSchedule>,
  ): Promise<FlightSchedule | null> {

    const response = await api.put<ApiResponse<FlightSchedule>>(
      `/schedules/${id}`,
      payload,
    );

    return response.data.data;
  },

  async deleteSchedule(
    id: string,
  ): Promise<void> {

    await api.delete(`/flight-schedules/${id}`);
  },
};
