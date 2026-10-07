import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitFeedback, FEEDBACK_CATEGORIES } from "../service/feedbackApi.service";

const INITIAL_FORM = { name: "", email: "", category: FEEDBACK_CATEGORIES[0].id, message: "" };

export const useFeedback = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSelectCategory = (categoryId) => {
    setForm((prev) => ({ ...prev, category: categoryId }));
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
        error?.data?.message || error?.message || "Could not send feedback right now. Please try again later."
      );
    }
  };

  const goBackToWelcome = () => navigate("/welcome");

  return {
    form,
    status,
    errorMessage,
    handleChange,
    handleSelectCategory,
    handleSubmit,
    goBackToWelcome,
  };
};
