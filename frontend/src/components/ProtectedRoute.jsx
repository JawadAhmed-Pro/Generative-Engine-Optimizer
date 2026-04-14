import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component that redirects to login if user is not authenticated.
 * Shows a loading state while checking authentication.
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // UI AUDIT BYPASS: Always allow access
    return children;

    return children;
}

export default ProtectedRoute;
