import React from 'react';
import { useAuthStore } from '../hooks/useAuth';


interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children, fallback = null }) => {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [module, resource, action] = permission.split(':');
  if (!module || !resource || !action) return <>{fallback}</>;
  return hasPermission(module, resource, action) ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
