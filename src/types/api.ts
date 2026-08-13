// ======================================================
// GENERIC API
// ======================================================

import type { Role, Permission, RoleDetail } from "./rbac";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


export interface ListResponse<T> {
  Items: T[];
  Total: number;
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
}
export interface RoleUpdateInput {
  description?: string;
  level?: number;
  is_active?: boolean;
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
}

export interface PermissionListResponse {
  items: Permission[];
  total: number;
  page: number;
  limit: number;
}

export type RoleDetailResponse = RoleDetail;
// ======================================================
// USER
// ======================================================
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  password_hash?: string;
  role_id: number;
  status: string; // "ACTIVE" | "LOCKED" | "INACTIVE"
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MePermission {
  module: string;
  resource: string;
  action: string;
}

export interface Me {
  id: number;
  username: string;
  email: string;
  full_name: string;
  status: string;
  role_id: number;
  role_name: string;
  role_level: number;
  permissions: MePermission[];
}

export interface UserInput {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role_id: number;
}

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
}

export interface PasswordUpdateInput {
  old_password?: string;
  new_password: string;
  confirm_password: string;
}

export interface UserListResult {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

// ======================================================
// AIRPORT
// ======================================================

export interface Airport {
  id: number;
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
  id: number;
  model: string;
  manufacturer: string;
  registration_number: string;
}

export interface AircraftInput {
  model: string;
  manufacturer: string;
  registration_number: string;
}

export interface AircraftListResponse {
  items: Aircraft[];
  meta: PaginationMeta;
}

// ======================================================
// AIRCRAFT SEAT LAYOUT
// ======================================================
export interface AircraftSeat {
  id: number;
  aircraft_id: number;
  seat_number: string; // e.g. "12A" -- row_number + seat_letter concatenated server-side
  row_number: number;
  seat_letter: string;
  seat_class_id: number;
  seat_type: string; // e.g. "WINDOW" | "MIDDLE" | "AISLE" -- exact set not confirmed, don't hardcode a strict union
  x_position?: number | null;
  y_position?: number | null;
  is_exit_row: boolean;
}

export interface SeatRowGroupInput {
  seat_class_id: number;
  row_start: number;
  row_end: number;
  seat_letters: string; // e.g. "ABCDEF" -- one seat per letter per row in this group
  seat_type: string;
  exit_rows?: number[];
}

export interface GenerateSeatLayoutInput {
  layout: SeatRowGroupInput[];
}

// ======================================================
// SEAT CLASS
// ======================================================

export interface SeatClass {
  id: number;
  code: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface SeatClassInput {
  code: string;
  name: string;
}

/** PUT /flights/seat-classes/{id} only accepts name -- code is immutable after creation, same convention as Aircraft.registration_number. */
export type SeatClassUpdateInput = Partial<Pick<SeatClassInput, 'name'>>;


// ======================================================
// FARE CLASS
// ======================================================

export interface FareClass {
  id: number;
  code: string;
  name: string;
  seat_class_id: number;
  refundable: boolean;
  rescheduleable: boolean;
  baggage_kg: number;
  created_at?: string;
  updated_at?: string;
}

export interface FareClassInput {
  code: string;
  name: string;
  seat_class_id: number;
  refundable: boolean;
  rescheduleable: boolean;
  baggage_kg: number;
}

/** PUT /flights/fare-classes/{id} -- code and seat_class_id are NOT editable (create a new fare class instead if either needs to change). */
export type FareClassUpdateInput = Partial<
  Pick<FareClassInput, 'name' | 'refundable' | 'rescheduleable' | 'baggage_kg'>
>;

// ======================================================
// FLIGHT SCHEDULE
// ======================================================

export interface FlightSchedule {
  id: number;

  flight_number: string;

  departure_airport_id: number;
  arrival_airport_id: number;

  departure_time: string; // "HH:MM"
  arrival_time: string; // "HH:MM"

