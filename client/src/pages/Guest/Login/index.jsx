// Route: /login
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/reusable/Navigation";
import Footer from "@/components/reusable/Footer";
import { useAuthStore } from "@/stores/AuthStore";
import { useLogin } from "@/pages/Guest/Login/hook/useLogin.hook.js";
import { LockoutWarning, AuthMessage } from "./sub-components";

export default function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    const {
        formData,
        handleInputChange,
        showPassword,
        toggleShowPassword,
        loading,
        message,
        failedAttempts,
        isLocked,
        lockoutCountdown,
        handleSubmit,
        handleGuestLogin,
        handleRegisterNav,
    } = useLogin();

    // Redirect to game mode select after successful login
    useEffect(() => {
        if (!isCheckingAuth && isAuthenticated) {
            console.log('[Login] User authenticated, redirecting to /play');
            navigate("/play", { replace: true });
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

    return (
        <div className="bg-[#0d0d1a] text-[#e3e0f4] font-body min-h-screen flex flex-col overflow-x-hidden">
            {/* Background Layers */}
            <div
                className="fixed inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, #3d484d 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            ></div>
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.05) 50%)",
                    backgroundSize: "100% 4px",
                }}
            ></div>

            {/* Top Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4 z-10">
                {/* Login Card */}
                <div className="w-full max-w-[480px] bg-[#1a1a2e] border border-[#2a2a4e] flex flex-col shadow-[4px_4px_0px_0px_#343342]">
                    {/* Card Header Bar */}
                    <div className="h-1 w-full bg-[#4cc9f0]"></div>

                    <div className="p-8">
                        <h1 className="font-headline text-lg text-[#e3e0f4] mb-3 tracking-tighter text-center uppercase">
                            LOGIN
                        </h1>
                        <div className="h-[2px] w-full bg-[#4cc9f0] relative mb-8">
                            <div className="absolute top-0 right-0 w-12 h-[2px] bg-white"></div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email/Username */}
                            <div className="space-y-2">
                                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                                    USERNAME OR EMAIL
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="USER_ID_70"
                                    disabled={loading || isLocked}
                                    className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] focus:ring-0 text-[#4cc9f0] p-3 font-body text-sm placeholder:opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                                        PASSWORD
                                    </label>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        disabled={loading || isLocked}
                                        className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] focus:ring-0 text-[#4cc9f0] p-3 font-body text-sm placeholder:opacity-30 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleShowPassword}
                                        disabled={loading || isLocked}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                            showPassword ? "text-[#4cc9f0]" : "text-[#3d484d]"
                                        } hover:text-[#4cc9f0]`}
                                    >
                                        👁
                                    </button>
                                </div>
                            </div>

                            {/* Primary CTA */}
                            <button
                                type="submit"
                                disabled={loading || isLocked}
                                className={`w-full font-bold py-4 px-6 flex items-center justify-center gap-3 transition-all uppercase text-sm ${
                                    isLocked
                                        ? "bg-[#93000a] text-[#ffdad6] border-2 border-[#ffb4ab] cursor-not-allowed shadow-none"
                                        : loading
                                        ? "bg-[#3d484d] text-[#879398] border-2 border-[#3d484d] cursor-not-allowed shadow-none"
                                        : "bg-[#4cc9f0] text-[#003543] border-2 border-[#4cc9f0] shadow-[4px_4px_0px_0px_#003543] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none"
                                }`}
                            >
                                <span>{isLocked ? "🔒" : loading ? "⏳" : "▶"}</span>
                                {isLocked ? "ACCOUNT LOCKED" : loading ? "LOGGING IN..." : "START GAME"}
                            </button>
                        </form>

                        {/* Error/Success Message - Below form */}
                        <div className="mt-6">
                            <AuthMessage message={message} />
                        </div>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#3d484d]/30"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px]">
                                <span className="bg-[#1a1a2e] px-2 text-[#3d484d] font-bold">OR</span>
                            </div>
                        </div>

                        {/* Guest CTA - Also disabled when locked */}
                        <button
                            onClick={handleGuestLogin}
                            disabled={loading || isLocked}
                            className={`w-full py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                isLocked
                                    ? "border border-[#3d484d] text-[#879398] cursor-not-allowed opacity-50"
                                    : "border border-[#3d484d] text-[#e3e0f4] hover:border-[#4cc9f0] hover:text-[#4cc9f0] disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                        >
                            <span>👤</span>
                            {isLocked ? "CONTINUE AS GUEST (LOCKED)" : "CONTINUE AS GUEST"}
                        </button>
                    </div>
                </div>

                {/* Secondary Link */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-[#879398] font-medium tracking-wide">
                        No account?{" "}
                        <button
                            onClick={handleRegisterNav}
                            className="text-[#4cc9f0] font-bold hover:drop-shadow-[0_0_8px_#4cc9f0] transition-all cursor-pointer"
                        >
                            REGISTER NOW
                        </button>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}