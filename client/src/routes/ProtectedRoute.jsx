import React from "react";
import { Navigate } from "react-router-dom";
// import { useAuthStore } from "@/stores/AuthStore";

export default function ProtectedRoute({ children, allowedRoles = ["PLAYER", "ADMIN"] }) {
    // const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
    //
    // if (isCheckingAuth) {
    //     return null;
    // }
    //
    // if (!isAuthenticated || !user) {
    //     return <Navigate to="/login" replace />;
    // }
    //
    // // Role-Based Access Control check
    // if (!allowedRoles.includes(user.role)) {
    //     return <Navigate to="/profile" replace />;
    // }
    //
    // return children;
}