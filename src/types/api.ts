// ======================================================
// GENERIC API
// ======================================================

import type { Role } from "./rbac";

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

// ⚠️ This matches the RAW JSON actually returned by POST /auth/register
// and PUT /auth/users/{id} (see commanddb.User in
// internal/auth/persistence/postgres/sqlc/command/models.go) -- the
// backend serializes that struct directly, not a dedicated API user model.
// Note it also includes password_hash: the backend leaks it in these
// responses (a real backend bug, not something to work around here --
// just don't render it anywhere in the UI).
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

export interface UserListResponse {
  items: User[];
  meta: PaginationMeta;
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
// FLIGHT SCHEDULE
// ======================================================

export interface FlightSchedule {
  id: number;

  flight_number: string;

  departure_airport_id: number;
  arrival_airport_id: number;

  departure_time: string; // "HH:MM"
  arrival_time: string; // "HH:MM"

  operating_days: number; // bitmask -- don't decode this yourself
  operating_days_labels: string[]; // e.g. ["MON","WED","FRI"] -- backend already decodes it, use this for display
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
//
// ⚠️ Matches the REAL, flat querydb.Flight row (see
// internal/flight/persistence/postgres/sqlc/query/models.go) --
// GET /flights/instances and GET /flights/instances/{id} return exactly
// this, with only schedule_id/aircraft_id foreign keys, NOT joined
// schedule/aircraft/airport objects, and no seats/price data at all
// (fares live on a separate FlightFare row, only surfaced via search).
// FlightsPage.tsx cross-references schedule_id/aircraft_id against
// separately-fetched schedules/aircraft lists to show route/aircraft
// names -- it's not embedded in this response.
// ======================================================
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

/**
 * ⚠️ Shape of GET /flights/search results -- NOTE THE PascalCase FIELD
 * NAMES. Unlike every other endpoint in this backend, FlightSearchResult
 * (internal/flight/application/query/flight_search_query.go) has no
 * `json:` struct tags, so Go's encoding/json falls back to the exported
 * Go field names verbatim (FlightID, not flight_id). This is a real
 * backend inconsistency, not a frontend typo -- if someone "fixes" it by
 * adding json tags later, this type (and searchFlights() in flight.ts)
 * needs to change to snake_case too.
 */
export interface FlightSearchResult {
  FlightID: number;
  ScheduleID: number;
  FlightNumber: string;
  DepartureAirportID: number;
  ArrivalAirportID: number;
  AircraftID: number;
  DepartureTime: string;
  ArrivalTime: string;
  Status: string;
  Fares: Array<{
    id: number;
    flight_id: number;
    fare_class_id: number;
    price: string | number;
    currency: string;
    available_seats: number;
  }>;
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

/**
 * ⚠️ Matches CreatePNRResult (internal/booking/application/command/
 * create_pnr.go) exactly -- PascalCase, no json tags, same backend
 * pattern as PaymentView/BoardingPassView/FlightSearchResult. This is
 * ONLY the create-response shape -- there is no GET endpoint that
 * returns a PNR in any shape at all (see booking.ts).
 */
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

// ======================================================
// PAYMENT
// ======================================================

/**
 * ⚠️ Matches PaymentView (internal/payment/application/query/
 * payment_query.go) exactly, including PascalCase -- same root cause as
 * FlightSearchResult: this DTO has no json struct tags, so Go serializes
 * the Go field names verbatim. Amount is a decimal STRING, not a number
 * (avoids float rounding on money).
 */
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

// ======================================================
// ANCILLARY
// ======================================================

/**
 * Matches internal/ancillary's sqlc-generated Ancillary{Category,Price,
 * Inventory}/BookingAncillary structs exactly, all serialized with real
 * snake_case json tags (unlike CatalogItem below). Nullable
 * pgtype.Text/Int8/Timestamptz fields marshal to `string|number|null`,
 * not the pgx wrapper object -- confirmed against pgx v5.6.0's
 * MarshalJSON for Text/Int8/Timestamptz/Numeric (all bare
 * value-or-null, never an object).
 */
export interface AncillaryCategory {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** The raw catalog item row (as returned by create/update/delete). For
 * the browsable listing with price attached, see CatalogItem -- that's
 * a *different*, PascalCase shape (Service.ListCatalog has no json
 * tags, so Go serializes Go field names verbatim). */
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

/**
 * ⚠️ Service.ListCatalog's CatalogItem struct (internal/ancillary/
 * application/query/service.go) has NO json struct tags -- same root
 * cause as PaymentView -- so these fields are PascalCase on the wire,
 * not snake_case. CurrentPrice is a decimal STRING (built with
 * fmt.Sprintf, not pgtype's numeric marshal) and is null/omitted when
 * the ancillary has no price configured yet -- that's a valid state,
 * not an error.
 */
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

/** Shape of GET /ancillaries and GET /ancillaries/categories --
 * map[string]any{"items","total","page","limit"} from catalog_handler.go,
 * lowercase, NOT the PascalCase ListResponse<T> used elsewhere. */
export interface AncillaryListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ======================================================
// REPORT
// ======================================================

/**
 * Matches internal/report/application/query's response DTOs exactly
 * (all snake_case json tags, hand-written structs -- not sqlc/pgtype,
 * so no nullability surprises here). Every report takes an optional
 * from/to (YYYY-MM-DD, inclusive); omitted defaults to the last 30 days
 * server-side, capped at 366 days.
 */
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
// ======================================================

/**
 * Matches checkInResponse (internal/checkin/interfaces/http/
 * checkin_handler.go) -- this one DOES have proper snake_case json tags.
 */
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

// ======================================================
// BOARDING PASS
// ======================================================

/**
 * ⚠️ Matches BoardingPassView (internal/checkin/application/query/
 * boarding_pass_query.go) exactly -- PascalCase, no json tags, same
 * backend pattern as PaymentView/PNR/FlightSearchResult.
 */
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
