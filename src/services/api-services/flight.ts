import api from '../api-client';

import type {
  Flight,
  ApiResponse,
} from '../../types/api';

export const flightsApi = {
async getFlights(
  dep?: string,
  arr?: string,
  date?: string,
): Promise<Flight[]> {

  const response = await api.get<
    ApiResponse<Flight[]>
  >('/flights', {
    params: {
      dep: dep || undefined,
      arr: arr || undefined,
      date: date || undefined,
    },
  });

  return response.data.data ?? [];
},

  async getFlightById(
    id: string,
  ): Promise<Flight | null> {

    const response = await api.get<ApiResponse<Flight>>(
      `/flights/${id}`,
    );

    return response.data.data;
  },

  async createFlight(
    payload: {
      schedule_id: string;
      aircraft_id: string;
      departure_time: string;
      arrival_time: string;
      status?: string;
    },
  ): Promise<Flight | null> {

    const response = await api.post<ApiResponse<Flight>>(
      '/flights',
      payload,
    );

    return response.data.data;
  },


  async updateFlight(
    id: string,
    payload: {
      schedule_id?: string;
      aircraft_id?: string;
      departure_time?: string;
      arrival_time?: string;
      status?: string;
    },
  ): Promise<Flight | null> {

    const response = await api.put<ApiResponse<Flight>>(
      `/flights/${id}`,
      payload,
    );

    return response.data.data;
  },

  async updateFlightStatus(
    id: string,
    status:
      | 'scheduled'
      | 'boarding'
      | 'departed'
      | 'arrived'
      | 'cancelled'
      | 'delayed',
  ): Promise<void> {

    await api.patch(
      `/flights/${id}/status`,
      {
        status,
      },
    );
  },

  async generateFlights(
    payload: {
      schedule_id: string;
      from: string;
      to: string;
    },
  ): Promise<{
    generated: number;
  } | null> {

    const response = await api.post<
      ApiResponse<{
        generated: number;
      }>
    >(
      '/flights/generate',
      payload,
    );

    return response.data.data;
  },

  async deleteFlight(
    id: string,
  ): Promise<void> {

    await api.delete(
      `/flights/${id}`,
    );
  },

  async getSeatMap(
    id: string,
  ): Promise<any[]> {

    const response = await api.get<ApiResponse<any[]>>(
      `/flights/${id}/seat-map`,
    );

    return response.data.data ?? [];
  },

  async searchFlights(
    params: {
      dep: string;
      arr: string;
      date: string;
    },
  ): Promise<Flight[]> {

    const response = await api.get<ApiResponse<Flight[]>>(
      '/flights/search',
      {
        params,
      },
    );

    return response.data.data ?? [];
  },
};
