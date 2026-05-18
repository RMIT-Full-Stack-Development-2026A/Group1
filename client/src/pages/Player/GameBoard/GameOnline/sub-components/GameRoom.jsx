import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { useButtonSound } from '@/hooks/useButtonSound';
import { AUDIO_FILES } from '@/config/audioConfig';
import PlayerCard from './PlayerCard';
import ReadyButton from './ReadyButton';
import Footer from '@/components/reusable/Footer';

// function MatchConfigChip({ label, value }) {
//   return (
//     <div
//       className="flex flex-col items-center gap-1 px-4 py-2 bg-surface-container-high border-t-2 border-t-primary border border-outline-variant/60 min-w-[80px]"
//     >
//       <span className="font-mono text-[7px] text-outline uppercase tracking-widest whitespace-nowrap">{label}</span>
//       <span className="font-headline text-[8px] text-on-surface-variant whitespace-nowrap">{value}</span>
//     </div>
//   );
// }

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
    <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden bg-deep-bg">

      <div className="flex-none flex flex-col py-2 items-center pt-8 pb-2 px-8 gap-1">
        <h1 className="font-headline text-2xl text-[#4cc9f0] drop-shadow-[0_0_12px_rgba(76,201,240,0.6)] uppercase tracking-widest">
          MATCH LOBBY
        </h1>
        <div className="h-1 w-24 bg-[#4cc9f0]" />
      </div>

      <div className="flex-1 flex items-center overflow-hidden min-h-0 px-6 gap-4">
        <PlayerCard participant={host} isCurrentUser={host?.userId === currentUserId} side="left" avatarUrl={hostAvatarUrl} markerStyle={roomData?.markerStyle ?? 'PIXEL'} markerVariantKey={roomData?.markerStyle ?? 'PIXEL'} />

        <div className="flex-1 flex flex-col items-center justify-between py-3 px-4 bg-surface-container overflow-hidden gap-3">
          <div className="flex flex-col items-center gap-2 flex-none">
            <span className="font-headline text-[36px] text-[#fad100]">VS</span>
           
            {/* Ready counter badge */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-headline text-[11px] text-[#4cc9f0] border border-[#4cc9f0]/40 px-4 py-1.5 uppercase tracking-widest shadow-[0px_0px_8px_rgba(76,201,240,0.2)]">
                READY {readyCount}/2
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-[300px] flex-none">
            {/* Gold section label — matches GameCustomization section header style */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-[#fad100]" />
              <span className="font-headline text-[10px] text-[#fad100] uppercase tracking-widest">
                MATCH CONFIG
              </span>
            </div>

            {/* BATTLEFIELD */}
            <div className="flex flex-col items-center py-3 bg-[#1e1e2c] border border-[#3d484d] shadow-[2px_2px_0px_#343342] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#4cc9f0] to-transparent" />
              <span className="font-mono text-[10px] text-[#879398] uppercase tracking-widest mb-1">BATTLEFIELD</span>
              <span className="font-headline text-2xl text-[#4cc9f0]">
                {roomData?.boardSize || 10}
                <span className="text-[#879398] text-sm">x</span>
                {roomData?.boardSize || 10}
              </span>
            </div>

            {/* STYLE + MARKER side by side */}
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col items-center py-3 bg-[#1e1e2c] border border-[#3d484d] shadow-[2px_2px_0px_#343342]">
                <span className="font-mono text-[10px] text-[#879398] uppercase tracking-widest mb-1">STYLE</span>
                <span className="font-headline text-sm text-[#4cc9f0]">{roomData?.boardStyle || 'CLASSIC'}</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-3 bg-[#1e1e2c] border border-[#3d484d] shadow-[2px_2px_0px_#343342]">
                <span className="font-mono text-[10px] text-[#879398] uppercase tracking-widest mb-1">MARKER</span>
                <span className="font-headline text-sm text-[#4cc9f0]">{roomData?.markerStyle || 'PIXEL'}</span>
              </div>
            </div>

            {/* FIRST MOVE */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2c] border border-[#3d484d] shadow-[2px_2px_0px_#343342]">
              <span className="font-mono text-[10px] text-[#879398] uppercase tracking-widest">FIRST MOVE</span>
              <span className="font-headline text-sm text-[#fad100]">PLAYER X</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 w-full max-w-[260px] flex-none min-h-[140px]">
            <div className="flex items-center justify-center gap-4 w-full">
              {[host, guest].map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 transition-all duration-500 ${p?.isReady ? 'bg-[#24d642]' : 'bg-[#6d706d]'}`} />
                  <span className={`font-mono text-[10px] uppercase tracking-wider transition-colors duration-500 ${p?.isReady ? 'text-[#24d642]' : 'text-[#6d706d]'}`}>
                    {p?.usernameSnapshot || '???'}
                  </span>
                </div>
              ))}
            </div>
            
            {/* READY BUTTON */}
            <ReadyButton isReady={isMyReady} isDisabled={!canReady} onReady={onReady} />

            <button
              onClick={handleLeaveWithSound}
              className="bg-transparent border border-[#ffb4ab] text-[#ffb4ab] cursor-pointer font-headline py-3 px-8 tracking-tight hover:bg-[#ffb4ab]/10 active:translate-y-0.5 transition-all text-xs w-full"
            >
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
      <Footer/>
    </div>
  );
}
