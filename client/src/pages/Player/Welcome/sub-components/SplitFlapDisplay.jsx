/**
 * SplitFlapDisplay — ported from componentry.dev/r/split-flap-display.json
 * (07/10). Airport-scoreboard flip effect, zero dependencies in the
 * original registry item. Ported to plain JSX/PropTypes (source is
 * TypeScript for Next.js). Used by ChallengeCounter to show the real
 * match count fetched from the backend — see docs/welcome-page-plan.md.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.,!?:;+-=%&#@";

function getNextChar(current) {
  const idx = CHARACTERS.indexOf(current);
  if (idx === -1 || idx >= CHARACTERS.length - 1) return CHARACTERS[0] ?? " ";
  return CHARACTERS[idx + 1] ?? " ";
}

function FlapCell({ targetChar, size, delay, flipSpeed }) {
  const [displayChar, setDisplayChar] = useState(" ");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipPhase, setFlipPhase] = useState("idle");
  const prevCharRef = useRef(" ");
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    cleanup();
    const target = targetChar.toUpperCase();

    if (displayChar === target) {
      setIsFlipping(false);
      setFlipPhase("idle");
      return cleanup;
    }

    timeoutRef.current = setTimeout(() => {
      setIsFlipping(true);
      intervalRef.current = setInterval(() => {
        setDisplayChar((prev) => {
          const next = getNextChar(prev);
          setFlipPhase("top-down");
          setTimeout(() => setFlipPhase("bottom-up"), flipSpeed * 0.4);
          setTimeout(() => setFlipPhase("idle"), flipSpeed * 0.8);
          prevCharRef.current = prev;

          if (next === target) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => {
              setIsFlipping(false);
              setFlipPhase("idle");
            }, flipSpeed);
          }
          return next;
        });
      }, flipSpeed);
    }, delay);

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetChar]);

  const sizeMap = {
    sm: { cell: "w-[26px] h-[38px] text-[16px]" },
    md: { cell: "w-[38px] h-[54px] text-[24px]" },
    lg: { cell: "w-[52px] h-[72px] text-[34px]" },
  };
  const s = sizeMap[size];

  return (
    <div className={cn("relative select-none font-mono font-bold", s.cell)} style={{ perspective: "400px" }}>
      <div
        className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-[3px]"
        style={{ background: "linear-gradient(180deg, #1e1e1e 0%, #181818 100%)" }}
      >
        <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[48%] text-[#e8e6e3] drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          {displayChar}
        </span>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-[3px]"
        style={{ background: "linear-gradient(180deg, #151515 0%, #111111 100%)" }}
      >
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[48%] text-[#d4d2cf] drop-shadow-[0_-1px_1px_rgba(0,0,0,0.6)]">
          {displayChar}
        </span>
      </div>
      {isFlipping && flipPhase === "top-down" && (
        <div
          className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-[3px] z-10"
          style={{
            background: "linear-gradient(180deg, #222 0%, #1a1a1a 100%)",
            transformOrigin: "bottom center",
            animation: `flapTopDown ${flipSpeed * 0.4}ms ease-in forwards`,
          }}
        >
          <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[48%] text-[#e8e6e3]">
            {prevCharRef.current}
          </span>
        </div>
      )}
      {isFlipping && flipPhase === "bottom-up" && (
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-[3px] z-10"
          style={{
            background: "linear-gradient(180deg, #181818 0%, #111 100%)",
            transformOrigin: "top center",
            animation: `flapBottomUp ${flipSpeed * 0.4}ms ease-out forwards`,
          }}
        >
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[48%] text-[#d4d2cf]">
            {displayChar}
          </span>
        </div>
      )}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
        style={{
          height: "2px",
          background: "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.9) 100%)",
        }}
      />
      <div
        className="absolute inset-0 rounded-[3px] z-20 pointer-events-none"
        style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(0,0,0,0.3)" }}
      />
    </div>
  );
}

FlapCell.propTypes = {
  targetChar: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  delay: PropTypes.number,
  flipSpeed: PropTypes.number,
};
FlapCell.defaultProps = { size: "md", delay: 0, flipSpeed: 35 };

function IndicatorStrip({ color, size }) {
  const heightMap = { sm: "h-[38px]", md: "h-[54px]", lg: "h-[72px]" };
  return (
    <div
      className={cn("w-[6px] rounded-[2px] flex-shrink-0 self-stretch", heightMap[size])}
      style={{
        background: `linear-gradient(180deg, ${color} 0%, ${color}99 40%, ${color}66 60%, ${color}99 100%)`,
        boxShadow: `0 0 8px ${color}44, inset 0 1px 2px rgba(255,255,255,0.2)`,
      }}
    />
  );
}

IndicatorStrip.propTypes = { color: PropTypes.string, size: PropTypes.oneOf(["sm", "md", "lg"]) };
IndicatorStrip.defaultProps = { color: "#4cc9f0", size: "md" };

function FlapRow({ text, columns, size, accentColor, showIndicators, staggerDelay, flipSpeed }) {
  const padded = text.toUpperCase().padEnd(columns, " ").substring(0, columns);

  return (
    <div className="flex items-center gap-1.5">
      {showIndicators && <IndicatorStrip color={accentColor} size={size} />}
      <div className="flex gap-[3px]">
        {padded.split("").map((char, i) => (
          <FlapCell key={i} targetChar={char} size={size} delay={i * staggerDelay} flipSpeed={flipSpeed} />
        ))}
      </div>
      {showIndicators && <IndicatorStrip color={accentColor} size={size} />}
    </div>
  );
}

FlapRow.propTypes = {
  text: PropTypes.string.isRequired,
  columns: PropTypes.number.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  accentColor: PropTypes.string,
  showIndicators: PropTypes.bool,
  staggerDelay: PropTypes.number,
  flipSpeed: PropTypes.number,
};
FlapRow.defaultProps = {
  size: "md",
  accentColor: "#4cc9f0",
  showIndicators: true,
  staggerDelay: 30,
  flipSpeed: 35,
};

const KEYFRAMES_ID = "split-flap-keyframes";

function useInjectKeyframes() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(KEYFRAMES_ID)) return;

    const style = document.createElement("style");
    style.id = KEYFRAMES_ID;
    style.textContent = `
      @keyframes flapTopDown { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(-90deg); } }
      @keyframes flapBottomUp { 0% { transform: rotateX(90deg); } 100% { transform: rotateX(0deg); } }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(KEYFRAMES_ID);
      if (el) el.remove();
    };
  }, []);
}

export default function SplitFlapDisplay({
  rows,
  text,
  columns,
  size,
  accentColor,
  showIndicators,
  staggerDelay,
  flipSpeed,
  className,
}) {
  useInjectKeyframes();

  const wrapperStyle = {
    background: "linear-gradient(145deg, #0c0c0c 0%, #080808 50%, #0a0a0a 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  if (text && !rows) {
    return (
      <div className={cn("inline-flex flex-col gap-2 p-4 rounded-2xl", className)} style={wrapperStyle}>
        <FlapRow
          text={text}
          columns={columns}
          size={size}
          accentColor={accentColor}
          showIndicators={showIndicators}
          staggerDelay={staggerDelay}
          flipSpeed={flipSpeed}
        />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex flex-col gap-2 p-5 rounded-2xl", className)} style={wrapperStyle}>
      {(rows ?? []).map((row, idx) => {
        const combined = `${row.label}${" ".repeat(Math.max(1, columns - row.label.length - row.value.length))}${row.value}`;
        return (
          <FlapRow
            key={idx}
            text={combined}
            columns={columns}
            size={size}
            accentColor={accentColor}
            showIndicators={showIndicators}
            staggerDelay={staggerDelay}
            flipSpeed={flipSpeed}
          />
        );
      })}
    </div>
  );
}

SplitFlapDisplay.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })),
  text: PropTypes.string,
  columns: PropTypes.number,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  accentColor: PropTypes.string,
  showIndicators: PropTypes.bool,
  staggerDelay: PropTypes.number,
  flipSpeed: PropTypes.number,
  className: PropTypes.string,
};

SplitFlapDisplay.defaultProps = {
  rows: undefined,
  text: undefined,
  columns: 14,
  size: "md",
  accentColor: "#4cc9f0",
  showIndicators: true,
  staggerDelay: 30,
  flipSpeed: 35,
  className: "",
};
