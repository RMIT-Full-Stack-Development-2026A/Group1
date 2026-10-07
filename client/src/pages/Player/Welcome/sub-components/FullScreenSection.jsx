/**
 * FullScreenSection — Phase 1 helper
 * Wraps each welcome-page section so it occupies exactly one full viewport
 * height when scroll-snap is active (≥ md breakpoint). On mobile the
 * section is at minimum full-viewport tall but can be taller; normal
 * scrolling applies. The snap anchor is on the <html> element (see
 * Welcome/index.jsx), not on a nested container, so window.scrollY
 * continues to work correctly for AuroraFlow's scroll interaction and
 * useWelcome's scrollToSection helper.
 *
 * pt-20 (≈ 80px) clears the fixed top navbar; pb-28 (≈ 112px) clears
 * the fixed bottom MagneticDock. Content is flex-centered inside.
 */

import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

export default function FullScreenSection({ id, children, className }) {
  return (
    <section
      id={id}
      className={cn(
        // snap-start + snap-always: each wheel notch lands on the section
        "relative flex h-dvh w-full snap-start snap-always",
        "flex-col items-center justify-center overflow-hidden",
        // Clear navbar top (pt-20) and dock bottom (pb-28)
        "px-6 pt-20 pb-28",
        className
      )}
    >
      {children}
    </section>
  );
}

FullScreenSection.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};
