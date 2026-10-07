import React from "react";

/**
 * UsernameField Component
 * Reusable username input with validation criteria display
 */
const UsernameField = ({
    value,
    onChange,
    placeholder = "PLAYER_01",
    usernameValidation = { validChars: false, validLength: false },
    CriteriaCheckbox,
    disabled = false,
}) => {
    return (
        <div className="space-y-2">
            <label htmlFor="field-username" className="block text-xs tracking-[0.2em] uppercase text-[#879398] font-semibold">
                Username
            </label>
            <input
                id="field-username"
                type="text"
                name="username"
                autoComplete="username"
                spellCheck={false}
                autoCapitalize="none"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body text-sm placeholder:text-[#879398] focus:ring-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc9f0] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {value.length > 0 && (
                <div className="mt-3 p-3 bg-[#1a1a28] border border-[#2a2a4e]">
                    <p className="text-xs text-[#4cc9f0] font-bold mb-2 uppercase tracking-widest">
                        Requirements:
                    </p>
                    <div className="space-y-1">
                        <CriteriaCheckbox
                            met={usernameValidation.validLength}
                            label="At least 6 characters"
                        />
                        <CriteriaCheckbox
                            met={usernameValidation.validChars}
                            label="Only letters, numbers, underscore (_), hyphen (-)"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsernameField;