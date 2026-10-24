import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

/**
 * ProtectedRoute — wraps a route that requires authentication and optionally
 * restricts access to specific roles or account statuses.
 *
 * Props:
 *   children        – the protected component
 *   allowedRoles    – string[] of roles that may access this route (omit = any authenticated user)
 *   requireStatus   – 'active' | undefined (omit = allow any status)
 */
const ProtectedRoute = ({ children, allowedRoles, requireStatus }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Still verifying persisted session — show full-page spinner
  if (loading) {
    return <Loader fullPage text="Loading…" />;
  }

  // Not logged in → redirect to login, preserving intended destination
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Authenticated but wrong role → send them to their own dashboard
    const roleMap = {
      farmer: '/farmer/dashboard',
      buyer:  '/buyer/dashboard',
      expert: '/expert/dashboard',
      admin:  '/admin/dashboard',
    };
    return <Navigate to={roleMap[user.role] || '/'} replace />;
  }

  // Status check — block pending/rejected/suspended users from active dashboards
  if (requireStatus === 'active' && user.status !== 'active') {
    if (user.status === 'pending') return <Navigate to="/pending-verification" replace />;
    if (user.status === 'rejected' || user.status === 'suspended')
      return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
