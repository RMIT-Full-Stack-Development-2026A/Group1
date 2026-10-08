/**
 * MarkerStylesSection — split from FeatureGrid (Phase 1/2 refactor)
 * Renders the 6 marker variants using the real CustomMarkers components.
 * Screen #6 in the welcome page.
 */

import { motion } from "framer-motion";
import { getMarkerVariants } from "@/pages/Player/GameCustomization/service/customization.service";
import { MarkerX, MarkerO } from "@/components/reusable/custom/CustomMarkers";

const MotionDiv = motion.div;

const MARKER_VARIANTS = getMarkerVariants();

export default function MarkerStylesSection() {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10">
      <h2 className="font-headline text-xl md:text-3xl text-[#e3e0f4] text-center uppercase">
        All 6 Marker Styles
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
        {MARKER_VARIANTS.map((variant, index) => (
          <MotionDiv
            key={variant.id}
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
          >
            {/* No box/background (07/10, Khanh) — markers sit directly on the
                AuroraFlow backdrop, sized up so they read clearly without one. */}
            <div className="flex gap-4 items-center">
              <MarkerX variantData={variant} className="text-4xl w-16 h-16" />
              <MarkerO variantData={variant} className="text-4xl w-16 h-16" />
            </div>
            <span className="font-headline text-xs text-[#bcc8ce] uppercase tracking-wide">
              {variant.id}
            </span>
          </MotionDiv>
        ))}
      </div>
    </div>
  );
}
