import { useWelcome } from "./hook/useWelcome.hook";
import {
  IntroSplash,
  HeroSection,
  MarqueeBand,
  ModeSelectPreview,
  HowToPlaySection,
  FeatureGrid,
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
    <div className="min-h-screen w-full bg-[#0d0d1a] text-[#e3e0f4] font-body overflow-x-hidden selection:bg-[#fad100] selection:text-[#003543]">
      <IntroSplash />

      <HeroSection />
      <MarqueeBand reducedMotion={prefersReducedMotion} />
      <ModeSelectPreview onPlayNow={goToPlay} />
      <HowToPlaySection />
      <FeatureGrid />
      <TeamSection />
      <FeedbackCta />
      <ChallengeCounter />
      <FinalCta onPlayNow={goToPlay} />
      <FaqAccordion />

      <MagneticDock onNavigate={scrollToSection} />
    </div>
  );
}
