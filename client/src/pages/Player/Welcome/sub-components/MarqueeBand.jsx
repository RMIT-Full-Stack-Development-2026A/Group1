/**
 * MarqueeBand — Section 2
 * Continuous horizontal scroll, pauses on hover (CSS only). When the user
 * prefers reduced motion, render a static centered/wrapped row instead.
 */

import PropTypes from "prop-types";
import { MARQUEE_ITEMS } from "../service/welcomeContent.service";

export default function MarqueeBand({ reducedMotion = false }) {
  if (reducedMotion) {
    return (
      <div className="w-full border-y border-[#3d484d] bg-[#1e1e2c]/60 py-4">
        <div className="flex flex-wrap justify-center gap-6 px-6">
          {MARQUEE_ITEMS.map((item) => (
            <span key={item} className="font-headline text-xs text-[#93e2ff]">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="w-full border-y border-[#3d484d] bg-[#1e1e2c]/60 py-4 overflow-hidden">
      <div className="welcome-marquee-track flex gap-12 whitespace-nowrap w-max">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="font-headline text-xs text-[#93e2ff]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

MarqueeBand.propTypes = {
  reducedMotion: PropTypes.bool,
};

// defaultProps removed — React 19 dropped support for defaultProps on
// function components. All defaults are now declared inline above.
