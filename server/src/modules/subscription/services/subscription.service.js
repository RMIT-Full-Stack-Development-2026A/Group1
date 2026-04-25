import { SubscriptionRepository } from '../repositories/subscription.repository.js';
import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { SubscriptionDTO } from '../dtos/subscription.dto.js';
import nodemailer from 'nodemailer';

// Function to clean HTML and avoid XSS injection
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

    // Support generic SMTP configuration instead of hardcoding Gmail
    const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (smtpUser && smtpPassword) {
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = Number(process.env.SMTP_PORT || 465);
        const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;

        mailTransporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPassword
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
/**
 * Helper function to verify Webhook Signature with PayPal API
 */
const verifyPayPalWebhook = async (headers, payload) => {
    if (!process.env.PAYPAL_WEBHOOK_ID) {
        console.error('[Webhook Security] CRITICAL: PAYPAL_WEBHOOK_ID is missing in .env!');
        //Permanent misconfiguration. Throw 500 immediately instead of 502 retry.
        throw Object.assign(
            new Error("Server misconfiguration: PAYPAL_WEBHOOK_ID is missing."),
            { statusCode: 500, error: "WEBHOOK_MISCONFIGURED" }
        );
    }

    try {
        const accessToken = await generateAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                transmission_id: headers['paypal-transmission-id'],
                transmission_time: headers['paypal-transmission-time'],
                cert_url: headers['paypal-cert-url'],
                auth_algo: headers['paypal-auth-algo'],
                transmission_sig: headers['paypal-transmission-sig'],
                webhook_id: process.env.PAYPAL_WEBHOOK_ID,
                webhook_event: payload
            })
        });

        // Distinguish transient errors (429, 408, 5xx), auth/configuration issues (401/403),
        // and permanent verification failures (other 4xx).
        if (!response.ok) {
            if (response.status === 429 || response.status === 408 || response.status >= 500) {
                console.error(`[Webhook Security] PayPal API returned transient error ${response.status}. Retrying later.`);
                return 'ERROR';
            }
            if (response.status === 401 || response.status === 403) {
                console.error(
                    `[Webhook Security] PayPal API returned ${response.status}; this likely indicates invalid access token, credentials, or webhook verification permissions. Treating as server error instead of invalid webhook.`
                );
                return 'ERROR';
            }
            if (response.status >= 400 && response.status < 500) {
                console.warn(`[Webhook Security] PayPal API returned ${response.status}; treating webhook as invalid.`);
                return 'INVALID';
            }
            return 'ERROR'; // safe fallback
        }

        const data = await response.json();
        return data.verification_status === 'SUCCESS' ? 'VALID' : 'INVALID';
    } catch (error) {
        if (error?.message === "MISSING_API_CREDENTIALS") {
            console.error('[Webhook Security] CRITICAL: PayPal API credentials are missing in .env!', error);
            throw Object.assign(
                new Error("Server misconfiguration: PayPal API credentials are missing."),
                { statusCode: 500, error: "PAYPAL_API_MISCONFIGURED" }
            );
        }

        if (error?.statusCode === 500) {
            throw error;
        }
        console.error('[Webhook Security] Error verifying signature with PayPal:', error);
        return 'ERROR';
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

            // check if user exists
            if (!user) {
                console.error(`[CaptureOrder] CRITICAL: Payment captured but user ${userId} is missing!`);
                throw {
                    statusCode: 404,
                    error: "USER_DELETED_POST_PAYMENT",
                    message: "Payment succeeded but your account data is missing. Please contact support."
                };
            }

            void SubscriptionService.sendConfirmationEmail(user.email, user.username, endDate);
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
        const verificationStatus = await verifyPayPalWebhook(headers, payload);

        // Gating the bypass behind an explicit env flag for development
        const allowUnverifiedWebhookBypass =
            process.env.NODE_ENV === 'development' &&
            process.env.ALLOW_UNVERIFIED_PAYPAL_WEBHOOKS === 'true';

        // Allow bypass to cover BOTH network errors and invalid signatures for local dev
        if (verificationStatus === 'ERROR' || verificationStatus === 'INVALID') {
            if (!allowUnverifiedWebhookBypass) {
                if (verificationStatus === 'ERROR') {
                    // Throw a service-layer error without HTTP status metadata; the controller is responsible for mapping this to an HTTP response.
                    throw Object.assign(
                        new Error("Failed to verify signature with PayPal API. Please retry."),
                        { code: "WEBHOOK_VERIFICATION_FAILED", error: "WEBHOOK_VERIFICATION_FAILED" }
                    );
                }
                console.error('[Webhook Security] CRITICAL: Fake PayPal webhook payload detected and rejected!');
                throw Object.assign(
                    new Error("Invalid webhook signature"),
                    { code: "INVALID_WEBHOOK_SIGNATURE", error: "INVALID_WEBHOOK_SIGNATURE" }
                );
            }

            //  If bypass allowed (local dev)
            if (verificationStatus === 'ERROR') {
                console.warn('[Webhook Security] Signature verification could not be completed, but bypass is explicitly enabled for development via ALLOW_UNVERIFIED_PAYPAL_WEBHOOKS=true.');
            } else {
                console.warn('[Webhook Security] Signature validation failed, but bypass is explicitly enabled for development via ALLOW_UNVERIFIED_PAYPAL_WEBHOOKS=true.');
            }
        }

        const eventType = payload.event_type;

        // Listen specifically for refunds or reversed payments
        if (eventType === 'PAYMENT.CAPTURE.REFUNDED' || eventType === 'PAYMENT.CAPTURE.REVERSED') {

            // Extract the original Order ID from the webhook payload
            // PayPal structure: resource -> supplementary_data -> related_ids -> order_id
            const orderId = payload.resource?.supplementary_data?.related_ids?.order_id;

            if (orderId) {
                const transaction = await SubscriptionRepository.findByExternalId(orderId);

                if (transaction && transaction.status === 'SUCCESS') {
                    //Fetch user and process revoke FIRST before marking transaction as REFUNDED
                    const user = await AuthInterface.getUserById(transaction.userId);
                    
                    // Prevent revoking premium if user has a newer valid subscription
                    if (user && user.premiumExpiresAt) {
                        const userExpiry = new Date(user.premiumExpiresAt).getTime();
                        
                        //Guard against missing/null subscriptionPeriodEnd
                        const rawTransactionExpiry = transaction.subscriptionPeriodEnd;
                        const transactionExpiry = rawTransactionExpiry ? new Date(rawTransactionExpiry).getTime() : NaN;
                        
                        // If the date data is invalid/missing, the safest fallback is to revoke premium
                        if (!Number.isFinite(transactionExpiry)) {
                            console.warn(`[Webhook] Missing or invalid subscriptionPeriodEnd for refunded transaction ${orderId}. Revoking premium as a safe fallback.`);
                            await AuthInterface.setPremiumExpiry(transaction.userId, null);
                            if (user.email) {
                                void SubscriptionService.sendRevokeEmail(user.email, user.username);
                            }
                            console.log(`[Webhook] Revoked premium for user ${transaction.userId} due to refund (Fallback).`);
                        } 
                        // If date data is valid, compare expiration timestamps as normal
                        else if (userExpiry <= transactionExpiry) {
                            // 2. Revoke premium status from user
                            await AuthInterface.setPremiumExpiry(transaction.userId, null);
                            
                            // 3. Send email notification
                            if (user.email) {
                                void SubscriptionService.sendRevokeEmail(user.email, user.username);
                            }
                            console.log(`[Webhook] Revoked premium for user ${transaction.userId} due to refund.`);
                        } 
                        // If premium came from a newer transaction, keep premium active
                        else {
                            console.log(`[Webhook] Refund processed, but user ${transaction.userId} has a newer active subscription. Premium not revoked.`);
                        }
                    }

                    //1. Mark transaction as refunded (MOVED TO BOTTOM FOR SAFETY/IDEMPOTENCY)
                    await SubscriptionRepository.updateTransactionStatus(orderId, { status: 'REFUNDED' });
                }
            }
        }
    },
    sendConfirmationEmail: async (toEmail, username, expiryDate) => {
        const transporter = getTransporter();
        if (!transporter) return;

        //Safely fallback to SMTP_USER or SMTP_EMAIL
        const senderEmail = process.env.SMTP_FROM || process.env.SMTP_EMAIL || process.env.SMTP_USER || 'noreply@tictactoang.com';

        try {
            const mailOptions = {
                from: `"TicTacToang Team" <${senderEmail}>`,
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

        //Safely fallback to SMTP_USER or SMTP_EMAIL
        const senderEmail = process.env.SMTP_FROM || process.env.SMTP_EMAIL || process.env.SMTP_USER || 'noreply@tictactoang.com';

        try {
            const mailOptions = {
                from: `"TicTacToang Team" <${senderEmail}>`,
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