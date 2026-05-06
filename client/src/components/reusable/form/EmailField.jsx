import React from "react";

/**
 * EmailField Component
 * Reusable email input with real-time validation criteria display
 */
const EmailField = ({
    value,
    onChange,
    placeholder = "player@gmail.com",
    emailValidation = { hasAt: false, hasDot: false, validLength: false, noProhibited: false },
    CriteriaCheckbox,
    disabled = false,
}) => {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                Email Address
            </label>
            <input
                type="email"
                name="email"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body text-sm placeholder:opacity-30 focus:ring-0 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {value.length > 0 && (
                <div className="mt-3 p-3 bg-[#1a1a28] border border-[#2a2a4e]">
                    <p className="text-[10px] text-[#4cc9f0] font-bold mb-2 uppercase tracking-widest">
                        Requirements:
                    </p>
                    <div className="space-y-1">
                        <CriteriaCheckbox
                            met={emailValidation.hasAt}
                            label="Contains exactly one '@' symbol"
                        />
                        <CriteriaCheckbox
                            met={emailValidation.hasDot}
                            label="Has '.' after '@' symbol"
                        />
                        <CriteriaCheckbox
                            met={emailValidation.validLength}
                            label="Less than 255 characters"
                        />
                        <CriteriaCheckbox
                            met={emailValidation.noProhibited}
                            label="No spaces or prohibited chars ( ) ; :"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailField;