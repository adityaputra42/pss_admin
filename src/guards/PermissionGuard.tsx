import React from 'react';
import { useAuthStore } from '../hooks/useAuth';

interface PermissionGuardProps {
  permission: string; 
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children }) => {
  const { user, permissions } = useAuthStore();

  if (user?.role.name === 'Super Admin') {
    return <>{children}</>;
  }

  if (permissions.includes(permission)) {
    return <>{children}</>;
  }

  return null; 
};

export default PermissionGuard;
