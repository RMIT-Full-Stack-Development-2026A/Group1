/**
 * HowToPlaySection — Section 4
 * id="how-to-play" is the Hero's secondary CTA scroll target.
 */

import { motion } from "framer-motion";
import { HOW_TO_PLAY_STEPS } from "../service/welcomeContent.service";

const MotionDiv = motion.div;

export default function HowToPlaySection() {
  return (
    <section id="how-to-play" className="w-full max-w-5xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-12">
        How to Play
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {HOW_TO_PLAY_STEPS.map((item, index) => (
          <MotionDiv
            key={item.step}
            className="flex flex-col items-center text-center gap-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
          >
            <div className="w-14 h-14 rounded-full border-2 border-[#4cc9f0] flex items-center justify-center font-headline text-lg text-[#4cc9f0]">
              {item.step}
            </div>
            <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">{item.title}</h3>
            <p className="text-xs md:text-sm text-[#bcc8ce] leading-relaxed">{item.description}</p>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}
