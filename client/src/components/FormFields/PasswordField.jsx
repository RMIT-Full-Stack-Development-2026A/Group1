import React from "react";

/**
 * PasswordField Component
 * Reusable password input with visibility toggle and validation criteria display
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
    CriteriaCheckbox,
    disabled = false,
    isConfirmField = false,
}) => {
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
                    className={`w-full bg-[#0d0d1a] border-b-2 p-3 font-body focus:ring-0 transition-colors outline-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    👁
                </button>
            </div>

            {/* Show validation criteria only for main password field */}
            {!isConfirmField && passwordValidation && value.length > 0 && (
                <div className="mt-3 p-3 bg-[#1a1a28] border border-[#2a2a4e]">
                    <p className="text-[10px] text-[#4cc9f0] font-bold mb-2 uppercase tracking-widest">
                        Requirements:
                    </p>
                    <div className="space-y-1">
                        <CriteriaCheckbox
                            met={passwordValidation.hasLength}
                            label="At least 8 characters"
                        />
                        <CriteriaCheckbox
                            met={passwordValidation.hasNumber}
                            label="At least 1 number (0-9)"
                        />
                        <CriteriaCheckbox
                            met={passwordValidation.hasSpecial}
                            label="At least 1 special character ($#@!)"
                        />
                        <CriteriaCheckbox
                            met={passwordValidation.hasCapital}
                            label="At least 1 capital letter"
                        />
                    </div>
                </div>
            )}

            {/* Show mismatch warning for confirm password field */}
            {isConfirmField && passwordMismatch && value.length > 0 && (
                <p className="text-[10px] text-[#ffb4ab] mt-2 font-semibold">
                    ✗ Passwords do not match
                </p>
            )}
        </div>
    );
};

export default PasswordField;
