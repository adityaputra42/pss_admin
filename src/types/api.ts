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

/** POST /roles body. is_system_role/is_active aren't accepted here --
 * every role created through the API is non-system and active
 * (RoleCommandService.CreateRole). */
export interface RoleInput {
  name: string;
  description?: string;
  level: number;
}

/** PUT /roles/{id} body. name is immutable (never accepted on update).
 * For system roles, level/is_active are REJECTED server-side (422) --
 * only description can change. See RoleCommandService.UpdateRole. */
export interface RoleUpdateInput {
  description?: string;
  level?: number;
  is_active?: boolean;
}

// ======================================================
// ASSIGN PERMISSION
// ======================================================

/** PUT /roles/{id}/permissions body. This REPLACES the role's entire
 * permission set -- send the full desired list every time, not a diff. */
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

/**
 * GET /auth/me response (internal/auth/application/query/get_me.go's
 * MeView) -- the "who am I, what can I do" endpoint. Not gated by
 * RequirePermission: any authenticated user can fetch their own.
 * `permissions` is the FULL list this user's role grants, used to
 * decide what the sidebar/UI shows -- it is NOT a security boundary by
 * itself, the server still enforces every call independently.
 */
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

/**
 * GET /auth/users (admin list) response -- internal/auth/application/
 * query/list_users.go's ListUsersResult, real snake_case json tags.
 * Was previously a guess (UserListResponse w/ `meta`) before this
 * endpoint existed; corrected to match what ListUsersHandler actually
 * returns: flat items/total/page/limit, no nested meta object.
 */
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
// SEAT CLASS
// ======================================================
// Matches querydb.SeatClass exactly (internal/flight/persistence/
// postgres/sqlc/query/models.go) -- real snake_case json tags, same
// convention as Airport/Aircraft above (unlike FlightSearchResult/PNR/
// Payment elsewhere in this file, which are PascalCase).

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

/**
 * GET /flights/seat-classes and GET /flights/fare-classes go through
 * MasterDataQueryService, same as Airport/Aircraft -- ListResult<T> has
 * NO json tags, so it serializes as capitalized {Items, Total}, not
 * {items, total}. Reuse the existing ListResponse<T> type (already
 * capitalized) instead of the lowercase *ListResponse ones below.
 */

// ======================================================
// FARE CLASS
// ======================================================
// Matches querydb.FareClass exactly. seat_class_id links to SeatClass
// above; there is no embedded seat_class object, cross-reference by id
// the same way FlightsPage does for schedule_id/aircraft_id.

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
// Matches the REAL, flat querydb.Flight row (see
// internal/flight/persistence/postgres/sqlc/query/models.go) --
// GET /flights/instances and GET /flights/instances/{id} return exactly
// this, with only schedule_id/aircraft_id foreign keys, NOT joined
// schedule/aircraft/airport objects, and no seats/price data at all
// (fares live on a separate FlightFare row, only surfaced via search).
// FlightsPage.tsx cross-references schedule_id/aircraft_id against
// separately-fetched schedules/aircraft lists to show route/aircraft
// names -- it's not embedded in this response.
//
// As of the CreateFlightHandler/UpdateFlightHandler/DeleteFlightHandler
// addition, this row IS now directly create/update/delete-able via
// POST|PUT|DELETE /flights/instances(/{id}) -- see flight.ts. Manual
// create does NOT generate flight_seats/flight_fares the way
// generate-flights does -- a manually created flight has no bookable
// seats/prices until those are added separately. Use generate-flights
// for a sellable flight; use manual create/update/delete for fixing up
// or removing a bad instance.
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

/** POST /flights/instances body. All fields required; times are RFC3339 (e.g. "2026-08-15T09:00:00+07:00"), status optional (defaults SCHEDULED server-side). */
export interface FlightInput {
  schedule_id: number;
  aircraft_id: number;
  departure_time: string; // RFC3339
  arrival_time: string; // RFC3339
  status?: string;
}

/** PUT /flights/instances/{id} body -- schedule_id is NOT editable (see UpdateFlight's sqlc comment: delete + regenerate instead if the schedule itself is wrong). */
export type FlightUpdateInput = Partial<Omit<FlightInput, 'schedule_id'>>;

export const FLIGHT_STATUSES = [
  'SCHEDULED',
  'BOARDING',
  'DEPARTED',
  'ARRIVED',
  'DELAYED',
  'CANCELLED',
] as const;

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
 * ONLY the create-response shape.
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

/**
 * GET /bookings/pnrs/{id} response -- matches bookingcontract.PNRInfo
 * exactly (internal/booking/contract/pnr_query.go), same "no json tags"
 * PascalCase convention as PNR/Payment above. Full detail incl. contact
 * info; TotalAmount is a decimal string, not a number (avoids float
 * rounding on money, same reasoning as Payment.Amount).
 */
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

/**
 * GET /bookings/pnrs (admin list) response. Unlike PNR/PNRDetail above,
 * this one DOES have json tags (internal/booking/application/query/
 * pnr_query_service.go's PNRSummary/ListPNRsResult) -- real snake_case,
 * a deliberately lighter row (no contact fetch per row -- follow up
 * with GET /bookings/pnrs/{id} for contact details on one PNR).
 */
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

/**
 * GET /payments (admin, list across all PNRs) response. The wrapper
 * (internal/payment/application/query's ListPaymentsResult) DOES have
 * json tags -- items/total/page/limit, lowercase -- but each Payment
 * inside `items` is still the PascalCase PaymentView above. Same mixed
 * convention as PNRListResult/PNRSummary vs PNRDetail.
 */
export interface PaymentListResult {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
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
