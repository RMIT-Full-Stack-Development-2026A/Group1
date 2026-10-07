/**
 * IntroSplash — new (07/10, Khanh)
 * Full-screen background shown briefly before the /welcome content is
 * revealed. 07/10 update: background is now the ported AnimatedGradient
 * (componentry.dev, WebGL) instead of a plain CSS gradient. Two-stage
 * reveal — "Welcome to" fades in first, holds briefly, then "TICTACTOANG"
 * appears below it, before the whole overlay fades out. Skipped entirely
 * when the user prefers reduced motion (no forced animation, page content
 * is visible immediately).
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import AnimatedGradient from "./AnimatedGradient";

const MotionDiv = motion.div;

// Timings widened 07/10 (Khanh): hold the AnimatedGradient intro for 5s
// total, with "Welcome to" settling in before "TICTACTOANG" appears below
// it, instead of the two nearly overlapping at the old 2s duration.
const WELCOME_DELAY_MS = 0;
const TITLE_DELAY_MS = 1500;
const SPLASH_DURATION_MS = 5000;

export default function IntroSplash() {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(!prefersReducedMotion);
  const [showWelcome, setShowWelcome] = useState(prefersReducedMotion);
  const [showTitle, setShowTitle] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const welcomeTimeout = setTimeout(() => setShowWelcome(true), WELCOME_DELAY_MS);
    const titleTimeout = setTimeout(() => setShowTitle(true), TITLE_DELAY_MS);
    const hideTimeout = setTimeout(() => setIsVisible(false), SPLASH_DURATION_MS);

    return () => {
      clearTimeout(welcomeTimeout);
      clearTimeout(titleTimeout);
      clearTimeout(hideTimeout);
    };
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDiv
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-2 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <AnimatedGradient className="absolute inset-0 z-0" />
          <div className="absolute inset-0 z-[1] bg-[#0d0d1a]/35" />

          <AnimatePresence>
            {showWelcome && (
              <MotionDiv
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 font-headline text-base md:text-lg text-[#93e2ff] uppercase tracking-widest"
              >
                Welcome to
              </MotionDiv>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showTitle && (
              <MotionDiv
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 font-headline text-2xl md:text-4xl text-[#4cc9f0] uppercase tracking-tighter [text-shadow:4px_4px_0px_#1e1e2c]"
              >
                TicTacToang
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
