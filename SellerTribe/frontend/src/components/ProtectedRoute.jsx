// components/ProtectedRoute.jsx
// Pages inside <ProtectedRoute> need a logged-in seller; others are sent to /login.
// Note: this only improves the user experience. The real protection is on the backend,
// which checks the seller login cookie for every product request.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from './Loading.jsx';

function ProtectedRoute({ children }) {
  const { seller, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <Loading text="Checking your account..." fullPage />;
  }

  if (!seller) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
