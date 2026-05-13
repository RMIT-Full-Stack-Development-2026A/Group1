export default function ReadyButton({ isReady, isDisabled, onReady }) {
  const baseClassName =
    'border-2 font-headline text-[10px] px-8 py-4 uppercase tracking-widest transition-all w-full max-w-[320px]';

  if (isDisabled) {
    return (
      <button
        type="button"
        className={`${baseClassName} border-outline-variant text-outline opacity-40 cursor-not-allowed`}
        disabled
        onClick={() => {}}
      >
        WAITING FOR OPPONENT TO JOIN
      </button>
    );
  }

  if (isReady) {
    return (
      <button
        type="button"
        className={`${baseClassName} border-[#69ff47] text-[#69ff47] cursor-default`}
        disabled
      >
        READY - WAITING FOR OPPONENT
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${baseClassName} border-primary text-primary hover:bg-primary/10 cursor-pointer`}
      onClick={onReady}
    >
      READY UP
    </button>
  );
}
