import { useMemo } from 'react';
import GridCell from './GridCell';
import { useButtonSound } from '@/hooks/useButtonSound';
import { AUDIO_FILES } from '@/config/audioConfig';
import { getTheme } from '@/config/gameThemes.config';
import ScanLines from '@/components/reusable/custom/ScanLines';

const COL_LETTERS = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));

const BoardArea = ({
    board,
    boardSize,
    markerVariant,
    xMarkerVariant,
    oMarkerVariant,
    theme = getTheme('jungle'),
    winnerData,
    isDraw,
    isLocked,
    onCellClick,
}) => {
    const gameOver = !!winnerData || isDraw;
    const { play: playMoveSound } = useButtonSound(AUDIO_FILES.BUTTON_CLICK, 0.5);

    const columns = useMemo(() => COL_LETTERS.slice(0, boardSize), [boardSize]);
    const rows = useMemo(
        () => Array.from({ length: boardSize }, (_, i) => String(i + 1).padStart(2, '0')),
        [boardSize]
    );

    return (
        <section className="flex-1 flex items-center justify-center">
            <ScanLines />
            <div
                className={`${theme.boardWrapper} board-wrapper p-3 grid aspect-square`}
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
                    className={`col-start-2 row-start-2 grid board-grid ${theme.boardBorder}`}
                    style={{
                        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                        boxShadow: theme.boardGlow,
                    }}
                >
                    {board.map((row, rowIndex) =>
                        row.map((cellValue, colIndex) => (
                            <GridCell
                                key={`${rowIndex}-${colIndex}`}
                                value={cellValue}
                                markerVariant={markerVariant}
                                xMarkerVariant={xMarkerVariant}
                                oMarkerVariant={oMarkerVariant}
                                cellBorderClass={theme.cellBorder}
                                isWinCell={winnerData?.cells?.some(([r, c]) => r === rowIndex && c === colIndex) ?? false}
                                onClick={() => {
                                    if (cellValue !== null || gameOver || isLocked) return;
                                    playMoveSound();
                                    onCellClick?.(rowIndex, colIndex);
                                }}
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