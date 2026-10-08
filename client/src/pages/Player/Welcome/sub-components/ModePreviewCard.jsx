/**
 * ModePreviewCard
 * Pure visual preview card — clicking navigates to /play (same destination
 * as the Hero "PLAY NOW" button) regardless of which card was clicked.
 * This is intentional: see docs/welcome-page-plan.md §4.4 (confirmed with
 * Khanh 06/10 — no shortcut logic, /play keeps owning real mode selection).
 *
 * 07/10 update: removed the hover-to-preview mini board demo per Khanh's
 * feedback — back to a static card (icon, title, description).
 */

import PropTypes from "prop-types";

export default function ModePreviewCard({ mode, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative bg-[#1e1e2c] border-2 border-[#3d484d] p-6 text-left flex flex-col items-center text-center gap-4 transition-all hover:border-[#4cc9f0]"
      style={{ boxShadow: "4px 4px 0px #343342" }}
    >
      <div
        className="w-full h-1 absolute top-0 left-0"
        style={{ backgroundColor: mode.accentColor }}
      />

      <div
        className="w-14 h-14 mt-4 flex items-center justify-center border border-[#3d484d] group-hover:border-[#4cc9f0] transition-colors"
        style={{ backgroundColor: "#292937", color: mode.accentColor }}
      >
        <span className="material-symbols-outlined text-3xl">{mode.icon}</span>
      </div>

      <h3 className="font-headline text-sm md:text-base text-[#e3e0f4] uppercase">
        {mode.title}
      </h3>
      <p className="text-xs md:text-sm text-[#bcc8ce] leading-relaxed">{mode.description}</p>
    </button>
  );
}

ModePreviewCard.propTypes = {
  mode: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    accentColor: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};
