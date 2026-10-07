/**
 * HistorySection — new dedicated section (07/10, Khanh)
 * Left: project history description lines. Right: Spiral3DSlider photo
 * gallery (componentry.dev, ported). Placeholder slides reuse the existing
 * theme bg assets — Khanh will swap these for real project photos.
 *
 * TODO: replace PLACEHOLDER_SLIDES with real photos before merging to main.
 */

import classicBg from "@/assets/themes/classic/bg.png";
import blockBg from "@/assets/themes/block/bg.png";
import neonBg from "@/assets/themes/neon/bg.png";
import Spiral3DSlider from "./Spiral3DSlider";
import { HISTORY_PLACEHOLDER } from "../service/welcomeContent.service";

const PLACEHOLDER_SLIDES = [
  { src: classicBg, alt: "Placeholder photo 1 — replace with a real project photo" },
  { src: blockBg, alt: "Placeholder photo 2 — replace with a real project photo" },
  { src: neonBg, alt: "Placeholder photo 3 — replace with a real project photo" },
];

export default function HistorySection() {
  return (
    <section id="history" className="w-full max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-12">
        {HISTORY_PLACEHOLDER.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
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

        <Spiral3DSlider items={PLACEHOLDER_SLIDES} className="rounded-none border border-[#3d484d]" />
      </div>
    </section>
  );
}
