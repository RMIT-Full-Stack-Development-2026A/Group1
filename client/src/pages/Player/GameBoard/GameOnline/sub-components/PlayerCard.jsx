import { useMemo } from 'react';
import { User } from 'lucide-react';
import { getMarkerVariant, resolveMarkerStyleClasses } from '@/utils/markerRenderer';
import { MarkerX, MarkerO } from '@/components/reusable/custom/CustomMarkers';

export default function PlayerCard({ participant, isCurrentUser, side, avatarUrl, markerStyle = 'PIXEL', markerVariantKey = 'PIXEL' }) {
  const markerVariantData = useMemo(() => getMarkerVariant(markerVariantKey), [markerVariantKey]);
  const markerStyleClasses = useMemo(() => resolveMarkerStyleClasses(markerStyle), [markerStyle]);

  if (!participant) {
    return (
      <div
        className={`w-[260px] shrink-0 flex flex-col p-12 items-center justify-center gap-2 bg-[#1e1e2c] px-6 border border-[#3d484d]
          ${side === 'left'
            ? 'border-r border-[#3d484d]'
            : 'border-l border-[#3d484d]'}
        `}
      >
        {/* Ghost avatar */}
        <div className="w-24 h-24 border-2 border-dashed border-outline-variant flex items-center justify-center shadow-inner bg-surface-container-lowest">
          <span className="font-headline text-[20px] text-outline-variant animate-pulse">?</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="font-headline text-[7px] text-outline uppercase tracking-widest animate-pulse text-center leading-[2]">
            WAITING FOR<br />OPPONENT
          </p>
          {/* Bouncing dots */}
          <div className="flex gap-1.5">
            {[0, 150, 300].map((delay, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 bg-outline-variant animate-bounce ${delay === 0 ? '[animation-delay:0ms]' : delay === 150 ? '[animation-delay:150ms]' : '[animation-delay:300ms]'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isX = participant.mark === 'X';
  const Marker = isX ? MarkerX : MarkerO;

  const isReady = participant.isReady;

  const hasStats = participant.wins !== undefined || participant.losses !== undefined || participant.totalGames !== undefined;

  const topAccentClass = isReady
    ? isX
      ? 'bg-[#4cc9f0] shadow-[0_0_12px_rgba(76,201,240,0.5)]'
      : 'bg-error shadow-glow-error'
    : 'bg-transparent';

  const avatarGlowClass = isReady
    ? isX
      ? 'border-[#4cc9f0] shadow-[0px_0px_12px_rgba(76,201,240,0.4)]'
      : 'border-error shadow-glow-error'
    : 'border-[#3d484d]';

  const markerReadyClass = isReady
    ? isX
      ? 'drop-shadow-[0_0_14px_rgba(76,201,240,0.5)]'
      : 'drop-shadow-[0_0_14px_rgba(255,180,171,0.5)]'
    : '';

  const readyBadgeClass = isReady
    ? 'border-neon-green text-neon-green bg-neon-green-dim shadow-glow-green'
    : 'border-outline-variant text-outline';

  return (
      <div
      className={`w-full md:w-[260px] py-4 md:shrink-0 flex flex-col bg-[#1e1e2c] relative overflow-hidden transition-all duration-700
        ${side === 'left'
          ? 'border-r border-[#3d484d]'
          : 'border-l border-[#3d484d]'}
        ${isCurrentUser
          ? 'border-2 border-[#4cc9f0] shadow-[0px_0px_12px_rgba(76,201,240,0.25)]'
          : 'border-2 border-[#3d6472] shadow-[0px_0px_12px_rgba(61,100,114,0.3)]'}
      `}
    >

      <div className={`absolute top-0 left-0 w-full h-[2px] transition-all duration-700 ${topAccentClass}`} />

      <div className="flex flex-col items-center gap-3 pt-6 pb-4 px-6 flex-none">
        <div className="flex items-center gap-2 h-6">
          {participant.isHost && (
            <span className="font-headline text-[10px] px-3 py-1 uppercase tracking-widest border text-[#fad100] border-[#fad100] bg-[#fad100]/10 shadow-[0px_0px_8px_rgba(250,209,0,0.2)]">
              HOST
            </span>
          )}
          {isCurrentUser && (
            <span className="font-mono text-[10px] text-[#4cc9f0] uppercase tracking-widest border border-[#4cc9f0]/40 px-2 py-0.5">
              YOU
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className={`w-24 h-24 border-2 bg-[#12121f] flex items-center justify-center relative overflow-hidden transition-all duration-700 ${avatarGlowClass}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={participant.usernameSnapshot} className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-[#879398]" />
          )}
        </div>

        {/* Username */}
        <p className="font-headline text-sm text-on-surface tracking-wider text-center leading-relaxed truncate max-w-full">
          {participant.usernameSnapshot}
        </p>

        {participant.isPremium && (
          <span className="font-mono text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 uppercase tracking-widest">
            PREMIUM
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-[#3d484d]/60" />

      {/* ── SECTION B: Marker Display (center) ── */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div
          data-ready={isReady}
          className={`w-24 h-24 flex items-center justify-center transition-all duration-700 ${markerStyleClasses.wrapperClass} ${markerReadyClass}`}
        >
          <Marker variantData={markerVariantData} className="w-24 h-24 text-6xl flex items-center justify-center" />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-[#3d484d]/60" />

      {/* ── SECTION C: Stats (optional) ── */}
      {hasStats && (
        <>
          <div className="mx-6 h-px bg-[#3d484d]/60" />

          <div className="flex items-center justify-center gap-6 py-3 px-4 bg-[#12121f]/50">
            {participant.wins !== undefined && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-headline text-sm text-neon-green">{participant.wins}</span>
                <span className="font-mono text-[10px] text-[#879398] uppercase tracking-widest">WIN</span>
              </div>
            )}

            {participant.losses !== undefined && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-headline text-sm text-error">{participant.losses}</span>
                <span className="font-mono text-[10px] text-[#879398] uppercase tracking-widest">LOSS</span>
              </div>
            )}

            {participant.totalGames !== undefined && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-headline text-sm text-[#bcc8ce]">{participant.totalGames}</span>
                <span className="font-mono text-[10px] text-[#879398] uppercase tracking-widest">TOTAL</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── SECTION D: Ready state indicator (bottom) ── */}
      <div 
        className={`mx-6 mb-4 py-2 text-center font-headline text-[11px] uppercase tracking-widest border transition-all duration-700 shadow-[2px_2px_0px_#343342] ${
          isReady 
            ? 'text-[#69ff47] border-[#69ff47] bg-[#69ff47]/10 shadow-glow-green' 
            : 'text-[#ff6b6b] border-[#ff6b6b] bg-[#ff6b6b]/10'
        }`}
      >
        {isReady ? 'READY' : 'NOT READY'}
      </div>
    </div>
  );
}
