/**
 * FeatureCardsSection
 * Displays the 2 FEATURE_CARDS in a two-column grid.
 * Lives inside its own FullScreenSection (Screen #4 in the welcome page).
 */

import { motion } from "framer-motion";
import { FEATURE_CARDS } from "../service/welcomeContent.service";

const MotionDiv = motion.div;

function FeatureCard({ feature, index }) {
  return (
    <MotionDiv
      className="bg-[#1e1e2c]/70 backdrop-blur-sm border border-[#3d484d] p-8 flex flex-col gap-4 rounded-sm"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <span className="material-symbols-outlined text-4xl text-[#4cc9f0]">{feature.icon}</span>
      <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">{feature.title}</h3>
      <p className="text-sm text-[#bcc8ce] leading-relaxed">{feature.description}</p>
    </MotionDiv>
  );
}

export default function FeatureCardsSection() {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      <h2 className="font-headline text-xl md:text-3xl text-[#e3e0f4] text-center uppercase">
        What Makes This Game Different
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURE_CARDS.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
}
