import type {
  AncillaryCategory,
  AncillaryInventory,
  AncillaryItem,
  AncillaryListResponse,
  AncillaryPrice,
  AncillaryPurchase,
  ApiResponse,
  CatalogItem,
} from '../../types/api';
import api from '../api-client';

/**
 * Ancillary API Service.
 *
 * Matches internal/ancillary's real routes exactly (see
 * internal/ancillary/interfaces/http/router.go), all nested under
 * /ancillaries. Categories/catalog CRUD, price and inventory endpoints
 * require RequirePermission("ancillary", ...) (superadmin/admin only --
 * see migration 000024_seed_ancillary_permissions). Purchase/cancel/
 * list-by-pnr are deliberately ungated there (customer self-service),
 * so they work with just a valid bearer token.
 *
 * There is NO "list all purchases" endpoint -- only
 * GET /ancillaries/purchases/pnr/{pnr_id}. An admin "Purchases" screen
 * has to be searched by PNR ID; it can't page through every purchase.
 */
export const ancillaryApi = {
  // ---------- Categories ----------

  async listCategories(page = 1, limit = 50): Promise<AncillaryListResponse<AncillaryCategory>> {
    const response = await api.get<ApiResponse<AncillaryListResponse<AncillaryCategory>>>(
      '/ancillaries/categories',
      { params: { page, limit } },
    );
    return response.data.data ?? { items: [], total: 0, page, limit };
  },

  async createCategory(payload: {
    code: string;
    name: string;
    description?: string;
  }): Promise<AncillaryCategory | null> {
    const response = await api.post<ApiResponse<AncillaryCategory>>('/ancillaries/categories', payload);
    return response.data.data;
  },

  async updateCategory(
    id: number,
    payload: Partial<{ name: string; description: string }>,
  ): Promise<AncillaryCategory | null> {
    const response = await api.put<ApiResponse<AncillaryCategory>>(`/ancillaries/categories/${id}`, payload);
    return response.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/ancillaries/categories/${id}`);
  },

  // ---------- Catalog (ancillary items) ----------

  /** Browsable catalog with current price attached. NOTE: PascalCase
   * response shape -- see CatalogItem's doc comment in types/api.ts. */
  async listCatalog(params?: {
    category_id?: number;
    active_only?: boolean;
    page?: number;
    limit?: number;
  }): Promise<AncillaryListResponse<CatalogItem>> {
    const response = await api.get<ApiResponse<AncillaryListResponse<CatalogItem>>>('/ancillaries', {
      params,
    });
    return (
      response.data.data ?? {
        items: [],
        total: 0,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      }
    );
  },

  async createAncillary(payload: {
    category_id: number;
    code: string;
    name: string;
    description?: string;
    is_active: boolean;
  }): Promise<AncillaryItem | null> {
    const response = await api.post<ApiResponse<AncillaryItem>>('/ancillaries', payload);
    return response.data.data;
  },

  async updateAncillary(
    id: number,
    payload: Partial<{
      category_id: number;
      name: string;
      description: string;
      is_active: boolean;
    }>,
  ): Promise<AncillaryItem | null> {
    const response = await api.put<ApiResponse<AncillaryItem>>(`/ancillaries/${id}`, payload);
    return response.data.data;
  },

  async deleteAncillary(id: number): Promise<void> {
    await api.delete(`/ancillaries/${id}`);
  },

  // ---------- Price ----------

  /** Closes whatever price is currently open and starts a new one
   * effective now -- there's no "schedule a future price" support.
   * amount is a decimal STRING on the way in (e.g. "150000.00"). */
  async setPrice(
    id: number,
    payload: { amount: string; currency?: string },
  ): Promise<AncillaryPrice | null> {
    const response = await api.post<ApiResponse<AncillaryPrice>>(`/ancillaries/${id}/price`, payload);
    return response.data.data;
  },

  // ---------- Inventory ----------

  /** Whitelist: an ancillary with NO inventory row for a flight is now
   * NOT purchasable on it (see PurchaseHandler.Handle server-side) --
   * this is the write side. Every ancillary a flight should sell needs
   * a row here, even if you don't care about capping quantity. */
  async setInventory(
    id: number,
    payload: { flight_id: number; available_quantity: number },
  ): Promise<AncillaryInventory | null> {
    const response = await api.post<ApiResponse<AncillaryInventory>>(`/ancillaries/${id}/inventory`, payload);
    return response.data.data;
  },

  async getFlightCatalog(flightId: number): Promise<CatalogItem[]> {
    const response = await api.get<ApiResponse<CatalogItem[]>>(`/ancillaries/flight/${flightId}`);
    return response.data.data ?? [];
  },

  // ---------- Purchases ----------

  async listPurchasesByPNR(pnrId: number): Promise<AncillaryPurchase[]> {
    const response = await api.get<ApiResponse<AncillaryPurchase[]>>(`/ancillaries/purchases/pnr/${pnrId}`);
    return response.data.data ?? [];
  },

  async purchase(payload: {
    pnr_id: number;
    ancillary_id: number;
    quantity: number;
    passenger_id?: number;
    segment_id?: number;
    flight_id?: number;
  }): Promise<AncillaryPurchase | null> {
    const response = await api.post<ApiResponse<AncillaryPurchase>>('/ancillaries/purchases', payload);
    return response.data.data;
  },

  async cancelPurchase(id: number): Promise<AncillaryPurchase | null> {
    const response = await api.post<ApiResponse<AncillaryPurchase>>(`/ancillaries/purchases/${id}/cancel`);
    return response.data.data;
  },
};
