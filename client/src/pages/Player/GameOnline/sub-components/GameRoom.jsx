import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { useButtonSound } from '@/hooks/useButtonSound';
import { AUDIO_FILES } from '@/config/audioConfig';
import PlayerCard from './PlayerCard';
import ReadyButton from './ReadyButton';

function MatchConfigChip({ label, value }) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-2 bg-surface-container-high border-t-2 border-t-primary border border-outline-variant/60 min-w-[80px]"
    >
      <span className="font-mono text-[7px] text-outline uppercase tracking-widest whitespace-nowrap">{label}</span>
      <span className="font-headline text-[8px] text-on-surface-variant whitespace-nowrap">{value}</span>
    </div>
  );
}

export default function GameRoom({ roomData, currentUserId, onReady, onLeave, disconnectCountdown }) {
  const host = roomData?.participants?.[0] || null;
  const guest = roomData?.participants?.[1] || null;
  const myParticipant = roomData?.participants?.find((p) => p.userId === currentUserId) || null;
  const isMyReady = myParticipant?.isReady || false;
  // The room should only allow Ready Up once both participants are present.
  // The backend may also mirror this in room status, but participant count is the direct UI gate.
  const canReady = roomData?.participants?.length === 2;

  const { user } = useAuthStore();
  const { play: playClick } = useButtonSound(AUDIO_FILES.BUTTON_CLICK);

  const hostAvatarUrl = host?.userId === currentUserId ? (user?.avatar || user?.profileImage || null) : (host?.avatarUrl || host?.profileImage || null);
  const guestAvatarUrl = guest?.userId === currentUserId ? (user?.avatar || user?.profileImage || null) : (guest?.avatarUrl || guest?.profileImage || null);

  const readyCount = [host, guest].filter((p) => p?.isReady).length;

  const handleLeaveWithSound = useCallback(() => {
    playClick();
    onLeave();
  }, [playClick, onLeave]);

  return (
    <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden bg-background">

      <div className="mx-8 h-px bg-outline-variant/25 flex-none" />

      <div className="flex-1 flex items-stretch overflow-hidden min-h-0">
        <PlayerCard participant={host} isCurrentUser={host?.userId === currentUserId} side="left" avatarUrl={hostAvatarUrl} markerStyle={roomData?.markerStyle ?? 'PIXEL'} markerVariantKey={roomData?.markerStyle ?? 'PIXEL'} />
        
        <div className="flex-1 flex flex-col items-center justify-between py-3 px-4 bg-surface-container-lowest/30 overflow-hidden gap-3">
          <div className="flex flex-col items-center gap-2 flex-none">
            <span className="font-headline text-[36px] text-secondary">VS</span>
            <div className="h-10 w-px bg-gradient-to-b from-outline-variant to-transparent" />
            {/* Ready counter badge */}
            <div className="mt-2">
              <span className="font-headline text-[12px] text-primary border border-primary/30 px-3 py-1 uppercase tracking-widest shadow-glow-primary-sm">
                READY: {readyCount}/2
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-[260px] flex-none">
            <div className="flex flex-col items-center py-3 bg-surface-container border border-outline-variant/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <span className="font-mono text-[7px] text-outline uppercase tracking-widest mb-1">BATTLEFIELD</span>
              <span className="font-headline text-[16px] text-primary">{roomData?.boardSize || 10}<span className="text-outline-variant text-[10px]">x</span>{roomData?.boardSize || 10}</span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 flex flex-col items-center py-2 bg-surface-container border border-outline-variant/50">
                <span className="font-mono text-[7px] text-outline uppercase tracking-widest mb-1">STYLE</span>
                <span className="font-headline text-[9px] text-on-surface-variant">{roomData?.boardStyle || 'CLASSIC'}</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-2 bg-surface-container border border-outline-variant/50">
                <span className="font-mono text-[7px] text-outline uppercase tracking-widest mb-1">MARKER</span>
                <span className="font-headline text-[9px] text-on-surface-variant">{roomData?.markerStyle || 'PIXEL'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-1.5 bg-surface-container-high border border-outline-variant/50">
              <span className="font-mono text-[7px] text-outline uppercase tracking-widest">FIRST MOVE</span>
              <span className="font-headline text-[8px] text-secondary-container">PLAYER X</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 w-full max-w-[260px] flex-none">
            <div className="flex items-center gap-3">
              {[host, guest].map((p, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={p?.isReady ? 'w-2 h-2 bg-neon-green shadow-glow-green transition-all duration-500' : 'w-2 h-2 bg-outline-variant transition-all duration-500'} />
                  <span className="font-mono text-[7px] text-outline uppercase">{p?.usernameSnapshot?.slice(0, 8) || '???'}</span>
                </div>
              ))}
              <span className="font-mono text-[8px] text-outline-variant ml-1">{readyCount}/2</span>
            </div>

            <ReadyButton isReady={isMyReady} isDisabled={!canReady} onReady={onReady} />

            <button onClick={handleLeaveWithSound} className="font-mono text-[11px] text-outline border border-outline px-3 py-1.5 uppercase tracking-widest transition-all duration-200 cursor-pointer mt-2 underline-offset-4 hover:underline hover:text-error">
              LEAVE ROOM
            </button>
          </div>
        </div>

        <PlayerCard participant={guest} isCurrentUser={guest?.userId === currentUserId} side="right" avatarUrl={guestAvatarUrl} markerStyle={roomData?.markerStyle ?? 'PIXEL'} markerVariantKey={roomData?.markerStyle ?? 'PIXEL'} />
      </div>

      {disconnectCountdown !== null && (
        <div className="flex-none flex items-center justify-center gap-3 px-6 py-2 border-t border-error/40 bg-error-container/15">
          <div className="w-2 h-2 bg-error animate-pulse" />
          <p className="font-headline text-[8px] text-error uppercase tracking-widest">OPPONENT DISCONNECTED — ABORTING IN {disconnectCountdown}S</p>
        </div>
      )}
    </div>
  );
}
