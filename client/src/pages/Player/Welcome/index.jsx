import { useWelcome } from "./hook/useWelcome.hook";
import {
  IntroSplash,
  AuroraFlow,
  HeroSection,
  MarqueeBand,
  ModeSelectPreview,
  HowToPlaySection,
  FeatureGrid,
  HistorySection,
  TeamSection,
  FeedbackCta,
  ChallengeCounter,
  FinalCta,
  FaqAccordion,
  MagneticDock,
} from "./sub-components";
import "./styles.css";

export default function Welcome() {
  const { prefersReducedMotion, scrollToSection, goToPlay } = useWelcome();

  return (
    <div className="relative min-h-screen w-full text-[#e3e0f4] font-body overflow-x-hidden selection:bg-[#fad100] selection:text-[#003543]">
      {/* Page-wide ambient background — fixed, sits behind every section.
          Hero's own video/overlay is opaque and paints over this layer,
          so the video is untouched (see HeroSection.jsx). */}
      <AuroraFlow className="fixed inset-0 z-0" preset="arcade" opacity={0.9} />

      <IntroSplash />

      <div className="relative z-10">
        <HeroSection />
        <MarqueeBand reducedMotion={prefersReducedMotion} />
        <ModeSelectPreview onPlayNow={goToPlay} />
        <HowToPlaySection />
        <FeatureGrid />
        <HistorySection />
        <TeamSection />
        <FeedbackCta />
        <ChallengeCounter />
        <FinalCta onPlayNow={goToPlay} />
        <FaqAccordion />
      </div>

      <MagneticDock onNavigate={scrollToSection} />
    </div>
  );
}
