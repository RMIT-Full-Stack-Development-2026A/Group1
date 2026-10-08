/**
 * MagneticDock — mandatory enhancement (see docs/welcome-page-plan.md §4.10)
 *
 * The GitHub issue named a package, `@componentry/magnetic-dock`, that does
 * not exist on the npm registry (verified via `npm view`/`npm search` —
 * both returned nothing). It turned out componentry.dev is real but
 * distributes components as a shadcn registry (source-copy, not an npm
 * dependency) via `npx shadcn@latest add @componentry/magnetic-dock`.
 * Running `shadcn init` on this shared repo was judged too risky (it can
 * rewrite Tailwind config / global CSS variables used by every other page),
 * so the real registry JSON (componentry.dev/r/magnetic-dock.json) was
 * fetched directly and its component logic ported here by hand: plain
 * JSX + PropTypes (the original is TypeScript for Next.js), restyled to
 * this project's arcade neon palette instead of the registry's light/dark
 * neutral theme. No new dependency — framer-motion was already installed.
 *
 * Fixed bottom-center, quick-jump icons to each section, with the full
 * magnetic-dock interaction set: distance-based scale, spring physics,
 * a floating lift as icons grow, a hover tooltip label, and a shine/glow
 * highlight. Magnify + lift + tooltip are disabled on touch devices
 * (matchMedia hover:none/pointer:coarse) and when the user prefers reduced
 * motion — icons stay at rest scale but remain fully clickable either way.
 */

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { DOCK_SECTIONS } from "../service/welcomeContent.service";

const MotionButton = motion.button;
const MotionDiv = motion.div;

const ICON_SIZE = 44;
const MAX_SCALE = 1.5;
const MAGNETIC_DISTANCE = 140;
const SPRING_CONFIG = { damping: 20, stiffness: 300, mass: 0.5 };

function DockIcon({ mouseX, section, onClick, magnifyDisabled }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const showLabel = !magnifyDisabled && (isHovered || isFocused);

  const distance = useTransform(mouseX, (value) => {
    if (!ref.current) return MAGNETIC_DISTANCE + 1;
    const rect = ref.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    return value - center;
  });

  const rawScale = useTransform(
    distance,
    [-MAGNETIC_DISTANCE, 0, MAGNETIC_DISTANCE],
    [1, MAX_SCALE, 1]
  );
  const scale = useSpring(rawScale, SPRING_CONFIG);
  const size = useTransform(scale, (value) => value * ICON_SIZE);
  const rawLift = useTransform(scale, (value) => (value - 1) * -10);
  const lift = useSpring(rawLift, SPRING_CONFIG);

  return (
    <MotionButton
      ref={ref}
      type="button"
      onClick={onClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={section.label}
      title={section.label}
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: magnifyDisabled ? ICON_SIZE : size,
        height: magnifyDisabled ? ICON_SIZE : size,
        y: magnifyDisabled ? 0 : lift,
      }}
      whileTap={magnifyDisabled ? undefined : { scale: 0.9 }}
    >
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center border transition-colors"
        style={{
          backgroundColor: "#1a1a28",
          borderColor: isHovered ? "#4cc9f0" : "#3d484d",
          boxShadow: isHovered
            ? "0 0 20px rgba(76, 201, 240, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <span className="material-symbols-outlined text-[#93e2ff] text-lg">
          {section.icon}
        </span>

        {/* Shine overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)",
            opacity: isHovered ? 0.9 : 0.4,
          }}
        />
      </div>

      <AnimatePresence initial={false}>
        {showLabel && (
          <MotionDiv
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap font-headline text-[9px] uppercase pointer-events-none z-50"
            style={{
              backgroundColor: "#1a1a28",
              color: "#e3e0f4",
              border: "1px solid #3d484d",
              boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
            }}
          >
            {section.label}
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionButton>
  );
}

DockIcon.propTypes = {
  mouseX: PropTypes.object.isRequired,
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  magnifyDisabled: PropTypes.bool.isRequired,
};

export default function MagneticDock({ onNavigate }) {
  const mouseX = useMotionValue(Infinity);
  const [isTouch, setIsTouch] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setIsTouch(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const magnifyDisabled = isTouch || prefersReducedMotion;

  const handleMouseMove = (event) => {
    if (magnifyDisabled) return;
    mouseX.set(event.clientX);
  };

  const handleMouseLeave = () => {
    mouseX.set(Infinity);
  };

  return (
    <MotionDiv
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-end gap-3 px-4 py-2.5 rounded-full backdrop-blur-sm"
      style={{ backgroundColor: "rgba(13, 13, 26, 0.85)", border: "1px solid #3d484d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {DOCK_SECTIONS.map((section) => (
        <DockIcon
          key={section.id}
          mouseX={mouseX}
          section={section}
          onClick={() => onNavigate(section.id)}
          magnifyDisabled={magnifyDisabled}
        />
      ))}
    </MotionDiv>
  );
}

MagneticDock.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
