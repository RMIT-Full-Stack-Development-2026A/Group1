import rateLimit from "express-rate-limit";

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

export const authRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: createRateLimitHandler({
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many authentication attempts. Please try again later.",
        cause: "More than 5 failed authentication requests were sent within 60 seconds from this client.",
        valid_example: "Wait 60 seconds before trying to log in again with valid credentials."
    })
});

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