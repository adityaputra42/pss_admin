import { useState, useEffect, useCallback } from 'react';
import { rolesApi } from '../services/api-services';
import type { Role } from '../types/api';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rolesApi.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch roles');
      console.error(err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, isLoading, error, mutate: fetchRoles };
};
