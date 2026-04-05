/**
 * Custom hook for login page logic
 * Manages form state, validation, lockout mechanism, and navigation
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
                text: `Account locked due to too many failed attempts. Try again in ${lockoutCountdown}s.`,
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
                // Call login service
                const response = await loginService.attemptLogin(formData);

                // Check if successful
                if (response.data && response.data.data) {
                    setFailedAttempts(0);
                    setIsLocked(false);
                    setMessage({
                        type: "success",
                        text: "Login successful! Redirecting...",
                    });
                    // Redirect to game lobby after 2 seconds
                    setTimeout(() => {
                        navigate("/lobby");
                    }, 2000);
                }
            } catch (error) {
                console.error("Login error:", error);

                // Handle specific error codes
                if (error.statusCode === 403) {
                    // Account locked
                    setIsLocked(true);
                    setLockoutCountdown(60);
                } else if (error.statusCode === 401) {
                    // Invalid credentials
                    setFailedAttempts((prev) => prev + 1);
                }

                setMessage({
                    type: "error",
                    text: error.message || "Login failed. Please try again.",
                });
            } finally {
                setLoading(false);
            }
        },
        [isLocked, formData, navigate]
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
        
        // Handlers
        handleSubmit,
        handleGuestLogin,
        handleRegisterNav,
    };
};
