import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Stores
import { useSocketStore } from '@/stores/socket/SocketStore';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { useCustomizationStore } from '@/stores/game/CustomizationStore';

// Utils
import { getMarkerVariant } from '@/utils/markerRenderer';

// Components (Dumb UI Components reused from Offline mode)
import AbortModal from '../pages/Player/GameBoard/sub-components/AbortModal';
import Navigation from '@/components/reusable/Navigation';
import ScanLines from '@/components/reusable/custom/ScanLines';
import PlayerPanel from '../pages/Player/GameBoard/sub-components/PlayerPanel';
import BoardArea from '../pages/Player/GameBoard/sub-components/BoardArea';
import WinOverlay from '../pages/Player/GameBoard/sub-components/WinOverlay';

const OnlineGameBoard = ({ roomData, currentUserId }) => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // --- GLOBAL STORES ---
    const { user, isCheckingAuth } = useAuthStore();
    const { socket, isConnected, connectSocket } = useSocketStore();
    const { boardSize: displaySize, gridStyle, markerVariant, setMarkerVariant } = useCustomizationStore();

    // --- LOCAL STATE (Replaces useGame Hook) ---
    const [board, setBoard] = useState([]);
    const [currentPlayerMark, setCurrentPlayerMark] = useState('X');
    const [winnerData, setWinnerData] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [showAbortModal, setShowAbortModal] = useState(false);

    const initialBoardSize = parseInt(displaySize.split('x')[0], 10) || 10;
    const markerVariantData = useMemo(() => getMarkerVariant(markerVariant), [markerVariant]);
    const userAvatarUrl = user?.avatar || user?.profileImage || undefined;

    // --- SOCKET LISTENERS (game state + end events only) ---
    useEffect(() => {
        if (!socket || !isConnected) return;

        // 1. Game State -> Syncs the board array and next turn
        socket.on('game:state', (payload) => {
            setBoard(payload.board);
            // Map the currentTurn (0 or 1) to the actual mark (X or O) using prop roomData
            setCurrentPlayerMark(roomData?.participants?.[payload.currentTurn]?.mark || 'X');
        });

        // 2. Game Ended -> Triggers the Win Overlay
        socket.on('game:ended', (payload) => {
            if (payload.result === 'DRAW') {
                setIsDraw(true);
            } else if (payload.result === 'WIN') {
                const winningCells = payload.winLine.map(cell => [cell.row, cell.col]);
                const mark = roomData?.participants?.[payload.winner]?.mark || 'X';
                setWinnerData({ player: mark, cells: winningCells });
            } else if (payload.result === 'ABORTED') {
                // ain't using alert here broski
                navigate('/lobby');
            }
        });

        // --- CLEANUP (only remove game listeners) ---
        return () => {
            socket.off('game:state');
            socket.off('game:ended');
        };
    }, [socket, isConnected, roomId, navigate, initialBoardSize, roomData]);

    // --- EMIT ACTIONS ---
    const handleCellClick = (rowIndex, colIndex) => {
        // Prevent action if game is over or not playing
        if (winnerData || isDraw || roomData?.status !== 'PLAYING') return;

        socket.emit('game:move', {
            roomId: roomData?.id || roomId,
            row: rowIndex,
            col: colIndex
        });
    };

    const handleAbortConfirm = () => {
        socket.emit('room:leave', { roomId: roomData?.id || roomId });
        setShowAbortModal(false);
        navigate('/lobby');
    };

    const handleMarkerChange = (val) => {
        const newVariant = val === 'default' ? 1 : parseInt(val.replace('custom_', ''), 10);
        setMarkerVariant(newVariant || 1);
    };

    // --- DATA MAPPING FOR UI ---
    // Extract Player 1 (Host) and Player 2 (Guest) safely from roomData
    const player1 = roomData?.participants?.[0] || { usernameSnapshot: 'WAITING...', mark: 'X' };
    const player2 = roomData?.participants?.[1] || { usernameSnapshot: 'WAITING FOR OPPONENT...', mark: 'O' };

    // Determine perspective for WinOverlay (winner/loser/draw)
    const userMark = roomData?.participants?.find(p => p.userId === user?.id)?.mark || 'X';
    const perspective = isDraw ? 'draw' : winnerData ? (winnerData.player === userMark ? 'winner' : 'loser') : null;
    const gameOver = !!winnerData || isDraw;

    if (isCheckingAuth || !isConnected) {
        return <div className="h-screen bg-deep-bg flex items-center justify-center font-headline text-primary-cyan">CONNECTING TO SERVER...</div>;
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-deep-bg text-[#e3e0f4] overflow-hidden relative">
            <ScanLines />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Mono:wght@400;700&display=swap');
                .font-headline { font-family: 'Press Start 2P', cursive; }
                .scanlines { background: linear-gradient(to bottom, rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%); background-size: 100% 2px; pointer-events: none; }
                .pixel-grid { background-image: radial-gradient(rgba(76,201,240,0.05) 1px, transparent 0); background-size: 4px 4px; pointer-events: none; }
            `}</style>

            <div className="fixed inset-0 scanlines z-100" />
            <div className="fixed inset-0 pixel-grid z-99" />

            <Navigation />

            <main className="flex-1 flex overflow-hidden px-6 gap-6 items-center justify-center font-mono max-w-[1400px] w-full mx-auto">
                {!gameOver && (
                    <div className="fixed top-20 right-6 z-50">
                        <button
                            onClick={() => setShowAbortModal(true)}
                            className="border-2 border-[#ffb4ab] text-[#ffb4ab] font-headline text-[8px] px-4 py-2 uppercase hover:bg-[#ffb4ab]/10 transition-all cursor-pointer"
                        >
                            ABORT
                        </button>
                    </div>
                )}

                {/* --- HOST PLAYER (Participant 0) --- */}
                <PlayerPanel
                    role={player1.mark}
                    playerName={player1.usernameSnapshot}
                    isBot={false}
                    isActive={currentPlayerMark === player1.mark && !gameOver && roomData?.status === 'PLAYING'}
                    avatarUrl={user?.id === player1.userId ? userAvatarUrl : undefined}
                    markerVariantData={markerVariantData}
                />

                <BoardArea
                    markerVariant={markerVariant}
                    gridStyle={gridStyle}
                    board={board}
                    boardSize={roomData?.boardSize || initialBoardSize}
                    matchTitle={`ROOM: ${roomData?.roomNumber || 'CONNECTING...'}`}
                    winnerData={winnerData}
                    isDraw={isDraw}
                    isLocked={roomData?.status !== 'PLAYING' || currentPlayerMark !== userMark}
                    onCellClick={handleCellClick}
                    onMarkerChange={handleMarkerChange}
                />

                {/* --- GUEST PLAYER (Participant 1) --- */}
                <PlayerPanel
                    role={player2.mark}
                    playerName={player2.usernameSnapshot}
                    isBot={false}
                    isActive={currentPlayerMark === player2.mark && !gameOver && roomData?.status === 'PLAYING'}
                    markerVariantData={markerVariantData}
                />
            </main>

            {gameOver && (
                <WinOverlay
                    winnerData={winnerData}
                    isDraw={isDraw}
                    perspective={perspective}
                    onRestart={() => navigate('/lobby')} // Online matches usually return to lobby instead of instant restart
                    onBackToLobby={() => navigate('/lobby')}
                />
            )}

            <AbortModal
                isOpen={showAbortModal}
                gameMode="ONLINE_MATCH"
                isSaving={false}
                onConfirm={handleAbortConfirm}
                onCancel={() => setShowAbortModal(false)}
            />
        </div>
    );
}

export default OnlineGameBoard;