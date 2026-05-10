import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Stores
import { useSocketStore } from '@/stores/useSocketStore';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { useCustomizationStore } from '@/stores/game/CustomizationStore';

// Utils
import { getMarkerVariant } from '@/utils/markerRenderer';

// Components (Dumb UI Components reused from Offline mode)
import AbortModal from './sub-components/AbortModal';
import Navigation from '@/components/reusable/Navigation';
import ScanLines from '@/components/reusable/custom/ScanLines';
import PlayerPanel from './sub-components/PlayerPanel';
import BoardArea from './sub-components/BoardArea';
import WinOverlay from './sub-components/WinOverlay';

const OnlineGameBoard = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // --- GLOBAL STORES ---
    const { user, isCheckingAuth } = useAuthStore();
    const { socket, isConnected, connectSocket } = useSocketStore();
    const { boardSize: displaySize, gridStyle, markerVariant, setMarkerVariant } = useCustomizationStore();

    // --- LOCAL STATE (Replaces useGame Hook) ---
    const [roomInfo, setRoomInfo] = useState(null);
    const [board, setBoard] = useState([]);
    const [currentPlayerMark, setCurrentPlayerMark] = useState('X');
    const [winnerData, setWinnerData] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [showAbortModal, setShowAbortModal] = useState(false);

    const initialBoardSize = parseInt(displaySize.split('x')[0], 10) || 10;
    const markerVariantData = useMemo(() => getMarkerVariant(markerVariant), [markerVariant]);
    const userAvatarUrl = user?.avatar || user?.profileImage || undefined;

    // --- SOCKET INITIALIZATION & LISTENERS ---
    useEffect(() => {
        if (!isConnected) connectSocket();
    }, [isConnected, connectSocket]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // 1. Room Created (Host only) -> Redirect to the active room URL
        socket.once('room:created', (payload) => {
            if (payload.room?.id) {
                navigate(`/play/online/${payload.room.id}`, { replace: true });
            }
        });

        // 2. Room Updated -> Maps participants to Player Panels
        socket.on('room:updated', (payload) => {
            setRoomInfo(payload.room);
            // Check if game just started, update current turn mark based on participant index
            if (payload.room.status === 'PLAYING') {
                const turnIndex = payload.room.currentTurnParticipantIndex || 0;
                setCurrentPlayerMark(payload.room.participants[turnIndex]?.mark || 'X');
            }
        });

        // 3. Game State -> Syncs the board array and next turn
        socket.on('game:state', (payload) => {
            setBoard(payload.board);
            // Map the currentTurn (0 or 1) to the actual mark (X or O)
            setRoomInfo(prevRoom => {
                if (prevRoom && prevRoom.participants) {
                    setCurrentPlayerMark(prevRoom.participants[payload.currentTurn]?.mark || 'X');
                }
                return prevRoom;
            });
        });

        // 4. Game Ended -> Triggers the Win Overlay
        socket.on('game:ended', (payload) => {
            if (payload.result === 'DRAW') {
                setIsDraw(true);
            } else if (payload.result === 'WIN') {
                // Map the payload.winLine format to the UI component's expected format
                const winningCells = payload.winLine.map(cell => [cell.row, cell.col]);
                
                // Get the winner's mark ('X' or 'O') based on participant index
                setRoomInfo(prevRoom => {
                    const mark = prevRoom?.participants[payload.winner]?.mark || 'X';
                    setWinnerData({ player: mark, cells: winningCells });
                    return prevRoom;
                });
            } else if (payload.result === 'ABORTED') {
                alert('Opponent has left the game.');
                navigate('/lobby');
            }
        });

        // 5. Room Removed -> Kick player out if room is closed
        socket.on('room:removed', () => {
            navigate('/lobby');
        });

        // --- INIT ROOM ACTION ---
        if (roomId) {
            socket.emit('room:join', { roomId });
        } else {
            socket.emit('room:create', { boardSize: initialBoardSize, marker: 'X' });
        }

        // --- CLEANUP (Abort on unmount) ---
        return () => {
            if (roomId || roomInfo?.id) {
                socket.emit('room:leave', { roomId: roomInfo?.id || roomId });
            }
            socket.off('room:created');
            socket.off('room:updated');
            socket.off('game:state');
            socket.off('game:ended');
            socket.off('room:removed');
        };
    }, [socket, isConnected, roomId, navigate, initialBoardSize, roomInfo?.id]);

    // --- EMIT ACTIONS ---
    const handleCellClick = (rowIndex, colIndex) => {
        // Prevent action if game is over or not playing
        if (winnerData || isDraw || roomInfo?.status !== 'PLAYING') return;

        socket.emit('game:move', {
            roomId: roomInfo?.id || roomId,
            row: rowIndex,
            col: colIndex
        });
    };

    const handleAbortConfirm = () => {
        socket.emit('room:leave', { roomId: roomInfo?.id || roomId });
        setShowAbortModal(false);
        navigate('/lobby');
    };

    const handleMarkerChange = (val) => {
        const newVariant = val === 'default' ? 1 : parseInt(val.replace('custom_', ''), 10);
        setMarkerVariant(newVariant || 1);
    };

    // --- DATA MAPPING FOR UI ---
    // Extract Player 1 (Host) and Player 2 (Guest) safely from roomInfo
    const player1 = roomInfo?.participants?.[0] || { username: 'WAITING...', mark: 'X' };
    const player2 = roomInfo?.participants?.[1] || { username: 'WAITING FOR OPPONENT...', mark: 'O' };
    
    // Determine perspective for WinOverlay (winner/loser/draw)
    const userMark = roomInfo?.participants?.find(p => p.userId === user?.id)?.mark || 'X';
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
                    playerName={player1.username}
                    isBot={false}
                    isActive={currentPlayerMark === player1.mark && !gameOver && roomInfo?.status === 'PLAYING'}
                    avatarUrl={user?.id === player1.userId ? userAvatarUrl : undefined}
                    markerVariantData={markerVariantData}
                />

                <BoardArea
                    markerVariant={markerVariant}
                    gridStyle={gridStyle}
                    board={board}
                    boardSize={roomInfo?.boardSize || initialBoardSize}
                    matchTitle={`ROOM: ${roomInfo?.roomNumber || 'CONNECTING...'}`}
                    winnerData={winnerData}
                    isDraw={isDraw}
                    isLocked={roomInfo?.status !== 'PLAYING'}
                    onCellClick={handleCellClick}
                    onMarkerChange={handleMarkerChange}
                />

                {/* --- GUEST PLAYER (Participant 1) --- */}
                <PlayerPanel
                    role={player2.mark}
                    playerName={player2.username}
                    isBot={false}
                    isActive={currentPlayerMark === player2.mark && !gameOver && roomInfo?.status === 'PLAYING'}
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