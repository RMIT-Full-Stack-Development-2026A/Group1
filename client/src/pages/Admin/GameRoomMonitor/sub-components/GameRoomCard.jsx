import React from "react";

const statusStyles = {
  waiting: {
    wrapper: "border-outline-variant hover:border-yellow-400 hover:shadow-[0_0_12px_rgba(255,214,10,0.3)]",
    badge: "text-yellow-400",
    icon: "hourglass_empty",
    label: "WAITING FOR PLAYER",
  },
  "in-progress": {
    wrapper: "border-outline-variant hover:border-[#ffb4ab] hover:shadow-[0_0_12px_rgba(255,180,171,0.28)]",
    badge: "text-[#ffb4ab]",
    icon: "sports_esports",
    label: "MATCH IN PROGRESS",
  },
  closed: {
    wrapper: "border-outline-variant opacity-60",
    badge: "text-white/50",
    icon: "lock",
    label: "CLOSED",
  },
};

export default function GameRoomCard({ room, onClose, closingRoomId }) {
  const style = statusStyles[room.status] || statusStyles.waiting;
  const isClosing = closingRoomId === room.id;
  const isClosed = room.status === "closed";

  const getParticipantId = (participant) => {
    if (!participant?.userId) return "-";

    return String(participant.userId).slice(0, 5);
  };

  const renderAvatar = (participant, label) => {
    const avatarUrl = participant?.avatarSnapshot || participant?.avatar || participant?.avatarUrl || null;

    if (avatarUrl) {
      return <img src={avatarUrl} alt={label} className="w-full h-full object-cover" />;
    }

    return <span className="material-symbols-outlined text-primary-cyan">person</span>;
  };

  return (
    <article
      className={`bg-surface-card border-2 flex flex-col overflow-hidden transition-all ${style.wrapper}`}
    >
      <div className="flex items-center justify-between border-b-2 border-outline-variant bg-deep-bg px-4 py-3">
        <div>
          <span className="font-mono text-xs font-bold text-primary-cyan uppercase tracking-[0.18em]">
            Room #{room.roomNumber}
          </span>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            Board {room.boardSize}
          </div>
        </div>
        <span className={`font-mono text-[10px] uppercase tracking-[0.24em] ${style.badge}`}>
          {style.label}
        </span>
      </div>

      <div className="p-5 grow flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border-2 border-primary-cyan bg-deep-bg">
              {renderAvatar(room.participants?.[0], room.playerOneName || "Player 1")}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wide text-white/45">
                Player 1
              </span>
              <span className="font-mono text-sm uppercase tracking-wide text-white">
                {room.playerOneName}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-[#fad100]">
                #{getParticipantId(room.participants?.[0])}
              </span>
            </div>
          </div>

          <div className="text-center font-mono text-sm font-bold text-primary-cyan uppercase tracking-[0.2em]">
            VS
          </div>

          <div className="flex items-center gap-3 lg:justify-end">
            <div className="flex h-11 w-11 items-center justify-center border-2 border-primary-cyan bg-deep-bg">
              {renderAvatar(room.participants?.[1], room.playerTwoName || "Player 2")}
            </div>
            <div className="flex flex-col gap-1 lg:items-end">
              <span className="font-mono text-[10px] uppercase tracking-wide text-white/45">
                Player 2
              </span>
              <span className="font-mono text-sm uppercase tracking-wide text-white">
                {room.playerTwoName}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-[#fad100]">
                #{getParticipantId(room.participants?.[1])}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="border border-dashed border-[#2a2a4e] bg-deep-bg px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
              Start time
            </p>
            <p className="mt-1 font-mono text-sm uppercase tracking-[0.18em] text-primary">
              {room.startTimeDisplay}
            </p>
          </div>
          <div className="border border-dashed border-[#2a2a4e] bg-deep-bg px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
              {room.endTimeLabel || "End time"}
            </p>
            <p className="mt-1 font-mono text-sm uppercase tracking-[0.18em] text-primary">
              {room.endTimeDisplay}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center border border-dashed border-[#2a2a4e] bg-deep-bg py-3">
          <span className={`font-mono text-xs uppercase tracking-[0.24em] ${style.badge} flex items-center gap-2`}>
            <span className="material-symbols-outlined text-sm">{style.icon}</span>
            {room.statusLabel}
          </span>
        </div>
      </div>

      <div className="p-4 pt-0">
        {isClosed ? (
          <div className="w-full cursor-not-allowed bg-outline-variant/25 py-2 text-center font-mono text-xs font-bold uppercase tracking-tighter text-white/45">
            Closed
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onClose(room)}
            disabled={isClosing}
            className="w-full border-2 border-primary-cyan py-2 font-mono text-sm font-bold uppercase tracking-tighter text-primary-cyan transition-all hover:bg-primary-cyan hover:text-deep-bg hover:shadow-[0_0_12px_#4cc9f0] disabled:cursor-wait disabled:opacity-60"
          >
            {isClosing ? "Closing..." : "Close Room"}
          </button>
        )}
      </div>
    </article>
  );
}
