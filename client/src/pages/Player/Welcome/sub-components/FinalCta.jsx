/**
 * FinalCta — Section 8
 */

import PropTypes from "prop-types";
import { motion } from "framer-motion";
import MiniBoardDemo from "./MiniBoardDemo";

const MotionSpan = motion.span;
const FALLING_MARKERS = ["X", "O", "X", "O", "X"];

export default function FinalCta({ onPlayNow }) {
  return (
    <section id="cta" className="relative w-full py-28 px-6 overflow-hidden text-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-sm pointer-events-none">
        <div className="w-[500px] max-w-full scale-150">
          <MiniBoardDemo script={[0, 4, 1, 5, 2]} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex gap-3">
          {FALLING_MARKERS.map((marker, index) => (
            <MotionSpan
              key={`${marker}-${index}`}
              className={`font-headline text-2xl ${
                marker === "X" ? "text-[#ffb4ab]" : "text-[#4cc9f0]"
              }`}
              initial={{ y: -24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {marker}
            </MotionSpan>
          ))}
        </div>

        <h2 className="font-headline text-2xl md:text-4xl text-[#e3e0f4] uppercase">
          Ready?
        </h2>

        <button
          type="button"
          onClick={onPlayNow}
          className="bg-[#4cc9f0] text-[#003543] px-10 py-5 font-headline text-base md:text-lg border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#1e1e2c] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:shadow-[0px_0px_8px_#4cc9f0]"
        >
          PLAY NOW
        </button>
      </div>
    </section>
  );
}

FinalCta.propTypes = {
  onPlayNow: PropTypes.func.isRequired,
};
