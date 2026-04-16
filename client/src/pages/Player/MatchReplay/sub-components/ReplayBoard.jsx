import React from 'react';

export default function ReplayBoard({ boardState, boardSize }) {
    const columns = Array.from({ length: boardSize }, (_, index) => String.fromCharCode(65 + index));
    const rows = Array.from({ length: boardSize }, (_, index) => index + 1);

    return (
        <div className="w-full overflow-auto bg-surface-container border border-outline-variant chunky-shadow p-4 md:p-6">
            <div
                className="grid min-w-max"
                style={{
                    gridTemplateColumns: '20px 1fr 20px',
                    gridTemplateRows: '16px 1fr 16px'
                }}
            >
                <div />

                <div className="grid" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}>
                    {columns.map((column) => (
                        <div
                            key={`top-${column}`}
                            className="text-[9px] text-outline font-mono font-body text-center leading-4"
                        >
                            {column}
                        </div>
                    ))}
                </div>

                <div />

                <div className="grid" style={{ gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))` }}>
                    {rows.map((row) => (
                        <div
                            key={`left-${row}`}
                            className="text-[9px] text-outline font-mono font-body flex items-center justify-center"
                        >
                            {row}
                        </div>
                    ))}
                </div>

                <div
                    className="grid border border-outline-variant/50"
                    style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
                >
                    {boardState.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            const cellClasses = [
                                'aspect-square',
                                'bg-surface-container',
                                'border-r',
                                'border-b',
                                'border-outline-variant/30',
                                'flex',
                                'items-center',
                                'justify-center',
                                'relative'
                            ];

                            if (cell?.isWinning) {
                                cellClasses.push('bg-secondary-container/20', 'border', 'border-secondary-container');
                            }

                            if (cell?.isLatest) {
                                cellClasses.push('border-2', 'border-primary-container', 'shadow-[0_0_8px_rgba(76,201,240,0.8)]');
                            }

                            return (
                                <div key={`${rowIndex}-${colIndex}`} className={cellClasses.join(' ')}>
                                    {cell ? (
                                        <>
                                            <span
                                                className={
                                                    cell.mark === 'X'
                                                        ? 'font-headline text-[clamp(10px,2.5cqw,20px)] text-error-container drop-shadow-[0_0_6px_rgba(147,0,10,0.8)]'
                                                        : 'font-headline text-[clamp(10px,2.5cqw,20px)] text-primary-container drop-shadow-[0_0_6px_rgba(76,201,240,0.8)]'
                                                }
                                            >
                                                {cell.mark}
                                            </span>
                                            <span className="absolute top-0 right-0.5 text-[7px] text-outline font-body leading-none">
                                                {String(cell.stepIndex).padStart(2, '0')}
                                            </span>
                                        </>
                                    ) : null}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="grid" style={{ gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))` }}>
                    {rows.map((row) => (
                        <div
                            key={`right-${row}`}
                            className="text-[9px] text-outline font-mono font-body flex items-center justify-center"
                        >
                            {row}
                        </div>
                    ))}
                </div>

                <div />

                <div className="grid" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}>
                    {columns.map((column) => (
                        <div
                            key={`bottom-${column}`}
                            className="text-[9px] text-outline font-mono font-body text-center leading-4"
                        >
                            {column}
                        </div>
                    ))}
                </div>

                <div />
            </div>
        </div>
    );
}