import { useState, useEffect, useCallback, useMemo } from 'react';
import { matchReplayService } from '../service/matchReplay.service';

export const useMatchReplay = (gameId, isUserPremium) => {
  const [sessionData, setSessionData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // 1. Lấy và mapping dữ liệu Backend (DTO Pattern)
  useEffect(() => {
    if (!isUserPremium || !gameId) return;

    matchReplayService.getReplayById(gameId).then((raw) => {
      // DTO: Transform DB schema thành UI Schema dễ dùng
      const playerX = raw.participants.find(p => p.mark === 'X');
      const playerO = raw.participants.find(p => p.mark === 'O');
      
      const mappedMoves = raw.moves.map(m => ({
        ...m,
        mark: raw.participants[m.byParticipantIndex].mark,
      }));

      setSessionData({
        ...raw,
        playerX,
        playerO,
        moves: mappedMoves
      });
      setCurrentStep(mappedMoves.length); // Mặc định vào xem là tua đến cuối trận
    });
  }, [gameId, isUserPremium]);

  // 2. Playback System
  useEffect(() => {
    let interval;
    if (isPlaying && sessionData && currentStep < sessionData.moves.length) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= sessionData.moves.length - 1) {
            setIsPlaying(false);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    } else if (currentStep >= sessionData?.moves.length) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, sessionData, speed]);

  // 3. Render bàn cờ dựa theo currentStep
  const boardState = useMemo(() => {
    if (!sessionData) return [];
    const size = sessionData.boardSize;
    const board = Array.from({ length: size }, () => Array(size).fill(null));
    
    // Đánh dấu Winning Line nếu ở step cuối
    const isAtEnd = currentStep === sessionData.moves.length;
    const winSet = new Set((sessionData.winningLine || []).map(w => `${w.row},${w.col}`));

    sessionData.moves.slice(0, currentStep).forEach((move, i) => {
      board[move.row][move.col] = {
        mark: move.mark,
        stepIndex: move.moveNumber,
        isLatest: i === currentStep - 1,
        isWinning: isAtEnd && winSet.has(`${move.row},${move.col}`)
      };
    });
    return board;
  }, [sessionData, currentStep]);

  // 4. Các hàm Control
  const controls = {
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next: () => setCurrentStep(s => Math.min(sessionData.moves.length, s + 1)),
    prev: () => setCurrentStep(s => Math.max(0, s - 1)),
    first: () => setCurrentStep(0),
    last: () => setCurrentStep(sessionData.moves.length),
    jump: (step) => setCurrentStep(step),
    cycleSpeed: () => setSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 4 : 1))
  };

  return {
    sessionData,
    boardState,
    currentStep,
    isPlaying,
    speed,
    controls
  };
};