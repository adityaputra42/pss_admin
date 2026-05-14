// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_products: number;
  total_orders: number;
}

export interface RevenueStats {
  total_revenue: number;
  monthly_revenue: number;
  revenue_growth: number;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
}

export interface OrderAnalytic {
  date: string;
  order_count: number;
  total_amount: number;
}

export interface UserGrowth {
  date: string;
  user_count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  revenue: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  category: string;
}

export interface RecentOrder {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface SystemHealth {
  database: string;
  cache: string;
  storage: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  resource_id?: number;
  created_at: string;
  user?: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

// ============================================
// User Types
// ============================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active: boolean;
  role_id: number;
  role?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  permissions?: string[];
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role_id: number;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role_id?: number;
}

export interface PasswordUpdateInput {
  new_password: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// Product Types
// ============================================

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
    icon: string;
  };
  images: string[];
  rating: number;
  color_varian?: ColorVariant[];
  created_at: string;
  updated_at: string;
}

export interface ColorVariant {
  id: number;
  product_id: number;
  color_name: string;
  color_hex: string;
  images: string | string[];
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: string;
  icon: File;

}

// ============================================
// Order Types
// ============================================

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    images: string[];
  };
}

export interface OrderUpdateInput {
  status: string;
}

// ============================================
// Payment Types
// ============================================

export interface Payment {
  id: number;
  transaction_id: string;
  total_payment: number;
  status: string;
  payment_method_id?: number;
  payment_method?: PaymentMethod;
  transaction?: Transaction;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_images: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodInput {
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_image: File;
}

export interface PaymentMethodUpdateInput {
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  is_active?: boolean;
  bank_image?: File;
}

// ============================================
// Transaction Types
// ============================================

export interface Transaction {
  tx_id: string;
  user_id: number;
  total_amount: number;
  status: string;
  payment_method_id: number;
  shipping_id: number;
  address_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  payment_method?: PaymentMethod;
  shipping?: ShippingMethod;
  transaction_items?: TransactionItem[];
}

export interface TransactionItem {
  id: number;
  transaction_id: string;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface TransactionUpdateInput {
  status: string;
}

export interface CreateTransactionInput {
  address_id: number;
  shipping_id: number;
  payment_method_id: number;
  product_orders: {
    product_id: number;
    quantity: number;
    color_id?: number;
  }[];
}

// ============================================
// Shipping Types
// ============================================

export interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  price: number;
  estimated_days: number;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingInput {
  name: string;
  description: string;
  price: number;
  estimated_days: number;
}

export interface ShippingUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  estimated_days?: number;
  is_active?: boolean;
}

// ============================================
// Role Types
// ============================================

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_system_role?: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RoleInput {
  name: string;
  description?: string;
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
}

export interface AssignPermissionsInput {
  permission_ids: number[];
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
