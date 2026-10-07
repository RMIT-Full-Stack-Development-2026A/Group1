/**
 * FeatureGrid — Section 5
 *
 * 07/10 update (Khanh): the old flat theme-thumbnail grid looked too plain
 * ("chưa đủ ARCADE"). Now pulls REAL data directly from
 * GameCustomization/service/customization.service.js and renders:
 *  - all 3 board themes as actual mini 3x3 preview boards (same technique
 *    as GridStyleSelector.jsx: themed wrapper/border/glow + bg image), not
 *    flat thumbnails;
 *  - all 6 marker variants (CLASSIC/GLOW/SKETCH/STONE/PIXEL/MINIMAL),
 *    rendered through the same CustomMarkers.jsx components the real game
 *    uses, so colors/glow always match exactly.
 * The Team card that used to live here moved into its own dedicated
 * TeamSection (see docs/welcome-page-plan.md §4.6 update).
 */

import { motion } from "framer-motion";
import {
  getMarkerVariants,
  getGridStyles,
  BOARD_THEMES,
} from "@/pages/Player/GameCustomization/service/customization.service";
import { MarkerX, MarkerO } from "@/components/reusable/custom/CustomMarkers";
import { FEATURE_CARDS, HISTORY_PLACEHOLDER } from "../service/welcomeContent.service";

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

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-12">
        What Makes This Game Different
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {FEATURE_CARDS.map((feature, index) => (
          <CardShell key={feature.id} index={index}>
            <span className="text-3xl text-[#4cc9f0]">{feature.icon}</span>
            <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">{feature.title}</h3>
            <p className="text-xs text-[#bcc8ce] leading-relaxed">{feature.description}</p>
          </CardShell>
        ))}
      </div>

      {/* All 3 board themes — real mini board preview, same technique as GridStyleSelector */}
      <CardShell index={2} className="mb-6">
        <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">All 3 Board Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gridStyles.map((style) => {
            const theme = BOARD_THEMES[style.displayId] || BOARD_THEMES.jungle;
            return (
              <div key={style.id} className="bg-[#12121f] border border-[#3d484d] p-1">
                <div className="w-full h-28 bg-[#05050a] flex items-center justify-center relative overflow-hidden">
                  {theme.bgImage && (
                    <img
                      src={theme.bgImage}
                      alt={`${style.name} theme background`}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 pointer-events-none"
                    />
                  )}
                  <div
                    className={`p-1 relative z-10 ${theme.wrapper}`}
                    style={theme.glow ? theme.glow : {}}
                  >
                    <div className={`grid grid-cols-3 ${theme.boardBorder}`}>
                      {Array(9)
                        .fill(null)
                        .map((_, i) => (
                          <div key={i} className={`w-5 h-5 ${theme.cellBorder}`} />
                        ))}
                    </div>
                  </div>
                </div>
                <div className="p-2 text-center">
                  <span className="font-headline text-[10px] text-[#bcc8ce]">{style.name}</span>
                </div>
              </div>
            );
          })}
        </div>
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
              <span className="font-headline text-[9px] text-[#bcc8ce]">{variant.id}</span>
            </div>
          ))}
        </div>
      </CardShell>

      {/* TODO: replace with real milestones before merging to main */}
      <CardShell index={4}>
        <h3 className="font-headline text-sm text-[#e3e0f4] uppercase">{HISTORY_PLACEHOLDER.title}</h3>
        <ul className="text-xs text-[#bcc8ce] flex flex-col gap-2">
          {HISTORY_PLACEHOLDER.milestones.map((milestone) => (
            <li key={milestone.date} className="flex gap-2">
              <span className="font-headline text-[10px] text-[#fad100]">{milestone.date}</span>
              <span>{milestone.label}</span>
            </li>
          ))}
        </ul>
      </CardShell>
    </section>
  );
}
