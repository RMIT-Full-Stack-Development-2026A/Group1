import React from "react";

/**
 * PasswordField Component
 * Reusable password input with visibility toggle, validation criteria display, and strength indicator
 * Can be used for both main password and confirm password fields
 */
const PasswordField = ({
    value,
    onChange,
    placeholder = "••••••••",
    name = "password",
    label = "Password",
    showPassword = false,
    onToggleShow,
    passwordValidation = null,
    passwordMismatch = false,
    passwordStrength = 0,
    CriteriaCheckbox,
    disabled = false,
    isConfirmField = false,
}) => {
    // Calculate password strength based on validation criteria
    const calculateStrength = () => {
        if (!passwordValidation) return 0;
        const metCriteria = [
            passwordValidation.hasLength,
            passwordValidation.hasLower,
            passwordValidation.hasCapital,
            passwordValidation.hasNumber,
            passwordValidation.hasSpecial,
        ].filter(Boolean).length;

        // Map number of met criteria (0-5) to strength level (0-4)
        if (metCriteria === 0) return 0;
        if (metCriteria <= 2) return 1;
        if (metCriteria === 3) return 2;
        if (metCriteria === 4) return 3;
        return 4; // all 5 criteria met
    };

    // Determine strength level and colors
    const getStrengthDisplay = () => {
        const levels = [
            { label: "TOO WEAK", color: "#EE4B2B", bgColor: "#3f2a2a", percentage: 0 },
            { label: "WEAK", color: "#ffb4ab", bgColor: "#3f3a2a", percentage: 25 },
            { label: "FAIR", color: "#fda866", bgColor: "#3f3f2a", percentage: 50 },
            { label: "STRONG", color: "#fad100", bgColor: "#2a3f2a", percentage: 75 },
            { label: "VERY STRONG", color: "#5cb85c", bgColor: "#2a3f2a", percentage: 100 },
        ];
        const strength = calculateStrength();
        return levels[strength] || levels[0];
    };
    return (
        <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full bg-[#0d0d1a] border-b-2 p-3 font-body text-sm placeholder:opacity-30 focus:ring-0 transition-colors outline-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isConfirmField && passwordMismatch
                            ? "border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]"
                            : "border-[#3d484d] text-[#4cc9f0] focus:border-[#4cc9f0]"
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    disabled={disabled}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        showPassword ? "text-[#4cc9f0]" : "text-[#3d484d]"
                    } hover:text-[#4cc9f0]`}
                >
                    <span className="material-symbols-outlined text-sm">
                        {showPassword ? "visibility_off" : "visibility"}
                    </span>
                </button>
            </div>

            {isConfirmField && passwordMismatch && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#ffb4ab] font-bold">
                    Passwords do not match
                </p>
            )}

            {/* Show validation criteria only for main password field */}
            {!isConfirmField && passwordValidation && value.length > 0 && (
                <div className="mt-3 space-y-3">
                    {/* Strength Indicator Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-[#4cc9f0] font-bold uppercase tracking-widest">
                                Strength:
                            </p>
                            <span
                                className="text-[10px] font-bold"
                                style={{ color: getStrengthDisplay().color }}
                            >
                                {getStrengthDisplay().label}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#0d0d1a] border border-[#2a2a4e] overflow-hidden">
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${getStrengthDisplay().percentage}%`,
                                    backgroundColor: getStrengthDisplay().color,
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Requirements Box */}
                    <div className="p-3 bg-[#1a1a28] border border-[#2a2a4e]">
                        <p className="text-[10px] text-[#4cc9f0] font-bold mb-2 uppercase tracking-widest">
                            Requirements:
                        </p>
                        <div className="space-y-1">
                            <CriteriaCheckbox
                                met={passwordValidation.hasLength}
                                label="At least 8 characters"
                            />
                            <CriteriaCheckbox
                                met={passwordValidation.hasLower}
                                label="Contains lowercase letter (a-z)"
                            />
                            <CriteriaCheckbox
                                met={passwordValidation.hasCapital}
                                label="Contains uppercase letter (A-Z)"
                            />
                            <CriteriaCheckbox
                                met={passwordValidation.hasNumber}
                                label="Contains number (0-9)"
                            />
                            <CriteriaCheckbox
                                met={passwordValidation.hasSpecial}
                                label="Contains special char (@$!%*?&)"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswordField;