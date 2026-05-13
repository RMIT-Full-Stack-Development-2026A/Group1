export default function PlayerCard({ participant, isCurrentUser, side }) {
  const isLeft = side === 'left';

  if (!participant) {
    return (
      <div className="bg-surface-container border border-outline-variant flex flex-col items-center gap-4 p-6 min-w-[200px] min-h-[260px] justify-center">
        <p className="animate-pulse text-outline font-mono text-[10px] text-center whitespace-pre-line">
          WAITING FOR
          {'\n'}OPPONENT...
        </p>
        <p className="animate-pulse text-outline font-mono text-[10px] text-center">
          [ ???? ]
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-surface-container border border-outline-variant flex flex-col items-center gap-4 p-6 min-w-[200px] min-h-[260px] justify-center"
      data-side={isLeft ? 'left' : 'right'}
    >
      {participant.isHost ? (
        <span className="text-[8px] font-mono text-secondary bg-surface-container-highest px-2 py-0.5 uppercase tracking-widest">
          HOST
        </span>
      ) : null}

      <div className="w-16 h-16 bg-surface-container-highest border border-outline flex items-center justify-center font-headline text-primary text-sm">
        {participant.mark}
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="font-headline text-[10px] text-on-surface tracking-widest text-center">
          {participant.usernameSnapshot}
        </p>
        {isCurrentUser ? (
          <span className="text-[8px] font-mono text-primary-fixed-dim uppercase">
            (YOU)
          </span>
        ) : null}
      </div>

      <p className={participant.isReady ? 'text-[9px] font-mono text-primary' : 'text-[9px] font-mono text-outline'}>
        {participant.isReady ? '✓ READY' : 'NOT READY'}
      </p>
    </div>
  );
}
