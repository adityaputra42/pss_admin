import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Me, User } from '../types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  roleName: string | null;
  isAuthenticated: boolean;
  permissions: string[];
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setPermissions: (me: Me) => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  hasPermission: (module: string, resource: string, action: string) => boolean;
  hasAnyPermission: (perms: Array<[string, string, string]>) => boolean;
}

const toKey = (module: string, resource: string, action: string) => `${module}:${resource}:${action}`;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      roleName: null,
      isAuthenticated: false,
      permissions: [],
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      setPermissions: (me) =>
        set({
          roleName: me.role_name,
          permissions: me.permissions.map((p) => toKey(p.module, p.resource, p.action)),
        }),
      login: (accessToken, refreshToken, user) =>
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          permissions: [],
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          roleName: null,
          isAuthenticated: false,
          permissions: [],
        }),
      hasPermission: (module, resource, action) => get().permissions.includes(toKey(module, resource, action)),
      hasAnyPermission: (perms) => perms.some(([m, r, a]) => get().permissions.includes(toKey(m, r, a))),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
