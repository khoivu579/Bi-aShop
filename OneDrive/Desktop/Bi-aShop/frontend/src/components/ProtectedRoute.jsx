import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, adminOnly = false, allowedRoles = [] }) {
  const { loading, isAuthenticated, isAdmin, user } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
