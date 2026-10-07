/**
 * CategoryCard — uses the ported HoverTransition (componentry.dev) to
 * reveal the category description on hover, wiping up from the bottom.
 */

import PropTypes from "prop-types";
import HoverTransition from "./HoverTransition";

export default function CategoryCard({ category, isSelected, onSelect }) {
  const defaultContent = (
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-3 p-6"
      style={{
        backgroundColor: "#1e1e2c",
        border: `2px solid ${isSelected ? category.accentColor : "#3d484d"}`,
      }}
    >
      <span className="material-symbols-outlined text-3xl" style={{ color: category.accentColor }}>
        {category.icon}
      </span>
      <span className="font-headline text-xs text-[#e3e0f4] uppercase text-center">
        {category.title}
      </span>
    </div>
  );

  const hoverContent = (
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-2 p-6 text-center"
      style={{ backgroundColor: "#003543", border: `2px solid ${category.accentColor}` }}
    >
      <span className="material-symbols-outlined text-2xl" style={{ color: category.accentColor }}>
        {category.icon}
      </span>
      <p className="text-xs text-[#e3e0f4] leading-relaxed">{category.description}</p>
    </div>
  );

  return (
    <button type="button" onClick={() => onSelect(category.id)} className="text-left w-full">
      <HoverTransition
        defaultComponent={defaultContent}
        hoverComponent={hoverContent}
        effect="wipe"
        direction="bottom"
        className="min-h-[150px] h-[150px]"
        label={`${category.title} feedback category`}
      />
      {isSelected && (
        <div
          className="h-1 w-full mt-1"
          style={{ backgroundColor: category.accentColor }}
        />
      )}
    </button>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    accentColor: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};
