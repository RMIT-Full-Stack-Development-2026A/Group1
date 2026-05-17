import express from 'express';
import { SubscriptionController } from '../controllers/subscription.controller.js';
import { SubscriptionValidator } from '../validators/subscription.validator.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/v1/subscription/status:
 *   get:
 *     tags: [Subscription]
 *     summary: Current premium status and expiry date
 *     responses:
 *       200:
 *         $ref: '#/components/responses/SubscriptionStatusResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get(
    '/status', 
    verifyToken, 
    SubscriptionController.getSubscriptionStatus
);

/**
 * @openapi
 * /api/v1/subscription/create-order:
 *   post:
 *     tags: [Subscription]
 *     summary: Generate PayPal payment link/order ID
 *     responses:
 *       201:
 *         description: PayPal order created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.post(
    '/create-order', 
    verifyToken, 
    SubscriptionController.createPayPalOrder
);

/**
 * @openapi
 * /api/v1/subscription/capture-order:
 *   post:
 *     tags: [Subscription]
 *     summary: Validate PayPal successful payment and activate premium
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment captured successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.post(
    '/capture-order', 
    verifyToken, 
    SubscriptionValidator.validateCaptureOrder,
    SubscriptionController.capturePayPalOrder
);

/**
 * @openapi
 * /api/v1/subscription/history:
 * get:
 * tags: [Subscription]
 * summary: Current Subscription Details
 * description: Returns the current subscription detail. Will only ever return an array with 1 item (the active transaction) or 0 items (if expired/none).
 * responses:
 * 200:
 * $ref: '#/components/responses/TransactionListResponse'
 * 401:
 * $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get(
    '/history', 
    verifyToken, 
    SubscriptionValidator.validatePagination,
    SubscriptionController.getSubscriptionHistory
);

/**
 * @openapi
 * /api/v1/subscription/paypal-events:
 *   post:
 *     tags: [Subscription]
 *     summary: Listen for PayPal async events to revoke premium (Webhook)
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully
 */
router.post(
    '/paypal-events', 
    SubscriptionController.handlePayPalWebhook
);

export default router;