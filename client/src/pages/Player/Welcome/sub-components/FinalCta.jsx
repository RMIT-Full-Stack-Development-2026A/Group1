/**
 * FinalCta — Section 8
 */

import PropTypes from "prop-types";
import { motion } from "framer-motion";

const HEADLINE = "READY AS YOU ARE";
const MotionH2 = motion.h2;

export default function FinalCta({ onPlayNow }) {
  return (
    <div className="w-full px-6 flex flex-col items-center justify-center gap-10 text-center">
      <MotionH2
        className="font-headline text-3xl md:text-5xl uppercase text-[#e3e0f4] [text-shadow:4px_4px_0px_#1e1e2c]"
        initial={{ y: 24, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4 }}
      >
        {HEADLINE}
      </MotionH2>

      <motion.button
        type="button"
        onClick={onPlayNow}
        className="bg-[#4cc9f0] text-[#003543] px-10 py-5 font-headline text-base md:text-lg border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#1e1e2c] active:translate-x-1 active:translate-y-1 active:shadow-none transition-[box-shadow,transform] hover:shadow-[0px_0px_8px_#4cc9f0]"
        initial={{ y: 24, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        PLAY
      </motion.button>
    </div>
  );
}

FinalCta.propTypes = {
  onPlayNow: PropTypes.func.isRequired,
};
