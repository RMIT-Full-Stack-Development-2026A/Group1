// Change Password Modal - Allows players to change their password
import React, { useState, useEffect } from "react";
import { PasswordField } from "@/components/reusable/FormFields";
import {
  validatePassword,
  isPasswordValid,
  passwordsMatch,
} from "@/utils/formValidation";

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [validations, setValidations] = useState({
    passwordValidation: {
      hasLength: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
      hasCapital: false,
    },
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setValidations({
        passwordValidation: {
          hasLength: false,
          hasLower: false,
          hasNumber: false,
          hasSpecial: false,
          hasCapital: false,
        },
      });
      setSaveError("");
      setSaveSuccess(false);
      setShowOldPassword(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordMismatch(false);
    }
  }, [isOpen]);

  // Auto-close modal after successful password change
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, onClose]);

  // Reusable criteria checkbox component
  const CriteriaCheckbox = ({ met, label }) => (
    <div className="flex items-center gap-2 text-[10px] uppercase font-mono">
      <span
        className={`w-4 h-4 flex items-center justify-center border ${
          met ? "bg-[#5cb85c] border-[#5cb85c]" : "bg-[#ffb4ab] border-[#ffb4ab]"
        }`}
      >
        {met ? (
          <span className="text-[#0d0d1a] font-bold">✓</span>
        ) : (
          <span className="text-[#0d0d1a] font-bold">✗</span>
        )}
      </span>
      <span className={met ? "text-[#5cb85c]" : "text-[#ffb4ab]"}>{label}</span>
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation for password strength only
    if (name === "newPassword") {
      setValidations((prev) => ({
        ...prev,
        passwordValidation: validatePassword(value),
      }));
    }
    // Clear error message when typing
    if (saveError) {
      setSaveError("");
    }
  };

  const handleSave = async () => {
    setSaveError("");

    // Validate all required fields
    if (!formData.oldPassword) {
      setSaveError("Please enter your current password.");
      return;
    }

    if (!formData.newPassword) {
      setSaveError("Please enter a new password.");
      return;
    }

    if (!formData.confirmNewPassword) {
      setSaveError("Please confirm your new password.");
      return;
    }

    if (!isPasswordValid(validations.passwordValidation)) {
      setSaveError("New password does not meet the requirements.");
      return;
    }

    // Check password match only on submit
    if (!passwordsMatch(formData.newPassword, formData.confirmNewPassword)) {
      setPasswordMismatch(true);
      setSaveError("Passwords do not match. Please check and try again.");
      return;
    }

    // Call parent handler with correct field names matching backend requirements
    const updateData = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmNewPassword,
    };

    try {
      const result = await onSave(updateData);
      if (result) {
        setSaveSuccess(true);
      } else {
        setSaveError("Failed to change password. Please try again or contact support.");
      }
    } catch (error) {
      setSaveError(error.message || "Failed to change password. Please try again or contact support.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-[#2a2a4e] w-full max-w-[500px] max-h-[90vh] shadow-[4px_4px_0px_0px_#343342] relative flex flex-col">
        {/* Terminal Header Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#4cc9f0]"></div>

        {/* Title */}
        <div className="mb-2 p-8 pb-0 flex-shrink-0">
          <h2 className="font-headline text-lg text-[#e3e0f4] tracking-tighter uppercase">
            CHANGE PASSWORD
          </h2>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mx-8 mb-4 p-3 bg-[#5cb85c]/20 border border-[#5cb85c] text-[#5cb85c] text-xs rounded flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Password changed successfully! Closing...
          </div>
        )}

        {/* Error Message */}
        {saveError && (
          <div className="mx-8 mb-4 p-3 bg-[#ffb4ab]/20 border border-[#ffb4ab] text-[#ffb4ab] text-xs rounded">
            {saveError}
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto flex-1 px-8">
          {/* Form */}
          <form
            className="space-y-6 pb-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Current Password Field */}
            <div className="space-y-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  disabled={isSaving}
                  autoComplete="off"
                  className="w-full bg-[#0d0d1a] border-b-2 border-[#3d484d] focus:border-[#4cc9f0] text-[#4cc9f0] p-3 font-body text-sm placeholder:opacity-30 focus:ring-0 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={isSaving}
                  className={`absolute right-3 top-3 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    showOldPassword ? "text-[#4cc9f0]" : "text-[#3d484d]"
                  } hover:text-[#4cc9f0]`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {showOldPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <PasswordField
                value={formData.newPassword}
                onChange={handleInputChange}
                name="newPassword"
                label="New Password"
                showPassword={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
                passwordValidation={validations.passwordValidation}
                CriteriaCheckbox={CriteriaCheckbox}
                disabled={isSaving}
                placeholder="Enter your new password"
              />
            </div>

            {/* Confirm New Password Field */}
            {isPasswordValid(validations.passwordValidation) && (
              <PasswordField
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
                name="confirmNewPassword"
                label="Verify New Password"
                showPassword={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                passwordMismatch={passwordMismatch}
                CriteriaCheckbox={CriteriaCheckbox}
                disabled={isSaving}
                isConfirmField={true}
              />
            )}
          </form>
        </div>

        {/* Sticky Footer with Buttons */}
        <div className="border-t border-[#2a2a4e] p-8 pt-4 flex gap-3 justify-end flex-shrink-0 bg-[#1a1a2e]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || saveSuccess}
            className="px-4 py-2 border border-outline text-xs uppercase font-bold tracking-widest hover:bg-surface-container-highest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={isSaving || saveSuccess}
            onClick={handleSave}
            className="px-6 py-2 bg-[#4cc9f0] text-[#0d0d1a] text-xs uppercase font-bold tracking-widest hover:bg-[#5dd9ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveSuccess ? "✓ SUCCESS" : isSaving ? "CHANGING..." : "CHANGE PASSWORD"}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-0 right-0 text-[#4cc9f0] hover:text-opacity-75 p-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
}
