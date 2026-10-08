/**
 * FaqAccordion — Section 7
 * grid-template-rows 0fr -> 1fr transition (GPU-friendly, no scrollHeight
 * measurement needed) — see docs/welcome-page-plan.md §4.8.
 */

import { useState } from "react";
import { FAQ_ITEMS } from "../service/welcomeContent.service";

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="w-full max-w-3xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-10">
        FAQ
      </h2>
      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className="border border-[#3d484d] bg-[#1e1e2c]">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-headline text-xs md:text-sm text-[#e3e0f4] uppercase">
                  {item.question}
                </span>
                <span className="text-[#4cc9f0] text-lg">{isOpen ? "−" : "+"}</span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out px-5"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="text-xs md:text-sm text-[#bcc8ce] pb-4 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
