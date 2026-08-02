import {  Routes, Route, Navigate} from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users/UsersPage';
import RolesPage from './pages/Roles/RolesPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import { useAuthStore } from './hooks/useAuth';
import { authApi } from './services/api-services';
import ProtectedRoute from './guards/ProtectedRoute';
import ProfilePage from './pages/Profile';
import FlightsPage from './pages/FlightOperations/FlightsPage';
import FlightSchedulesPage from './pages/FlightOperations/FlightSchedulePage';
import RoutesPage from './pages/FlightOperations/RoutePage';
import AirportPage from './pages/FlightOperations/AirportPage';
import AircraftPage from './pages/FlightOperations/AircraftPage';
import SeatClassPage from './pages/FlightOperations/SeatClassPage';
import FareClassPage from './pages/FlightOperations/FareClassPage';
import PageTransition from './components/animations/PageTransition';
import BookingPage from './pages/Booking/BookingPage';
import CheckinPage from './pages/Booking/CheckinPage';
import BoardingPassPage from './pages/Booking/BoardingPassPage';
import AncillaryPage from './pages/Booking/AncillaryPage';
import ReportPage from './pages/Reports/ReportPage';

const App = () => {
const { isAuthenticated, setPermissions } = useAuthStore();
useEffect(() => {
  if (!isAuthenticated) return;
  authApi.getMe().then((me) => {
    if (me) setPermissions(me);
  }).catch(() => {});
 }, [isAuthenticated]);

  return (
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <PageTransition> <LoginPage /></PageTransition> : <Navigate to="/dashboard" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/users" element={<PageTransition><UsersPage /></PageTransition> } />
          <Route path="/flights" element={<PageTransition><FlightsPage /></PageTransition>} />
          <Route path="/flight-schedules" element={<PageTransition><FlightSchedulesPage /></PageTransition>} />
          <Route path="/routes" element={<PageTransition><RoutesPage /></PageTransition>} />
          <Route path="/airports" element={<PageTransition><AirportPage /></PageTransition>} />
          <Route path="/aircraft" element={<PageTransition><AircraftPage /></PageTransition>} />
          <Route path="/seat-classes" element={<PageTransition><SeatClassPage /></PageTransition>} />
          <Route path="/fare-classes" element={<PageTransition><FareClassPage /></PageTransition>} />
          <Route path="/payments" element={<PageTransition><PaymentsPage /></PageTransition>} />
          <Route path="/roles" element={<PageTransition><RolesPage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/bookings" element={<PageTransition><BookingPage /></PageTransition>} />
          <Route path="/check-in" element={<PageTransition><CheckinPage /></PageTransition>} />
          <Route path="/boarding-pass" element={<PageTransition><BoardingPassPage /></PageTransition>} />
          <Route path="/ancillary" element={<PageTransition><AncillaryPage /></PageTransition>} />
          <Route path="/reports" element={<PageTransition><ReportPage /></PageTransition>} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>

  );
};

export default App;
