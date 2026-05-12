// Edit Profile Modal - Allows players to update email, username, and country
import React, { useState, useEffect } from "react";
import {
  EmailField,
  UsernameField,
  CountrySelect,
} from "@/components/reusable/FormFields";
import {
  validateEmail,
  validateUsername,
  isEmailValid,
  isUsernameValid,
} from "@/utils/formValidation";

export default function EditProfileModal({
  isOpen,
  playerData,
  countries,
  countriesLoading,
  onClose,
  onSave,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    country: "",
  });

  const [validations, setValidations] = useState({
    emailValidation: {
      hasAt: false,
      hasDot: false,
      validLength: false,
      noProhibited: false,
    },
    usernameValidation: { validChars: false, validLength: false },
  });

  const [saveError, setSaveError] = useState("");

  // Initialize form with player data and validate existing values
  useEffect(() => {
    if (playerData && isOpen) {
      const initialUsername = playerData.username || "";
      const initialEmail = playerData.email || "";

      setFormData({
        email: initialEmail,
        username: initialUsername,
        country: playerData.country || "",
      });

      // Set validations for existing values so they show as passing
      setValidations((prev) => ({
        ...prev,
        usernameValidation: validateUsername(initialUsername),
        emailValidation: validateEmail(initialEmail),
      }));

      setSaveError("");
    }
  }, [isOpen, playerData]);

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

    // Real-time validation
    if (name === "email") {
      setValidations((prev) => ({
        ...prev,
        emailValidation: validateEmail(value),
      }));
    } else if (name === "username") {
      setValidations((prev) => ({
        ...prev,
        usernameValidation: validateUsername(value),
      }));
    }
  };

  const handleSave = async () => {
    setSaveError("");

    // Validate changed fields
    if (formData.email !== playerData?.email) {
      if (!isEmailValid(validations.emailValidation)) {
        setSaveError("Email is invalid. Please check the requirements.");
        return;
      }
    }

    if (formData.username !== playerData?.username) {
      if (!isUsernameValid(validations.usernameValidation)) {
        setSaveError("Username is invalid. Please check the requirements.");
        return;
      }
    }

    // Call parent handler with only changed fields
    const updateData = {
      email: formData.email !== playerData?.email ? formData.email : undefined,
      username:
        formData.username !== playerData?.username
          ? formData.username
          : undefined,
      country:
        formData.country !== playerData?.country ? formData.country : undefined,
    };

    const result = await onSave(updateData);
    if (!result) {
      setSaveError(
        "Failed to save profile. Please try again or contact support."
      );
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
            EDIT PROFILE
          </h2>
        </div>

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
          {/* Username Field */}
          <UsernameField
            value={formData.username}
            onChange={handleInputChange}
            usernameValidation={validations.usernameValidation}
            CriteriaCheckbox={CriteriaCheckbox}
            disabled={isSaving}
          />

          {/* Email Field */}
          <EmailField
            value={formData.email}
            onChange={handleInputChange}
            emailValidation={validations.emailValidation}
            CriteriaCheckbox={CriteriaCheckbox}
            disabled={isSaving}
          />

          {/* Country */}
          {/* Country */}
          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#879398] font-semibold">
              Regional Sector
            </label>
            <CountrySelect
              value={formData.country}
              onChange={handleInputChange}
              disabled={isSaving || countriesLoading}
              loading={countriesLoading}
              countries={countries}
            />
          </div>
          </form>
        </div>

        {/* Sticky Footer with Buttons */}
        <div className="border-t border-[#2a2a4e] p-8 pt-4 flex gap-3 justify-end flex-shrink-0 bg-[#1a1a2e]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-outline text-xs uppercase font-bold tracking-widest hover:bg-surface-container-highest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-6 py-2 bg-[#4cc9f0] text-[#0d0d1a] text-xs uppercase font-bold tracking-widest hover:bg-[#5dd9ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 text-outline hover:text-on-surface disabled:opacity-50"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
}
