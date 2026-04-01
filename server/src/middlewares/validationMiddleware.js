export const validateProfileUpdate = (req, res, next) => {
    const { username, email, password } = req.body;

    // 1. Validate Username 
    if (username) {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                error: "INVALID_USERNAME_FORMAT",
                message: "Profile update failed. Invalid username format.",
                cause: "Username can only contain English letters, numbers, underscores (_), and hyphens (-). Spaces are not allowed.",
                valid_example: "KienMinh_123"
            });
        }
    }

    // 2. Validate Email 
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        if (!emailRegex.test(email) || email.length >= 255) {
            return res.status(400).json({
                error: "INVALID_EMAIL_FORMAT",
                message: "Profile update failed. Invalid email format.",
                cause: "Email must contain exactly one '@' symbol, a dot ('.') after '@', be under 255 characters, and contain no spaces.",
                valid_example: "kienminhmou@gmail.com"
            });
        }
    }

    // 3. Validate Password ( >= 8 chars, 1 number, 1 special char, 1 capital letter)
    if (password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[$#@!%*?&])[A-Za-z\d$#@!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: "WEAK_PASSWORD",
                message: "Profile update failed. Password is not strong enough.",
                cause: "Password must be at least 8 characters long, including at least 1 uppercase letter, 1 number, and 1 special character (e.g., $#@!).",
                valid_example: "TictacToang@2026!"
            });
        }
    }

    // Proceed to controller if all validations pass
    next();
};