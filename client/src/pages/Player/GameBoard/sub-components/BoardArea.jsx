import GridCell from './GridCell';

const COL_LETTERS = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));

const BOARD_SIZES   = [10, 15];
const MARKER_STYLES = [
    { value: 'default',  label: 'Default (X / O)' },
    { value: 'custom_1', label: 'Custom 1' },
];

/**
 * BoardArea — center section.
 * Contains: board controls header + coordinate grid.
 * Props:
 *   board         2D array
 *   boardSize     10 | 15
 *   matchTitle    string
 *   markerStyle   string
 *   winnerData    { player, cells } | null
 *   isDraw        boolean
 *   onCellClick   (row, col) => void
 *   onReset       () => void
 *   onSizeChange  (size: number) => void
 *   onMarkerChange (style: string) => void
 */
const BoardArea = ({
    board, boardSize, matchTitle, markerStyle,
    winnerData, isDraw, isLocked,
    onCellClick, onReset, onSizeChange, onMarkerChange,
}) => {
    const gameOver = !!winnerData || isDraw;
    const moveCount = board.flat().filter(v => v !== null).length;

    const columns = COL_LETTERS.slice(0, boardSize);
    const rows    = Array.from({ length: boardSize }, (_, i) => String(i + 1).padStart(2, '0'));

    const selectClass = "bg-[#1e1e2c] border border-[#3d484d] text-[#e3e0f4] font-mono text-[10px] uppercase px-2 py-1 focus:outline-none focus:border-[#4cc9f0]";

    return (
        <section className="flex-1 flex flex-col gap-3 max-w-205">

            {/* Board controls header */}
            <div className="flex flex-wrap justify-between items-center gap-3 bg-[#1e1e2c] p-4 border-b-2 border-[#93e2ff]">
                <div>
                    <h2 className="font-headline text-[10px] text-[#fad100] mb-1">{matchTitle}</h2>
                    <p className="font-mono text-[10px] text-[#879398] uppercase tracking-widest">
                        MOVE: {String(moveCount).padStart(2, '0')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Board size selector */}
                    <div className="flex flex-col gap-1">
                        <label className="font-mono text-[8px] text-[#879398] uppercase tracking-widest">BOARD_SIZE</label>
                        <select
                            className={selectClass}
                            value={boardSize}
                            onChange={e => onSizeChange(Number(e.target.value))}
                            disabled={moveCount > 0 && !gameOver}
                        >
                            {BOARD_SIZES.map(s => (
                                <option key={s} value={s}>{s}×{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Marker style selector */}
                    <div className="flex flex-col gap-1">
                        <label className="font-mono text-[8px] text-[#879398] uppercase tracking-widest">MARKER_SET</label>
                        <select
                            className={selectClass}
                            value={markerStyle}
                            onChange={e => onMarkerChange(e.target.value)}
                            disabled={moveCount > 0 && !gameOver}
                        >
                            {MARKER_STYLES.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset */}
                    <div className="flex flex-col gap-1">
                        <label className="font-mono text-[8px] text-transparent uppercase tracking-widest select-none">ACTION</label>
                        <button
                            onClick={onReset}
                            className="border border-[#ffb4ab] text-[#ffb4ab] px-4 py-1 font-headline text-[8px] hover:bg-[#93000a] hover:text-[#ffdad6] transition-all uppercase"
                        >
                            RESET
                        </button>
                    </div>
                </div>
            </div>

            {/* Coordinate grid */}
            <div
                className="bg-surface-card p-3 border border-outline-variant grid z-101"
                style={{ gridTemplateColumns: '24px 1fr 24px', gridTemplateRows: '20px 1fr 20px' }}
            >
                {/* Top labels */}
                <div className="col-start-2 flex justify-between px-1">
                    {columns.map(col => (
                        <span key={col} className="w-full text-center text-[9px] text-[#879398] font-mono">{col}</span>
                    ))}
                </div>

                {/* Left labels */}
                <div className="row-start-2 flex flex-col justify-between py-1">
                    {rows.map(row => (
                        <span key={row} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{row}</span>
                    ))}
                </div>

                {/* Main cell grid */}
                <div
                    className="col-start-2 row-start-2 grid border-l border-t border-[#2a2a4e]"
                    style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
                >
                    {board.map((row, rowIndex) =>
                        row.map((cellValue, colIndex) => (
                            <GridCell
                                key={`${rowIndex}-${colIndex}`}
                                value={cellValue}
                                markerStyle={markerStyle}
                                isWinCell={winnerData?.cells?.some(([r, c]) => r === rowIndex && c === colIndex) ?? false}
                                onClick={() => onCellClick(rowIndex, colIndex)}
                                
                                // UPDATED: Add isLocked to disable condition
                                disabled={cellValue !== null || gameOver || isLocked} 
                            />
                        ))
                    )}
                </div>

                {/* Right labels */}
                <div className="row-start-2 col-start-3 flex flex-col justify-between py-1 px-1">
                    {rows.map(row => (
                        <span key={row} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{row}</span>
                    ))}
                </div>

                {/* Bottom labels */}
                <div className="col-start-2 row-start-3 flex justify-between px-1">
                    {columns.map(col => (
                        <span key={col} className="w-full text-center text-[9px] text-[#879398] font-mono">{col}</span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BoardArea;