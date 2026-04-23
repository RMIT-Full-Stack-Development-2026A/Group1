export const SubscriptionValidator = {
    validateCaptureOrder: (req, res, next) => {
        const { orderId } = req.body;
        
        if (!orderId || typeof orderId !== 'string') {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Valid Order ID is required to capture payment.",
                cause: "Missing or invalid orderId in request body.",
                valid_example: "{\"orderId\": \"PAYPAL_ORDER_123\"}"
            });
        }
        next();
    },

    validatePagination: (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        if (req.query.page && (isNaN(page) || page < 1)) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Page must be a positive integer." });
        }
        if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "Limit must be between 1 and 100." });
        }
        
        req.query.page = page || 1;
        req.query.limit = limit || 20;
        next();
    }
};