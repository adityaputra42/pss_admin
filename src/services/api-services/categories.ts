import api from '../api-client';
import type { ApiResponse, Category, CategoryInput } from '../../types/api';



export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Categories API Service
 * Handles all category-related API calls
 */
export const categoriesApi = {
  /**
   * Get all categories
   * GET /categories
   */
  async getCategories(limit: number = 100): Promise<Category[]> {
    const response = await api.get<ApiResponse<any>>('/categories', {
      params: { limit },
    });
    const data = response.data?.data?.categories || response.data?.data || [];
    return Array.isArray(data) ? data : [];
  },
   async getCategoryById(id: number): Promise<Category| null> {
      const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      return response.data.data;
    },

    /**
     * Create categories method
     * POST /categories
     * Accepts multipart/form-data
     */
    async createCategory(data: CategoryInput): Promise<Category| null> {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('icon', data.icon);

      const response = await api.post<ApiResponse<Category>>('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },

    /**
     * Update payment method
     * PUT /categories/{id}
     * Accepts multipart/form-data
     */
    async updateCategory(id: number, data: CategoryInput): Promise<Category| null> {
      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
       if (data.icon) formData.append('icon', data.icon);

      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },

    /**
     * Delete payment method
     * DELETE /categories/{id}
     */
    async deleteCategory(id: number): Promise<void> {
      await api.delete(`/categories/${id}`);
    },
};
