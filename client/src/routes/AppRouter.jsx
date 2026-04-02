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

                {/* 2. Player Pages (Free & Premium) */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/play" element={<GameModeSelect />} />
                <Route path="/lobby" element={<GameLobby />} />
                <Route path="/game-customization" element={<GameCustomization />} />
                <Route path="/play/:roomId" element={<GameBoard />} />
                <Route path="/replay/:gameId" element={<MatchReplay />} />
                <Route path="/subscription" element={<SubscriptionPage />} />

                {/* 3. Admin Pages */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/players" element={<PlayerManagement />} />
                <Route path="/admin/rooms" element={<GameRoomMonitor />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}