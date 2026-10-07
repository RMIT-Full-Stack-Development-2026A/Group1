/**
 * ChallengeCounter — Section 6
 * Count-up placeholder stat (not backed by a real API yet, see
 * welcomeContent.service.js CHALLENGE_STAT). Snaps to the final value
 * immediately when the user prefers reduced motion.
 */

import { useRef, useState } from "react";
import { motion, animate, useReducedMotion } from "framer-motion";
import { CHALLENGE_STAT } from "../service/welcomeContent.service";

const MotionDiv = motion.div;

export default function ChallengeCounter() {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);

  const shownValue = prefersReducedMotion ? CHALLENGE_STAT.value : displayValue;

  const handleViewportEnter = () => {
    if (hasAnimatedRef.current || prefersReducedMotion) return;
    hasAnimatedRef.current = true;
    animate(0, CHALLENGE_STAT.value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => setDisplayValue(Math.round(value)),
    });
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
      <MotionDiv onViewportEnter={handleViewportEnter} viewport={{ once: true, amount: 0.5 }}>
        <h2 className="font-headline text-lg md:text-xl text-[#e3e0f4] uppercase mb-6">
          {CHALLENGE_STAT.label}
        </h2>
        <p className="font-headline text-4xl md:text-6xl text-[#fad100]">
          {shownValue}
          <span className="text-lg md:text-2xl text-[#bcc8ce] ml-2">{CHALLENGE_STAT.suffix}</span>
        </p>
      </MotionDiv>
    </section>
  );
}
