import React from 'react';
import { useAuthStore } from '../hooks/useAuth';

/**
 * ⚠️ Duplicate of components/PermissionGuard.tsx (neither is currently
 * imported anywhere) -- see that file's comment for why this is a no-op:
 * the backend has no client-facing permissions endpoint to check against.
 */
interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return null;
  return <>{children}</>;
};

export default PermissionGuard;
