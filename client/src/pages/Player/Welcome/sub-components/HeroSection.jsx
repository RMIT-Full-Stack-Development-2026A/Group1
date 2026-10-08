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

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import PixelCanvas from "./PixelCanvas";

export default function HeroSection({ reducedMotion = false }) {
  const videoRef = useRef(null);
  // Visitors who asked for reduced motion or data saving do not download the video at all: they see the
  // small poster image until they press play themselves.
  const saveData = typeof navigator !== "undefined" && navigator.connection?.saveData === true;
  // null = follow those settings; true/false = the visitor's own choice
  const [userPaused, setUserPaused] = useState(null);
  const [requested, setRequested] = useState(false);
  const paused = userPaused ?? (reducedMotion || saveData);
  const videoActive = requested || !paused;

  const togglePlayback = () => {
    if (paused) setRequested(true);
    setUserPaused(!paused);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else video.play().catch(() => {});
  }, [paused]);

  return (
    <div
      className="relative h-full min-h-0 w-full flex flex-col items-center justify-center overflow-hidden px-6 pt-16"
    >
      <video
        ref={videoRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-sm"
        src={videoActive ? "/videos/welcome-placeholder.mp4" : undefined}
        poster="/videos/welcome-poster.webp"
        preload={videoActive ? "auto" : "none"}
        autoPlay={!paused}
        muted
        loop
        playsInline
        style={{
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a]/80 via-[#0d0d1a]/60 to-[#0d0d1a]/10 z-10 pointer-events-none" />
      <PixelCanvas className="absolute inset-0 z-[15] mix-blend-screen" variant="glow" />

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={paused ? "Play background video" : "Pause background video"}
        className="absolute right-4 top-20 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-[#3d484d] bg-[#1a1a28]/85 text-[#93e2ff] transition-colors hover:border-[#4cc9f0] hover:text-[#4cc9f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc9f0]"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          {paused ? "play_arrow" : "pause"}
        </span>
      </button>

      <div className="relative z-20 flex w-full min-w-0 flex-col items-center text-center max-w-5xl mx-auto gap-4 -translate-y-1">
        <h1 className="font-headline text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#4cc9f0] tracking-tighter uppercase [text-shadow:4px_4px_0px_#1e1e2c]">
          TicTacToang
        </h1>
        <p className="font-body text-base md:text-lg text-[#bcc8ce] max-w-xl uppercase tracking-wide">
          The ultimate TicTacToe arena.{" "}
          <span className="text-[#93e2ff]">Precision or Perish.</span>
        </p>
      </div>
    </div>
  );
}

HeroSection.propTypes = {
  reducedMotion: PropTypes.bool,
};
