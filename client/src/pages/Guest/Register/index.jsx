// Route: /register
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAuthService } from "@/services/mockAuthService";
import Navigation from "@/components/Navigation/index";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        country: "NEO-TOKYO (NT-01)",
    });

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        setPasswordStrength(strength);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "password") {
            calculatePasswordStrength(value);
        }

        if (name === "confirmPassword" || name === "password") {
            const pwd = name === "password" ? value : formData.password;
            const confirm = name === "confirmPassword" ? value : formData.confirmPassword;
            setPasswordMismatch(pwd !== confirm && confirm.length > 0);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setPasswordMismatch(true);
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        // Simulate API call delay
        setTimeout(() => {
            const result = mockAuthService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                country: formData.country,
            });

            if (result.success) {
                setMessage({
                    type: "success",
                    text: "Account created! Redirecting to login...",
                });
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setMessage({
                    type: "error",
                    text: result.message || "Registration failed",
                });
            }
            setLoading(false);
        }, 500);
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return "#d9534f"; // red
        if (passwordStrength === 2) return "#f0ad4e"; // orange
        if (passwordStrength === 3) return "#fad100"; // yellow
        return "#5cb85c"; // green
    };

    return (
        <div className="min-h-screen w-full bg-[#0d0d1a] text-[#e3e0f4] font-body flex flex-col">
            {/* Top Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
                <div className="w-full max-w-[480px] bg-[#1a1a2e] border border-[#2a2a4e] p-8 shadow-[4px_4px_0px_0px_#343342] relative">
                    {/* Terminal Header Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#4cc9f0]"></div>
                    <div className="absolute top-2 right-4 flex gap-1">
                        <div className="w-2 h-2 bg-[#3d484d]"></div>
                        <div className="w-2 h-2 bg-[#3d484d]"></div>
                    </div>

                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="font-headline text-lg text-[#e3e0f4] tracking-tighter mb-4 uppercase">
                            NEW PLAYER
                        </h1>
                        <div className="h-[2px] w-full bg-[#4cc9f0] relative">
                            <div className="absolute top-0 right-0 w-12 h-[2px] bg-white"></div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="PLAYER_01"
                                className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body focus:ring-0 transition-colors outline-none"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="PROTOCOL@NETWORK.COM"
                                className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body focus:ring-0 transition-colors outline-none"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                                Encryption Key
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body focus:ring-0 transition-colors outline-none"
                            />
                            {/* Strength Indicator */}
                            <div className="flex gap-1 mt-2 items-center">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-2 transition-colors"
                                        style={{
                                            backgroundColor: i < passwordStrength ? getStrengthColor() : "#343342",
                                        }}
                                    ></div>
                                ))}
                                <span className="ml-2 text-[10px] text-[#fad100] font-bold uppercase tracking-widest">
                                    {passwordStrength === 0 && "Strength: Weak"}
                                    {passwordStrength === 1 && "Strength: Fair"}
                                    {passwordStrength === 2 && "Strength: Good"}
                                    {passwordStrength === 3 && "Strength: Strong"}
                                    {passwordStrength === 4 && "Strength: Very Strong"}
                                </span>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                                Verify Key
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className={`w-full bg-[#0d0d1a] border-b-2 p-3 font-body focus:ring-0 transition-colors outline-none ${
                                    passwordMismatch
                                        ? "border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]"
                                        : "border-[#3d484d] text-[#4cc9f0] focus:border-[#4cc9f0]"
                                }`}
                            />
                            {passwordMismatch && (
                                <p className="text-[10px] text-[#ffb4ab] font-bold tracking-widest uppercase mt-1">
                                    ⚠ PASSWORDS MUST MATCH
                                </p>
                            )}
                        </div>

                        {/* Country */}
                        <div className="space-y-2">
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                                Regional Sector
                            </label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body focus:ring-0 transition-colors outline-none cursor-pointer"
                            >
                                <option>NEO-TOKYO (NT-01)</option>
                                <option>EURO-NET (EU-04)</option>
                                <option>AMERICAS-GRID (AG-09)</option>
                                <option>ORBITAL-STATION (OS-00)</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full font-headline py-4 px-6 border-2 transition-all uppercase text-sm flex items-center justify-center gap-3 ${
                                    loading
                                        ? "bg-[#3d484d] text-[#879398] border-[#3d484d] cursor-not-allowed shadow-none"
                                        : "bg-[#4cc9f0] text-[#003543] border-[#003543] shadow-[2px_2px_0px_0px_#005266] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:shadow-[0px_0px_8px_#4cc9f0]"
                                }`}
                            >
                                <span>{loading ? "⏳" : "➕"}</span>
                                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                            </button>
                        </div>
                    </form>

                    {/* Message Display - Below Form */}
                    {message.text && (
                        <div
                            className={`mt-6 p-4 text-sm text-center rounded-none border-2 font-bold uppercase ${
                                message.type === "success"
                                    ? "bg-[#2a3f2a] border-[#5cb85c] text-[#5cb85c]"
                                    : "bg-[#3f2a2a] border-[#ffb4ab] text-[#ffb4ab]"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Login Link */}
                    <div className="mt-8 pt-6 border-t border-[#3d484d] text-center">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-[10px] tracking-[0.2em] text-[#4cc9f0] hover:underline uppercase font-bold cursor-pointer"
                        >
                            Already have an account? LOGIN
                        </button>
                    </div>

                    {/* Decorative corner data */}
                    <div className="absolute -bottom-12 left-0 text-[10px] text-[#3d484d] font-body">
                        STATUS: IDLE_WAITING_FOR_INPUT<br />
                        ENCRYPTION: AES-4096-QUANTUM
                    </div>
                    <div className="absolute -bottom-12 right-0 text-[10px] text-[#3d484d] font-body text-right">
                        VER: 2.0.70<br />
                        S_ID: ARC-9821
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#0d0d1a] border-t-2 border-[#3d484d] flex flex-col md:flex-row justify-between items-center px-8 py-4 w-full font-body text-[10px] tracking-[0.2em]">
                <div className="text-[#4cc9f0] font-bold uppercase mb-4 md:mb-0">
                    © 2070 NEOTRONICS ARCADE SYSTEMS
                </div>
                <div className="flex gap-8">
                    <a className="text-[#343342] hover:text-[#4cc9f0] cursor-pointer transition-colors">
                        SUPPORT
                    </a>
                    <a className="text-[#343342] hover:text-[#4cc9f0] cursor-pointer transition-colors">
                        TERMS
                    </a>
                    <a className="text-[#343342] hover:text-[#4cc9f0] cursor-pointer transition-colors">
                        SYSTEM_STATUS
                    </a>
                </div>
            </footer>
        </div>
    );
}