import api from '../api-client';
import type { Product, ApiResponse } from '../../types/api';

/**
 * Products API Service
 * Handles all product-related API calls
 */
export const productsApi = {
  /**
   * Get all products
   * GET /products
   */
  async getProducts(page: number = 1, limit: number = 10): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>('/products', {
      params: { page, limit },
    });
    return response.data.data??[];
  },

  /**
   * Get product by ID
   * GET /products/{id}
   */
  async getProductById(id: number): Promise<Product| null> {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  /**
   * Create a new product
   * POST /products
   * Accepts multipart/form-data
   */
  async createProduct(formData: FormData): Promise<Product| null> {
    const response = await api.post<ApiResponse<Product>>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Update product
   * PUT /products/{id}
   * Accepts multipart/form-data
   */
  async updateProduct(id: number, formData: FormData): Promise<Product| null> {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Delete product
   * DELETE /products/{id}
   */
  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  /**
   * Add color variant to product
   * POST /products/{id}/color
   */
  async addColorVariant(id: number, data: { color_name: string; color_hex: string; images: File[] }): Promise<Product| null> {
    const formData = new FormData();
    formData.append('color_name', data.color_name);
    formData.append('color_hex', data.color_hex);
    data.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post<ApiResponse<Product>>(`/products/${id}/color`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
