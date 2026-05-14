import { useMemo } from 'react';
import { User } from 'lucide-react';
import { getMarkerVariant, resolveMarkerStyleClasses } from '@/utils/markerRenderer';
import { MarkerX, MarkerO } from '@/components/reusable/custom/CustomMarkers';

export default function PlayerCard({ participant, isCurrentUser, side, avatarUrl, markerStyle = 'PIXEL', markerVariantKey = 'PIXEL' }) {
  const markerVariantData = useMemo(() => getMarkerVariant(markerVariantKey), [markerVariantKey]);
  const markerStyleClasses = useMemo(() => resolveMarkerStyleClasses(markerStyle), [markerStyle]);

  // ── EMPTY SLOT ──
  if (!participant) {
    return (
      <div className="w-[260px] shrink-0 flex flex-col items-center justify-center gap-4 bg-surface-container-lowest border-r border-outline-variant/30 px-6">
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

  // ── FILLED SLOT ──
  const isX = participant.mark === 'X';
  const Marker = isX ? MarkerX : MarkerO;

  const isReady = participant.isReady;

  const hasStats = participant.wins !== undefined || participant.losses !== undefined || participant.totalGames !== undefined;

  const topAccentClass = isReady
    ? isX
      ? 'bg-primary shadow-glow-primary'
      : 'bg-error shadow-glow-error'
    : 'bg-transparent';

  const avatarGlowClass = isReady
    ? isX
      ? 'border-error shadow-glow-error'
      : 'border-primary shadow-glow-primary'
    : 'border-outline-variant';

  const markerReadyClass = isReady
    ? isX
      ? 'drop-shadow-[0_0_12px_rgba(255,180,171,0.25)]'
      : 'drop-shadow-[0_0_12px_rgba(147,226,255,0.25)]'
    : '';

  const readyBadgeClass = isReady
    ? 'border-neon-green text-neon-green bg-neon-green-dim shadow-glow-green'
    : 'border-outline-variant text-outline';

  return (
    <div className="w-[260px] shrink-0 flex flex-col bg-surface-container border-r border-outline-variant relative overflow-hidden transition-all duration-700">
      {/* Top accent line — lit up when ready */}
      <div className={`absolute top-0 left-0 w-full h-[2px] transition-all duration-700 ${topAccentClass}`} />

      {/* ── SECTION A: Identity (top ~40%) ── */}
      <div className="flex flex-col items-center gap-3 pt-6 pb-4 px-6 flex-none">
        <div className="flex items-center gap-2 h-6">
          {participant.isHost && (
            <span className="font-headline text-[8px] px-3 py-1 uppercase tracking-widest border text-host-gold border-host-gold bg-host-gold-dim shadow-glow-gold">
              HOST
            </span>
          )}
          {isCurrentUser && (
            <span className="font-mono text-[8px] text-primary-fixed-dim uppercase tracking-widest border border-primary-fixed-dim/40 px-2 py-0.5">
              YOU
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className={`w-20 h-20 border-2 bg-surface-container-highest flex items-center justify-center relative overflow-hidden transition-all duration-700 ${avatarGlowClass}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={participant.usernameSnapshot} className="w-full h-full object-cover" />
          ) : (
            <User size={36} color="#879398" />
          )}
        </div>

        {/* Username */}
        <p className="font-headline text-[9px] text-on-surface tracking-wider text-center leading-relaxed truncate max-w-full">
          {participant.usernameSnapshot}
        </p>

        {participant.isPremium && (
          <span className="font-mono text-[7px] bg-secondary-container text-on-secondary-container px-2 py-0.5 uppercase tracking-widest">
            PREMIUM
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-outline-variant/40" />

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
      <div className="mx-6 h-px bg-outline-variant/40" />

      {/* ── SECTION C: Stats (optional) ── */}
      {hasStats && (
        <div className="flex items-center justify-center gap-6 py-3 px-6">
          {participant.wins !== undefined && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-headline text-[10px] text-[#69ff47]">{participant.wins}</span>
              <span className="font-mono text-[7px] text-outline uppercase tracking-widest">WIN</span>
            </div>
          )}
          {participant.losses !== undefined && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-headline text-[10px] text-error">{participant.losses}</span>
              <span className="font-mono text-[7px] text-outline uppercase tracking-widest">LOSS</span>
            </div>
          )}
          {participant.totalGames !== undefined && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-headline text-[10px] text-on-surface-variant">{participant.totalGames}</span>
              <span className="font-mono text-[7px] text-outline uppercase tracking-widest">TOTAL</span>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION D: Ready state indicator (bottom) ── */}
      <div className={`mx-6 mb-6 py-2 text-center font-headline text-[8px] uppercase tracking-widest border transition-all duration-700 ${readyBadgeClass}`}>
        {isReady ? 'READY' : 'NOT READY'}
      </div>
    </div>
  );
}
