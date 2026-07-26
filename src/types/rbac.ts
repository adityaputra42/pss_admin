
export interface Permission {
  id: number;
  module: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  level: number;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_count: number;
}

export interface RoleDetail extends Role {
  permissions: Permission[];
}
