/**
 * Welcome — /welcome page root
 *
 * Phase 1: scroll-snap layout.
 * Each section occupies exactly one viewport height on md+ screens.
 * Scroll-snap is applied on the <html> element so window.scrollY works
 * correctly for AuroraFlow and scrollToSection. Mobile uses normal
 * scrolling with min-h-dvh sections.
 *
 * Phase 2: AuroraFlow is deferred until intro exits (introDone) so the
 * WebGL intro gradient is the only WebGL context during the first ~2s.
 * The hero video also starts after introDone.
 *
 * Section order (12 screens):
 *  1  Hero          — video + PixelCanvas + MarqueeBand pinned to bottom
 *  2  Modes         — ModeSelectPreview
 *  3  How to Play   — HowToPlaySection
 *  4  Features      — FeatureCardsSection (2 cards)
 *  5  Board Themes  — BoardThemesSection (WheelCarousel, no box)
 *  6  Markers       — MarkerStylesSection (6 variants)
 *  7  History       — HistorySection (description + Spiral3DSlider)
 *  8  Team          — TeamSection
 *  9  Feedback      — FeedbackCta
 * 10  Stats         — ChallengeCounter
 * 11  Final CTA     — FinalCta
 * 12  FAQ           — FaqAccordion
 */

import { useEffect, useState } from "react";
import { useWelcome } from "./hook/useWelcome.hook";
import {
  IntroSplash,
  AuroraFlow,
  HeroSection,
  MarqueeBand,
  ModeSelectPreview,
  HowToPlaySection,
  FeatureCardsSection,
  BoardThemesSection,
  MarkerStylesSection,
  HistorySection,
  TeamSection,
  FeedbackCta,
  ChallengeCounter,
  FinalCta,
  FaqAccordion,
  MagneticDock,
  FullScreenSection,
} from "./sub-components";
import "./styles.css";

// ---------------------------------------------------------------------------
// HeroScreenSection — custom wrapper for screen 1
// MarqueeBand lives at the bottom of this screen (not a separate screen).
// ---------------------------------------------------------------------------
function HeroScreenSection({ reducedMotion }) {
  return (
    <section
      id="welcome-top"
      className="relative h-dvh w-full snap-start snap-always overflow-hidden"
    >
      <HeroSection />

      {/* MarqueeBand pinned to the bottom of the hero screen */}
      <div className="absolute bottom-0 left-0 w-full z-30">
        <MarqueeBand reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Welcome
// ---------------------------------------------------------------------------
export default function Welcome() {
  const { prefersReducedMotion, scrollToSection, goToPlay } = useWelcome();

  // Phase 2: defer AuroraFlow until intro exits
  const [introDone, setIntroDone] = useState(prefersReducedMotion);

  // Enable scroll-snap on <html> for md+ breakpoints only.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    const applySnap = (matches) => {
      if (matches) {
        document.documentElement.style.scrollSnapType = "y mandatory";
        if (!prefersReducedMotion) {
          document.documentElement.style.scrollBehavior = "smooth";
        }
      } else {
        document.documentElement.style.scrollSnapType = "";
        document.documentElement.style.scrollBehavior = "";
      }
    };

    applySnap(mq.matches);
    const listener = (e) => applySnap(e.matches);
    mq.addEventListener("change", listener);

    return () => {
      mq.removeEventListener("change", listener);
      document.documentElement.style.scrollSnapType = "";
      document.documentElement.style.scrollBehavior = "";
    };
  }, [prefersReducedMotion]);

  // Delay introDone by the IntroSplash duration (~2.6s incl. exit anim)
  // when not using reduced motion.
  useEffect(() => {
    if (prefersReducedMotion) {
      setIntroDone(true);
      return;
    }
    const t = setTimeout(() => setIntroDone(true), 2800);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  return (
    <div className="relative w-full text-[#e3e0f4] font-body overflow-x-hidden selection:bg-[#fad100] selection:text-[#003543]">
      {/* ------------------------------------------------------------------ */}
      {/* AuroraFlow — page-wide ambient background (deferred until introDone) */}
      {/* Phase 5: z-0, no solid ancestor bg, sections are transparent        */}
      {/* ------------------------------------------------------------------ */}
      {introDone && (
        <AuroraFlow
          className="fixed inset-0 z-0"
          preset="arcade"
          opacity={0.9}
          intensity={1.2}
          brightness={1.1}
          ambientOpacity={0.6}
          layers={4}
          pointerInteraction={false}
          grain={false}
        />
      )}

      {/* IntroSplash — fixed z-[100] overlay, unmounts after its exit anim */}
      <IntroSplash />

      {/* ------------------------------------------------------------------ */}
      {/* Scrollable content — z-10 so it sits above AuroraFlow              */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10">
        {/* Screen 1: Hero + MarqueeBand (custom: no pt-20/pb-28 — video is full-bleed) */}
        <HeroScreenSection reducedMotion={prefersReducedMotion} />

        {/* Screen 2: Game Modes */}
        <FullScreenSection id="modes">
          <ModeSelectPreview onPlayNow={goToPlay} />
        </FullScreenSection>

        {/* Screen 3: How to Play */}
        <FullScreenSection id="how-to-play">
          <HowToPlaySection />
        </FullScreenSection>

        {/* Screen 4: Feature Cards */}
        <FullScreenSection id="features">
          <FeatureCardsSection />
        </FullScreenSection>

        {/* Screen 5: Board Themes — WheelCarousel without CardShell box */}
        <FullScreenSection id="board-themes">
          <BoardThemesSection />
        </FullScreenSection>

        {/* Screen 6: Marker Styles */}
        <FullScreenSection id="markers">
          <MarkerStylesSection />
        </FullScreenSection>

        {/* Screen 7: Development History — description + Spiral3DSlider */}
        <FullScreenSection id="history">
          <HistorySection />
        </FullScreenSection>

        {/* Screen 8: Team */}
        <FullScreenSection id="team">
          <TeamSection />
        </FullScreenSection>

        {/* Screen 9: Feedback */}
        <FullScreenSection id="feedback">
          <FeedbackCta />
        </FullScreenSection>

        {/* Screen 10: Stats */}
        <FullScreenSection id="stats">
          <ChallengeCounter />
        </FullScreenSection>

        {/* Screen 11: Final CTA */}
        <FullScreenSection id="cta">
          <FinalCta onPlayNow={goToPlay} />
        </FullScreenSection>

        {/* Screen 12: FAQ — snap-proximity so tall FAQs don't trap the user */}
        <FullScreenSection id="faq" className="snap-proximity overflow-y-auto">
          <FaqAccordion />
        </FullScreenSection>
      </div>

      {/* MagneticDock — always on top */}
      <MagneticDock onNavigate={scrollToSection} />
    </div>
  );
}
