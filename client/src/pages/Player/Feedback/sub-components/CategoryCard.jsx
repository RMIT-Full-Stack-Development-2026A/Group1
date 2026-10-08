/**
 * CategoryCard — uses the ported HoverTransition (componentry.dev) to
 * reveal the category description on hover, wiping up from the bottom.
 */

import { useState } from "react";
import PropTypes from "prop-types";
import HoverTransition from "./HoverTransition";

export default function CategoryCard({ category, isSelected, onSelect }) {
  const [focused, setFocused] = useState(false);
  const descriptionId = `feedback-category-${category.id.toLowerCase().replace(/\s+/g, "-")}-description`;
  const defaultContent = (
    <div
      className="h-full w-full flex flex-row md:flex-col items-center justify-start md:justify-center gap-3 p-3 md:p-6"
      style={{
        backgroundColor: "#1e1e2c",
        border: `2px solid ${isSelected ? category.accentColor : "#3d484d"}`,
      }}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-2xl md:text-3xl" style={{ color: category.accentColor }}>
        {category.icon}
      </span>
      <span className="font-headline text-xs text-[#e3e0f4] uppercase text-left md:text-center">
        {category.title}
      </span>
    </div>
  );

  const hoverContent = (
    <div
      className="h-full w-full flex flex-row md:flex-col items-center justify-start md:justify-center gap-3 md:gap-2 p-3 md:p-6 text-left md:text-center"
      style={{ backgroundColor: "#003543", border: `2px solid ${category.accentColor}` }}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-xl md:text-2xl" style={{ color: category.accentColor }}>
        {category.icon}
      </span>
      <p className="text-xs text-[#e3e0f4] leading-tight md:leading-relaxed">{category.description}</p>
    </div>
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-pressed={isSelected}
      aria-label={`${category.title} feedback category`}
      aria-describedby={descriptionId}
      className="text-left w-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc9f0]"
    >
      <span id={descriptionId} className="sr-only">
        {category.description}
      </span>
      <HoverTransition
        defaultComponent={defaultContent}
        hoverComponent={hoverContent}
        effect="wipe"
        direction="bottom"
        className="min-h-[64px] h-[64px] md:min-h-[150px] md:h-[150px]"
        focusable={false}
        forceActive={focused}
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
