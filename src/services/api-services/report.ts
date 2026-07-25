import type {
  AncillariesReport,
  ApiResponse,
  BookingsReport,
  CheckinsReport,
  PaymentsReport,
  ReportOverview,
} from '../../types/api';
import api from '../api-client';

/**
 * Report API Service.
 *
 * Matches internal/report's 5 real endpoints (internal/report/
 * interfaces/http/router.go), all under
 * RequirePermission("report", "report", "view") -- superadmin/admin
 * only (see migration 000025_seed_report_permission). from/to are
 * optional "YYYY-MM-DD" strings, inclusive; omit both for "last 30
 * days" server-side.
 */
export interface ReportRangeParams {
  from?: string;
  to?: string;
}

export const reportApi = {
  async getOverview(params?: ReportRangeParams): Promise<ReportOverview | null> {
    const response = await api.get<ApiResponse<ReportOverview>>('/reports/overview', { params });
    return response.data.data;
  },

  async getBookingsReport(params?: ReportRangeParams): Promise<BookingsReport | null> {
    const response = await api.get<ApiResponse<BookingsReport>>('/reports/bookings', { params });
    return response.data.data;
  },

  async getCheckinsReport(params?: ReportRangeParams): Promise<CheckinsReport | null> {
    const response = await api.get<ApiResponse<CheckinsReport>>('/reports/checkins', { params });
    return response.data.data;
  },

  async getPaymentsReport(params?: ReportRangeParams): Promise<PaymentsReport | null> {
    const response = await api.get<ApiResponse<PaymentsReport>>('/reports/payments', { params });
    return response.data.data;
  },

  async getAncillariesReport(params?: ReportRangeParams): Promise<AncillariesReport | null> {
    const response = await api.get<ApiResponse<AncillariesReport>>('/reports/ancillaries', { params });
    return response.data.data;
  },
};
