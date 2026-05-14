import { useEffect, useState } from 'react';
import { rolesApi } from '../services/api-services';
import { useAuthStore } from '../hooks/useAuth';
import type { Permission } from '../types/api';

export const usePermissions = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPermissions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await rolesApi.getAllPermissions();
        setPermissions(data ?? []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch permissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [isAuthenticated]);

  return { permissions, isLoading, error };
};
