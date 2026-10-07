/**
 * FeedbackCta — 07/10, Khanh.
 * Single button linking out to the dedicated /feedback page (was an inline
 * multi-field form here before — moved for a richer, full-page experience).
 */

import { useNavigate } from "react-router-dom";

export default function FeedbackCta() {
  const navigate = useNavigate();

  return (
    <section id="feedback" className="w-full max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-6 text-center">
      <h2 className="font-headline text-lg md:text-xl text-[#e3e0f4] uppercase">
        Got something to say?
      </h2>
      <p className="text-xs md:text-sm text-[#bcc8ce]">
        Found a bug or have an idea? We'd love to hear it.
      </p>
      <button
        type="button"
        onClick={() => navigate("/feedback")}
        className="bg-[#4cc9f0] text-[#003543] px-8 py-4 font-headline text-sm border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#1e1e2c] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:shadow-[0px_0px_8px_#4cc9f0]"
      >
        SEND FEEDBACK
      </button>
    </section>
  );
}
