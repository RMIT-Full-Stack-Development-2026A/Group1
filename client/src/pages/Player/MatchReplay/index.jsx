// Route: /replay/:gameId (Premium only)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PremiumRequiredModal from '@/components/reusable/PremiumRequiredModal';
import { useMatchReplay } from './hook/useMatchReplay.hook';
import MatchHeader from './sub-components/MatchHeader';
import ReplayBoard from './sub-components/ReplayBoard';
import ReplayControls from './sub-components/ReplayControls'; // Dùng code Controls của bạn
import MoveLog from './sub-components/MoveLog'; // Dùng code MoveLog của bạn

const MatchReplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();   
  
  // Thực tế: Lấy trạng thái từ useAuthStore() (Zustand)
  const isUserPremium = true; 
  const [showPremiumModal, setShowPremiumModal] = useState(!isUserPremium);

  const {
    sessionData, boardState, currentStep,
    isPlaying, speed, controls
  } = useMatchReplay(id, isUserPremium);

  // Chặn user thường
  if (showPremiumModal) {
    return (
      <PremiumRequiredModal 
        isOpen={true} 
        featureName="MATCH REPLAYS"
        onClose={() => {
          setShowPremiumModal(false);
          navigate('/player/subscription'); 
        }}
      />
    );
  }

  if (!sessionData) {
    return <div className="min-h-screen flex items-center justify-center font-arcade text-primary animate-pulse">ACCESSING SYSTEM DATA...</div>;
  }

  return (
    <main className="flex-1 mt-16 mb-10 px-8 py-6 flex flex-col items-center pixel-grid">
      <MatchHeader session={sessionData} />

      <div className="w-full max-w-[1280px] grid grid-cols-12 gap-8 items-start">
        {/* Left Col */}
        <div className="col-span-12 lg:col-span-8 flex flex-col items-center w-full">
          <ReplayBoard boardState={boardState} boardSize={sessionData.boardSize} />
          
          <ReplayControls 
            currentMoveIndex={currentStep}
            totalMoves={sessionData.moves.length}
            isPlaying={isPlaying}
            speed={speed}
            onGoToStart={controls.first}
            onStepBack={controls.prev}
            onTogglePlay={isPlaying ? controls.pause : controls.play}
            onStepForward={controls.next}
            onGoToEnd={controls.last}
            onCycleSpeed={controls.cycleSpeed}
          />
        </div>

        {/* Right Col */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full w-full">
          <MoveLog 
            moveLog={sessionData.moves}
            currentMoveIndex={currentStep}
            boardSize={sessionData.boardSize}
            onJumpToMove={controls.jump}
          />
        </div>
      </div>
    </main>
  );
};

export default MatchReplay;