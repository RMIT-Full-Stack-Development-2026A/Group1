import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/AuthStore";
import ProtectedRoute from "./ProtectedRoute";

// Lazy-loaded pages
const LandingPage = lazy(() => import("@/pages/Guest/Landing"));
const LoginPage = lazy(() => import("@/pages/Guest/Login"));
const RegisterPage = lazy(() => import("@/pages/Guest/Register"));

const ProfilePage = lazy(() => import("@/pages/Player/Profile"));
const GameModeSelect = lazy(() => import("@/pages/Player/GameModeSelect"));
const GameLobby = lazy(() => import("@/pages/Player/GameLobby"));
const GameCustomization = lazy(() => import("@/pages/Player/GameCustomization"));
const GameBoard = lazy(() => import("@/pages/Player/GameBoard"));
const MatchReplay = lazy(() => import("@/pages/Player/MatchReplay"));
const SubscriptionPage = lazy(() => import("@/pages/Player/Subscription"));

const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const PlayerManagement = lazy(() => import("@/pages/Admin/PlayerManagement"));
const GameRoomMonitor = lazy(() => import("@/pages/Admin/GameRoomMonitor"));

const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    if (isAuthenticated) {
        return <Navigate to={user.role === 'ADMIN' ? "/admin" : "/profile"} replace />;
    }
    return children;
};

export default function AppRouter() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <Routes>
                {/* 1. Guest Pages */}
                <Route path="/" element={<RedirectAuthenticatedUser><LandingPage /></RedirectAuthenticatedUser>} />
                <Route path="/login" element={<RedirectAuthenticatedUser><LoginPage /></RedirectAuthenticatedUser>} />
                <Route path="/register" element={<RedirectAuthenticatedUser><RegisterPage /></RedirectAuthenticatedUser>} />

                {/* 2. Player Pages (Free & Premium) */}
                <Route path="/profile" element={<ProtectedRoute allowedRoles={["PLAYER", "ADMIN"]}><ProfilePage /></ProtectedRoute>} />
                <Route path="/play" element={<ProtectedRoute allowedRoles={["PLAYER", "ADMIN"]}><GameModeSelect /></ProtectedRoute>} />
                <Route path="/lobby" element={<ProtectedRoute allowedRoles={["PLAYER", "ADMIN"]}><GameLobby /></ProtectedRoute>} />
                <Route path="/play/customize" element={<ProtectedRoute allowedRoles={["PLAYER", "ADMIN"]}><GameCustomization /></ProtectedRoute>} />
                <Route path="/game/:roomId" element={<ProtectedRoute allowedRoles={["PLAYER", "ADMIN"]}><GameBoard /></ProtectedRoute>} />
                <Route path="/replay/:gameId" element={<ProtectedRoute allowedRoles={["PLAYER", "ADMIN"]}><MatchReplay /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute allowedRoles={["PLAYER", "ADMIN"]}><SubscriptionPage /></ProtectedRoute>} />

                {/* 3. Admin Pages */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/players" element={<ProtectedRoute allowedRoles={["ADMIN"]}><PlayerManagement /></ProtectedRoute>} />
                <Route path="/admin/rooms" element={<ProtectedRoute allowedRoles={["ADMIN"]}><GameRoomMonitor /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}