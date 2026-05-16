// ======================================================
// GENERIC API
// ======================================================

import type { Role } from "./rbac";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ======================================================
// ROLE
// ======================================================

export interface RoleInput {
  name: string;

  description?: string;

  level: number;

  permission_ids?: number[];
}

export interface RoleUpdateInput {
  name?: string;

  description?: string;

  level?: number;

  permission_ids?: number[];
}

// ======================================================
// ASSIGN PERMISSION
// ======================================================

export interface AssignPermissionsInput {
  permission_ids: number[];
}

// ======================================================
// ROLE LIST RESPONSE
// ======================================================

export interface RoleListResponse {
  items: Role[];

  total: number;

  page: number;

  limit: number;

  total_pages: number;
}
// ======================================================
// USER
// ======================================================

export interface User {
  uid: string;
  email: string;
  full_name: string;

  role_id: number;
  role?: Role;

  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
  last_login?: string | null;
  deleted_at?: string | null;
}

export interface UserInput {
  email: string;
  full_name: string;
  password: string;
  role_id: number;
}

export interface UserUpdateInput {
  email?: string;
  full_name?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface PasswordUpdateInput {
  old_password?: string;
  new_password: string;
  confirm_password: string;
}

export interface UserListResponse {
  items: User[];
  meta: PaginationMeta;
}

// ======================================================
// AIRPORT
// ======================================================

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
}

export interface AirportInput {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
}

export interface AirportListResponse {
  items: Airport[];
  meta: PaginationMeta;
}

// ======================================================
// AIRCRAFT
// ======================================================

export interface Aircraft {
  id: string;
  model: string;
  manufacturer: string;
  total_seats: number;
}

export interface AircraftInput {
  model: string;
  manufacturer: string;
  total_seats: number;
}

export interface AircraftListResponse {
  items: Aircraft[];
  meta: PaginationMeta;
}

// ======================================================
// FLIGHT SCHEDULE
// ======================================================

export interface FlightSchedule {
  id: string;

  flight_number: string;

  departure_airport_id: string;
  arrival_airport_id: string;

  departure_airport?: Airport;
  arrival_airport?: Airport;

  departure_time: string;
  arrival_time: string;

  operating_days: string;
}

export interface FlightScheduleInput {
  flight_number: string;

  departure_airport_id: string;
  arrival_airport_id: string;

  departure_time: string;
  arrival_time: string;

  operating_days: string;
}

export interface FlightScheduleListResponse {
  items: FlightSchedule[];
  meta: PaginationMeta;
}

// ======================================================
// FLIGHT
// ======================================================

export interface Flight {
  id: string;

  schedule_id: string;
  aircraft_id: string;

  schedule?: FlightSchedule;
  aircraft?: Aircraft;

  departure_time: string;
  arrival_time: string;

  status:
    | 'scheduled'
    | 'boarding'
    | 'departed'
    | 'arrived'
    | 'cancelled'
    | 'delayed';

  created_at?: string;
}

export interface FlightInput {
  schedule_id: string;
  aircraft_id: string;

  departure_time: string;
  arrival_time: string;

  status?: string;
}

export interface FlightListResponse {
  items: Flight[];
  meta: PaginationMeta;
}

// ======================================================
// PNR / BOOKING
// ======================================================

export interface Passenger {
  id: string;

  first_name: string;
  last_name: string;

  passenger_type: string;

  passport_number?: string;
}

export interface PNR {
  id: string;

  record_locator: string;

  status: string;

  passengers?: Passenger[];

  created_at: string;
  ttl?: string;
}

export interface BookingListResponse {
  items: PNR[];
  meta: PaginationMeta;
}

// ======================================================
// PAYMENT
// ======================================================

export interface Payment {
  id: string;

  pnr_id: string;

  amount: number;

  method: string;

  status: string;

  paid_at?: string;
}

export interface PaymentListResponse {
  items: Payment[];
  meta: PaginationMeta;
}

// ======================================================
// BAGGAGE
// ======================================================

export interface Baggage {
  id: string;

  passenger_id: string;
  segment_id: string;

  weight: number;

  tag_number: string;

  status: string;
}

export interface BaggageListResponse {
  items: Baggage[];
  meta: PaginationMeta;
}

// ======================================================
// CHECKIN
// ======================================================

export interface Checkin {
  id: string;

  passenger_id: string;

  segment_id: string;

  checkin_time: string;
}

export interface CheckinListResponse {
  items: Checkin[];
  meta: PaginationMeta;
}

// ======================================================
// BOARDING PASS
// ======================================================

export interface BoardingPass {
  id: string;

  passenger_id: string;

  segment_id: string;

  boarding_group: string;

  gate: string;

  boarding_time: string;

  qr_code?: string;
}

export interface BoardingPassListResponse {
  items: BoardingPass[];
  meta: PaginationMeta;
}

// ======================================================
// DASHBOARD
// ======================================================

export interface DashboardSummary {
  total_bookings: number;
  total_passengers: number;
  today_flights: number;
  total_revenue: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface BookingStatus {
  status: string;
  value: number;
}

export interface TodayFlight {
  id: string;

  flight_number: string;

  origin: string;
  destination: string;

  departure_time: string;

  aircraft: string;

  passenger_count: number;

  status: string;
}

export interface RecentBooking {
  id: string;

  booking_code: string;

  passenger_name: string;

  route: string;

  payment_status: string;
}

export interface OperationalAlert {
  id: string;

  title: string;

  description: string;

  time: string;
}
