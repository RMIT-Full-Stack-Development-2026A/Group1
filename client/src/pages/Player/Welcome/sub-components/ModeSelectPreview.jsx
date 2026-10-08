/**
 * ModeSelectPreview — Section 3
 */

import PropTypes from "prop-types";
import { MODE_PREVIEWS } from "../service/welcomeContent.service";
import ModePreviewCard from "./ModePreviewCard";

export default function ModeSelectPreview({ onPlayNow }) {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-10">
        3 Game Modes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODE_PREVIEWS.map((mode) => (
          <ModePreviewCard key={mode.id} mode={mode} onSelect={onPlayNow} />
        ))}
      </div>
    </section>
  );
}

ModeSelectPreview.propTypes = {
  onPlayNow: PropTypes.func.isRequired,
};
