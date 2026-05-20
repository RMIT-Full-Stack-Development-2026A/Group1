export const SubscriptionValidator = {
    /**
     * Validates capture order request payload.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     * @param {Function} next - Next middleware.
     */
    validateCaptureOrder: (req, res, next) => {
        const { orderId } = req.body;
        
        if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Valid Order ID is required to capture payment.",
                cause: "Missing or invalid orderId in request body.",
                valid_example: "{\"orderId\": \"PAYPAL_ORDER_123\"}"
            });
        }
        next();
    },

    /**
     * Validates pagination parameters.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     * @param {Function} next - Next middleware.
     */
    validatePagination: (req, res, next) => {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 20;

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({ 
                error: "VALIDATION_ERROR", 
                message: "Page must be a positive integer.",
                cause: "The 'page' query parameter must be an integer >= 1.",
                valid_example: "?page=1&limit=20"
            });
        }
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({ 
                error: "VALIDATION_ERROR", 
                message: "Limit must be between 1 and 100.",
                cause: "The 'limit' query parameter must be an integer between 1 and 100.",
                valid_example: "?page=1&limit=20"
            });
        }
        
        req.query.page = page;
        req.query.limit = limit;
        next();
    }
};