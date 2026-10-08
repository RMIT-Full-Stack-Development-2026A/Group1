import { useButtonSound } from '@/hooks/useButtonSound';
import { AUDIO_FILES } from '@/config/audioConfig';

export default function ReadyButton({ isReady, isDisabled, onReady }) {
  const { play: playClick } = useButtonSound(AUDIO_FILES.BUTTON_CLICK);

  const handleReadyClick = () => {
    if (isDisabled || isReady) return;
    playClick();
    if (onReady) onReady();
  };

  const base = "border-2 font-headline text-xs px-4 lg:px-8 py-2 uppercase tracking-widest transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] max-w-[320px]";

  if (isDisabled) {
    return (
      <button type="button" disabled
        className={`${base} border-outline-variant text-[#bcc8ce] cursor-not-allowed`}
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
        className={`${base} border-current w-full hover:shadow-glow-primary cursor-pointer text-[#fad100] animate-pulse`}
      >
        PRESS TO READY
      </button>
    );
  }

  return (
      <button
        type="button"
        disabled
        className={`${base} border-current w-full hover:shadow-glow-primary cursor-pointer text-[#32CD32] animate-pulse`}
      >
        READY
      </button>  
      );
}
