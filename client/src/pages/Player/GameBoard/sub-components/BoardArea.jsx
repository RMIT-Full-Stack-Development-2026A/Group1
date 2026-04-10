import GridCell from './GridCell';
import ScanLines from '../../../../components/reusable/ScanLines';

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
        <section className="h-[75vh] flex flex-col max-w-[100vh] mx-3">
            <ScanLines />
            {/* Coordinate grid */}
            <div
                className="bg-surface-card p-3 border border-outline-variant grid z-101 aspect-square h-full overflow-hidden"
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