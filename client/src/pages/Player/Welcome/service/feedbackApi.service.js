import http from "@/utils/httpHelper";
import { API_ENDPOINTS } from "@/config/apiConfig";

export const FEEDBACK_CATEGORIES = ["Bug Report", "Feature Suggestion", "General Feedback"];

/**
 * Submits the Welcome page feedback form. The backend forwards it by email
 * to the project inbox (see server/src/modules/feedback).
 * @param {{name: string, email: string, category: string, message: string}} payload
 */
export const submitFeedback = (payload) => {
  return http.post(API_ENDPOINTS.FEEDBACK.SUBMIT, payload, { silent: true });
};
