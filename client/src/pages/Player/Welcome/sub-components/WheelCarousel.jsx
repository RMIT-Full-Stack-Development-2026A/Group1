/**
 * WheelCarousel — ported from componentry.dev/r/wheel-carousel.json
 *. "A cinematic rotating-wheel picker with inertial drag, curved
 * fading labels, and crossfading project imagery." Ported to plain
 * JSX/PropTypes (source is TypeScript for Next.js). The original also
 * depends on `next-themes` for light/dark switching — dropped entirely
 * since this app has no theme provider (always dark) — palette is
 * hardcoded to the arcade neon colors instead. Used to display the 3 board themes.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;
const MotionImg = motion.img;

const aspectRatios = { "3/4": "3 / 4", "1/1": "1 / 1", "4/3": "4 / 3", "3/2": "3 / 2" };

const PALETTE = {
  background: "#0d0d1a",
  text: "rgba(227, 224, 244, 0.4)",
  selected: "#4cc9f0",
  marker: "#fad100",
  panel: "#1e1e2c",
};

function wrapIndex(index, length) {
  if (!length || !Number.isFinite(index)) return 0;
  return ((index % length) + length) % length;
}

function shortestOffset(index, rotation, length) {
  let offset = index - rotation;
  while (offset > length / 2) offset -= length;
  while (offset < -length / 2) offset += length;
  return offset;
}

export default function WheelCarousel({
  items,
  photoSide = "left",
  photoShape = "square",
  photoWidth = 38,
  photoAspect = "1/1",
  contentWidth = 700,
  gap = 0,
  photoRadius = 0,
  crossfadeDuration = 0.5,
  radius = 160,
  spacing = 16,
  visibleItems = 3,
  apexInset = 44,
  dragSpeed = 0.02,
  snap = true,
  momentum = true,
  edgeFade = true,
  edgeFadeSize = 25,
  initialIndex = 0,
  onActiveChange,
  className,
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const instanceId = useId();
  const itemCount = items.length;
  const startingIndex = wrapIndex(initialIndex, itemCount);
  const [rotation, setRotation] = useState(startingIndex);
  const [selectedIndex, setSelectedIndex] = useState(startingIndex);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef(null);
  const rotationRef = useRef(startingIndex);
  const selectedRef = useRef(startingIndex);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({ y: 0, rotation: startingIndex });
  const previousDragRotationRef = useRef(startingIndex);
  const frameRef = useRef(null);

  const commitRotation = useCallback(
    (nextRotation) => {
      rotationRef.current = nextRotation;
      setRotation(nextRotation);
      const nextIndex = wrapIndex(Math.round(nextRotation), itemCount);
      if (nextIndex !== selectedRef.current) {
        selectedRef.current = nextIndex;
        setSelectedIndex(nextIndex);
        onActiveChange?.(items[nextIndex], nextIndex);
      }
    },
    [items, itemCount, onActiveChange]
  );

  const runAnimation = useCallback(() => {
    if (frameRef.current !== null) return;

    const tick = () => {
      let keepAnimating = false;

      if (!draggingRef.current && Math.abs(velocityRef.current) > 0.0008) {
        commitRotation(rotationRef.current + velocityRef.current);
        velocityRef.current *= momentum && !reduceMotion ? (snap ? 0.9 : 0.94) : 0.8;
        keepAnimating = true;
      } else if (!draggingRef.current && snap) {
        velocityRef.current = 0;
        const target = Math.round(rotationRef.current);
        const delta = target - rotationRef.current;
        if (Math.abs(delta) > 0.001 && !reduceMotion) {
          commitRotation(rotationRef.current + delta * 0.22);
          keepAnimating = true;
        } else {
          commitRotation(target);
        }
      } else if (!draggingRef.current) {
        velocityRef.current = 0;
      }

      if (keepAnimating) frameRef.current = requestAnimationFrame(tick);
      else frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [commitRotation, momentum, reduceMotion, snap]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  // No wheel handler: rely on drag / arrow keys so page scrolling is never trapped.

  const moveBy = (amount) => {
    velocityRef.current = 0;
    commitRotation(rotationRef.current + amount);
    runAnimation();
  };

  const handlePointerDown = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    draggingRef.current = true;
    setIsDragging(true);
    velocityRef.current = 0;
    dragOriginRef.current = { y: event.clientY, rotation: rotationRef.current };
    previousDragRotationRef.current = rotationRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;
    const distance = event.clientY - dragOriginRef.current.y;
    const nextRotation = dragOriginRef.current.rotation - distance * dragSpeed;
    velocityRef.current = nextRotation - previousDragRotationRef.current;
    previousDragRotationRef.current = nextRotation;
    commitRotation(nextRotation);
  };

  const handlePointerEnd = (event) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    runAnimation();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveBy(-1);
    }
  };

  // Guard against an empty/not-yet-ready items array — without this,
  // selectedItem is undefined and the image below throws on first render.
  if (itemCount === 0) return null;

  const safeSelectedIndex = wrapIndex(selectedIndex, itemCount);
  const selectedItem = items[safeSelectedIndex];
  if (!selectedItem) return null;
  const mask = edgeFade
    ? `linear-gradient(to bottom, transparent 0%, black ${edgeFadeSize}%, black ${100 - edgeFadeSize}%, transparent 100%)`
    : undefined;

  return (
    <MotionDiv
      initial={!reduceMotion ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex h-full w-full items-center justify-center", className)}
    >
      <div
        ref={stageRef}
        role="listbox"
        aria-label="Board theme wheel carousel"
        tabIndex={0}
        className={cn(
          "flex h-full w-full touch-none select-none items-stretch overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4cc9f0]",
          photoSide === "right" && "flex-row-reverse",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ maxWidth: contentWidth, gap }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div
          className={cn("flex h-full shrink-0 items-center justify-center", photoShape === "circle" ? "w-[42%]" : "")}
          style={photoShape === "square" ? { width: `${photoWidth}%` } : undefined}
        >
          <div
            className={cn(
              "relative",
              photoShape === "circle" ? "rounded-full" : "w-full max-h-full overflow-hidden"
            )}
            style={{
              aspectRatio: photoShape === "circle" ? "1 / 1" : aspectRatios[photoAspect],
              borderRadius: photoShape === "circle" ? "9999px" : photoRadius,
              width: photoShape === "circle" ? "min(56dvh, 480px)" : undefined,
            }}
          >
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: photoShape === "circle" ? "9999px" : photoRadius }}>
              <AnimatePresence initial={false} mode="sync">
                <MotionImg
                  key={`${safeSelectedIndex}-${selectedItem.image}`}
                  src={selectedItem.image}
                  alt={selectedItem.imageAlt ?? selectedItem.label}
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : crossfadeDuration }}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>
            </div>
            {photoShape === "circle" && (
              <MotionDiv
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow: "0 0 40px rgba(76,201,240,0.25), inset 0 0 60px rgba(13,13,26,0.6)",
                  border: "2px solid rgba(76,201,240,0.6)",
                }}
                animate={!reduceMotion ? { scale: [1, 1.02, 1] } : false}
                transition={!reduceMotion ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
              />
            )}
          </div>
        </div>

        <div className="relative h-full min-w-0 flex-1 overflow-hidden" style={{ maskImage: mask, WebkitMaskImage: mask }}>
          <span
            aria-hidden="true"
            className="absolute top-1/2 z-10 -translate-y-1/2 rounded-full"
            style={{
              left: `calc(${apexInset}% - 20px)`,
              width: 14,
              height: 14,
              marginLeft: -14,
              backgroundColor: PALETTE.marker,
            }}
          />

          {items.map((item, index) => {
            const offset = shortestOffset(index, rotation, itemCount);
            if (Math.abs(offset) > visibleItems + 1) return null;

            const angle = offset * spacing;
            const radians = (angle * Math.PI) / 180;
            const x = -radius * (1 - Math.cos(radians));
            const y = radius * Math.sin(radians);
            const distance = Math.min(Math.abs(offset) / visibleItems, 1);
            const opacity = Math.cos((distance * Math.PI) / 2);
            const scale = 1 - Math.min(Math.abs(offset) * 0.04, 0.45);
            const selected = Math.abs(offset) < 0.5;

            return (
              <div
                id={`${instanceId}-item-${index}`}
                key={`${item.label}-${index}`}
                role="option"
                aria-selected={selected}
                className="pointer-events-none absolute top-1/2 origin-left whitespace-nowrap font-headline text-[clamp(0.75rem,4.4vw,1.1rem)] md:text-[clamp(1.1rem,2.4vw,1.75rem)] leading-none tracking-[-0.01em]"
                style={{
                  left: `${apexInset}%`,
                  color: selected ? PALETTE.selected : PALETTE.text,
                  opacity,
                  transform: `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}deg) scale(${scale})`,
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </MotionDiv>
  );
}

WheelCarousel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, image: PropTypes.string.isRequired, imageAlt: PropTypes.string })
  ).isRequired,
  photoSide: PropTypes.oneOf(["left", "right"]),
  photoShape: PropTypes.oneOf(["square", "circle"]),
  photoWidth: PropTypes.number,
  photoAspect: PropTypes.oneOf(["3/4", "1/1", "4/3", "3/2"]),
  contentWidth: PropTypes.number,
  gap: PropTypes.number,
  photoRadius: PropTypes.number,
  crossfadeDuration: PropTypes.number,
  radius: PropTypes.number,
  spacing: PropTypes.number,
  visibleItems: PropTypes.number,
  apexInset: PropTypes.number,
  dragSpeed: PropTypes.number,
  snap: PropTypes.bool,
  momentum: PropTypes.bool,
  edgeFade: PropTypes.bool,
  edgeFadeSize: PropTypes.number,
  initialIndex: PropTypes.number,
  onActiveChange: PropTypes.func,
  className: PropTypes.string,
};

// defaultProps removed — React 19 dropped support for defaultProps on
// function components. All defaults are now declared inline above.
