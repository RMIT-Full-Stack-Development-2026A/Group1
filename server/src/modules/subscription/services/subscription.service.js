import { SubscriptionRepository } from '../repositories/subscription.repository.js';
import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { SubscriptionDTO } from '../dtos/subscription.dto.js';

// Determine PayPal API Base URL based on environment
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

// Subscription configuration
const PREMIUM_PRICE = '5.00';
const PREMIUM_DURATION_DAYS = 30;

/**
 * Helper function to generate PayPal Access Token
 */
const generateAccessToken = async () => {
    try {
        if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
        const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: { Authorization: `Basic ${auth}` }
        });
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
        throw error;
    }
};

export const SubscriptionService = {
    // 1. Get current premium status
    getStatus: async (userId) => {
        const user = await AuthInterface.getUserById(userId);
        if (!user) throw { statusCode: 404, error: "USER_NOT_FOUND", message: "User not found." };
        
        return SubscriptionDTO.toStatus(user);
    },

    // 2. Generate PayPal Order
    createOrder: async (userId) => {
        const accessToken = await generateAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: { currency_code: 'USD', value: PREMIUM_PRICE }
                }],
                application_context: {
                brand_name: "Premium Subscription", 
                user_action: "PAY_NOW", 
                return_url: "http://localhost:8000/success", 
                cancel_url: "http://localhost:8000/cancel"  
            }
            })
        });

        const orderData = await response.json();
        
        if (orderData.error) {
            throw { statusCode: 500, error: "PAYPAL_ERROR", message: "Failed to create PayPal order." };
        }

        // Save pending transaction to database
        await SubscriptionRepository.createTransaction({
            userId,
            type: 'SUBSCRIPTION',
            provider: 'PAYPAL',
            amount: parseFloat(PREMIUM_PRICE),
            currency: 'USD',
            status: 'PENDING',
            externalTransactionId: orderData.id
        });

        // Extract the approval link for the frontend to redirect the user
        const approveLink = orderData.links.find(link => link.rel === 'approve')?.href;

        return { orderId: orderData.id, approveLink };
    },

    // 3. Capture Payment and Activate Premium
    captureOrder: async (userId, orderId) => {
        const transaction = await SubscriptionRepository.findByExternalId(orderId);
        if (!transaction) {
            throw { statusCode: 404, error: "ORDER_NOT_FOUND", message: "Transaction record not found." };
        }
        if (transaction.status === 'SUCCESS') {
            throw { statusCode: 400, error: "ALREADY_CAPTURED", message: "This order has already been captured." };
        }

        const accessToken = await generateAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            }
        });

        const captureData = await response.json();

        if (captureData.status === 'COMPLETED') {
            // Calculate premium dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + PREMIUM_DURATION_DAYS);

            // Update transaction to SUCCESS
            const updatedTransaction = await SubscriptionRepository.updateTransactionStatus(orderId, {
                status: 'SUCCESS',
                subscriptionPeriodStart: startDate,
                subscriptionPeriodEnd: endDate,
                metadata: captureData // Store raw PayPal response for audit
            });

            // Update user's premium expiry date in Auth module
            await AuthInterface.updatePremiumStatus(userId, endDate);

            const user = await AuthInterface.getUserById(userId);

            return SubscriptionDTO.toPurchaseResponse({ 
                isPremium: user.isPremium, 
                premiumExpiresAt: user.premiumExpiresAt, 
                transaction: updatedTransaction 
            });
        } else {
            // Handle failure scenario
            await SubscriptionRepository.updateTransactionStatus(orderId, { status: 'FAILED' });
            throw { statusCode: 400, error: "CAPTURE_FAILED", message: "Payment capture failed." };
        }
    },

    // 4. Get Transaction History
    getHistory: async (userId, page, limit) => {
        const { transactions, total } = await SubscriptionRepository.getHistoryByUserId(userId, page, limit);
        return SubscriptionDTO.toHistory(transactions, { total, page, limit });
    },

    // 5. Process Webhook (Refunds/Chargebacks)
    processWebhook: async (payload, headers) => {
        // Note: In production, verify the webhook signature here using PayPal SDK or crypto.
        // Skipping strict verification logic here for brevity, focusing on business rules.

        const eventType = payload.event_type;

        // Listen specifically for refunds or reversed payments
        if (eventType === 'PAYMENT.CAPTURE.REFUNDED' || eventType === 'PAYMENT.CAPTURE.REVERSED') {
            
            // Extract the original Order ID from the webhook payload
            // PayPal structure: resource -> supplementary_data -> related_ids -> order_id
            const orderId = payload.resource?.supplementary_data?.related_ids?.order_id;
            
            if (orderId) {
                const transaction = await SubscriptionRepository.findByExternalId(orderId);
                
                if (transaction && transaction.status === 'SUCCESS') {
                    // 1. Mark transaction as refunded
                    await SubscriptionRepository.updateTransactionStatus(orderId, { status: 'REFUNDED' });
                    
                    // 2. Revoke premium status from user (Set expiry to null or past date)
                    await AuthInterface.updatePremiumStatus(transaction.userId, null);
                    
                    console.log(`[Webhook] Revoked premium for user ${transaction.userId} due to refund.`);
                }
            }
        }
    }
};