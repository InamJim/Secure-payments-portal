import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    const role = user.role;
    const allowed = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

    const ok = allowed
        .map(r => r.toLowerCase())
        .includes(role);

    return ok ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;