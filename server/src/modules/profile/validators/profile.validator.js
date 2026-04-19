export const validateProfileUpdate = (data) => {
    const { username, email, country, avatar } = data;
    const errors = [];

    // Validate Username 
    if (username) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        if (!usernameRegex.test(username)) {
            errors.push({
                error: "INVALID_USERNAME",
                message: "Profile update failed. Invalid username format.",
                cause: "Must be 3-30 characters, using only letters, numbers, hyphens, or underscores.",
                valid_example: "KienMinh_123"
            });
        }
    }

    // Validate Email 
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        if (!emailRegex.test(email) || email.length >= 255) {
            errors.push({
                error: "INVALID_EMAIL",
                message: "Profile update failed. Invalid email format.",
                cause: "Must be a valid email address with an '@' and '.' under 255 characters.",
                valid_example: "player@gmail.com"
            });
        }
    }

    // Validate country
    if (country != undefined) {
        if (typeof country !== 'string' || country.trim().length === 0) {
            errors.push({
                error: "INVALID_COUNTRY",
                message: "Profile update failed. Password is not strong enough.",
                cause: "Country must be provided as a valid, non-empty string.",
                valid_example: "Australia"
            });
        }
    }

    // Validate avatar URL
    if (avatar !== undefined) {
        if (typeof avatar !== 'string' || avatar.trim().length === 0) {
            errors.push({
                error: "INVALID_AVATAR",
                message: "Profile update failed. Invalid avatar format.",
                cause: "Avatar must be a non-empty string URL or Base64.",
                valid_example: "https://example.com/avatar.png"
            });
        }
    }

    return errors
};

export const validatePasswordChange = (data) => {
    const { oldPassword, newPassword, confirmPassword } = data || {};
    const errors = [];

    if (!oldPassword || !newPassword || !confirmPassword) {
        errors.push({
            field: "all",
            error: "MISSING_FIELDS",
            cause: "Old password, new password, and confirmation are all required.",
            example: "Provide oldPassword, newPassword, and confirmPassword."
        });
        return errors;
    }

    if (newPassword !== confirmPassword) {
        errors.push({
            field: "confirmPassword",
            error: "PASSWORD_MISMATCH",
            cause: "The new password and confirm password fields do not match.",
            example: "Ensure both new password fields are exactly identical."
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        errors.push({
            field: "newPassword",
            error: "WEAK_PASSWORD",
            cause: "Must be >= 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special char.",
            example: "StrongP@ssw0rd!"
        });
    }

    return errors;
};