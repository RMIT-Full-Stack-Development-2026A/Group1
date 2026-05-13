import RoomInfoBanner from './RoomInfoBanner';
import PlayerCard from './PlayerCard';
import ReadyButton from './ReadyButton';

export default function GameRoom({ roomData, currentUserId, onReady, onLeave, disconnectCountdown }) {
  const host = roomData?.participants?.[0] || null;
  const guest = roomData?.participants?.[1] || null;
  const myParticipant = roomData?.participants?.find((p) => p.userId === currentUserId) || null;
  const isMyReady = myParticipant?.isReady || false;
  const canReady = roomData?.status === 'READY';

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-8">
      <RoomInfoBanner
        roomNumber={roomData?.roomNumber || ''}
        boardSize={roomData?.boardSize || 10}
        boardStyle={roomData?.boardStyle || 'CLASSIC'}
        status={roomData?.status || 'WAITING'}
      />

      <div className="flex items-center gap-8">
        <PlayerCard participant={host} isCurrentUser={host?.userId === currentUserId} side="left" />
        <span className="font-headline text-[10px] text-on-surface-variant tracking-widest">VS</span>
        <PlayerCard participant={guest} isCurrentUser={guest?.userId === currentUserId} side="right" />
      </div>

      <ReadyButton isReady={isMyReady} isDisabled={!canReady} onReady={onReady} />

      <button
        onClick={onLeave}
        className="font-mono text-[9px] text-outline hover:text-on-surface-variant underline transition-colors"
      >
        Leave Room
      </button>

      {disconnectCountdown !== null && (
        <div className="border border-error bg-error-container/20 px-4 py-3 text-center w-full max-w-[480px]">
          <p className="font-headline text-[9px] text-error uppercase tracking-widest">
            OPPONENT DISCONNECTED — WAITING {disconnectCountdown}S
          </p>
        </div>
      )}
    </div>
  );
}
