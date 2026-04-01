// Route: /login
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockAuthService } from "@/services/mockAuthService";
import Navigation from "@/components/Navigation/index";
import { LockoutWarning, AuthMessage } from "@/components/Login";

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutCountdown, setLockoutCountdown] = useState(0);

    // Auto-lock when failedAttempts reaches 5
    useEffect(() => {
        if (failedAttempts === 5 && !isLocked) {
            setIsLocked(true);
            setLockoutCountdown(60);
        }
    }, [failedAttempts, isLocked]);

    // Countdown timer for lockout
    useEffect(() => {
        let interval;
        if (lockoutCountdown > 0) {
            interval = setInterval(() => {
                setLockoutCountdown((prev) => prev - 1);
            }, 1000);
        } else if (lockoutCountdown === 0 && isLocked) {
            // Countdown finished, reset lockout
            setIsLocked(false);
            setFailedAttempts(0);
            setMessage({ type: "", text: "" });
        }
        return () => clearInterval(interval);
    }, [lockoutCountdown, isLocked]);

    // Update error message with countdown
    useEffect(() => {
        if (isLocked && lockoutCountdown > 0) {
            setMessage({
                type: "error",
                text: `Account locked due to too many failed attempts. Try again in ${lockoutCountdown}s.`,
            });
        }
    }, [lockoutCountdown, isLocked]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setMessage({
                type: "error",
                text: "Please enter email and password",
            });
            return;
        }

        // Check if account is locked
        if (mockAuthService.isAccountLockedForEmail(formData.email)) {
            setIsLocked(true);
            setLockoutCountdown(60);
            // Message will be set by the countdown useEffect
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        // Simulate API call delay
        setTimeout(() => {
            const result = mockAuthService.login(formData.email, formData.password);

            if (result.success) {
                setFailedAttempts(0);
                setIsLocked(false);
                setMessage({
                    type: "success",
                    text: "Login successful! Redirecting...",
                });
                // Redirect to profile after 2 seconds
                setTimeout(() => {
                    navigate("/profile");
                }, 2000);
            } else {
                const attemptsRemaining = result.attemptsRemaining || 0;
                const currentFailures = 5 - attemptsRemaining;
                setFailedAttempts(currentFailures);

                if (result.isLocked) {
                    setIsLocked(true);
                    setLockoutCountdown(60);
                }

                setMessage({
                    type: "error",
                    text: result.message || "Login failed",
                });
            }
            setLoading(false);
        }, 500);
    };

    const handleGuestLogin = () => {
        navigate("/play");
    };

    return (
        <div className="bg-[#0d0d1a] text-[#e3e0f4] min-h-screen flex flex-col overflow-x-hidden">
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
                <div className="w-full max-w-[420px] bg-[#1a1a2e] border border-[#2a2a4e] flex flex-col shadow-2xl">
                    {/* Card Header Bar */}
                    <div className="h-1.5 w-full bg-[#4cc9f0]"></div>

                    <div className="p-8">
                        <h1 className="font-headline text-xl text-[#4cc9f0] mb-8 drop-shadow-[0_0_8px_#4cc9f0] tracking-tighter text-center">
                            PLAYER LOGIN
                        </h1>

                        {/* Warning Bar - Show only when approaching lockout (before it's locked) */}
                        <LockoutWarning 
                            failedAttempts={failedAttempts}
                            isLocked={isLocked}
                        />

                        {/* Error/Success Message */}
                        <AuthMessage message={message} />

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email/Username */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#879398] tracking-wider block">
                                    USERNAME OR EMAIL
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="USER_ID_70"
                                    disabled={loading || isLocked}
                                    className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] focus:ring-0 text-[#4cc9f0] p-3 font-mono text-sm placeholder:opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-bold text-[#879398] tracking-wider block">
                                        PASSWORD
                                    </label>
                                    <button
                                        type="button"
                                        className="text-[10px] text-[#3d484d] hover:text-[#4cc9f0] transition-colors cursor-pointer"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        disabled={loading || isLocked}
                                        className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] focus:ring-0 text-[#4cc9f0] p-3 font-mono text-sm placeholder:opacity-30 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
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
                                    loading || isLocked
                                        ? "bg-[#3d484d] text-[#879398] border-2 border-[#3d484d] cursor-not-allowed shadow-none"
                                        : "bg-[#4cc9f0] text-[#003543] border-2 border-[#4cc9f0] shadow-[4px_4px_0px_0px_#003543] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none"
                                }`}
                            >
                                <span>{loading ? "⏳" : "▶"}</span>
                                {loading ? "LOGGING IN..." : "START GAME"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#3d484d]/30"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px]">
                                <span className="bg-[#1a1a2e] px-2 text-[#3d484d] font-bold">OR</span>
                            </div>
                        </div>

                        {/* Guest CTA */}
                        <button
                            onClick={handleGuestLogin}
                            disabled={loading || isLocked}
                            className="w-full border border-[#3d484d] text-[#e3e0f4] hover:border-[#4cc9f0] hover:text-[#4cc9f0] transition-all py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>👤</span>
                            CONTINUE AS GUEST
                        </button>
                    </div>
                </div>

                {/* Secondary Link */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-[#879398] font-medium tracking-wide">
                        No account?{" "}
                        <button
                            onClick={() => navigate("/register")}
                            className="text-[#4cc9f0] font-bold hover:drop-shadow-[0_0_8px_#4cc9f0] transition-all cursor-pointer"
                        >
                            REGISTER NOW
                        </button>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t-2 border-[#3d484d] mt-auto bg-[#0d0d1a] flex flex-col md:flex-row justify-between items-center px-6 py-4">
                <div className="font-mono text-[10px] uppercase tracking-tighter text-slate-500">
                    © 2070 TICTACTOANG TERMINAL. ALL RIGHTS RESERVED.
                </div>
                <div className="flex gap-6 mt-4 md:mt-0 font-mono text-[10px] uppercase tracking-tighter">
                    <span className="text-[#fad100]">SYSTEM: ONLINE</span>
                    <span className="text-slate-500">LATENCY: 12MS</span>
                    <span className="text-slate-500">v4.0.2</span>
                </div>
            </footer>
        </div>
    );
}