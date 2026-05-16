import {  Routes, Route, Navigate} from 'react-router-dom';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users/UsersPage';
import RolesPage from './pages/Roles/RolesPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import { useAuthStore } from './hooks/useAuth';
import ProtectedRoute from './guards/ProtectedRoute';
import ProfilePage from './pages/Profile';
import FlightsPage from './pages/FlightOperations/FlightsPage';
import FlightSchedulesPage from './pages/FlightOperations/FlightSchedulePage';
import RoutesPage from './pages/FlightOperations/RoutePage';
import AirportPage from './pages/FlightOperations/AirportPage';
import AircraftPage from './pages/FlightOperations/AircraftPage';

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
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/flight-schedules" element={<FlightSchedulesPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/airports" element={<AirportPage />} />
          <Route path="/aircraft" element={<AircraftPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>

  );
};

export default App;
