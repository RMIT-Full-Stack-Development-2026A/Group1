/**
 * FeatureGrid — Section 5
 *
 * Pulls REAL data directly from GameCustomization/service/customization.service.js:
 *  - all 3 board themes displayed via the ported WheelCarousel (componentry.dev,
 *    07/10 update — replaced the static 3-column grid per Khanh's feedback);
 *  - all 6 marker variants (CLASSIC/GLOW/SKETCH/STONE/PIXEL/MINIMAL),
 *    rendered through the same CustomMarkers.jsx components the real game
 *    uses, so colors/glow always match exactly.
 * The Team card that used to live here moved into its own dedicated
 * TeamSection; the History block moved into its own HistorySection.
 */

import { motion } from "framer-motion";
import {
  getMarkerVariants,
  getGridStyles,
  BOARD_THEMES,
} from "@/pages/Player/GameCustomization/service/customization.service";
import { MarkerX, MarkerO } from "@/components/reusable/custom/CustomMarkers";
import { FEATURE_CARDS } from "../service/welcomeContent.service";
import WheelCarousel from "./WheelCarousel";

const MotionDiv = motion.div;

function CardShell({ index, className, children }) {
  return (
    <MotionDiv
      className={`bg-[#1e1e2c] border border-[#3d484d] p-6 flex flex-col gap-4 ${className || ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      {children}
    </MotionDiv>
  );
}

export default function FeatureGrid() {
  const markerVariants = getMarkerVariants();
  const gridStyles = getGridStyles();
  const themeWheelItems = gridStyles.map((style) => {
    const theme = BOARD_THEMES[style.displayId] || BOARD_THEMES.jungle;
    return { label: style.name, image: theme.bgImage, imageAlt: `${style.name} theme preview` };
  });

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-12">
        What Makes This Game Different
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {FEATURE_CARDS.map((feature, index) => (
          <CardShell key={feature.id} index={index}>
            <span className="material-symbols-outlined text-3xl text-[#4cc9f0]">{feature.icon}</span>
            <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">{feature.title}</h3>
            <p className="text-xs text-[#bcc8ce] leading-relaxed">{feature.description}</p>
          </CardShell>
        ))}
      </div>

      {/* All 3 board themes — WheelCarousel (componentry.dev, ported) */}
      <CardShell index={2} className="mb-6">
        <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">All 3 Board Themes</h3>
        <WheelCarousel items={themeWheelItems} className="min-h-[280px]" />
      </CardShell>

      {/* All 6 marker variants — rendered through the real CustomMarkers components */}
      <CardShell index={3} className="mb-6">
        <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">All 6 Marker Styles</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {markerVariants.map((variant) => (
            <div key={variant.id} className="flex flex-col items-center gap-2">
              <div className="flex gap-2 items-center">
                <MarkerX variantData={variant} className="text-xl w-6 h-6" />
                <MarkerO variantData={variant} className="text-xl w-6 h-6" />
              </div>
              <span className="font-headline text-xs text-[#bcc8ce]">{variant.id}</span>
            </div>
          ))}
        </div>
      </CardShell>
    </section>
  );
}
