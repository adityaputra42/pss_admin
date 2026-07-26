/**
 * Matches internal/role's response DTOs exactly (internal/role/
 * application/query/role_query_service.go) -- hand-written structs with
 * real json tags, snake_case, no pgtype nullability surprises.
 */
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
  /** Convenience field from the list/detail query -- how many users
   * currently have this role. A role can't be deleted while this is > 0. */
  user_count: number;
}

export interface RoleDetail extends Role {
  permissions: Permission[];
}
