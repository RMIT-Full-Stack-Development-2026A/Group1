import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/AuthStore";
import { loginService } from "../service/login.service";
import { notifySuccess } from "@/utils/toast.util";

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

    // ── Per-identifier lockout helpers (scoped localStorage keys) ──
    const getLockStorageKey = (identifier) => {
        const normalized = (identifier || "").trim().toLowerCase();
        return normalized ? `login_lock_${normalized}` : null;
    };

    const getLockoutState = (identifier) => {
        const key = getLockStorageKey(identifier);
        if (!key) return { failedAttempts: 0, isLocked: false, lockoutCountdown: 0 };
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (!data) return { failedAttempts: 0, isLocked: false, lockoutCountdown: 0 };
            const isStillLocked = data.lockUntil && new Date(data.lockUntil) > new Date();
            if (!isStillLocked) {
                localStorage.removeItem(key);
                return { failedAttempts: 0, isLocked: false, lockoutCountdown: 0 };
            }
            const remaining = Math.ceil((new Date(data.lockUntil) - new Date()) / 1000);
            return { failedAttempts: data.failedAttempts || 0, isLocked: true, lockoutCountdown: remaining > 0 ? remaining : 0 };
        } catch {
            return { failedAttempts: 0, isLocked: false, lockoutCountdown: 0 };
        }
    };

    const persistLockoutState = (identifier, failedAttempts, lockUntil) => {
        const key = getLockStorageKey(identifier);
        if (!key) return;
        if (lockUntil) {
            localStorage.setItem(key, JSON.stringify({ failedAttempts, lockUntil: lockUntil.toISOString() }));
        } else {
            localStorage.removeItem(key);
        }
    };

    // Lockout state — derived from the current identifier in the form
    const [lockState, setLockState] = useState(() => getLockoutState(formData.email));
    const { failedAttempts, isLocked, lockoutCountdown } = lockState;

    // Recalculate lockout state whenever the identifier changes
    useEffect(() => {
        setLockState(getLockoutState(formData.email));
    }, [formData.email]);

    // Countdown timer for lockout (ticks every second)
    useEffect(() => {
        if (lockoutCountdown <= 0) return;
        const interval = setInterval(() => {
            setLockState((prev) => {
                if (prev.lockoutCountdown <= 1) {
                    persistLockoutState(formData.email, 0, null);
                    setMessage({ type: "", text: "" });
                    return { failedAttempts: 0, isLocked: false, lockoutCountdown: 0 };
                }
                return { ...prev, lockoutCountdown: prev.lockoutCountdown - 1 };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [lockoutCountdown, formData.email]);

    // Update error message with countdown
    useEffect(() => {
        if (isLocked && lockoutCountdown > 0) {
            setMessage({
                type: "error",
                text: `Too many failed attempts for this account. Try again in ${lockoutCountdown} seconds.`,
            });
        }
    }, [lockoutCountdown, isLocked]);

    // Auto-dismiss transient auth notifications, but keep the lockout countdown visible
    useEffect(() => {
        if (!message.text) return;

        const isLockoutCountdownMessage =
            isLocked && lockoutCountdown > 0 && message.text.includes("Too many failed attempts for this account");

        if (isLockoutCountdownMessage) return;

        const timeoutId = setTimeout(() => {
            setMessage({ type: "", text: "" });
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, [message.text, isLocked, lockoutCountdown]);

    // Handle input change
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        if (message.text) {
            setMessage({ type: "", text: "" });
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, [message.text]);

    // Toggle password visibility
    const toggleShowPassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            const currentIdentifier = formData.email;

            // Don't allow submission if this account is locked
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

                // Show success message before redirect
                notifySuccess("Welcome back! Redirecting...");
                setMessage({
                    type: "success",
                    text: "Login successful! Redirecting to lobby...",
                });

                // Clear failed attempts and lockout for this identifier
                persistLockoutState(currentIdentifier, 0, null);
                setLockState({ failedAttempts: 0, isLocked: false, lockoutCountdown: 0 });
                // Redirect is handled by login page's useEffect when auth state updates

            } catch (error) {
                const errorCode = error.response?.data?.error;
                const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";

                if (error.response?.status === 403 && errorCode === "ACCOUNT_DEACTIVATED") {
                    setMessage({
                        type: "error",
                        text: errorMessage,
                    });
                } else if (error.response?.status === 403) {
                    // Account locked by backend — sync client lock for this identifier
                    const lockUntil = new Date(Date.now() + 60 * 1000);
                    persistLockoutState(currentIdentifier, 5, lockUntil);
                    setLockState({ failedAttempts: 5, isLocked: true, lockoutCountdown: 60 });

                    setMessage({
                        type: "error",
                        text: errorMessage || "Account locked due to too many failed attempts.",
                    });
                } else if (error.response?.status === 401) {
                    // Invalid credentials — per-identifier tracking
                    const newAttempts = failedAttempts + 1;
                    if (newAttempts >= 5) {
                        const lockUntil = new Date(Date.now() + 60 * 1000);
                        persistLockoutState(currentIdentifier, newAttempts, lockUntil);
                        setLockState({ failedAttempts: newAttempts, isLocked: true, lockoutCountdown: 60 });
                        setMessage({
                            type: "error",
                            text: "LOGIN LOCKED: 5 failed attempts. Try again in 60 seconds.",
                        });
                    } else {
                        persistLockoutState(currentIdentifier, newAttempts, null);
                        setLockState((prev) => ({ ...prev, failedAttempts: newAttempts }));
                        const attemptsRemaining = 5 - newAttempts;
                        setMessage({
                            type: "error",
                            text: `Invalid credentials. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining before lockout.`,
                        });
                    }
                } else {
                    setMessage({
                        type: "error",
                        text: errorMessage,
                    });
                }
            } finally {
                setLoading(false);
            }
        },
        [isLocked, failedAttempts, formData]
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