  operating_days: number;
  operating_days_labels: string[];
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
// FLIGHT INSTANCE

export interface Flight {
  id: number;
  schedule_id: number;
  aircraft_id: number;
  departure_time: string;
  arrival_time: string;
  status: string; // e.g. "SCHEDULED" | "DEPARTED" | "ARRIVED" | "CANCELLED" -- exact set not confirmed, don't hardcode a strict union
}

export interface FlightsResponse {
  items: Flight[];
  total: number;
}

/** ADT = adult, CHD = child, INF = infant (no seat, travels on an adult's lap). */
export type PassengerType = 'ADT' | 'CHD' | 'INF';

export const PASSENGER_TYPES: PassengerType[] = ['ADT', 'CHD', 'INF'];

export const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  ADT: 'Adult',
  CHD: 'Child',
  INF: 'Infant',
};

export interface FlightFarePrice {
  id: number;
  passenger_type: string; // ADT | CHD | INF
  price: string;
  currency: string;
}

export interface FlightFare {
  id: number;
  flight_id: number;
  fare_class_id: number;
  available_seats: number;
  prices: FlightFarePrice[];
}

export interface FlightInput {
  schedule_id: number;
  aircraft_id: number;
  departure_time: string; // RFC3339
  arrival_time: string; // RFC3339
  status?: string;
}

export type FlightUpdateInput = Partial<Omit<FlightInput, 'schedule_id'>>;

export const FLIGHT_STATUSES = [
  'SCHEDULED',
  'BOARDING',
  'DEPARTED',
  'ARRIVED',
  'DELAYED',
  'CANCELLED',
] as const;

export interface ItinerarySegment {
  flight_id: number;
  flight_number: string;
  departure_airport_id: number;
  departure_airport_code: string;
  departure_airport_name: string;
  arrival_airport_id: number;
  arrival_airport_code: string;
  arrival_airport_name: string;
  aircraft_id: number;
  departure_time: string;
  arrival_time: string;
  status: string;
}

export interface ItineraryFare {
  fare_class_id: number;
  /** passenger_type (ADT/CHD/INF) -> decimal price string. */
  prices: Record<string, string>;
  currency: string;
  available_seats: number; // bottleneck: min across the itinerary's segments
}

export interface Itinerary {
  stops: number; // 0 = direct, 1 = one connection
  aircraft_changed: boolean[]; // length == stops; true = plane changes at that connection point
  duration_minutes: number; // first departure to last arrival, includes layover
  segments: ItinerarySegment[];
  fares: ItineraryFare[];
}

export type TripType = 'ONE_WAY' | 'ROUND_TRIP';

export interface FlightSearchResponse {
  trip_type: TripType;
  departure: Itinerary[];
  return?: Itinerary[];
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
  PNRID: number;
  BookingCode: string;
  Status: string;
  ExpiresAt: string;
  TotalAmount: number;
  Currency: string;
}

export interface BookingListResponse {
  items: PNR[];
  meta: PaginationMeta;
}

export interface PNRDetail {
  ID: number;
  BookingCode: string;
  Status: string; // HOLD, BOOKED, CANCELLED, EXPIRED
  PaymentStatus: string; // UNPAID, PENDING, PAID, FAILED, EXPIRED, REFUNDED
  TotalAmount: string;
  Currency: string;
  HoldExpiresAt: string | null; // null if not (or no longer) in HOLD
  ContactName: string;
  ContactEmail: string;
  ContactPhone: string;
  CreatedBy: number | null;
}

export interface PNRSummary {
  id: number;
  booking_code: string;
  status: string;
  payment_status: string;
  total_amount: string;
  currency: string;
  created_at: string;
  expires_at?: string;
}

export interface PNRListResult {
  items: PNRSummary[];
  total: number;
  page: number;
  limit: number;
}

// ======================================================
// PAYMENT
// ======================================================

export interface Payment {
  ID: number;
  PaymentCode: string;
  PNRID: number;
  Amount: string;
  Currency: string;
  Method: string;
  Status: string;
  ExpiredAt?: string | null;
  PaidAt?: string | null;
}

export interface PaymentListResponse {
  items: Payment[];
  meta: PaginationMeta;
}

export interface PaymentListResult {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
}

// ======================================================
// ANCILLARY
// ======================================================

export interface AncillaryCategory {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AncillaryItem {
  id: number;
  category_id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  ID: number;
  CategoryID: number;
  Code: string;
  Name: string;
  Description: string;
  IsActive: boolean;
  CurrentPrice?: string | null;
  Currency?: string;
}

export interface AncillaryPrice {
  id: number;
  ancillary_id: number;
  currency: string;
  amount: number;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
}

export interface AncillaryInventory {
  id: number;
  ancillary_id: number;
  flight_id: number;
  available_quantity: number;
  created_at: string;
}

/** booking_ancillaries row -- a purchased ancillary. */
export interface AncillaryPurchase {
  id: number;
  pnr_id: number;
  passenger_id: number | null;
  segment_id: number | null;
  ancillary_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'ACTIVE' | 'CANCELLED' | 'USED' | string;
  purchased_at: string;
  created_at: string;
  payment_status: 'UNPAID' | 'PAID' | string;
  payment_id: number | null;
}

export interface AncillaryListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ======================================================
// REPORT
// ======================================================

export interface ReportDateRange {
  from: string;
  to: string;
}

export interface ReportStatusCount {
  status: string;
  count: number;
}

export interface ReportStatusCountAmount {
  status: string;
  count: number;
  amount: number;
}

export interface ReportMethodCountAmount {
  method: string;
  count: number;
  amount: number;
}

export interface ReportDailyCountRevenuePoint {
  date: string;
  count: number;
  revenue: number;
}

export interface ReportDailyCountPoint {
  date: string;
  count: number;
}

export interface ReportDailyAmountPoint {
  date: string;
  amount: number;
}

export interface ReportCategoryRevenue {
  category_code: string;
  category_name: string;
  count: number;
  revenue: number;
}

export interface ReportTopAncillary {
  ancillary_code: string;
  ancillary_name: string;
  category_name: string;
  quantity: number;
  revenue: number;
}

export interface BookingsReport {
  period: ReportDateRange;
  total_bookings: number;
  paid_bookings: number;
  total_revenue: number;
  by_status: ReportStatusCount[];
  daily_trend: ReportDailyCountRevenuePoint[];
}

export interface CheckinsReport {
  period: ReportDateRange;
  total_checkins: number;
  total_baggage_count: number;
  total_baggage_kg: number;
  daily_trend: ReportDailyCountPoint[];
}

export interface PaymentsReport {
  period: ReportDateRange;
  total_payments: number;
  paid_payments: number;
  total_paid: number;
  total_refunded: number;
  refunded_count: number;
  by_status: ReportStatusCountAmount[];
  by_method: ReportMethodCountAmount[];
  daily_trend: ReportDailyAmountPoint[];
}

export interface AncillariesReport {
  period: ReportDateRange;
  total_purchases: number;
  total_units: number;
  total_revenue: number;
  cancelled_count: number;
  by_category: ReportCategoryRevenue[];
  top_ancillaries: ReportTopAncillary[];
  daily_trend: ReportDailyAmountPoint[];
}

export interface ReportOverview {
  period: ReportDateRange;
  bookings: {
    total: number;
    paid: number;
    revenue: number;
    by_status: ReportStatusCount[];
  };
  checkins: {
    total: number;
    total_baggage_count: number;
    total_baggage_kg: number;
  };
  payments: {
    total: number;
    paid: number;
    total_paid: number;
    total_refunded: number;
    by_status: ReportStatusCountAmount[];
  };
  ancillaries: {
    total_purchases: number;
    total_revenue: number;
    top_ancillaries: ReportTopAncillary[];
  };
  net_revenue: number;
}

export interface Checkin {
  checkin_id: number;
  boarding_pass_number: string;
  passenger_name: string;
  booking_code: string;
  flight_number: string;
  seat_number: string;
  departure_time: string;
  boarding_time: string;
  gate: string;
}

export interface CheckinListResponse {
  items: Checkin[];
  meta: PaginationMeta;
}

export interface BoardingPass {
  CheckinID: number;
  BoardingPassNumber: string;
  BoardingGroup: string;
  Gate: string;
  BoardingTime?: string | null;
  Status: string;
  BaggageCount: number;
  CheckedInAt: string;
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
