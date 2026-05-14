import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../services/api-services';
import { useAuthStore } from '../hooks/useAuth';
import type { User } from '../types/api';

export const useUsers = (
  page = 1,
  limit = 10,
  search = ''
) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await usersApi.getUsers(page, limit, search);
      
      setUsers(Array.isArray(response.users) ? response.users : []);
      setTotal(response.total ?? 0);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Failed to fetch users');
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, isAuthenticated]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    total,
    isLoading,
    error,
    refetch: fetchUsers,
  };
};
