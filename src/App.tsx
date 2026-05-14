import {  Routes, Route, Navigate} from 'react-router-dom';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users/UsersPage';
import RolesPage from './pages/Roles/RolesPage'; // Placeholder
import ProductsPage from './pages/Products/ProductsPage';
import OrdersPage from './pages/Orders/OrdersPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import ShippingPage from './pages/Shipping/ShippingPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import PaymentMethodPage from './pages/Payments/PaymentMethodPage';
import { useAuthStore } from './hooks/useAuth';
import ProtectedRoute from './guards/ProtectedRoute';
import ProfilePage from './pages/Profile';
import CategoryPage from './pages/category/CategoryPage';

const App = () => {
const { isAuthenticated } = useAuthStore();
console.log('AUTH STATE:', isAuthenticated);
console.log('CURRENT PATH:', window.location.pathname);
console.log('AUTH:', isAuthenticated);
  return (
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/payment-methods" element={<PaymentMethodPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>

  );
};

export default App;
