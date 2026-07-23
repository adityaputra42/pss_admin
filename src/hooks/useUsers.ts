import { useState, useCallback } from 'react';
import { usersApi } from '../services/api-services';
import type { User } from '../types/api';


export const useUsers = () => {
  const [lastUser, setLastUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (data: Parameters<typeof usersApi.createUser>[0]) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const user = await usersApi.createUser(data);
      setLastUser(user);
      return user;
    } catch (err) {
      setError('Failed to create user');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: Parameters<typeof usersApi.updateUser>[1]) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const user = await usersApi.updateUser(id, data);
      setLastUser(user);
      return user;
    } catch (err) {
      setError('Failed to update user');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const setUserStatus = useCallback(async (id: string, status: 'ACTIVE' | 'LOCKED' | 'INACTIVE') => {
    setIsSubmitting(true);
    setError(null);
    try {
      await usersApi.setUserStatus(id, status);
    } catch (err) {
      setError('Failed to change user status');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { lastUser, isSubmitting, error, createUser, updateUser, setUserStatus };
};
