/**
 * Feedback page (/feedback) — 07/10, Khanh.
 * Dedicated page (was previously an inline section on /welcome). Uses two
 * real componentry.dev components: PixelCanvas (ambient background) and
 * HoverTransition (via CategoryCard). Submits to the real backend
 * (/api/v1/feedback), which emails the project inbox.
 */

import PixelCanvas from "@/pages/Player/Welcome/sub-components/PixelCanvas";
import { useFeedback } from "./hook/useFeedback.hook";
import { FEEDBACK_CATEGORIES } from "./service/feedbackApi.service";
import CategoryCard from "./sub-components/CategoryCard";

export default function Feedback() {
  const { form, status, errorMessage, handleChange, handleSelectCategory, handleSubmit, goBackToWelcome } =
    useFeedback();

  return (
    <div className="relative min-h-screen w-full bg-[#0d0d1a] text-[#e3e0f4] font-body overflow-x-hidden">
      <PixelCanvas className="absolute inset-0 z-0" variant="glow" colors={["#4cc9f0", "#93e2ff", "#fad100"]} />
      <div className="absolute inset-0 bg-[#0d0d1a]/70 z-[1]" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <button
          type="button"
          onClick={goBackToWelcome}
          className="flex items-center gap-1 text-[#93e2ff] hover:text-[#4cc9f0] transition-colors mb-10 font-headline text-[10px] uppercase"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Welcome
        </button>

        <h1 className="font-headline text-2xl md:text-3xl text-[#e3e0f4] text-center uppercase mb-4">
          Send Feedback
        </h1>
        <p className="text-xs md:text-sm text-[#bcc8ce] text-center mb-10">
          Found a bug? Have an idea? Tell us directly.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <label className="font-headline text-[10px] text-[#93e2ff] uppercase mb-3 block">
              Category
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FEEDBACK_CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={form.category === category.id}
                  onSelect={handleSelectCategory}
                />
              ))}
            </div>
          </div>

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
              rows={6}
              className="bg-[#1e1e2c] border border-[#3d484d] px-4 py-3 text-sm text-[#e3e0f4] focus:outline-none focus:border-[#4cc9f0] resize-none"
            />
          </div>

          {status === "error" && <p className="text-xs text-[#ffb4ab]">{errorMessage}</p>}
          {status === "success" && (
            <p className="text-xs text-[#4cc9f0]">Thanks! Your feedback has been sent.</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="self-center bg-[#4cc9f0] text-[#003543] px-10 py-4 font-headline text-sm border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#1e1e2c] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:shadow-[0px_0px_8px_#4cc9f0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "SENDING..." : "SEND FEEDBACK"}
          </button>
        </form>
      </div>
    </div>
  );
}
