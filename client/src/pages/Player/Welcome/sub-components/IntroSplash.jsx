/**
 * IntroSplash — new (07/10, Khanh)
 * Full-screen gradient overlay shown briefly before the /welcome content
 * is revealed. Skipped entirely when the user prefers reduced motion (no
 * forced animation, page content is visible immediately instead).
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const MotionDiv = motion.div;
const SPLASH_DURATION_MS = 1400;

export default function IntroSplash() {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(!prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timeout = setTimeout(() => setIsVisible(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDiv
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0d0d1a 0%, #1e1e2c 50%, #003543 100%)",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-headline text-2xl md:text-4xl text-[#4cc9f0] uppercase tracking-tighter [text-shadow:4px_4px_0px_#1e1e2c]"
          >
            TicTacToang
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
