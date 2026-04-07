// Route: /register
import React from "react";
import { EmailField, PasswordField, UsernameField, CountrySelect } from "@/pages/Guest/sub-components/FormFields";
import { useRegister } from "./hook/useRegister.hook.js";

export default function RegisterPage() {
    const { form, countries, countriesLoading, countriesError, handleSubmit, handleLoginNav } = useRegister();

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

    return (
        <div className="min-h-screen w-full bg-[#0d0d1a] text-[#e3e0f4] font-body flex flex-col">
            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center pt-5 pb-12 px-4">
                <div className="w-full max-w-[480px] bg-[#1a1a2e] border border-[#2a2a4e] p-8 shadow-[4px_4px_0px_0px_#343342] relative">
                    {/* Terminal Header Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#4cc9f0]"></div>

                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="font-headline text-lg text-[#e3e0f4] tracking-tighter mb-4 text-center uppercase">
                            REGISTRATION
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
                            passwordStrength={form.passwordStrength}
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
                            <CountrySelect
                                value={form.formData.country}
                                onChange={form.handleInputChange}
                                disabled={form.loading}
                                loading={countriesLoading}
                                error={countriesError}
                                countries={countries}
                            />
                            {countriesError && (
                                <p className="text-[10px] text-[#ffb4ab]">
                                    Failed to load countries. Please try again.
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
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
                            onClick={handleLoginNav}
                            className="text-[10px] tracking-[0.2em] text-[#4cc9f0] hover:underline uppercase font-bold cursor-pointer"
                        >
                            Already have an account? LOGIN
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}