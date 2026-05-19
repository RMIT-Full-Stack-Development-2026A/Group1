import React from "react";

const statusStyles = {
  FINISHED: {
    wrapper: "border-outline-variant hover:border-primary hover:shadow-[0_0_12px_rgba(76,201,240,0.26)]",
    badge: "text-primary",
    icon: "check_circle",
    label: "FINISHED",
  },
  DRAW: {
    wrapper: "border-outline-variant hover:border-[#ffd60a] hover:shadow-[0_0_12px_rgba(255,214,10,0.22)]",
    badge: "text-[#ffd60a]",
    icon: "remove_circle",
    label: "DRAW",
  },
  ABORTED: {
    wrapper: "border-outline-variant opacity-80 hover:border-[#ffb4ab] hover:shadow-[0_0_12px_rgba(255,180,171,0.24)]",
    badge: "text-[#ffb4ab]",
    icon: "block",
    label: "ABORTED",
  },
  default: {
    wrapper: "border-outline-variant",
    badge: "text-white/50",
    icon: "sports_esports",
    label: "SESSION",
  },
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export default function GameSessionCard({ session }) {
  const statusKey = String(session.status || session.viewerResult || "").toUpperCase();
  const style = statusStyles[statusKey] || statusStyles.default;
  const finalResultLabel = statusKey === "ABORTED" ? "ABORTED" : "FINISHED";
  const boardSizeLabel = session.boardSize ? `${session.boardSize} BOARD` : "BOARD";

  const renderAvatar = (src, alt) => {
    if (src) {
      return <img src={src} alt={alt || "Player"} className="h-full w-full object-cover" />;
    }

    return <span className="material-symbols-outlined text-primary-cyan">person</span>;
  };

  const hasParticipants = Array.isArray(session.participants) && session.participants.length >= 2;
  const winnerIndex = typeof session.winnerParticipantIndex === "number" ? session.winnerParticipantIndex : null;

  return (
    <article className={`bg-surface-card border-2 flex flex-col overflow-hidden transition-all ${style.wrapper}`}>
      <div className="flex items-center justify-between border-b-2 border-outline-variant bg-deep-bg px-4 py-3">
        <div>
          <span className="font-mono text-xs font-bold text-primary-cyan uppercase tracking-[0.18em]">
            Session #{session.sessionNumber || session.id}
          </span>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{boardSizeLabel}</div>
        </div>
        <span className={`font-mono text-[10px] uppercase tracking-[0.24em] ${style.badge}`}>
          {style.label}
        </span>
      </div>

      <div className="p-5 grow flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:items-center">
          {hasParticipants ? (
            <div className="flex items-center gap-6">
              {(() => {
                const players = session.participants.slice(0, 2);
                const p0 = players[0];
                const p1 = players[1];

                return (
                  <>
                    {p0 && (
                      <div key={String(p0.userId || 0)} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center border-2 border-primary-cyan bg-deep-bg">
                          {renderAvatar(p0.avatarSnapshot, p0.usernameSnapshot)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[10px] uppercase tracking-wide text-white/45">Player 1</span>
                          <span className="font-mono text-sm uppercase tracking-wide text-white">{p0.usernameSnapshot || "UNKNOWN"}</span>
                          {winnerIndex === 0 ? (
                            <span className="font-mono text-[10px] uppercase tracking-wide text-[#fad100]">WINNER</span>
                          ) : (
                            <span className="font-mono text-[10px] uppercase tracking-wide text-white/40">{finalResultLabel}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="font-mono text-xs uppercase tracking-[0.18em] text-white/35">VS</div>

                    {p1 && (
                      <div key={String(p1.userId || 1)} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center border-2 border-primary-cyan bg-deep-bg">
                          {renderAvatar(p1.avatarSnapshot, p1.usernameSnapshot)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[10px] uppercase tracking-wide text-white/45">Player 2</span>
                          <span className="font-mono text-sm uppercase tracking-wide text-white">{p1.usernameSnapshot || "UNKNOWN"}</span>
                          {winnerIndex === 1 ? (
                            <span className="font-mono text-[10px] uppercase tracking-wide text-[#fad100]">WINNER</span>
                          ) : (
                            <span className="font-mono text-[10px] uppercase tracking-wide text-white/40">{finalResultLabel}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border-2 border-primary-cyan bg-deep-bg">
                {renderAvatar(session.opponentAvatar, session.opponentName)}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wide text-white/45">Opponent</span>
                <span className="font-mono text-sm uppercase tracking-wide text-white">{session.opponentName || "UNKNOWN"}</span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-[#fad100]">{finalResultLabel}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="border border-dashed border-[#2a2a4e] bg-deep-bg px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">Start time</p>
            <p className="mt-1 font-mono text-sm uppercase tracking-[0.18em] text-primary">{formatDateTime(session.startedAt)}</p>
          </div>
          <div className="border border-dashed border-[#2a2a4e] bg-deep-bg px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">End time</p>
            <p className="mt-1 font-mono text-sm uppercase tracking-[0.18em] text-primary">{formatDateTime(session.endedAt)}</p>
          </div>
        </div>

        <div className="flex items-center justify-center border border-dashed border-[#2a2a4e] bg-deep-bg py-3">
          <span className={`font-mono text-xs uppercase tracking-[0.24em] ${style.badge} flex items-center gap-2`}>
            <span className="material-symbols-outlined text-sm">{style.icon}</span>
            {style.label}
          </span>
        </div>
      </div>
    </article>
  );
}
