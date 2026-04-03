export const notFoundHandler = (req, res, next) => {
    return res.status(404).json({
        error: "NOT_FOUND",
        message: "The requested resource was not found.",
        cause: `No route matches ${req.method} ${req.originalUrl}.`,
        valid_example: "Use a valid API endpoint and HTTP method defined in ENDPOINTS.md."
    });
};

const mapKnownError = (error) => {
    if (!error) {
        return {
            statusCode: 500,
            error: "SERVER_ERROR",
            message: "An unexpected server error occurred.",
            cause: "Unexpected internal exception during request processing.",
            valid_example: "Check request path, payload, authentication, and permissions."
        };
    }

    // Custom application/service errors thrown intentionally by the codebase
    if (error.statusCode || error.error) {
        return {
            statusCode: error.statusCode || 500,
            error: error.error || "SERVER_ERROR",
            message: error.message || "An unexpected server error occurred.",
            cause: error.statusCode === 500
                ? "Unexpected internal exception during request processing."
                : (error.cause || "Request processing failed."),
            valid_example: error.valid_example || "Check request path, payload, authentication, and permissions."
        };
    }

    // Mongoose validation errors
    if (error.name === "ValidationError") {
        const details = Object.values(error.errors || {})
            .map((item) => item.message)
            .join("; ");

        return {
            statusCode: 400,
            error: "VALIDATION_ERROR",
            message: "Validation failed for the submitted data.",
            cause: details || "One or more fields contain invalid values.",
            valid_example: "Ensure required fields are provided and respect the schema rules, for example unique email, valid username, and supported board size."
        };
    }

    // Mongoose duplicate key errors 
    if (error.code === 11000) {
        const duplicatedFields = Object.keys(error.keyPattern || error.keyValue || {});
        const fieldList = duplicatedFields.length > 0 ? duplicatedFields.join(", ") : "unique field";

        return {
            statusCode: 409,
            error: "CONFLICT",
            message: "A resource with the same unique field already exists.",
            cause: `Duplicate value detected for: ${fieldList}.`,
            valid_example: "Use a different username, email, sessionNumber, or roomNumber before retrying."
        };
    }

    // Invalid ObjectId or malformed route parameter
    if (error.name === "CastError") {
        return {
            statusCode: 400,
            error: "INVALID_IDENTIFIER",
            message: "The provided resource identifier is invalid.",
            cause: `Field '${error.path}' received an invalid value '${error.value}'.`,
            valid_example: "Use a valid MongoDB ObjectId when requesting a user, room, or game resource by id."
        };
    }

    // JSON body parse error from express.json()
    if (error.type === "entity.parse.failed") {
        return {
            statusCode: 400,
            error: "INVALID_JSON",
            message: "Request body contains invalid JSON.",
            cause: "The server could not parse the incoming JSON payload.",
            valid_example: "Send a syntactically valid JSON body, for example { \"email\": \"user@example.com\", \"password\": \"StrongPass123!\" }."
        };
    }

    // Payload too large  (for large request bodies)
    if (error.status === 413 || error.statusCode === 413) {
        return {
            statusCode: 413,
            error: "PAYLOAD_TOO_LARGE",
            message: "The uploaded payload is too large.",
            cause: "The request body or uploaded file exceeded the allowed size limit.",
            valid_example: "For avatar uploads, use a JPG, PNG, or WEBP image within the configured size limit."
        };
    }

    return {
        statusCode: 500,
        error: "SERVER_ERROR",
        message: "An unexpected server error occurred.",
        cause: "Unexpected internal exception during request processing.",
        valid_example: "Check server logs for technical details and verify the request data."
    };
};

export const errorMiddleware = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error("Error in errorMiddleware", error);

    const normalizedError = mapKnownError(error);

    return res.status(normalizedError.statusCode).json({
        error: normalizedError.error,
        message: normalizedError.message,
        cause: normalizedError.cause,
        valid_example: normalizedError.valid_example
    });
};