/**
 * BoardThemesSection
 * Renders WheelCarousel without the CardShell box, directly on the
 * AuroraFlow background. Screen #5 in the welcome page.
 *
 * Size is h-[min(70dvh,640px)] w-full max-w-6xl; contentWidth ≈ 1100. The carousel
 * has no wheel handler (it responds to drag and arrow keys), so page scrolling
 * is never trapped.
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
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 md:h-full md:min-h-0">
      <h2 className="font-headline text-xl md:text-3xl text-[#e3e0f4] text-center uppercase shrink-0">
        All 3 Board Themes
      </h2>
      <WheelCarousel
        items={THEME_ITEMS}
        contentWidth={1100}
        photoShape="circle"
        photoWidth={42}
        apexInset={26}
        spacing={28}
        // Below md the section is only "at least one screen tall", so a percentage height has nothing to resolve
        // against and the theme names (which fill the wheel's height) collapse to zero. Give it a real height there.
        className="h-[min(50dvh,360px)] w-full md:h-auto md:flex-1 md:min-h-0"
      />
    </div>
  );
}
