import { SubscriptionRepository } from '../repositories/subscription.repository.js';
import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { SubscriptionDTO } from '../dtos/subscription.dto.js';
import nodemailer from 'nodemailer';

//function to clean HTML and avoid XSS Injection (Copilot suggest)
const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
//Initialize transporter lazily to ensure env vars are loaded
let mailTransporter = null;
let isMailerWarningLogged = false; // flag to prevent repeated warnings about missing SMTP credentials

const getTransporter = () => {
    if (mailTransporter) return mailTransporter;

    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
        return mailTransporter;
    }
    // Log a warning only once if SMTP credentials are missing
    if (!isMailerWarningLogged) {
        console.warn('[WARNING] SMTP credentials missing in .env! Emails will NOT be sent.');
        isMailerWarningLogged = true;
    }
    return null;
};
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
                return_url: `${process.env.CLIENT_URL}/success`,
                cancel_url: `${process.env.CLIENT_URL}/cancel`
            }
            })
        });

        const orderData = await response.json();

        if (!response.ok || !orderData?.id) {
            throw {
                statusCode: 502,
                error: "PAYPAL_ERROR",
                message: "Failed to create PayPal order.",
                details: orderData
            };
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
        const approveLink = orderData?.links?.find((link) => link.rel === 'approve')?.href;

        if (!approveLink) {
            throw {
                statusCode: 502,
                error: "PAYPAL_ERROR",
                message: "PayPal order created without an approval link.",
                details: orderData
            };
        }

        return { orderId: orderData.id, approveLink };
    },

    // 3. Capture Payment and Activate Premium
    captureOrder: async (userId, orderId) => {
        const transaction = await SubscriptionRepository.findByExternalId(orderId);
        if (!transaction) {
            throw { statusCode: 404, error: "ORDER_NOT_FOUND", message: "Transaction record not found." };
        }
        if (transaction.userId.toString() !== userId.toString()) {
            throw {
                statusCode: 403,
                error: "ORDER_ACCESS_DENIED",
                message: "You are not allowed to capture this order."
            };
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
            await AuthInterface.setPremiumExpiry(transaction.userId, endDate);

            const user = await AuthInterface.getUserById(userId);
            
            // check if users exist
            if (!user) {
                console.error(`[CaptureOrder] CRITICAL: Payment captured but user ${userId} is missing!`);
                throw { 
                    statusCode: 404, 
                    error: "USER_DELETED_POST_PAYMENT", 
                    message: "Payment succeeded but your account data is missing. Please contact support." 
                };
            }

            SubscriptionService.sendConfirmationEmail(user.email, user.username, endDate);
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
        /**
         * TODO: In production, verify the webhook signature using PayPal SDK.
         * Real verification is skipped here for development/sandbox simplicity.
         * DO NOT rely on header presence for security in a live environment.
         */
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
                    
                    const user = await AuthInterface.getUserById(transaction.userId);
                    
                    // Prevent revoking VIP if user has a newer valid subscription
                    if (user && user.premiumExpiresAt) {
                        const userExpiry = new Date(user.premiumExpiresAt).getTime();
                        const transactionExpiry = new Date(transaction.subscriptionPeriodEnd).getTime();
                        
                        // If the user's current premium came from this transaction (or an older one)
                        if (userExpiry <= transactionExpiry) {
                            // 2. Revoke premium status from user
                            await AuthInterface.setPremiumExpiry(transaction.userId, null);
                            
                            // 3. Send email notification
                            if (user.email) {
                                SubscriptionService.sendRevokeEmail(user.email, user.username);
                            }
                            console.log(`[Webhook] Revoked premium for user ${transaction.userId} due to refund.`);
                        } else {
                            // The user has purchased a newer plan, so keep premium active
                            console.log(`[Webhook] Refund processed, but user ${transaction.userId} has a newer active subscription. VIP NOT revoked.`);
                        }
                    }
                }
        }
    }
},
    sendConfirmationEmail: async (toEmail, username, expiryDate) => {
        const transporter = getTransporter(); 
        if (!transporter) return;
        try {
            const mailOptions = {
                from: `"TicTacToang Team" <${process.env.SMTP_EMAIL}>`,
                to: toEmail,
                subject: 'Premium Activation Successful!',
                html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h2>Hello ${escapeHtml(username) || 'there'},</h2>
                        <p>Congratulations! Your account has been successfully upgraded to <b>Premium</b>.</p>
                        <p>Your subscription is valid until: <b>${expiryDate.toLocaleDateString('en-US', { timeZone: 'UTC', dateStyle: 'long' })} (UTC)</b>.</p>
                        <p>You can now enjoy all premium features of TicTacToang.</p>
                        <hr />
                        <p>If you have any questions, feel free to contact us.</p>
                        <p>Best regards,<br>The TicTacToang Femboys Team</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('[Email] Confirmation email sent successfully');
        } catch (error) {
            console.error('[Email Error] Failed to send email:', error);
        }
    },
    sendRevokeEmail: async (toEmail, username) => {
        const transporter = getTransporter(); 
        if (!transporter) return;
        try {
            const mailOptions = {
                from: `"TicTacToang Team" <${process.env.SMTP_EMAIL}>`,
                to: toEmail,
                subject: 'Premium Subscription Revoked',
                html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h2>Hello ${escapeHtml(username) || 'there'},</h2>
                        <p>Our system has detected that your payment was refunded, reversed, or otherwise canceled by PayPal.</p>
                        <p>As a result, the <b>Premium</b> benefits for this account have been revoked.</p>
                        <p>If you believe this is a mistake, please contact support.</p>
                        <hr />
                        <p>Best regards,<br>The TicTacToang Femboys Team</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('[Email] Revoke email sent successfully');
        } catch (error) {
            console.error('[Email Error] Failed to send revoke email:', error);
        }
    }
};