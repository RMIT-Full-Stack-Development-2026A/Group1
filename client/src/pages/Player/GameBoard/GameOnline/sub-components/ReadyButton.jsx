import { useButtonSound } from '@/hooks/useButtonSound';
import { AUDIO_FILES } from '@/config/audioConfig';

export default function ReadyButton({ isReady, isDisabled, onReady, onUnready }) {
  const { play: playClick } = useButtonSound(AUDIO_FILES.BUTTON_CLICK);

  const handleReadyClick = () => {
    if (isDisabled || isReady) return;
    playClick();
    if (onReady) onReady();
  };

  const handleCancelReady = () => {
    playClick();
    if (onUnready) onUnready();
  };

  const base = "border-2 font-headline text-[10px] px-8 py-2 uppercase tracking-widest transition-all max-w-[320px]";

  if (isDisabled) {
    return (
      <button type="button" disabled
        className={`${base} border-outline-variant text-outline opacity-40 cursor-not-allowed`}
      >

        WAITING FOR OPPONENT
      </button>
    );
  }

  if (!isReady) {
    return (
      <button
        type="button"
        onClick={handleReadyClick}
        className={`${base} border-primary text-primary w-full hover:shadow-glow-primary cursor-pointer text-[#fad100] animate-pulse`}
      >
        PRESS TO READY
      </button>
    );
  }

  return (
      <button
        type="button"
        disabled
        className={`${base} border-primary text-primary w-full hover:shadow-glow-primary cursor-pointer text-[#32CD32] animate-pulse`}
      >
        READY
      </button>  
      );
}
