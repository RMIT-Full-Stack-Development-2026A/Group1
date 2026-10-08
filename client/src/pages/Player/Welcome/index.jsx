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
 *  9  Testimonials  — TestimonialsMarquee (user review cards, infinite loop)
 * 10  Feedback      — FeedbackCta
 * 11  Stats         — ChallengeCounter
 * 12  Final CTA     — FinalCta
 *
 * FAQ screen removed (07/10, Khanh) — section and its dock entry dropped.
 * FaqAccordion.jsx/FAQ_ITEMS kept in the codebase, just unused for now.
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  TestimonialsMarquee,
  ChallengeCounter,
  FinalCta,
  MagneticDock,
  FullScreenSection,
} from "./sub-components";
import "./styles.css";

// Bumped 0.2 -> 0.5 (07/10, Khanh reported the aurora fade was effectively
// invisible). At 0.2 the WebGL gradient was likely rendering correctly but
// too faint against the dark page background to perceive as "there".
const AURORA_VISIBILITY = 0.5;

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
      <HeroSection reducedMotion={reducedMotion} />

      {/* MarqueeBand pinned to the bottom of the hero screen */}
      <div className="absolute inset-x-0 bottom-1 z-30">
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

  // Intro splash only plays right after a fresh login (07/10, Khanh).
  // Login/index.jsx passes { fromLogin: true } in navigation state when it
  // redirects here; clicking the logo (Navigation.jsx) or the /play "back
  // to Welcome" button both navigate() here without that state, so the
  // splash does not replay on those visits.
  const location = useLocation();
  const showIntroSplash = Boolean(location.state?.fromLogin) && !prefersReducedMotion;

  // Phase 2: defer AuroraFlow until intro exits
  // introDone is derived: with no splash it is true at once; otherwise the timer below flips it
  const [introTimerDone, setIntroTimerDone] = useState(false);
  const introDone = !showIntroSplash || introTimerDone;

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

  // Delay introDone by the IntroSplash duration (5s hold + 0.6s exit fade,
  // 07/10 -- kept in sync with SPLASH_DURATION_MS in IntroSplash.jsx), but
  // only when the splash is actually going to play (fresh login).
  useEffect(() => {
    if (!showIntroSplash) return;
    const t = setTimeout(() => setIntroTimerDone(true), 5600);
    return () => clearTimeout(t);
  }, [showIntroSplash]);

  return (
    <div className="relative w-full text-[#e3e0f4] font-body overflow-x-hidden selection:bg-[#fad100] selection:text-[#003543]">
      {/* ------------------------------------------------------------------ */}
      {/* AuroraFlow — page-wide ambient background (deferred until introDone) */}
      {/* Phase 5: z-0, no solid ancestor bg, sections are transparent        */}
      {/* ------------------------------------------------------------------ */}
      {introDone && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[#0d0d1a]"
        >
          <div 
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: AURORA_VISIBILITY }}
          >
            <AuroraFlow
              className="absolute inset-0"
              preset="arcade"
              opacity={1}
              intensity={1}
              brightness={1}
              ambientOpacity={0.5}
              layers={4}
              pointerInteraction={false}
              grain={false}
            />
          </div>
        </div>
      )}

      {/* IntroSplash — fixed z-[100] overlay, unmounts after its exit anim */}
      {showIntroSplash && <IntroSplash />}

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

        {/* Screen 9: Testimonials — infinite right-to-left card marquee */}
        <FullScreenSection id="testimonials">
          <TestimonialsMarquee reducedMotion={prefersReducedMotion} />
        </FullScreenSection>

        {/* Screen 10: Feedback */}
        <FullScreenSection id="feedback">
          <FeedbackCta />
        </FullScreenSection>

        {/* Screen 11: Stats */}
        <FullScreenSection id="stats">
          <ChallengeCounter />
        </FullScreenSection>

        {/* Screen 12: Final CTA */}
        <FullScreenSection id="cta">
          <FinalCta onPlayNow={goToPlay} />
        </FullScreenSection>
      </div>

      {/* MagneticDock — always on top */}
      <MagneticDock onNavigate={scrollToSection} />
    </div>
  );
}
