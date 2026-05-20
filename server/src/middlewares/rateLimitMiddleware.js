import rateLimit from "express-rate-limit";

/**
 * Factory function to generate a standard custom JSON response for rate limiting.
 * * @param {Object} payload - The error payload structure.
 * @param {string} payload.error - Error code string.
 * @param {string} payload.message - User-facing error message.
 * @param {string} payload.cause - Technical cause of the error.
 * @param {string} payload.valid_example - Suggested user action.
 * @returns {Function} Express rate-limit handler function.
 */
const createRateLimitHandler = ({ error, message, cause, valid_example }) => {
    return (req, res, next, options) => {
        return res.status(options.statusCode).json({
            error,
            message,
            cause,
            valid_example
        });
    };
};

/**
 * Global rate limiter restricting requests to 100 per minute per IP.
 */
export const generalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler({
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please slow down and try again later.",
        cause: "The request frequency exceeded the allowed threshold for this API.",
        valid_example: "Reduce repeated requests, avoid rapid polling, and retry after a short delay."
    })
});