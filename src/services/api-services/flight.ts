import api from '../api-client';

import type {
  Flight,
  FlightInput,
  FlightUpdateInput,
  ApiResponse,
  FlightSearchResponse,
  FlightFare,
  FlightFarePrice,
  PassengerType,
  ListResponse,
} from '../../types/api';

export const flightsApi = {

  async getFlights(
    page: number = 1,
    limit: number = 10,
    scheduleId?: number,
  ): Promise<ListResponse<Flight>> {
    const response = await api.get<ApiResponse<ListResponse<Flight>>>('/flights/instances', {
      params: { page, limit, schedule_id: scheduleId || undefined },
    });
    return response.data.data ?? { items: [], total: 0 };
  },

  /** GET /flights/instances/{id} */
  async getFlightById(id: number): Promise<Flight | null> {
    const response = await api.get<ApiResponse<Flight>>(`/flights/instances/${id}`);
    return response.data.data;
  },

  async createFlight(payload: FlightInput): Promise<Flight | null> {
    const response = await api.post<ApiResponse<Flight>>('/flights/instances', payload);
    return response.data.data;
  },

  async updateFlight(id: number, payload: FlightUpdateInput): Promise<Flight | null> {
    const response = await api.put<ApiResponse<Flight>>(`/flights/instances/${id}`, payload);
    return response.data.data;
  },

  async deleteFlight(id: number): Promise<void> {
    await api.delete(`/flights/instances/${id}`);
  },

  /**
   * Materializes flight instances for a schedule's date range.
   * `fares` is FLAT -- one row per (fare_class_id, passenger_type) pair,
   * not nested. To sell a fare class to ADT+CHD+INF, include three rows
   * sharing the same fare_class_id. Every row's price/currency is
   * required server-side (http.fareRequest).
   */
  async generateFlightsData(
    scheduleId: number,
    payload: {
      segments: Array<{ start_date: string; end_date: string; aircraft_id: number }>;
      fares: Array<{ fare_class_id: number; passenger_type: PassengerType | string; price: string; currency: string }>;
    },
  ): Promise<void> {
    await api.post(`/flights/schedules/${scheduleId}/generate-flights`, payload);
  },

  /** GET /flights/search. total_pax is required server-side (400 without it) -- pass non-infant seat-needing count + infants together, exactly as the passenger picker totals them. */
  async searchFlights(params: {
    departureAirportId: number;
    arrivalAirportId: number;
    date: string; // YYYY-MM-DD
    totalPax: number;
    tripType?: 'one_way' | 'round_trip';
    returnDate?: string; // YYYY-MM-DD, required when tripType is 'round_trip'
    maxStops?: number;
    seatClassId?: number;
    page?: number;
    limit?: number;
  }): Promise<FlightSearchResponse> {
    const response = await api.get<ApiResponse<FlightSearchResponse>>('/flights/search', {
      params: {
        departure_airport_id: params.departureAirportId,
        arrival_airport_id: params.arrivalAirportId,
        date: params.date,
        total_pax: params.totalPax,
        trip_type: params.tripType ?? 'one_way',
        return_date: params.returnDate || undefined,
        max_stops: params.maxStops,
        seat_class_id: params.seatClassId || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    });
    return response.data.data ?? { trip_type: 'ONE_WAY', departure: [] };
  },

  /** GET /flights/instances/{flightId}/fares */
  async listFares(flightId: number): Promise<FlightFare[]> {
    const response = await api.get<ApiResponse<FlightFare[]>>(`/flights/instances/${flightId}/fares`);
    return response.data.data ?? [];
  },

  /**
   * Attaches one sellable fare_class_id to a flight, with a price for
   * each passenger type it should be bookable by. `prices` needs at
   * least one entry (http.addFlightFareRequest) -- CHD/INF can be added
   * afterwards via setFarePrice, but ADT (or whichever types you want
   * sellable immediately) must go in here.
   */
  async addFare(
    flightId: number,
    payload: {
      fare_class_id: number;
      available_seats: number;
      prices: Array<{ passenger_type: PassengerType | string; price: string; currency?: string }>;
    },
  ): Promise<FlightFare | null> {
    const response = await api.post<ApiResponse<FlightFare>>(`/flights/instances/${flightId}/fares`, payload);
    return response.data.data;
  },

  /** PUT /flights/fares/{fareId} -- only available_seats is editable here now. Price is per-passenger-type via setFarePrice/deleteFarePrice below. */
  async updateFare(
    fareId: number,
    payload: { available_seats: number },
  ): Promise<FlightFare | null> {
    const response = await api.put<ApiResponse<FlightFare>>(`/flights/fares/${fareId}`, payload);
    return response.data.data;
  },

  /** DELETE /flights/fares/{fareId} */
  async deleteFare(fareId: number): Promise<void> {
    await api.delete(`/flights/fares/${fareId}`);
  },

  /**
   * PUT /flights/fares/{fareId}/prices -- upsert: creates the price for
   * this passenger_type if it doesn't exist on the fare yet, or
   * corrects it if it does. Use this for both "add a price" and "edit
   * a price" in the UI.
   */
  async setFarePrice(
    fareId: number,
    payload: { passenger_type: PassengerType | string; price: string; currency?: string },
  ): Promise<FlightFarePrice | null> {
    const response = await api.put<ApiResponse<FlightFarePrice>>(`/flights/fares/${fareId}/prices`, payload);
    return response.data.data;
  },

  /**
   * DELETE /flights/fares/prices/{priceId} -- removes one passenger
   * type's price. That passenger type can no longer be booked on this
   * fare; the fare bucket (seat inventory) itself is untouched.
   */
  async deleteFarePrice(priceId: number): Promise<void> {
    await api.delete(`/flights/fares/prices/${priceId}`);
  },
};
