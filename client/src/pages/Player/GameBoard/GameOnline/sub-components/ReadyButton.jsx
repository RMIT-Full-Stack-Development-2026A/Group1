import { useButtonSound } from '@/hooks/useButtonSound';
import { AUDIO_FILES } from '@/config/audioConfig';

export default function ReadyButton({ isReady, isDisabled, onReady, onUnready }) {
  const { play: playClick } = useButtonSound(AUDIO_FILES.BUTTON_CLICK);

  const handleReadyClick = () => {
    if (isDisabled || isReady) return;
    playClick();
    if (onReady) onReady();
  };

  const handleCancelClick = () => {
    if (isDisabled || !isReady) return;
    playClick();
    if (onUnready) onUnready();
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

  // Ready: still pulses green so it reads as "waiting for the opponent", but it can be cancelled.
  return (
    <button
      type="button"
      onClick={handleCancelClick}
      className={`${base} border-current w-full cursor-pointer text-[#32CD32] animate-pulse motion-reduce:animate-none hover:bg-[#32CD32]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32CD32]`}
    >
      <span className="block">READY</span>
      <span className="block text-xs normal-case tracking-normal">Tap to cancel</span>
    </button>
  );
}
