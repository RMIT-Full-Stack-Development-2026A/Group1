// Route: /register
import React from "react";
import { useNavigate } from "react-router-dom";
import { mockAuthService } from "@/services/mockAuthService";
import Navigation from "@/components/Navigation/index";
import { EmailField, PasswordField, UsernameField } from "@/components/FormFields";
import { useFormValidation } from "@/hooks/useFormValidation";
import {
    isEmailValid,
    isUsernameValid,
    isPasswordValid,
    passwordsMatch,
} from "@/utils/validationUtils";

export default function RegisterPage() {
    const navigate = useNavigate();
    const form = useFormValidation();

    // Criteria checkbox component
    const CriteriaCheckbox = ({ met, label }) => (
        <div className="flex items-center gap-2 text-[10px] uppercase font-mono">
            <span className={`w-4 h-4 flex items-center justify-center border ${
                met 
                    ? "bg-[#5cb85c] border-[#5cb85c]"
                    : "bg-[#ffb4ab] border-[#ffb4ab]"
            }`}>
                {met ? (
                    <span className="text-[#0d0d1a] font-bold">✓</span>
                ) : (
                    <span className="text-[#0d0d1a] font-bold">✗</span>
                )}
            </span>
            <span className={met ? "text-[#5cb85c]" : "text-[#ffb4ab]"}>{label}</span>
        </div>
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const errors = [];

        // Validate email
        if (!isEmailValid(form.emailValidation)) {
            errors.push("Email does not meet all requirements");
        }

        // Validate username
        if (form.formData.username.length === 0 || !isUsernameValid(form.usernameValidation)) {
            errors.push("Username must contain only letters, numbers, underscore, and hyphen");
        }

        // Validate password
        if (!isPasswordValid(form.passwordValidation)) {
            errors.push("Password does not meet all requirements");
        }
        
        // Check password match
        if (!passwordsMatch(form.formData.password, form.formData.confirmPassword)) {
            errors.push("Passwords must match");
        }

        // If there are any errors, display them all
        if (errors.length > 0) {
            form.setMessage({
                type: "error",
                text: errors.join("\n"),
            });
            return;
        }

        form.setLoading(true);
        form.setMessage({ type: "", text: "" });

        // Simulate API call delay
        setTimeout(() => {
            const result = mockAuthService.register({
                username: form.formData.username,
                email: form.formData.email,
                password: form.formData.password,
                country: form.formData.country,
            });

            if (result.success) {
                form.setMessage({
                    type: "success",
                    text: "Account created! Redirecting to login...",
                });
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                form.setMessage({
                    type: "error",
                    text: result.message || "Registration failed",
                });
            }
            form.setLoading(false);
        }, 500);
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
                        {/* Username Field */}
                        <UsernameField
                            value={form.formData.username}
                            onChange={form.handleInputChange}
                            usernameValidation={form.usernameValidation}
                            CriteriaCheckbox={CriteriaCheckbox}
                            disabled={form.loading}
                        />

                        {/* Email Field */}
                        <EmailField
                            value={form.formData.email}
                            onChange={form.handleInputChange}
                            emailValidation={form.emailValidation}
                            CriteriaCheckbox={CriteriaCheckbox}
                            disabled={form.loading}
                        />

                        {/* Password Field */}
                        <PasswordField
                            value={form.formData.password}
                            onChange={form.handleInputChange}
                            name="password"
                            label="Password"
                            showPassword={form.showPassword}
                            onToggleShow={() => form.setShowPassword(!form.showPassword)}
                            passwordValidation={form.passwordValidation}
                            CriteriaCheckbox={CriteriaCheckbox}
                            disabled={form.loading}
                        />

                        {/* Confirm Password Field */}
                        <PasswordField
                            value={form.formData.confirmPassword}
                            onChange={form.handleInputChange}
                            name="confirmPassword"
                            label="Verify Password"
                            showPassword={form.showConfirmPassword}
                            onToggleShow={() => form.setShowConfirmPassword(!form.showConfirmPassword)}
                            passwordMismatch={form.passwordMismatch}
                            CriteriaCheckbox={CriteriaCheckbox}
                            disabled={form.loading}
                            isConfirmField={true}
                        />

                        {/* Country */}
                        <div className="space-y-2">
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                                Regional Sector
                            </label>
                            <select
                                name="country"
                                value={form.formData.country}
                                onChange={form.handleInputChange}
                                disabled={form.loading}
                                className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body focus:ring-0 transition-colors outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option>🇻🇳 Vietnam</option>
                                <option>Japan</option>
                                <option>South Korea</option>
                                <option>Thailand</option>
                                <option>Philippines</option>
                                <option>Indonesia</option>
                                <option>Malaysia</option>
                                <option>Singapore</option>
                                <option>China</option>
                                <option>India</option>
                                <option>United States</option>
                                <option>Canada</option>
                                <option>United Kingdom</option>
                                <option>Germany</option>
                                <option>France</option>
                                <option>Australia</option>
                                <option>New Zealand</option>
                                <option>Brazil</option>
                                <option>Mexico</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={form.loading}
                                className={`w-full font-headline py-4 px-6 border-2 transition-all uppercase text-sm flex items-center justify-center gap-3 ${
                                    form.loading
                                        ? "bg-[#3d484d] text-[#879398] border-[#3d484d] cursor-not-allowed shadow-none"
                                        : "bg-[#4cc9f0] text-[#003543] border-[#003543] shadow-[2px_2px_0px_0px_#005266] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:shadow-[0px_0px_8px_#4cc9f0]"
                                }`}
                            >
                                <span>{form.loading ? "⏳" : "➕"}</span>
                                {form.loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                            </button>
                        </div>
                    </form>

                    {/* Message Display - Below Form */}
                    {form.message.text && (
                        <div
                            className={`mt-6 p-4 text-sm text-center rounded-none border-2 font-bold uppercase ${
                                form.message.type === "success"
                                    ? "bg-[#2a3f2a] border-[#5cb85c] text-[#5cb85c]"
                                    : "bg-[#3f2a2a] border-[#ffb4ab] text-[#ffb4ab]"
                            }`}
                            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                        >
                            {form.message.text}
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