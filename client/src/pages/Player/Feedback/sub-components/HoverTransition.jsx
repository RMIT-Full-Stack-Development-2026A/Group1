/**
 * HoverTransition — ported from componentry.dev/r/hover-transition.json
 * "Eight polished hover transitions with per-card animation,
 * direction, color, and content controls." Ported to plain JSX/PropTypes
 * (source is TypeScript for Next.js). Requires clsx + tailwind-merge
 * (installed) via src/lib/utils.js's `cn` helper.
 */

import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const directionVectors = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  "top-left": { x: -1, y: -1 },
  "top-right": { x: 1, y: -1 },
  "bottom-right": { x: 1, y: 1 },
  "bottom-left": { x: -1, y: 1 },
  center: { x: 0, y: 0 },
};

const rippleOrigins = {
  top: "50% 0%",
  right: "100% 50%",
  bottom: "50% 100%",
  left: "0% 50%",
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-right": "100% 100%",
  "bottom-left": "0% 100%",
  center: "50% 50%",
};

function hiddenInset(direction) {
  switch (direction) {
    case "top":
      return "inset(0 0 100% 0)";
    case "right":
      return "inset(0 0 0 100%)";
    case "bottom":
      return "inset(100% 0 0 0)";
    case "left":
      return "inset(0 100% 0 0)";
    case "top-left":
      return "inset(0 100% 100% 0)";
    case "top-right":
      return "inset(0 0 100% 100%)";
    case "bottom-right":
      return "inset(100% 0 0 100%)";
    case "bottom-left":
      return "inset(100% 100% 0 0)";
    default:
      return "inset(50%)";
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Layer({ children, style }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={style}>
      {children}
    </div>
  );
}

export default function HoverTransition({
  defaultComponent,
  hoverComponent,
  effect = "wipe",
  direction = "right",
  duration = 0.72,
  easing = "cubic-bezier(0.22, 1, 0.36, 1)",
  label = "Interactive hover transition",
  className = "",
  focusable = true,
  forceActive = false,
}) {
  const rootRef = useRef(null);
  const [hovered, setActive] = useState(false);
  const active = hovered || forceActive;
  const reducedMotion = usePrefersReducedMotion();
  const vector = directionVectors[direction];
  const perceivedDurationScale = effect === "diagonal" || effect === "ripple" ? 1.25 : 1;
  const seconds = reducedMotion ? 0 : Math.max(0, duration) * perceivedDurationScale;
  const before = defaultComponent;
  const after = hoverComponent;
  const distanceX = vector.x * 100;
  const distanceY = vector.y * 100;

  const transitionFor = (properties, delay = 0, durationScale = 1) =>
    properties
      .map((property) => `${property} ${seconds * durationScale}s ${easing} ${reducedMotion ? 0 : delay}s`)
      .join(", ");

  const layerTransition = transitionFor(["clip-path", "transform", "opacity", "filter", "border-radius"]);

  const resetTilt = () => {
    const element = rootRef.current;
    if (!element) return;
    element.style.setProperty("--hover-tilt-x", "0deg");
    element.style.setProperty("--hover-tilt-y", "0deg");
  };

  const trackPointer = (event) => {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    const maxTilt = 2.4;
    event.currentTarget.style.setProperty("--hover-tilt-x", `${((0.5 - y) * maxTilt).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--hover-tilt-y", `${((x - 0.5) * maxTilt).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--hover-glare-x", `${(x * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--hover-glare-y", `${(y * 100).toFixed(1)}%`);
  };

  const hoverLayer = (style) => <Layer style={{ transition: layerTransition, ...style }}>{after}</Layer>;

  let animatedLayers;

  switch (effect) {
    case "ripple":
      animatedLayers = hoverLayer({
        clipPath: active ? `circle(150% at ${rippleOrigins[direction]})` : `circle(0% at ${rippleOrigins[direction]})`,
        filter: active ? "blur(0px)" : "blur(2px)",
        transform: active ? "scale(1)" : "scale(1.035)",
        transformOrigin: rippleOrigins[direction],
      });
      break;
    case "morph":
      animatedLayers = hoverLayer({
        borderRadius: active ? "0%" : "42%",
        clipPath: active ? "inset(0% round 0%)" : "inset(43% round 42%)",
        filter: active ? "blur(0px)" : "blur(3px)",
        opacity: active ? 1 : 0,
        transform: active
          ? "translate3d(0, 0, 0) scale(1) rotate(0deg)"
          : `translate3d(${distanceX * 0.04}%, ${distanceY * 0.04}%, 0) scale(.86) rotate(${vector.x < 0 ? -2 : 2}deg)`,
        transformOrigin: rippleOrigins[direction],
      });
      break;
    case "wipe":
    default:
      animatedLayers = hoverLayer({
        clipPath: active ? "inset(0)" : hiddenInset(direction),
        filter: active ? "blur(0px)" : "blur(1.5px)",
        transform: active ? "scale(1)" : "scale(1.025)",
        transformOrigin: rippleOrigins[direction],
      });
      break;
  }

  return (
    <div
      ref={rootRef}
      role={focusable ? "group" : undefined}
      aria-label={focusable ? label : undefined}
      tabIndex={focusable ? 0 : undefined}
      data-active={active ? "true" : "false"}
      data-effect={effect}
      className={cn(
        "relative isolate min-h-64 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#4cc9f0] focus-visible:ring-offset-2",
        className
      )}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
        setActive(false);
        resetTilt();
      }}
      onPointerMove={trackPointer}
      onFocus={() => setActive(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActive(false);
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transform: reducedMotion
            ? "none"
            : `perspective(1000px) rotateX(var(--hover-tilt-x, 0deg)) rotateY(var(--hover-tilt-y, 0deg)) scale(${active ? 1.012 : 1})`,
          transformStyle: "preserve-3d",
          transition: reducedMotion ? "none" : `transform ${active ? 0.22 : 0.55}s ${easing}`,
        }}
      >
        <div
          className="h-full w-full"
          style={{
            filter: active ? "brightness(.86) saturate(.88)" : "none",
            transform: active ? "scale(1.025)" : "scale(1)",
            transition: transitionFor(["transform", "filter"]),
          }}
        >
          {before}
        </div>
        {animatedLayers}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle 180px at var(--hover-glare-x, 50%) var(--hover-glare-y, 50%), rgba(255,255,255,.22), rgba(255,255,255,.05) 48%, transparent 78%)",
            opacity: active && !reducedMotion ? 0.16 : 0,
            transition: reducedMotion ? "none" : `opacity 0.3s ${easing}`,
          }}
        />
      </div>
    </div>
  );
}

HoverTransition.propTypes = {
  defaultComponent: PropTypes.node.isRequired,
  hoverComponent: PropTypes.node.isRequired,
  effect: PropTypes.oneOf(["wipe", "ripple", "morph"]),
  direction: PropTypes.oneOf([
    "top",
    "right",
    "bottom",
    "left",
    "top-left",
    "top-right",
    "bottom-right",
    "bottom-left",
    "center",
  ]),
  duration: PropTypes.number,
  easing: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  // false when a parent control (e.g. a button) already provides the focus stop and the name
  focusable: PropTypes.bool,
  // lets a parent reveal the hover layer, e.g. when its button has keyboard focus
  forceActive: PropTypes.bool,
};

// defaultProps removed — React 19 dropped support for defaultProps on
// function components. All defaults are now declared inline above.
