import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Renders children only if user is logged in (infrioAuth in localStorage).
 * Otherwise redirects to /login with state.redirect set to the current path
 * so the user can be sent back after logging in.
 */
function ProtectedRoute({ children }) {
  const location = useLocation();
  const auth = typeof window !== 'undefined' ? localStorage.getItem('infrioAuth') : null;

  if (!auth) {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;
