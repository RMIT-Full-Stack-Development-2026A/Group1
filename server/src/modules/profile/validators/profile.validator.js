export const validateProfileUpdate = (data) => {
    const { username, email, country } = data;
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

    // Check country
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

    return errors
};