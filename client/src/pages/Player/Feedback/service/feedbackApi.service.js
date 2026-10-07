import http from "@/utils/httpHelper";
import { API_ENDPOINTS } from "@/config/apiConfig";

export const FEEDBACK_CATEGORIES = [
  {
    id: "Bug Report",
    title: "Bug Report",
    description: "Something broke, crashed, or didn't behave as expected.",
    accentColor: "#ff6b6b",
    icon: "bug_report",
  },
  {
    id: "Feature Suggestion",
    title: "Feature Suggestion",
    description: "An idea for a mode, theme, or feature you'd like to see.",
    accentColor: "#fad100",
    icon: "lightbulb",
  },
  {
    id: "General Feedback",
    title: "General Feedback",
    description: "Anything else about your experience with the game.",
    accentColor: "#4cc9f0",
    icon: "chat",
  },
];

/**
 * Submits the feedback form. The backend forwards it by email to the
 * project inbox (see server/src/modules/feedback).
 * @param {{name: string, email: string, category: string, message: string}} payload
 */
export const submitFeedback = (payload) => {
  return http.post(API_ENDPOINTS.FEEDBACK.SUBMIT, payload, { silent: true });
};
