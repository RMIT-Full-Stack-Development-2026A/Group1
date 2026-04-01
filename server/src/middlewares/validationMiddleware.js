export const validateProfileUpdate = (req, res, next) => {
    const { username, email, password } = req.body;

    // 1. Validate Username (Req 1.2.3: Only English alphabets, numbers, _, -) 
    if (username) {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                error: "INVALID_USERNAME_FORMAT",
                message: "Update failed. Invalid username format.",
                cause: "Username only allows English letters, numbers, underscores (_), and hyphens (-). No spaces allowed.",
                valid_example: "KienMinh_123"
            });
        }
    }

    // 2. Validate Email (Req 1.2.2: standard formatting) 
    if (email) {
        // Regex: basic email format validation (one '@', at least one '.' after '@', no spaces, max length 255)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        if (!emailRegex.test(email) || email.length >= 255) {
            return res.status(400).json({
                error: "INVALID_EMAIL_FORMAT",
                message: "Update failed. Invalid email format.",
                cause: "Email must have exactly one '@' character, at least one '.' after '@', be less than 255 characters long, and contain no spaces.",
                valid_example: "kienminhmou@gmail.com"
            });
        }
    }

    // 3. Validate Password (Req 1.2.1: >= 8 chars, 1 number, 1 special char, 1 capital letter) 
    if (password) {
        // Regex: at least 8 characters, at least 1 uppercase letter, at least 1 digit, at least 1 special character
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[$#@!%*?&])[A-Za-z\d$#@!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: "WEAK_PASSWORD",
                message: "Update failed. Password is not strong enough.",
                cause: "Password must be at least 8 characters long, include at least 1 uppercase letter, 1 digit, and 1 special character (e.g., $#@!).",
                valid_example: "TictacToang@2026!"
            });
        }
    }

    // if pass all validations, proceed to the next middleware or controller
    next();
};