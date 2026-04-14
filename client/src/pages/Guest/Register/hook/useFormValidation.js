import { useState } from "react";
import {
    validateEmail,
    validateUsername,
    validatePassword,
    passwordsMatch,
} from "../utils/validationUtils";

/**
 * Custom hook for managing form validation state
 * Handles email, username, password validation and password strength
 * 
 * @returns {Object} - { formData, setFormData, validation states, handlers, etc. }
 */
export const useFormValidation = (initialData = {}) => {
    // Default form structure
    const defaultFormData = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        country: "Vietnam",
        ...initialData,
    };

    // Form data state
    const [formData, setFormData] = useState(defaultFormData);

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Validation states
    const [emailValidation, setEmailValidation] = useState({
        hasAt: false,
        hasDot: false,
        validLength: false,
        noProhibited: false,
    });

    const [usernameValidation, setUsernameValidation] = useState({
        validChars: false,
        validLength: false,
    });

    const [passwordValidation, setPasswordValidation] = useState({
        hasLength: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        hasCapital: false,
    });

    const [passwordMismatch, setPasswordMismatch] = useState(false);

    // Validation handlers
    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++; // Minimum 8 chars
        if (/[a-z]/.test(password)) strength++; // Must have lowercase
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++; // Specific special chars
        setPasswordStrength(Math.min(strength - 1, 4)); // Normalize to 0-4
    };

    const handleEmailChange = (email) => {
        setEmailValidation(validateEmail(email));
    };

    const handleUsernameChange = (username) => {
        setUsernameValidation(validateUsername(username));
    };

    const handlePasswordChange = (password) => {
        calculatePasswordStrength(password);
        setPasswordValidation(validatePassword(password));
    };

    // Main input change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Clear error messages when user starts typing
        if (message.type === "error") {
            setMessage({ type: "", text: "" });
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Validate specific fields
        if (name === "email") {
            handleEmailChange(value);
        } else if (name === "username") {
            handleUsernameChange(value);
        } else if (name === "password") {
            handlePasswordChange(value);
        }

        // Check password match for both password fields
        if (name === "confirmPassword" || name === "password") {
            const pwd = name === "password" ? value : formData.password;
            const confirm = name === "confirmPassword" ? value : formData.confirmPassword;
            setPasswordMismatch(!passwordsMatch(pwd, confirm));
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData(defaultFormData);
        setEmailValidation({
            hasAt: false,
            hasDot: false,
            validLength: false,
            noProhibited: false,
        });
        setUsernameValidation({ validChars: false });
        setPasswordValidation({
            hasLength: false,
            hasNumber: false,
            hasSpecial: false,
            hasCapital: false,
        });
        setPasswordMismatch(false);
        setPasswordStrength(0);
        setMessage({ type: "", text: "" });
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    // Clear message
    const clearMessage = () => {
        setMessage({ type: "", text: "" });
    };

    return {
        // Form data
        formData,
        setFormData,

        // UI states
        loading,
        setLoading,
        message,
        setMessage,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        passwordStrength,

        // Validation states
        emailValidation,
        usernameValidation,
        passwordValidation,
        passwordMismatch,

        // Handlers
        handleInputChange,
        handleEmailChange,
        handleUsernameChange,
        handlePasswordChange,

        // Utilities
        resetForm,
        clearMessage,
    };
};
