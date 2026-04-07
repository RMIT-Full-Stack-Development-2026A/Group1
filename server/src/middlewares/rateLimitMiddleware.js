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