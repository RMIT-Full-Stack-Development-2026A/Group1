import { useMemo } from 'react';
import GridCell from './GridCell';
import ScanLines from '../../../../components/reusable/ScanLines';

const COL_LETTERS = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));

const BOARD_THEMES = {
    classic: {
        wrapper: 'bg-[#0c0f2a] border border-[#7b61ff]',
        cellBorder: 'border-[#7b61ff]/35',
        boardBorder: 'border-l border-t border-[#7b61ff]/40',
        glowStyle: { 
            boxShadow: '0 0 20px rgba(123, 97, 255, 0.18), inset 0 0 14px rgba(123, 97, 255, 0.08)' 
        },
    },

    neon: {
        wrapper: 'bg-[#0a0a1a] border border-[#4cc9f0]',
        cellBorder: 'border-[#4cc9f0]/40',
        boardBorder: 'border-l border-t border-[#4cc9f0]/40',
        glowStyle: { boxShadow: '0 0 24px rgba(76, 201, 240, 0.18), inset 0 0 18px rgba(76, 201, 240, 0.08)' },
    },

    block: {
        wrapper: 'bg-[#0a0a0a] border-4 border-[#ff3d00]',
        cellBorder: 'border-[#ff3d00]/30',
        boardBorder: 'border-l-2 border-t-2 border-[#ff3d00]/40',
        glowStyle: { 
            boxShadow: '0 0 18px rgba(255, 61, 0, 0.2), inset 0 0 10px rgba(255, 61, 0, 0.06)' 
        },
    },
};

const BoardArea = ({
    board,
    boardSize,
    markerVariant,
    gridStyle = 'classic',
    winnerData,
    isDraw,
    isLocked,
    onCellClick,
}) => {
    const gameOver = !!winnerData || isDraw;
    const theme = BOARD_THEMES[gridStyle] ?? BOARD_THEMES.classic;

    const columns = useMemo(() => COL_LETTERS.slice(0, boardSize), [boardSize]);
    const rows = useMemo(
        () => Array.from({ length: boardSize }, (_, i) => String(i + 1).padStart(2, '0')),
        [boardSize]
    );

    return (
        <section className="flex-1 flex items-center justify-center">
            <ScanLines />
            <div
                className={`${theme.wrapper} p-3 grid aspect-square w-full max-w-[600px]`}
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
                    className={`col-start-2 row-start-2 grid ${theme.boardBorder}`}
                    style={{
                        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                        ...(theme.glowStyle ?? {}),
                    }}
                >
                    {board.map((row, rowIndex) =>
                        row.map((cellValue, colIndex) => (
                            <GridCell
                                key={`${rowIndex}-${colIndex}`}
                                value={cellValue}
                                markerVariant={markerVariant}
                                gridStyle={gridStyle}
                                isWinCell={winnerData?.cells?.some(([r, c]) => r === rowIndex && c === colIndex) ?? false}
                                onClick={() => onCellClick?.(rowIndex, colIndex)}
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