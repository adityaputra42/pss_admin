import React from 'react';
import { useAuthStore } from '../hooks/useAuth';


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
