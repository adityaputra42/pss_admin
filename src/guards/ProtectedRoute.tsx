// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '../hooks/useAuth';
// import MainLayout from '../components/common/MainLayout';
// import { useEffect, useState } from 'react';

// const ProtectedRoute = () => {
//   const { isAuthenticated, accessToken } = useAuthStore();
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   if (!hydrated) {
//     return null; 
//   }
//   if (!isAuthenticated && !accessToken) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <MainLayout>
//       <Outlet />
//     </MainLayout>
//   );
// };

// export default ProtectedRoute;
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import MainLayout from '../components/common/MainLayout';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;
