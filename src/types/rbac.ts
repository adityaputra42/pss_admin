import type { ReactNode } from "react";

export interface Role {
  permissions: Permission[];
  created_at: string | number | Date;
  is_system_role: any;
  id: number;
  name: string;
  description: string;
}

export interface Permission {
  description: ReactNode;
  id: number;
  name: string;
  resource: string;
  action: string;
}
