/**
 * ReviewsSection — new section (07/10, Khanh)
 * Placeholder testimonials until real user reviews are collected.
 */

import { motion } from "framer-motion";
import { USER_REVIEWS } from "../service/welcomeContent.service";

const MotionDiv = motion.div;

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className="material-symbols-outlined text-sm"
          style={{ color: index < rating ? "#fad100" : "#3d484d" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section id="reviews" className="w-full max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-12">
        What Players Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {USER_REVIEWS.map((review, index) => (
          <MotionDiv
            key={review.id}
            className="bg-[#1e1e2c] border border-[#3d484d] p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <StarRating rating={review.rating} />
            <p className="text-sm text-[#bcc8ce] leading-relaxed italic">“{review.quote}”</p>
            <span className="font-headline text-[10px] text-[#93e2ff] uppercase mt-auto">
              — {review.name}
            </span>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}
