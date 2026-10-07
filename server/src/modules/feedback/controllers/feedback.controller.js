import { FeedbackService } from '../services/feedback.service.js';

export const FeedbackController = {
    // [POST] /feedback endpoint
    submitFeedback: async (req, res, next) => {
        try {
            const { name, email, category, message } = req.body;
            await FeedbackService.sendFeedback({
                name: name.trim(),
                email: email.trim(),
                category,
                message: message.trim(),
            });

            return res.status(200).json({
                data: { sent: true },
                message: 'Feedback sent successfully.',
            });
        } catch (error) {
            return next(error);
        }
    },
};
