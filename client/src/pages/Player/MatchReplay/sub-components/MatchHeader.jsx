import React from 'react';

const MatchHeader = ({ session }) => {
  if (!session) return null;

  const pX = session.playerX;
  const pO = session.playerO;
  
  // Format tên AI
  const nameX = pX.role === 'AI' ? `AI (${pX.aiDifficulty})` : pX.usernameSnapshot;
  const nameO = pO.role === 'AI' ? `AI (${pO.aiDifficulty})` : pO.usernameSnapshot;

  return (
    <div className="w-full max-w-[1280px] flex justify-between items-end mb-8 border-b border-outline-variant pb-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-2xl text-on-surface uppercase tracking-tight">MATCH REPLAY</h1>
          <span className="bg-secondary-container text-on-secondary px-3 py-1 flex items-center gap-2 text-[10px] font-bold border-2 border-on-secondary-container chunky-shadow">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            PREMIUM
          </span>
        </div>
        <p className="text-primary tracking-widest text-sm font-bold font-body">
          {nameX} <span className="text-outline mx-2">VS</span> {nameO} 
          <span className="text-outline mx-4">|</span> 
          {new Date(session.createdAt).toLocaleDateString()} 
          <span className="text-outline mx-4">|</span> 
          RESULT: <span className={`px-2 uppercase font-bold ${session.endedReason === 'WIN' ? 'text-secondary-container bg-secondary-container/20' : 'text-outline bg-surface-container'}`}>
            {session.status}
          </span>
        </p>
      </div>
    </div>
  );
};
export default MatchHeader;