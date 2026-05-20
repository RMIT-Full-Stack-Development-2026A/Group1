// Route: /login
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/AuthStore";
import { useLogin } from "@/pages/Guest/Login/hook/useLogin.hook.js";
import { LockoutWarning, AuthMessage } from "./sub-components";
import toast from "react-hot-toast";

let duplicateLoginToastShown = false;

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
        isLocked,
        handleSubmit,
        handleRegisterNav,
    } = useLogin();

    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason');

    useEffect(() => {
        if (reason === 'duplicate' && !duplicateLoginToastShown) {
            duplicateLoginToastShown = true;
            toast.error("Your account was logged in from another location.", { duration: 5000 });

            window.setTimeout(() => {
                duplicateLoginToastShown = false;
            }, 1000);
        }
    }, [reason]);

    // Redirect based on user role after successful login
    useEffect(() => {
        if (!isCheckingAuth && isAuthenticated) {
            const { user } = useAuthStore.getState();
            const redirectPath = user?.role === 'ADMIN' ? '/admin' : '/play';
            console.log(`[Login] User authenticated with role: ${user?.role}, redirecting to ${redirectPath}`);
            navigate(redirectPath, { replace: true });
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

            {/* Content Section */}
            <section className="flex-grow flex-col flex items-center justify-center pb-8 px-4 z-10">
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
                                        <span className="material-symbols-outlined text-sm">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Primary CTA */}
                            <button
                                type="submit"
                                disabled={loading || isLocked}
                                className={`w-full font-bold font-headline py-4 px-6 flex items-center justify-center gap-3 transition-all uppercase text-sm ${
                                    isLocked
                                        ? "bg-[#93000a] text-[#ffdad6] border-2 border-[#ffb4ab] cursor-not-allowed shadow-none"
                                        : loading
                                        ? "bg-[#3d484d] text-[#879398] border-2 border-[#3d484d] cursor-not-allowed shadow-none"
                                        : "bg-[#4cc9f0] text-[#003543] border-2 border-[#4cc9f0] shadow-[4px_4px_0px_0px_#003543] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none"
                                }`}
                            >
                                {isLocked ? (
                                        <span className="material-symbols-outlined">lock</span>
                                    ) : loading ? (
                                        <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
                                    ) : (
                                        <span className="material-symbols-outlined">play_arrow</span>
                                    )}
                                {isLocked ? "ACCOUNT LOCKED" : loading ? "LOGGING IN..." : "LOGIN"}
                            </button>
                        </form>

                        {/* Error/Success Message - Below form */}
                        <div className="mt-6">
                            <AuthMessage message={message} />
                        </div>
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
            </section>
        </div>
    );
}