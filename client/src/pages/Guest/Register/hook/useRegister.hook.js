/**
 * Custom hook for register page logic
 * Manages form validation, submission, and navigation
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/AuthStore";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useCountries } from "@/hooks/useCountries";
import { registerService } from "../service/register.service";

export const useRegister = () => {
    const navigate = useNavigate();
    const form = useFormValidation();
    const { countries, loading: countriesLoading, error: countriesError } = useCountries();

    // Handle form submission
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            form.setLoading(true);
            form.setMessage({ type: "", text: "" });

            try {
                // Validate form first
                const validation = registerService.validateRegisterForm(form.formData, {
                    emailValidation: form.emailValidation,
                    usernameValidation: form.usernameValidation,
                    passwordValidation: form.passwordValidation,
                });

                if (!validation.isValid) {
                    form.setMessage({
                        type: "error",
                        text: validation.errors.join("\n"),
                    });
                    form.setLoading(false);
                    return;
                }

                // Call AuthStore.register() which updates auth state and saves JWT
                await useAuthStore.getState().register(form.formData);

                form.setMessage({
                    type: "success",
                    text: "✓ Account created! Redirecting to lobby...",
                });

                // Redirect to lobby after showing success message
                setTimeout(() => {
                    navigate("/lobby");
                }, 1500);
            } catch (error) {
                console.error("Register error:", error);

                // Handle backend validation errors
                if (error.details && Array.isArray(error.details)) {
                    const errorMessages = error.details.join("\n");
                    form.setMessage({
                        type: "error",
                        text: errorMessages,
                    });
                } else {
                    form.setMessage({
                        type: "error",
                        text: error.message || "Registration failed. Please try again.",
                    });
                }
            } finally {
                form.setLoading(false);
            }
        },
        [form, navigate]
    );

    // Handle navigation to login
    const handleLoginNav = useCallback(() => {
        navigate("/login");
    }, [navigate]);

    return {
        // Form state from centralized hook
        form,
        
        // Countries data
        countries,
        countriesLoading,
        countriesError,
        
        // Handlers
        handleSubmit,
        handleLoginNav,
    };
};
