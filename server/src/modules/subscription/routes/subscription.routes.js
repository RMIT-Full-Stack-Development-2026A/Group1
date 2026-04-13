import express from "express";

const subscriptionRoutes = express.Router();

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
// subscriptionRoutes.get('/status');

/**
 * @openapi
 * /api/v1/subscription/subscribe:
 *   post:
 *     tags: [Subscription]
 *     summary: Purchase one month of premium using wallet balance
 *     responses:
 *       200:
 *         $ref: '#/components/responses/SubscriptionStatusResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
// subscriptionRoutes.post('/subscribe');

/**
 * @openapi
 * /api/v1/subscription/history:
 *   get:
 *     tags: [Subscription]
 *     summary: Subscription payment history (SUBSCRIPTION-type transactions)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TransactionListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
// subscriptionRoutes.get('/history')