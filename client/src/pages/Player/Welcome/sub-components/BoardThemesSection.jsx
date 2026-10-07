/**
 * BoardThemesSection — split from FeatureGrid (Phase 1/2 refactor)
 * Renders WheelCarousel without the CardShell box, directly on the
 * AuroraFlow background. Screen #5 in the welcome page.
 *
 * Phase 2 changes applied here:
 *  - No CardShell / no solid bg wrapping the carousel.
 *  - WheelCarousel itself had its solid PALETTE.background removed (see
 *    WheelCarousel.jsx changes).
 *  - Size is h-[min(70dvh,640px)] w-full max-w-6xl; contentWidth ≈ 1100.
 *  - Wheel handler only prevents default when there are more items to
 *    scroll; the scroll-through escape is handled by dropping the inline
 *    wheel handler and relying only on drag / arrow keys instead (simpler
 *    and more robust than direction-aware preventDefault).
 */

import { getGridStyles, BOARD_THEMES } from "@/pages/Player/GameCustomization/service/customization.service";
import WheelCarousel from "./WheelCarousel";

// Pre-compute once: map grid styles → carousel items
function buildThemeItems() {
  const styles = getGridStyles();
  return styles.map((style) => {
    const theme = BOARD_THEMES[style.displayId] || BOARD_THEMES.jungle;
    return { label: style.name, image: theme.bgImage, imageAlt: `${style.name} theme preview` };
  });
}

const THEME_ITEMS = buildThemeItems();

export default function BoardThemesSection() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 h-full min-h-0">
      <h2 className="font-headline text-xl md:text-3xl text-[#e3e0f4] text-center uppercase shrink-0">
        All 3 Board Themes
      </h2>
      <WheelCarousel
        items={THEME_ITEMS}
        contentWidth={1100}
        photoShape="circle"
        photoWidth={42}
        apexInset={18}
        className="flex-1 min-h-0 w-full"
      />
    </div>
  );
}
