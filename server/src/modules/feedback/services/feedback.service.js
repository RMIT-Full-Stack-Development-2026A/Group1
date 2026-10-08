import nodemailer from 'nodemailer';

const FEEDBACK_RECIPIENT = 'frankkhanhnguyen@gmail.com';

const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

let mailTransporter = null;
let isMailerWarningLogged = false;

const getTransporter = () => {
    if (mailTransporter) return mailTransporter;

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

    if (!isMailerWarningLogged) {
        console.warn('[WARNING] SMTP credentials missing in .env! Feedback emails will NOT be sent.');
        isMailerWarningLogged = true;
    }
    return null;
};

export const FeedbackService = {
    /**
     * Sends a player feedback submission to the fixed recipient inbox.
     * @param {Object} feedback - { name, email, category, message }
     * @returns {Promise<{ sent: boolean }>}
     */
    async sendFeedback({ name, email, category, message }) {
        const transporter = getTransporter();

        if (!transporter) {
            // SMTP not configured in this environment — surface a clear error
            // instead of silently pretending the email was sent.
            const error = new Error('Email service is not configured on the server.');
            error.statusCode = 503;
            error.error = 'EMAIL_SERVICE_UNAVAILABLE';
            throw error;
        }

        const senderEmail = process.env.SMTP_FROM || process.env.SMTP_EMAIL || process.env.SMTP_USER;

        await transporter.sendMail({
            from: `"TicTacToang Feedback" <${senderEmail}>`,
            to: FEEDBACK_RECIPIENT,
            replyTo: email,
            subject: `[TicTacToang Feedback] ${category} — ${name}`,
            html: `
                <h2>New feedback from the Welcome page</h2>
                <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Category:</strong> ${escapeHtml(category)}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
            `,
        });

        return { sent: true };
    },
};
