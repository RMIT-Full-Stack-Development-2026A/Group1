import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

// Stores
import { useAuthStore } from '@/stores/AuthStore';
import { useModeStore } from '@/stores/ModeStore'; 
import { useCustomizationStore } from '@/stores/CustomizationStore'; 

// Services
import { getDifficultyLevels } from '@/pages/Player/GameCustomization/service/customization.service';

import { useGame } from './hook/useGame.hook';

import Navigation from '@/components/reusable/Navigation';
import Footer from '@/components/reusable/Footer';
import ScanLines from '@/components/reusable/ScanLines';
import PlayerPanel from './sub-components/PlayerPanel';
import BoardArea from './sub-components/BoardArea';
import WinOverlay from './sub-components/WinOverlay';

const GameBoard = () => {
    const navigate = useNavigate();

    const { user, isCheckingAuth } = useAuthStore(); 
    const { gameMode, aiDifficulty } = useModeStore();
    const { boardSize: displaySize, markerVariant, setMarkerVariant } = useCustomizationStore();

    // Convert the string "10x10" or "15x15" from the store into an integer of 10 or 15.
    const initialBoardSize = useMemo(() => {
        return parseInt(displaySize.split('x')[0], 10) || 10;
    }, [displaySize]);

    // Map the markerVariant number (1, 2, 3...) to a string (default, custom_1...) so that the BoardArea component understands it.
    const activeMarkerStyle = markerVariant === 1 ? 'default' : `custom_${markerVariant}`;

    // Set title and player name
    const matchTitle = gameMode === 'SINGLE_PLAYER' ? `VS AI — ${aiDifficulty}` : gameMode === 'ONLINE_MATCH' ? 'RANKED MATCH' : 'LOCAL MULTIPLAYER';
    const isBotMatch = gameMode === 'SINGLE_PLAYER';
    
    // Get AI name from difficulty level
    const getAIName = (difficulty) => {
        const difficulties = getDifficultyLevels();
        const difficultyObj = difficulties.find(d => d.id === difficulty);
        return difficultyObj ? difficultyObj.aiName : 'NEXUS-9';
    };
    
    const p2Name = isBotMatch ? getAIName(aiDifficulty) : gameMode === 'ONLINE_MATCH' ? 'OPPONENT' : 'PLAYER_02';

    // Build player infor
    const playersInfo = useMemo(() => {
        const player1 = {
            userId: user?._id || user?.id || null, 
            usernameSnapshot: user?.username || user?.name || 'PLAYER_01', 
            role: 'HUMAN',
            mark: 'X'
        };

        let player2 = {
            userId: null,
            usernameSnapshot: p2Name,
            role: 'HUMAN',
            mark: 'O'
        };

        if (isBotMatch) {
            player2.role = 'AI';
            player2.aiDifficulty = aiDifficulty; 
        }

        return [player1, player2];
    }, [user, gameMode, isBotMatch, p2Name, aiDifficulty]);

    // Call hook useGame
    const {
        board,
        boardSize,
        currentPlayer,
        winnerData,
        isDraw,
        isLocked, 
        handleMove,
        resetGame,
        setBoardSize,
    } = useGame(gameMode, playersInfo, initialBoardSize);

    const gameOver = !!winnerData || isDraw;

    // Handling dropdown events in the board area
    const handleMarkerChange = (val) => {
        // Convert 'default' or 'custom_1' back to an integer to save to the Store.
        const newVariant = val === 'default' ? 1 : parseInt(val.replace('custom_', ''), 10);
        setMarkerVariant(newVariant || 1);
    };

    if (isCheckingAuth) {
        return <div className="h-screen bg-deep-bg flex items-center justify-center font-headline text-primary-cyan">AUTHENTICATING...</div>;
    }

    return (
        <div className="flex flex-col bg-deep-bg text-[#e3e0f4] overflow-hidden h-screen w-screen relative">
            <ScanLines />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Mono:wght@400;700&display=swap');
                .font-headline { font-family: 'Press Start 2P', cursive; }
                .scanlines { background: linear-gradient(to bottom, rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%); background-size: 100% 2px; pointer-events: none; }
                .pixel-grid { background-image: radial-gradient(rgba(76,201,240,0.05) 1px, transparent 0); background-size: 4px 4px; pointer-events: none; }
                .glow-cyan { box-shadow: 0 0 10px #4cc9f0; }
                .glow-amber { box-shadow: 0 0 15px #fad100; }
                .text-glow-amber { text-shadow: 0 0 12px #fad100; }
                .chunky-offset { box-shadow: 2px 2px 0px 0px #005266; }
            `}</style>

            <div className="fixed inset-0 scanlines z-100" />
            <div className="fixed inset-0 pixel-grid z-99" />

            <Navigation />

            <main className="mx-auto w-fit pt-16 flex-1 overflow-hidden flex px-6 gap-6 items-center justify-center font-mono">
                <PlayerPanel 
                    role="X" 
                    playerName={playersInfo[0].usernameSnapshot} 
                    isBot={false} 
                    isActive={currentPlayer === 'X' && !gameOver} 
                />

                <BoardArea
                    markerVariant={markerVariant}
                    board={board}
                    boardSize={boardSize} 
                    matchTitle={matchTitle}
                    winnerData={winnerData}
                    isDraw={isDraw}
                    isLocked={isLocked}
                    onCellClick={handleMove}
                    onReset={resetGame}
                    onSizeChange={setBoardSize} 
                    onMarkerChange={handleMarkerChange}
                />

                <PlayerPanel 
                    role="O" 
                    playerName={playersInfo[1].usernameSnapshot} 
                    isBot={isBotMatch} 
                    isActive={currentPlayer === 'O' && !gameOver} 
                    difficulty={isBotMatch ? aiDifficulty : undefined} 
                />
            </main>

            {gameOver && (
                <WinOverlay winnerData={winnerData} isDraw={isDraw} onRestart={resetGame} onBackToLobby={() => navigate('/lobby')} />
            )}
        </div>
    );
}
export default GameBoard;