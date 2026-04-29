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
        // Gating the bypass behind an explicit env flag for development
        const allowUnverifiedWebhookBypass =
            process.env.NODE_ENV === 'development' &&
            process.env.ALLOW_UNVERIFIED_PAYPAL_WEBHOOKS === 'true';

        let verificationStatus = 'BYPASSED';

        if (allowUnverifiedWebhookBypass) {
            console.warn('[Webhook Security] PayPal webhook signature verification is being bypassed because ALLOW_UNVERIFIED_PAYPAL_WEBHOOKS=true in development.');
        } else {
            verificationStatus = await verifyPayPalWebhook(headers, payload);
        }
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
                subject: 'NEURO-ELITE ACTIVATED - Welcome to the Future!',
                html: `
                    <div style="background-color: #0f172a; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc; text-align: center;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border: 2px solid #facc15; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);">
                            
                            <!-- Header with Neon Effect -->
                            <div style="background-color: #0f172a; padding: 30px; border-bottom: 1px solid #334155;">
                                <h1 style="margin: 0; color: #facc15; text-transform: uppercase; letter-spacing: 4px; font-size: 28px; text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);">
                                    TICTACTOANG
                                </h1>
                                <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">SYSTEM UPGRADE SUCCESSFUL</p>
                            </div>

                            <!-- Main Content -->
                            <div style="padding: 40px 30px;">
                                <div style="background: rgba(250, 204, 21, 0.1); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin: 0 auto 20px auto; border: 2px solid #facc15;">
                                    <span style="font-size: 40px;">⚡</span>
                                </div>
                                
                                <h2 style="color: #f8fafc; margin-bottom: 20px;">Hello, ${escapeHtml(username) || 'Operator'}!</h2>
                                
                                <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 25px;">
                                    Congratulations! Your neural link has been upgraded. You are now officially a member of the <b style="color: #facc15;">NEURO-ELITE</b> division.
                                </p>

                                <!-- Subscription Card -->
                                <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #facc15;">
                                    <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase;">License Valid Until</p>
                                    <p style="margin: 5px 0 0 0; font-size: 20px; color: #facc15; font-weight: bold;">
                                        ${expiryDate.toLocaleDateString('en-US', { timeZone: 'UTC', dateStyle: 'long' })}
                                    </p>
                                </div>

                                <!-- Call to Action -->
                                <a href="${process.env.CLIENT_URL}" style="display: inline-block; background-color: #facc15; color: #0f172a; padding: 16px 32px; font-weight: bold; text-decoration: none; border-radius: 6px; text-transform: uppercase; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(250, 204, 21, 0.3);">
                                    Return to Battlefield
                                </a>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #0f172a; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #334155;">
                                <p style="margin-bottom: 10px;">You are receiving this because your account was upgraded to Premium.</p>
                                <p style="margin: 0;">Best regards,<br>
                                <b style="color: #cbd5e1;">The TicTacToang Team</b></p>
                            </div>
                        </div>
                        
                        <p style="margin-top: 20px; font-size: 11px; color: #475569;">
                            &copy; 2026 TicTacToang Interactive. All rights reserved.
                        </p>
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
                subject: '⚠️ [URGENT] NEURO-ELITE Access Revoked',
                html: `
                    <div style="background-color: #020617; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc; text-align: center;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 2px solid #06b6d4; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.2);">
                            
                            <!-- Header with Cyan Accent -->
                            <div style="background-color: #020617; padding: 30px; border-bottom: 1px solid #1e293b;">
                                <h1 style="margin: 0; color: #06b6d4; text-transform: uppercase; letter-spacing: 4px; font-size: 24px;">
                                    TICTACTOANG
                                </h1>
                                <p style="color: #94a3b8; font-size: 12px; margin-top: 5px;">SECURITY & SUBSCRIPTION ALERT</p>
                            </div>

                            <!-- Main Content -->
                            <div style="padding: 40px 30px;">
                                <div style="background: rgba(239, 68, 68, 0.1); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin: 0 auto 20px auto; border: 2px solid #ef4444;">
                                    <span style="font-size: 40px;">⚠️</span>
                                </div>
                                
                                <h2 style="color: #f8fafc; margin-bottom: 20px;">System Notice, ${escapeHtml(username) || 'Operator'}</h2>
                                
                                <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 25px; line-height: 1.6;">
                                    Our system has detected that your payment was <b style="color: #ef4444;">refunded, reversed, or canceled</b> via PayPal.
                                </p>

                                <!-- Alert Box -->
                                <div style="background-color: #020617; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #facc15;">
                                    <p style="margin: 0; font-size: 14px; color: #facc15; font-weight: bold; text-transform: uppercase;">
                                        Action Taken: NEURO-ELITE Access Revoked
                                    </p>
                                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;">
                                        Your account has been downgraded to <b>Normal</b> status. Premium features like Match Replays and Pro Skins are no longer accessible.
                                    </p>
                                </div>

                                <p style="font-size: 14px; color: #64748b; margin-bottom: 30px;">
                                    If you believe this is a technical error, please contact our support team immediately to restore your link.
                                </p>

                                <!-- CTA Button -->
                                <a href="${process.env.CLIENT_URL}/subscription" style="display: inline-block; background-color: #06b6d4; color: #020617; padding: 16px 32px; font-weight: bold; text-decoration: none; border-radius: 6px; text-transform: uppercase; font-size: 14px;">
                                    Manage Subscription
                                </a>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #020617; padding: 20px; font-size: 12px; color: #475569; border-top: 1px solid #1e293b;">
                                <p style="margin: 0;">Best regards,<br>
                                <b style="color: #cbd5e1;">The TicTacToang Team</b></p>
                            </div>
                        </div>
                    </div>`
            };

            await transporter.sendMail(mailOptions);
            console.log('[Email] Revoke email sent successfully');
        } catch (error) {
            console.error('[Email Error] Failed to send revoke email:', error);
        }
    }
};