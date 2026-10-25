// components/ProtectedRoute.jsx
// Wraps pages that need a logged-in buyer (cart, checkout, orders):
//   <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
// Note: this only improves the user experience. Real protection must happen on the backend.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from './Loading.jsx';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <Loading text="Checking your account..." fullPage />;
  }

  // Not logged in: go to the login page and come back here afterwards
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}

export default ProtectedRoute;
