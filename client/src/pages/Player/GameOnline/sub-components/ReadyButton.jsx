import { useState, useEffect, useRef } from 'react';
import { useButtonSound } from '@/hooks/useButtonSound';
import { AUDIO_FILES } from '@/config/audioConfig';

export default function ReadyButton({ isReady, isDisabled, onReady, onUnready }) {
  const [countdown, setCountdown] = useState(null);
  const intervalRef = useRef(null);
  const { play: playClick } = useButtonSound(AUDIO_FILES.BUTTON_CLICK);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isReady && countdown !== null) {
      setCountdown(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isReady]);

  const handleReadyClick = () => {
    if (isDisabled || isReady || countdown !== null) return;
    playClick();
    setCountdown(3);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (onReady) onReady();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    playClick();
    setCountdown(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleCancelReady = () => {
    playClick();
    if (onUnready) onUnready();
  };

  const base = 'w-full font-headline text-[10px] px-6 py-4 uppercase tracking-widest transition-all duration-300 border-2';

  if (isDisabled) {
    return (
      <button type="button" disabled
        className="w-full font-headline text-[10px] px-6 py-4 uppercase tracking-widest border-2 border-outline-variant text-outline opacity-40 cursor-not-allowed">
        WAITING FOR OPPONENT
      </button>
    );
  }

  if (countdown !== null) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <button
          type="button"
          onClick={handleCancelCountdown}
          className={`${base} border-secondary-container text-secondary-container bg-secondary-container/10 animate-pulse shadow-glow-gold`}
        >
          CONFIRMING... {countdown}
        </button>
        <button
          type="button"
          onClick={handleCancelCountdown}
          className="font-mono text-[8px] text-outline hover:text-error uppercase tracking-widest transition-colors cursor-pointer"
        >
          CANCEL
        </button>
      </div>
    );
  }

  if (!isReady) {
    return (
      <button
        type="button"
        onClick={handleReadyClick}
        className={`${base} border-primary text-primary hover:bg-primary/10 hover:shadow-glow-primary animate-pulse`}
      >
        READY UP
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        type="button"
        disabled
        className="w-full font-headline text-[10px] px-6 py-4 uppercase tracking-widest border-2 border-neon-green text-neon-green bg-neon-green-dim cursor-default shadow-glow-green"
      >
        READY
      </button>
      {onUnready && (
        <button
          type="button"
          onClick={handleCancelReady}
          className="font-mono text-[8px] text-outline hover:text-error uppercase tracking-widest transition-colors cursor-pointer"
        >
          CANCEL READY
        </button>
      )}
    </div>
  );
}
