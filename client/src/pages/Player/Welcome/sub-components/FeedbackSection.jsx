/**
 * FeedbackSection — new section (07/10, Khanh)
 * Multi-field feedback form. Submits to the backend (`/api/v1/feedback`),
 * which forwards it by email to frankkhanhnguyen@gmail.com — see
 * server/src/modules/feedback. Requires SMTP_USER/SMTP_PASSWORD (and
 * optionally SMTP_HOST/SMTP_PORT/SMTP_FROM) to be set in the server's .env;
 * without them the backend returns a clear 503 instead of silently
 * pretending the email was sent.
 */

import { useState } from "react";
import { submitFeedback, FEEDBACK_CATEGORIES } from "../service/feedbackApi.service";

const INITIAL_FORM = { name: "", email: "", category: FEEDBACK_CATEGORIES[0], message: "" };

export default function FeedbackSection() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || form.message.trim().length < 10) {
      setStatus("error");
      setErrorMessage("Please fill in your name, email, and a message of at least 10 characters.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      await submitFeedback(form);
      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error?.data?.message ||
          error?.message ||
          "Could not send feedback right now. Please try again later."
      );
    }
  };

  return (
    <section id="feedback" className="w-full max-w-2xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-4">
        Send Feedback
      </h2>
      <p className="text-xs md:text-sm text-[#bcc8ce] text-center mb-10">
        Found a bug? Have an idea? Tell us directly.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="feedback-name" className="font-headline text-[10px] text-[#93e2ff] uppercase">
              Name
            </label>
            <input
              id="feedback-name"
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              required
              className="bg-[#1e1e2c] border border-[#3d484d] px-4 py-3 text-sm text-[#e3e0f4] focus:outline-none focus:border-[#4cc9f0]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="feedback-email" className="font-headline text-[10px] text-[#93e2ff] uppercase">
              Email
            </label>
            <input
              id="feedback-email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
              className="bg-[#1e1e2c] border border-[#3d484d] px-4 py-3 text-sm text-[#e3e0f4] focus:outline-none focus:border-[#4cc9f0]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="feedback-category" className="font-headline text-[10px] text-[#93e2ff] uppercase">
            Category
          </label>
          <select
            id="feedback-category"
            value={form.category}
            onChange={handleChange("category")}
            className="bg-[#1e1e2c] border border-[#3d484d] px-4 py-3 text-sm text-[#e3e0f4] focus:outline-none focus:border-[#4cc9f0]"
          >
            {FEEDBACK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="feedback-message" className="font-headline text-[10px] text-[#93e2ff] uppercase">
            Message
          </label>
          <textarea
            id="feedback-message"
            value={form.message}
            onChange={handleChange("message")}
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            className="bg-[#1e1e2c] border border-[#3d484d] px-4 py-3 text-sm text-[#e3e0f4] focus:outline-none focus:border-[#4cc9f0] resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-xs text-[#ffb4ab]">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="text-xs text-[#4cc9f0]">Thanks! Your feedback has been sent.</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="self-center bg-[#4cc9f0] text-[#003543] px-8 py-4 font-headline text-sm border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#1e1e2c] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:shadow-[0px_0px_8px_#4cc9f0] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "SENDING..." : "SEND FEEDBACK"}
        </button>
      </form>
    </section>
  );
}
