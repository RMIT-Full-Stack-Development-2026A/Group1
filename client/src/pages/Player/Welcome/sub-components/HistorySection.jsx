/**
 * HistorySection — Phase 3 redesign
 * Full-screen two-column layout:
 *   Left  — heading + description paragraph + timeline milestones.
 *   Right — Spiral3DSlider, mounted lazily (IntersectionObserver) and with
 *           a transparent R3F canvas so AuroraFlow shows behind it.
 *
 * Images: loaded automatically from @/assets/history/ via Vite's
 * import.meta.glob; falls back to the three theme bg assets when empty.
 *
 * TODO(Khanh): review copy in HISTORY_PLACEHOLDER.description before
 * merging to main. Drop real photos into client/src/assets/history/.
 */

import { useEffect, useRef, useState } from "react";
import classicBg from "@/assets/themes/classic/bg.png";
import blockBg from "@/assets/themes/block/bg.png";
import neonBg from "@/assets/themes/neon/bg.png";
import Spiral3DSlider from "./Spiral3DSlider";
import { HISTORY_PLACEHOLDER } from "../service/welcomeContent.service";

// ---------------------------------------------------------------------------
// Auto-load project photos from @/assets/history/ (Vite glob)
// Falls back to placeholder theme bgs when the folder is empty.
// ---------------------------------------------------------------------------
const historyModules = import.meta.glob(
  "@/assets/history/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
);

const PLACEHOLDER_SLIDES = [
  { src: classicBg, alt: "Placeholder photo 1 — replace with a real project photo" },
  { src: blockBg,   alt: "Placeholder photo 2 — replace with a real project photo" },
  { src: neonBg,    alt: "Placeholder photo 3 — replace with a real project photo" },
];

function buildSlides() {
  const entries = Object.entries(historyModules);
  if (entries.length === 0) return PLACEHOLDER_SLIDES;
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => ({ src, alt: path.split("/").pop() }));
}

const SLIDES = buildSlides();

// ---------------------------------------------------------------------------
// LazySpiral — mounts the WebGL canvas only while the section is near the
// viewport (IntersectionObserver, rootMargin 200px). Keeps at most one
// extra WebGL context alive at a time.
// ---------------------------------------------------------------------------
function LazySpiral({ slides }) {
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="h-full w-full">
      {visible && (
        <Spiral3DSlider
          items={slides}
          className="h-full w-full"
          // Phase 3: transparent canvas — AuroraFlow shows through
          // Phase 4: reduced dpr, demand frame loop
        />
      )}
    </div>
  );
}

export default function HistorySection() {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center h-full min-h-0">
      {/* ---- Left column: text + timeline ---- */}
      <div className="flex flex-col gap-6 min-h-0 overflow-y-auto">
        <h2 className="font-headline text-xl md:text-3xl text-[#e3e0f4] uppercase">
          {HISTORY_PLACEHOLDER.title}
        </h2>

        {/* Description paragraph — TODO(Khanh): review copy */}
        <p className="text-sm text-[#bcc8ce] leading-relaxed">
          TicTacToang is a neon-arcade Tic-Tac-Toe built as a full-stack web game,
          featuring offline single-player AI, real-time online multiplayer, extensive
          board and marker customization, and full match-replay history. Developed by
          a 5-person student team at RMIT as a semester project in 2026.
        </p>

        {/* Timeline */}
        <ul className="flex flex-col gap-4">
          {HISTORY_PLACEHOLDER.milestones.map((milestone) => (
            <li key={milestone.date} className="flex gap-3 border-l-2 border-[#4cc9f0] pl-4">
              <span className="font-headline text-[10px] text-[#fad100] whitespace-nowrap">
                {milestone.date}
              </span>
              <span className="text-sm text-[#bcc8ce]">{milestone.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- Right column: 3D spiral gallery ---- */}
      {/* No border, no bg — transparent canvas per Phase 3 spec */}
      <div className="h-[70dvh] md:h-full min-h-0">
        <LazySpiral slides={SLIDES} />
      </div>
    </div>
  );
}
