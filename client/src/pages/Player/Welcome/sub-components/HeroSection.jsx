/**
 * HeroSection — Section 1
 * Full-bleed autoplay background video + title + CTAs. Video loads and
 * plays immediately on page load (not deferred behind a click) — see
 * docs/welcome-page-plan.md §4.2.
 *
 * 07/10 update (Khanh): removed the mini board demo and the tagline next
 * to the title — no longer needed here.
 */

import PropTypes from "prop-types";

export default function HeroSection({ onPlayNow, onHowToPlay }) {
  return (
    <section
      id="welcome-top"
      className="relative min-h-[80vh] w-full flex flex-col items-center justify-center overflow-hidden px-6 py-20"
    >
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/welcome-placeholder.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a]/80 via-[#0d0d1a]/60 to-[#0d0d1a] z-10" />

      <div className="relative z-20 flex flex-col items-center text-center max-w-5xl mx-auto gap-8">
        <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl text-[#4cc9f0] tracking-tighter uppercase [text-shadow:4px_4px_0px_#1e1e2c]">
          TicTacToang
        </h1>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={onPlayNow}
            className="bg-[#4cc9f0] text-[#003543] px-8 py-4 font-headline text-sm md:text-base border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#1e1e2c] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:shadow-[0px_0px_8px_#4cc9f0]"
          >
            PLAY NOW
          </button>
          <button
            type="button"
            onClick={onHowToPlay}
            className="border-2 border-[#3d484d] text-[#e3e0f4] px-8 py-4 font-headline text-sm md:text-base active:translate-y-[1px] transition-all hover:shadow-[0px_0px_8px_#4cc9f0] hover:border-[#4cc9f0]"
          >
            HOW TO PLAY
          </button>
        </div>
      </div>
    </section>
  );
}

HeroSection.propTypes = {
  onPlayNow: PropTypes.func.isRequired,
  onHowToPlay: PropTypes.func.isRequired,
};
