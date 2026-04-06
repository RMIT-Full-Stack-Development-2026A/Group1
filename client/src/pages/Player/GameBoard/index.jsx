import { useGame } from './hook/useGame.hook';
import { useLocation, useNavigate } from 'react-router-dom';
import PlayerPanel from './sub-components/PlayerPanel';
import BoardArea from './sub-components/BoardArea';
import WinOverlay from './sub-components/WinOverlay';

const GameBoard = () => {
    // 'LOCAL' | 'ONLINE' | 'AI'
    const location = useLocation();
    const navigate = useNavigate();
    const gameMode = location.state?.gameMode || 'LOCAL';

    const matchTitle = gameMode === 'AI' ? 'VS AI — HARD' : gameMode === 'ONLINE' ? 'RANKED MATCH' : 'LOCAL MULTIPLAYER';
    const isBotMatch = gameMode === 'AI';
    const p2Name     = gameMode === 'AI' ? 'NEXUS-9' : gameMode === 'ONLINE' ? 'OPPONENT' : 'PLAYER_02';

    const {
        board,
        boardSize,
        currentPlayer,
        winnerData,
        isDraw,
        markerStyle,
        isLocked,
        handleMove,
        resetGame,
        setBoardSize,
        setMarkerStyle,
    } = useGame();

    const gameOver = !!winnerData || isDraw;

    return (
        <div className="bg-deep-bg text-[#e3e0f4] overflow-hidden h-screen w-screen relative">
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

            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#12121f] border-b-2 border-outline-variant">
                <span className="text-xl font-black text-primary-cyan font-headline tracking-tighter"
                      style={{ textShadow: '0 0 8px #4cc9f0' }}>
                    TICTACTOANG
                </span>
                <nav className="hidden md:flex gap-8">
                    <span className="font-mono uppercase tracking-widest text-sm text-primary-cyan border-b-2 border-primary-cyan pb-1 cursor-pointer">ARCADE</span>
                    <span className="font-mono uppercase tracking-widest text-sm text-outline-variant hover:text-primary-cyan cursor-pointer transition-colors">LEADERBOARD</span>
                </nav>
            </header>

            <main className="pt-16 pb-8 h-full flex px-6 gap-6 items-center justify-center font-mono">
                <PlayerPanel role="X" playerName="PLAYER_01" isBot={false} isActive={currentPlayer === 'X' && !gameOver} />

                <BoardArea
                    board={board}
                    boardSize={boardSize}
                    matchTitle={matchTitle}
                    markerStyle={markerStyle}
                    winnerData={winnerData}
                    isDraw={isDraw}
                    isLocked={isLocked}
                    onCellClick={handleMove}
                    onReset={resetGame}
                    onSizeChange={setBoardSize}
                    onMarkerChange={setMarkerStyle}
                />

                <PlayerPanel 
                role="O" 
                playerName={p2Name} 
                isBot={isBotMatch} 
                isActive={currentPlayer === 'O' && !gameOver} 
                difficulty={isBotMatch ? "HARD" : undefined} 
                />
            </main>

            {gameOver && (
                <WinOverlay winnerData={winnerData} isDraw={isDraw} onRestart={resetGame} onBackToLobby={() => navigate('/lobby')} />
            )}

            <footer className="fixed bottom-0 w-full py-2 px-6 flex justify-between bg-outline-variant border-t border-outline-variant z-50">
                <span className="font-mono text-[10px] uppercase text-primary-cyan">© 2076 TICTACTOANG SYSTEMS.</span>
                <span className="font-mono text-[10px] uppercase text-primary-cyan">CORE_TEMP: OPTIMAL</span>
            </footer>
        </div>
    );
};

export default GameBoard;