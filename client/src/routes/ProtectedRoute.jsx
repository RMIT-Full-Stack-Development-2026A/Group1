import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/AuthStore";

export default function ProtectedRoute({ children, allowedRoles = ["PLAYER", "ADMIN"] }) {
    const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

    // Show loading while checking auth
    if (isCheckingAuth) {
        return <div className="flex h-screen items-center justify-center">Checking authentication...</div>;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role-Based Access Control check
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/profile" replace />;
    }

    return children;
}