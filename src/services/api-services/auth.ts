import api from '../api-client';
import type { ApiResponse } from '../../types/api';

/**
 * Auth API Service.
 *
 * IMPORTANT mismatch vs pss_modular_cqrs, NOT fixable by changing this
 * file alone -- read before touching Login.tsx / useAuth.ts:
 *
 * POST /auth/login's real response is ONLY
 *   { access_token, refresh_token, expires_at }
 * (see internal/auth/interfaces/http/auth_handler.go's loginResponse).
 * There is NO `user` object in the login response, and NO GET /profile or
 * GET /auth/me endpoint on the backend to fetch one afterwards -- so
 * Login.tsx's `const { access_token, refresh_token, user } = data` will
 * always destructure `user` as undefined. useAuthStore.setUser/login()
 * will receive undefined, and anything reading `user.role` /
 * `user.full_name` downstream (Sidebar, Profile page, PermissionGuard)
 * will break. Fixing this needs either a new backend "who am I" endpoint,
 * or decoding the JWT client-side for at least user_id/role_id (the
 * access token DOES embed `id` and `role_id` as claims -- see
 * JWTService.IssueAccessToken -- just not username/email/full_name).
 */
export const authApi = {
  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/auth/login', credentials);
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(payload: { token: string; new_password: string }): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },

  /**
   * Update the CURRENTLY LOGGED-IN user's own profile.
   * PUT /auth/me -- this is the only "profile" endpoint that exists.
   * There is no GET /auth/me, so you can't use this to fetch the profile,
   * only to update it.
   */
  async updateMe(payload: Record<string, unknown>): Promise<any> {
    const response = await api.put<ApiResponse<any>>('/auth/me', payload);
    return response.data.data;
  },

  /**
   * ⚠️ BACKEND: POST /auth/logout does NOT exist. There is no server-side
   * session/refresh-token revocation endpoint in pss_modular_cqrs at all
   * -- logout there is purely "the client forgets its tokens"
   * (useAuthStore.logout() already does exactly that, with no network
   * call). This function is now a client-side no-op so it doesn't 404;
   * remove the call to authApi.logout() entirely and just call
   * useAuthStore.getState().logout() wherever logout happens.
   */
  async logout(): Promise<void> {
    return Promise.resolve();
  },
};
