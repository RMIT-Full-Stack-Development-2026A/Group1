import express from 'express';
import { FeedbackController } from '../controllers/feedback.controller.js';
import { FeedbackValidator } from '../validators/feedback.validator.js';

const feedbackRoutes = express.Router();

/**
 * @openapi
 * /api/v1/feedback:
 *  post:
 *      tags: [Feedback]
 *      summary: Submit player feedback about the game
 *      description: Sends the submitted feedback form (name, email, category, message) to the project inbox via email.
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required: [name, email, category, message]
 *                      properties:
 *                          name:
 *                              type: string
 *                          email:
 *                              type: string
 *                          category:
 *                              type: string
 *                              enum: [Bug Report, Feature Suggestion, General Feedback]
 *                          message:
 *                              type: string
 *      responses:
 *          200:
 *              description: Feedback sent successfully.
 *          400:
 *              description: Validation error.
 *          503:
 *              description: Email service not configured on the server.
 */
feedbackRoutes.post('/', FeedbackValidator.validateSubmitFeedback, FeedbackController.submitFeedback);

export default feedbackRoutes;
