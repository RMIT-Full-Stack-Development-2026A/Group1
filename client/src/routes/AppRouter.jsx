import React, { lazy, Suspense,  } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuthStore } from "@/stores/AuthStore";
import ProtectedRoute from "./ProtectedRoute";

// Lazy-loaded pages
const LandingPage = lazy(() => import("@/pages/Guest/Landing/index"));
const LoginPage = lazy(() => import("@/pages/Guest/Login/index"));
const RegisterPage = lazy(() => import("@/pages/Guest/Register/index"));

const ProfilePage = lazy(() => import("@/pages/Player/Profile/index"));
const GameModeSelect = lazy(() => import("@/pages/Player/GameModeSelect/index"));
const GameLobby = lazy(() => import("@/pages/Player/GameLobby/index"));
const GameCustomization = lazy(() => import("@/pages/Player/GameCustomization/index"));
const GameBoard = lazy(() => import("@/pages/Player/GameBoard/index"));
const MatchReplay = lazy(() => import("@/pages/Player/MatchReplay/index"));
const SubscriptionPage = lazy(() => import("@/pages/Player/Subscription/index"));

const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard/index"));
const PlayerManagement = lazy(() => import("@/pages/Admin/PlayerManagement/index"));
const GameRoomMonitor = lazy(() => import("@/pages/Admin/GameRoomMonitor/index"));

// const RedirectAuthenticatedUser = ({ children }) => {
// };

export default function AppRouter() {
    // const { checkAuth } = useAuthStore();
    //
    // useEffect(() => {
    //     checkAuth();
    // }, [checkAuth]);

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <Routes>
                {/* 1. Guest Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/play" element={<GameBoard />} />

                {/* 2. Player Pages (Free & Premium) */}
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/play" element={<ProtectedRoute><GameModeSelect /></ProtectedRoute>} />
                <Route path="/lobby" element={<ProtectedRoute><GameLobby /></ProtectedRoute>} />
                <Route path="/play/customize" element={<ProtectedRoute><GameCustomization /></ProtectedRoute>} />
                <Route path="/game/:roomId" element={<ProtectedRoute><GameBoard /></ProtectedRoute>} />
                <Route path="/replay/:gameId" element={<ProtectedRoute><MatchReplay /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />

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