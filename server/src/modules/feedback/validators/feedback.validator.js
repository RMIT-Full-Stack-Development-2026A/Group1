const FEEDBACK_CATEGORIES = ['Bug Report', 'Feature Suggestion', 'General Feedback'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FeedbackValidator = {
    validateSubmitFeedback: (req, res, next) => {
        const { name, email, category, message } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Name is required.",
                cause: "Missing or invalid 'name' in request body.",
                valid_example: "{\"name\": \"Jane Doe\"}"
            });
        }

        if (!email || typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "A valid email is required.",
                cause: "Missing or invalid 'email' in request body.",
                valid_example: "{\"email\": \"jane@example.com\"}"
            });
        }

        if (!category || !FEEDBACK_CATEGORIES.includes(category)) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: `Category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}.`,
                cause: "Missing or invalid 'category' in request body.",
                valid_example: "{\"category\": \"Bug Report\"}"
            });
        }

        if (!message || typeof message !== 'string' || message.trim().length < 10) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Message must be at least 10 characters.",
                cause: "Missing or too-short 'message' in request body.",
                valid_example: "{\"message\": \"Found a bug when...\"}"
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Message must be under 2000 characters.",
                cause: "'message' in request body exceeds the length limit.",
                valid_example: "Shorten the message."
            });
        }

        next();
    },
};
