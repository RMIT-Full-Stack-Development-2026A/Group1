import { SubscriptionService } from '../services/subscription.service.js';

export const SubscriptionController = {
    getSubscriptionStatus: async (req, res, next) => {
        try {
            const status = await SubscriptionService.getStatus(req.user.id);
            res.status(200).json({
                data: status,
                message: "Fetched subscription status successfully."
            });
        } catch (error) {
            next(error);
        }
    },

    createPayPalOrder: async (req, res, next) => {
        try {
            const orderData = await SubscriptionService.createOrder(req.user.id);
            res.status(201).json({
                data: orderData,
                message: "PayPal order created successfully."
            });
        } catch (error) {
            next(error);
        }
    },

    capturePayPalOrder: async (req, res, next) => {
        try {
            const result = await SubscriptionService.captureOrder(req.user.id, req.body.orderId);
            res.status(200).json({
                data: result,
                message: "Payment captured and premium activated successfully."
            });
        } catch (error) {
            next(error);
        }
    },

    getSubscriptionHistory: async (req, res, next) => {
        try {
            const history = await SubscriptionService.getHistory(req.user.id, req.query.page, req.query.limit);
            res.status(200).json({
                data: history,
                message: "Subscription history fetched successfully."
            });
        } catch (error) {
            next(error);
        }
    },

    handlePayPalWebhook: async (req, res, next) => {
        try {
            await SubscriptionService.processWebhook(req.body, req.headers);
            res.status(200).send('OK'); // Acknowledge to PayPal after successful processing
        } catch (error) {
            console.error('[Webhook Controller] Error processing webhook:', error);

            // Map service error codes to HTTP status codes (401, 502, 500)
            let httpStatus = 500;
            if (error.code === 'UNAUTHORIZED') {
                httpStatus = 401;
            } else if (error.code === 'WEBHOOK_VERIFICATION_FAILED') {
                httpStatus = 502; // Return 502 so PayPal can retry later
            } else if (error.statusCode) {
                // Fallback for other errors that already provide a statusCode
                httpStatus = error.statusCode; 
            }

            return res.status(httpStatus).json({
                error: error.error || 'INTERNAL_SERVER_ERROR',
                message: error.message || 'An unexpected error occurred while processing webhook.'
            });
        }
    }
};