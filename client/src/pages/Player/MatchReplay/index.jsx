// Route: /replay/:gameId
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PremiumRequiredModal from '@/components/reusable/overlay/PremiumBannerOverlay';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { useMatchReplay } from './hook/useMatchReplay.hook';
import MatchHeader from './sub-components/MatchHeader';
import ReplayBoard from './sub-components/ReplayBoard';
import ReplayControls from './sub-components/ReplayControls';
import MoveLog from './sub-components/MoveLog';

const MatchReplay = () => {
    const { gameId: rawGameId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isUserPremium = (() => {
        if (!user) return false;
        if (user.premiumExpiresAt) {
            return new Date(user.premiumExpiresAt).getTime() > Date.now();
        }
        return user.isPremium || false;
    })();

    const {
        sessionData,
        boardState,
        moveLog,
        currentStep,
        isPlaying,
        speed,
        controls,
        isLoading,
        errorMessage
    } = useMatchReplay(rawGameId, isUserPremium);

    if (errorMessage.includes('Premium')) {
        return (
            <PremiumRequiredModal
                isOpen={true}
                featureName="MATCH REPLAYS"
                onClose={() => navigate('/profile')}
            />
        );
    }

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center font-arcade text-primary animate-pulse">LOADING REPLAY...</div>;
    }

    if (errorMessage) {
        return (
            <main className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-md w-full border border-outline-variant bg-surface-container p-8 text-center chunky-shadow">
                    <h1 className="font-headline text-lg text-secondary-container mb-4">REPLAY ACCESS DENIED</h1>
                    <p className="font-body text-sm text-on-surface">{errorMessage}</p>
                </div>
            </main>
        );
    }

    if (!sessionData) {
        return <div className="flex-1 flex items-center justify-center font-arcade text-primary animate-pulse">LOADING REPLAY...</div>;
    }

    return (
        <main className="flex-1 mt-16 mb-10 pb-32 px-6 py-6 flex flex-col items-center bg-surface">
            <MatchHeader session={sessionData} />

            <div className="w-full max-w-[1280px] grid grid-cols-12 gap-8 items-start">
                <div className="col-span-12 lg:col-span-8 flex flex-col items-center w-full">
                    <ReplayBoard boardState={boardState} boardSize={sessionData.boardSize} playerX={sessionData.playerX} playerO={sessionData.playerO} boardStyle={sessionData.boardStyle} />

                    <ReplayControls
                        currentStep={currentStep}
                        totalMoves={sessionData.moves.length}
                        isPlaying={isPlaying}
                        speed={speed}
                        onGoToStart={controls.first}
                        onStepBack={controls.prev}
                        onTogglePlay={() => (isPlaying ? controls.pause() : controls.play())}
                        onStepForward={controls.next}
                        onGoToEnd={controls.last}
                        onJumpToStep={controls.jump}
                        onSetSpeed={controls.setSpeed}
                    />
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col h-full min-h-[500px] w-full lg:sticky lg:top-20" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                    <MoveLog
                        moveLog={moveLog}
                        currentStep={currentStep}
                        boardSize={sessionData.boardSize}
                        onJumpToStep={controls.jump}
                        playerX={sessionData.playerX}
                        playerO={sessionData.playerO}
                    />
                </div>
            </div>
        </main>
    );
};

export default MatchReplay;