/**
 * MarkerStylesSection
 * Renders the 6 marker variants using the real CustomMarkers components.
 * Screen #6 in the welcome page.
 */

import { motion } from "framer-motion";
import { getMarkerVariants } from "@/pages/Player/GameCustomization/service/customization.service";
import { MarkerX, MarkerO } from "@/components/reusable/custom/CustomMarkers";

const MotionDiv = motion.div;

const MARKER_VARIANTS = getMarkerVariants();

// Each marker sits centred in a fixed cell, so every pair has the same width and every glyph is vertically centred.
// The glyph fills a different share of its box in each style (the four letter styles are small, PIXEL and MINIMAL are
// SVGs), so the sizes below are tuned for a drawn glyph of about 40px in every style.
const MARKER_CELL = "flex h-12 w-12 items-center justify-center";
// The letters are drawn in the upper-left part of their text box, so they are nudged down and right to look centred.
const LETTER_SIZE = "relative left-[3px] top-1 text-[2.8rem]";
// shrink-0: a flex item would otherwise be squeezed to the cell width, and these SVGs are intentionally larger than it.
const SVG_SIZES = {
  PIXEL: { X: "shrink-0 h-[58px] w-[58px]", O: "shrink-0 h-[52px] w-[52px]" },
  MINIMAL: { X: "shrink-0 h-[71px] w-[71px]", O: "shrink-0 h-[48px] w-[48px]" },
};
const markerSize = (variantId, mark) => SVG_SIZES[variantId]?.[mark] ?? LETTER_SIZE;

export default function MarkerStylesSection() {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10">
      <h2 className="font-headline text-xl md:text-3xl text-[#e3e0f4] text-center uppercase">
        All 6 Marker Styles
      </h2>
      <div className="grid grid-cols-1 min-[300px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-8">
        {MARKER_VARIANTS.map((variant, index) => (
          <MotionDiv
            key={variant.id}
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
          >
            {/* No box/background — markers sit directly on the
                AuroraFlow backdrop, sized up so they read clearly without one. */}
            <div className="flex items-center gap-2">
              <div className={MARKER_CELL}>
                <MarkerX variantData={variant} className={markerSize(variant.id, "X")} />
              </div>
              <div className={MARKER_CELL}>
                <MarkerO variantData={variant} className={markerSize(variant.id, "O")} />
              </div>
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
