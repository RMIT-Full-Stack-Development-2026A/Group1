import React from 'react';
import { useGame } from './hook/useGame.hook';
import GridCell from './sub-components/GridCell';

const GameBoard = ({ initialSize = 10 }) => {
    const { 
        board, 
        boardSize, 
        handleCellClick, 
        winner, 
        isDraw, 
        currentPlayer 
    } = useGame(initialSize);

    const currentSize = boardSize || initialSize || 10;
    
    // Tọa độ A, B, C...
    const columns = Array.from({ length: currentSize }, (_, i) => String.fromCharCode(65 + i));
    // Tọa độ 01, 02, 03...
    const rows = Array.from({ length: currentSize }, (_, i) => String(i + 1).padStart(2, '0'));

    if (!board || board.length === 0) return <div className="text-white text-center mt-20">BOOTING ARCADE SYSTEM...</div>;

    return (
        <div className="bg-[#0d0d1a] text-[#e3e0f4] font-mono overflow-hidden h-screen w-screen relative selection:bg-[#fad100]">
            
            {/* --- INLINE STYLES FOR ARCADE EFFECTS --- */}
            <style>{`
                .scanlines { background: linear-gradient(to bottom, rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%); background-size: 100% 2px; pointer-events: none; }
                .pixel-grid { background-image: radial-gradient(rgba(76,201,240,0.05) 1px, transparent 0); background-size: 4px 4px; pointer-events: none; }
                .glow-cyan { box-shadow: 0 0 10px #4cc9f0; }
                .glow-amber { box-shadow: 0 0 15px #fad100; }
                .text-glow-amber { text-shadow: 0 0 12px #fad100; }
                .chunky-offset-primary { box-shadow: 2px 2px 0px 0px #005266; }
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Mono:wght@400;700&display=swap');
                .font-headline { font-family: 'Press Start 2P', cursive; }
                .font-body { font-family: 'IBM Plex Mono', monospace; }
            `}</style>

            {/* Screen Overlays */}
            <div className="fixed inset-0 scanlines z-[100]"></div>
            <div className="fixed inset-0 pixel-grid z-[99]"></div>

            {/* Top Navigation Shell */}
            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#12121f] border-b-2 border-[#3d484d] shadow-[0px_2px_0px_0px_#343342]">
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-[#4cc9f0] [text-shadow:0px_0px_8px_#4cc9f0] font-headline tracking-tighter">TICTACTOANG</span>
                </div>
                <nav className="hidden md:flex gap-8">
                    <span className="font-mono uppercase tracking-widest text-sm text-[#4cc9f0] border-b-2 border-[#4cc9f0] pb-1 cursor-pointer">ARCADE</span>
                    <span className="font-mono uppercase tracking-widest text-sm text-[#3d484d] cursor-pointer">LEADERBOARD</span>
                </nav>
            </header>

            {/* Main Content Layout */}
            <main className="pt-16 pb-8 h-full flex px-6 gap-6 items-center justify-center font-body">
                
                {/* Left Panel: Player 1 (X) */}
                <aside className={`w-[220px] flex flex-col gap-4 self-start mt-8 transition-opacity ${currentPlayer === 'X' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`bg-[#12121f] border-2 border-[#4cc9f0] p-6 flex flex-col items-center gap-6 relative ${currentPlayer === 'X' ? 'glow-cyan' : ''}`}>
                        {currentPlayer === 'X' && (
                            <div className="absolute -top-3 left-4 bg-[#4cc9f0] text-[#003543] px-2 py-0.5 text-[10px] font-bold uppercase">ACTIVE_TURN</div>
                        )}
                        <div className="w-32 h-32 border-2 border-[#3d484d] bg-[#292937] flex items-center justify-center p-2">
                            <div className="text-5xl">👤</div> {/* Thay bằng img avatar thật nếu có */}
                        </div>
                        <div className="text-center">
                            <p className="font-headline text-[10px] text-[#93e2ff] tracking-tighter mb-2">PLAYER_01</p>
                            <div className="text-[#ffb4ab] font-headline text-5xl drop-shadow-[0_0_10px_#93000a]">X</div>
                        </div>
                    </div>
                </aside>

                {/* Center: Game Board */}
                <section className="flex-1 flex flex-col gap-4 max-w-[800px]">
                    {/* Board Header */}
                    <div className="flex justify-between items-end bg-[#1e1e2c] p-4 border-b-2 border-[#93e2ff]">
                        <div>
                            <h2 className="font-headline text-xs text-[#fad100] mb-1">VS AI — HARD</h2>
                            <p className="font-mono text-[10px] text-[#879398] uppercase tracking-widest">MATCH_ID: #FF-990-2074</p>
                        </div>
                        <button onClick={() => window.location.reload()} className="border border-[#ffb4ab] text-[#ffb4ab] px-4 py-2 font-headline text-[8px] hover:bg-[#93000a] hover:text-[#ffdad6] transition-all uppercase z-[101]">
                            RESET_BOARD
                        </button>
                    </div>

                    {/* The Grid Area */}
                    <div className="bg-[#1a1a2e] p-4 border border-[#3d484d] grid grid-cols-[24px_1fr_24px] grid-rows-[24px_1fr_24px] z-[101]">
                        
                        {/* Top Labels */}
                        <div className="col-start-2 flex justify-between px-1">
                            {columns.map(col => <span key={col} className="w-full text-center text-[9px] text-[#879398] font-mono">{col}</span>)}
                        </div>

                        {/* Left Labels */}
                        <div className="row-start-2 flex flex-col justify-between py-1">
                            {rows.map(row => <span key={row} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{row}</span>)}
                        </div>

                        {/* Main Grid */}
                        <div 
                            className="col-start-2 row-start-2 grid border-l border-t border-[#2a2a4e]"
                            style={{ gridTemplateColumns: `repeat(${currentSize}, minmax(0, 1fr))` }}
                        >
                            {board.map((row, rowIndex) => (
                                row.map((cellValue, colIndex) => (
                                    <GridCell 
                                        key={`${rowIndex}-${colIndex}`}
                                        value={cellValue}
                                        row={rowIndex}
                                        col={colIndex}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        disabled={cellValue !== null || winner !== null || isDraw}
                                    />
                                ))
                            ))}
                        </div>

                        {/* Right Labels */}
                        <div className="row-start-2 col-start-3 flex flex-col justify-between py-1 px-1">
                            {rows.map(row => <span key={row} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{row}</span>)}
                        </div>

                        {/* Bottom Labels */}
                        <div className="col-start-2 row-start-3 flex justify-between px-1">
                            {columns.map(col => <span key={col} className="w-full text-center text-[9px] text-[#879398] font-mono">{col}</span>)}
                        </div>
                    </div>
                </section>

                {/* Right Panel: Player 2 / AI (O) */}
                <aside className={`w-[220px] flex flex-col gap-4 self-start mt-8 transition-opacity ${currentPlayer === 'O' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`bg-[#12121f] border-2 border-[#3d484d] p-6 flex flex-col items-center gap-6 relative ${currentPlayer === 'O' ? 'glow-cyan border-[#4cc9f0]' : ''}`}>
                        {currentPlayer === 'O' && (
                            <div className="absolute -top-3 right-4 bg-[#4cc9f0] text-[#003543] px-2 py-0.5 text-[10px] font-bold uppercase">ACTIVE_TURN</div>
                        )}
                        <div className="w-32 h-32 border-2 border-[#3d484d] bg-[#292937] flex items-center justify-center p-2 relative">
                            <div className="text-5xl">🤖</div>
                            <div className="absolute bottom-0 right-0 bg-[#fad100] text-[#6d5a00] px-2 py-0.5 text-[8px] font-bold font-mono">HARD</div>
                        </div>
                        <div className="text-center">
                            <p className="font-headline text-[10px] text-[#879398] tracking-tighter mb-2 uppercase">NEXUS-9</p>
                            <div className="text-[#93e2ff] font-headline text-5xl">O</div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Win Overlay */}
            {(winner || isDraw) && (
                <div className="fixed inset-0 z-[110] bg-[#0d0d1a]/80 flex items-center justify-center">
                    <div className="bg-[#12121f] border-4 border-[#fad100] p-12 max-w-2xl w-full text-center glow-amber relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#fad100] text-[#3b2f00] px-6 py-2 font-headline text-sm uppercase">
                            MATCH ENDED
                        </div>
                        <h1 className="font-headline text-4xl text-[#fad100] text-glow-amber mb-12 leading-relaxed">
                            {winner ? `PLAYER ${winner} WINS!` : 'DRAW!'}
                        </h1>
                        <div className="flex flex-col gap-4 items-center">
                            <button onClick={() => window.location.reload()} className="w-64 bg-[#4cc9f0] text-[#005266] font-headline text-xs py-5 chunky-offset-primary hover:translate-y-[2px] hover:shadow-none transition-all uppercase">
                                PLAY AGAIN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="fixed bottom-0 w-full py-2 px-6 flex justify-between items-center bg-[#0d0d1a] border-t border-[#3d484d] z-50">
                <span className="font-mono text-[10px] uppercase tracking-tighter text-[#4cc9f0]">© 2076 TICTACTOANG SYSTEMS.</span>
                <span className="font-mono text-[10px] uppercase tracking-tighter text-[#4cc9f0]">CORE_TEMP: OPTIMAL</span>
            </footer>
        </div>
    );
};

export default GameBoard;