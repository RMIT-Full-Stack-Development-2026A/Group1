import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/AuthStore";
import { loginService } from "../service/login.service";

export const useLogin = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Lockout state
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutCountdown, setLockoutCountdown] = useState(0);

    // Auto-lock when failedAttempts reaches 5
    useEffect(() => {
        if (failedAttempts === 5 && !isLocked) {
            setIsLocked(true);
            setLockoutCountdown(60);
        }
    }, [failedAttempts, isLocked]);

    // Countdown timer for lockout
    useEffect(() => {
        let interval;
        if (lockoutCountdown > 0) {
            interval = setInterval(() => {
                setLockoutCountdown((prev) => prev - 1);
            }, 1000);
        } else if (lockoutCountdown === 0 && isLocked) {
            // Countdown finished, reset lockout
            setIsLocked(false);
            setFailedAttempts(0);
            setMessage({ type: "", text: "" });
        }
        return () => clearInterval(interval);
    }, [lockoutCountdown, isLocked]);

    // Update error message with countdown
    useEffect(() => {
        if (isLocked && lockoutCountdown > 0) {
            setMessage({
                type: "error",
                text: `Account locked due to too many failed attempts. Try again in ${lockoutCountdown} seconds.`,
            });
        }
    }, [lockoutCountdown, isLocked]);

    // Handle input change
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // Toggle password visibility
    const toggleShowPassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            // Don't allow submission if locked
            if (isLocked) {
                return;
            }

            setLoading(true);
            setMessage({ type: "", text: "" });

            try {
                // Create LoginRequest DTO for validation
                const { LoginRequest } = await import("@/pages/Guest/Login/model/auth.js");
                const loginRequest = new LoginRequest(formData);
                const validation = loginRequest.validate();
                if (!validation.valid) {
                    throw new Error(validation.errors.join(", "));
                }

                // Call AuthStore.login() which updates auth state and saves JWT
                const response = await useAuthStore.getState().login(formData);

                // TODO: Backend needs to implement /auth/clear-failed-attempts endpoint
                // Uncomment the following code once backend endpoint is ready:
                // const { authService } = await import("@/services/auth/auth.service");
                // await authService.clearFailedAttempts();

                // Show success message before redirect
                setMessage({
                    type: "success",
                    text: "Login successful! Redirecting to lobby...",
                });

                // Clear failed attempts and lockout
                setFailedAttempts(0);
                setIsLocked(false);
                // Redirect is handled by login page's useEffect when auth state updates

            } catch (error) {
                // Handle specific error codes
                if (error.response?.status === 403) {
                    // Account locked by backend
                    setIsLocked(true);
                    setLockoutCountdown(60);
                    setMessage({
                        type: "error",
                        text: "Account locked due to too many failed attempts.",
                    });
                } else if (error.response?.status === 401) {
                    // Invalid credentials
                    // Use backend attempt count if available, otherwise increment local
                    const backendAttempts = error.response?.data?.loginAttempts;
                    const newAttempts = backendAttempts !== undefined ? backendAttempts : failedAttempts + 1;
                    
                    setFailedAttempts(newAttempts);
                    
                    if (newAttempts >= 5) {
                        setIsLocked(true);
                        setLockoutCountdown(60);
                        setMessage({
                            type: "error",
                            text: "ACCOUNT LOCKED: 5 failed attempts. Try again in 60 seconds.",
                        });
                    } else {
                        const attemptsRemaining = 5 - newAttempts;
                        setMessage({
                            type: "error",
                            text: `Invalid credentials. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining before lockout.`,
                        });
                    }
                } else {
                    setMessage({
                        type: "error",
                        text: error.message || "Login failed. Please try again.",
                    });
                }
            } finally {
                setLoading(false);
            }
        },
        [isLocked, failedAttempts, formData, navigate]
    );

    // Handle guest login
    const handleGuestLogin = useCallback(() => {
        navigate("/play");
    }, [navigate]);

    // Handle register navigation
    const handleRegisterNav = useCallback(() => {
        navigate("/register");
    }, [navigate]);

    return {
        // Form state
        formData,
        handleInputChange,
        
        // Password visibility
        showPassword,
        toggleShowPassword,
        
        // UI state
        loading,
        message,
        
        // Lockout state
        failedAttempts,
        isLocked,
        lockoutCountdown,
        attemptsRemaining: Math.max(0, 5 - failedAttempts),
        
        // Handlers
        handleSubmit,
        handleGuestLogin,
        handleRegisterNav,
    };
};
