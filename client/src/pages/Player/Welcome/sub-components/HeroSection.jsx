/**
 * HeroSection — Section 1
 * Full-bleed autoplay background video + title + tagline. No buttons — the
 * user just scrolls down on their own.
 *
 * 07/10 update (Khanh): "Welcome to" moved into IntroSplash (shown once,
 * before this page reveals) — removed here to avoid repeating it. The
 * tagline is back ("Welcome to" is no longer here, so it no longer reads
 * oddly next to it). Added PixelCanvas as an interactive ambient
 * background layer for more arcade-style motion (componentry.dev).
 */

import PixelCanvas from "./PixelCanvas";

export default function HeroSection() {
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
      <PixelCanvas className="absolute inset-0 z-[15] mix-blend-screen" variant="glow" />

      <div className="relative z-20 flex flex-col items-center text-center max-w-5xl mx-auto gap-4">
        <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl text-[#4cc9f0] tracking-tighter uppercase [text-shadow:4px_4px_0px_#1e1e2c]">
          TicTacToang
        </h1>
        <p className="font-body text-base md:text-lg text-[#bcc8ce] max-w-xl uppercase tracking-wide">
          The ultimate TicTacToe arena.{" "}
          <span className="text-[#93e2ff]">Precision or Perish.</span>
        </p>
      </div>
    </section>
  );
}
