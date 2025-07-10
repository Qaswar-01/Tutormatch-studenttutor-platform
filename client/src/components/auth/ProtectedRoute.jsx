import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null, requireApproval = false }) => {
  const { isAuthenticated, loading, user, isTutorApproved } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'tutor') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if tutor needs approval
  if (user?.role === 'tutor' && user?.pendingApproval && requireApproval) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if tutor profile is complete
  if (user?.role === 'tutor' && !user?.profileCompleted) {
    // Allow access to profile page to complete it
    if (location.pathname !== '/profile') {
      return <Navigate to="/profile" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
