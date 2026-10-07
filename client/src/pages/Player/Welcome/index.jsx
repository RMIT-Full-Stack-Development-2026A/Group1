import { useWelcome } from "./hook/useWelcome.hook";
import {
  IntroSplash,
  HeroSection,
  MarqueeBand,
  ModeSelectPreview,
  HowToPlaySection,
  FeatureGrid,
  TeamSection,
  FeedbackSection,
  ChallengeCounter,
  FaqAccordion,
  FinalCta,
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
      <ModeSelectPreview onPlayNow={goToPlay} reducedMotion={prefersReducedMotion} />
      <HowToPlaySection />
      <FeatureGrid />
      <TeamSection />
      <FeedbackSection />
      <ChallengeCounter />
      <FaqAccordion />
      <FinalCta onPlayNow={goToPlay} />

      <MagneticDock onNavigate={scrollToSection} />
    </div>
  );
}
