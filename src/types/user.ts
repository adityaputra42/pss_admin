export interface User {
  uid: string;
  email: string;
  username: string;
  full_name: string;
  role: {
    id: number;
    name: string;
  };
  is_active: boolean;
  created_at: string;
  last_login_at: string;
  permissions: string[];
}
