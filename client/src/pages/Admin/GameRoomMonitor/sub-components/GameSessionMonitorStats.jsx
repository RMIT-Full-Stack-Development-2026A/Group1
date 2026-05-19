import React from "react";

const StatCard = ({ label, value, tone = "text-primary" }) => (
  <div className="border border-outline-variant bg-[#1b1c2c] p-4">
    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-outline">{label}</p>
    <p className={`mt-2 font-arcade text-3xl ${tone}`}>{value}</p>
  </div>
);

export default function GameSessionMonitorStats({ sessions }) {
  const totalSessions = sessions.length;
  const finishedSessions = sessions.filter((session) => String(session.viewerResult || session.status).toUpperCase() === "FINISHED").length;
  const drawSessions = sessions.filter((session) => String(session.viewerResult || session.status).toUpperCase() === "DRAW").length;
  const abortedSessions = sessions.filter((session) => String(session.viewerResult || session.status).toUpperCase() === "ABORTED").length;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatCard label="Total sessions" value={totalSessions} />
      <StatCard label="Finished" value={finishedSessions} tone="text-primary" />
      <StatCard label="Draws" value={drawSessions} tone="text-[#ffd60a]" />
      <StatCard label="Aborted" value={abortedSessions} tone="text-[#ffb4ab]" />
    </section>
  );
}
