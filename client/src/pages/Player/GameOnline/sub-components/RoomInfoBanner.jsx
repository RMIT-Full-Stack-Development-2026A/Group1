export default function RoomInfoBanner({ roomNumber, boardSize, boardStyle, status }) {
  const isWaiting = status === 'WAITING';
  const badgeClassName = isWaiting
    ? 'bg-surface-container-highest text-on-surface-variant text-[8px] font-mono px-2 py-1 uppercase tracking-widest'
    : 'bg-secondary-container text-on-secondary-container text-[8px] font-headline px-2 py-1 uppercase';
  const badgeText = isWaiting ? 'WAITING' : 'READY';

  return (
    <div className="bg-surface-container border-b border-outline-variant px-6 py-3 w-full flex items-center justify-between">
      <div>
        <p className="font-headline text-[10px] text-primary tracking-widest">
          {roomNumber}
        </p>
        <p className="font-mono text-[10px] text-on-surface-variant mt-1">
          Board: {boardSize}×{boardSize} · Style: {boardStyle}
        </p>
      </div>

      <span className={badgeClassName}>{badgeText}</span>
    </div>
  );
}
