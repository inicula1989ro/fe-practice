import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route tree: no valid session -> straight to /auth, same as the
// old vanilla app.js's top-of-file redirect, just declarative instead of a
// script that runs before the page paints.
export default function ProtectedRoute() {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
