/**
 * MiniBoardDemo
 * Self-contained decorative 3x3 tic-tac-toe board. No socket, no AI service,
 * no auth dependency — purely local state so it can never break the real
 * game flow. Runs a fixed scripted sequence on a loop (X,O,X,O,X,
 * alternating through the 5 cell indices in `script`) and resets once a
 * winner is drawn. Each caller passes a different `script` so the 3 mode
 * preview cards (Section 3) each show a visually distinct demo instead of
 * one shared animation — see docs/welcome-page-plan.md §4.4 (07/10 update).
 */

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const MotionDiv = motion.div;
const EMPTY_BOARD = Array(9).fill(null);

const LINE_STYLES = {
  "0,1,2": { top: "16.67%", left: "4%", width: "92%", height: "4px", transform: "translateY(-50%)" },
  "3,4,5": { top: "50%", left: "4%", width: "92%", height: "4px", transform: "translateY(-50%)" },
  "6,7,8": { top: "83.33%", left: "4%", width: "92%", height: "4px", transform: "translateY(-50%)" },
  "0,3,6": { left: "16.67%", top: "4%", height: "92%", width: "4px", transform: "translateX(-50%)" },
  "1,4,7": { left: "50%", top: "4%", height: "92%", width: "4px", transform: "translateX(-50%)" },
  "2,5,8": { left: "83.33%", top: "4%", height: "92%", width: "4px", transform: "translateX(-50%)" },
  "0,4,8": { top: "50%", left: "50%", width: "125%", height: "4px", transform: "translate(-50%, -50%) rotate(45deg)" },
  "2,4,6": { top: "50%", left: "50%", width: "125%", height: "4px", transform: "translate(-50%, -50%) rotate(-45deg)" },
};

const WIN_LINES = Object.keys(LINE_STYLES).map((key) => key.split(",").map(Number));

function checkWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line };
    }
  }
  return null;
}

function WinLineOverlay({ line, reducedMotion }) {
  const style = LINE_STYLES[line.join(",")] || {};
  return (
    <MotionDiv
      className="absolute bg-[#fad100] shadow-[0_0_10px_#fad100] pointer-events-none"
      style={style}
      initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
    />
  );
}

WinLineOverlay.propTypes = {
  line: PropTypes.arrayOf(PropTypes.number).isRequired,
  reducedMotion: PropTypes.bool,
};

export default function MiniBoardDemo({ script, reducedMotion }) {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [winInfo, setWinInfo] = useState(null);
  const timeoutsRef = useRef([]);

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    let stepIndex = 0;
    let currentBoard = EMPTY_BOARD;

    const runStep = () => {
      if (stepIndex >= script.length) {
        schedule(() => {
          currentBoard = EMPTY_BOARD;
          setBoard(EMPTY_BOARD);
          setWinInfo(null);
          stepIndex = 0;
          schedule(runStep, 400);
        }, reducedMotion ? 600 : 1500);
        return;
      }
      const mark = stepIndex % 2 === 0 ? "X" : "O";
      const index = script[stepIndex];
      currentBoard = currentBoard.map((cell, i) => (i === index ? mark : cell));
      setBoard(currentBoard);

      const winner = checkWinner(currentBoard);
      if (winner) setWinInfo(winner);

      stepIndex += 1;
      schedule(runStep, reducedMotion ? 300 : 600);
    };

    schedule(runStep, 300);

    return clearAllTimeouts;
  }, [script, reducedMotion]);

  return (
    <div className="relative w-full max-w-[320px] mx-auto aspect-square border border-[#3d484d] bg-[#1a1a28]">
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
        {board.map((cell, index) => (
          <div
            key={index}
            className="relative flex items-center justify-center border border-[#3d484d] font-headline text-2xl md:text-3xl"
          >
            {cell === "X" && (
              <span className="text-[#ffb4ab] [text-shadow:0_0_10px_#93000a]">X</span>
            )}
            {cell === "O" && (
              <span className="text-[#4cc9f0] [text-shadow:0_0_10px_#4cc9f0]">O</span>
            )}
          </div>
        ))}
      </div>
      {winInfo && <WinLineOverlay line={winInfo.line} reducedMotion={reducedMotion} />}
    </div>
  );
}

MiniBoardDemo.propTypes = {
  script: PropTypes.arrayOf(PropTypes.number),
  reducedMotion: PropTypes.bool,
};

MiniBoardDemo.defaultProps = {
  script: [0, 4, 1, 5, 2], // default: X wins the top row
  reducedMotion: false,
};
