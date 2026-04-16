import React, { useEffect, useRef } from 'react';

const getPlayerLabel = (player) => {
    if (!player) return 'Unknown';

    if (player.role === 'AI') {
        return `${player.usernameSnapshot || 'AI'} (${player.aiDifficulty || 'N/A'})`;
    }

    return player.usernameSnapshot || 'Unknown';
};

export default function MoveLog({ moveLog, currentStep, boardSize, onJumpToStep, playerX, playerO }) {
    const listRef = useRef(null);
    const activeRound = Math.ceil(currentStep / 2);

    useEffect(() => {
        if (!activeRound) return;

        const activeRow = listRef.current?.querySelector(`[data-round="${activeRound}"]`);
        activeRow?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [activeRound]);

    return (
        <div className="h-full min-h-[500px] flex flex-col bg-surface border border-outline-variant chunky-shadow overflow-hidden">
            <div className="h-10 bg-primary-container flex items-center px-4 justify-between shrink-0">
                <span className="text-on-primary font-bold text-[10px] uppercase tracking-widest font-body">
                    MOVE_LOG
                </span>
                <span className="text-on-primary font-bold text-[10px] font-body">
                    {moveLog.length} ROUNDS
                </span>
            </div>

            <div className="grid grid-cols-[40px_1fr_1fr] gap-2 text-[10px] font-body text-outline px-4 py-2 border-b border-outline-variant/40 uppercase tracking-widest shrink-0">
                <span>#</span>
                <span className="truncate">X: {getPlayerLabel(playerX)}</span>
                <span className="truncate text-right">O: {getPlayerLabel(playerO)}</span>
            </div>

            <div
                ref={listRef}
                className="flex-1 overflow-y-auto font-body text-xs"
            >
                {moveLog.map(({ round, xMove, oMove }) => {
                    const xMoveStep = (round - 1) * 2 + 1;
                    const oMoveStep = (round - 1) * 2 + 2;

                    const isActiveRound = currentStep === xMoveStep || currentStep === oMoveStep;
                    const isPastRound = currentStep > oMoveStep;
                    const isFutureRound = currentStep < xMoveStep;
                    const isXActive = currentStep === xMoveStep;
                    const isOActive = currentStep === oMoveStep;

                    const rowClasses = [
                        'grid',
                        'grid-cols-[40px_1fr_1fr]',
                        'gap-2',
                        'items-center',
                        'px-4',
                        'py-2',
                        'border-b',
                        'border-outline-variant/20',
                        'transition-colors'
                    ];

                    if (isFutureRound) {
                        rowClasses.push('opacity-30', 'pointer-events-none');
                    } else if (isActiveRound) {
                        rowClasses.push('bg-primary-container/10', 'border-l-2', 'border-primary-container');
                    } else if (isPastRound) {
                        rowClasses.push('hover:bg-surface-container-highest');
                    }

                    return (
                        <div
                            key={round}
                            data-round={round}
                            className={rowClasses.join(' ')}
                        >
                            <span className={`font-body ${isActiveRound ? 'text-primary' : 'text-outline'}`}>
                                {String(round).padStart(2, '0')}
                            </span>

                            <button
                                type="button"
                                onClick={() => !isFutureRound && onJumpToStep(xMoveStep)}
                                className={`text-left truncate transition-colors ${
                                    isXActive
                                        ? 'text-error font-bold'
                                        : isPastRound || isActiveRound
                                            ? 'text-on-surface-variant'
                                            : 'text-on-surface-variant'
                                }`}
                            >
                                {xMove?.coordinate || '—'}
                            </button>

                            <button
                                type="button"
                                onClick={() => oMove && !isFutureRound && onJumpToStep(oMoveStep)}
                                className={`text-right truncate transition-colors ${
                                    isOActive
                                        ? 'text-primary-container font-bold'
                                        : isPastRound || isActiveRound
                                            ? 'text-on-surface-variant'
                                            : 'text-on-surface-variant'
                                } ${!oMove ? 'cursor-default' : ''}`}
                                disabled={!oMove}
                            >
                                {oMove?.coordinate || '—'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 bg-surface-container-low border-t border-outline-variant shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-outline font-body uppercase tracking-wider">
                        AUTO-SCROLL
                    </span>
                    <div className="w-8 h-4 bg-primary-container/30 border border-primary-container flex items-center px-0.5">
                        <div className="w-2.5 h-2.5 bg-primary-container" />
                    </div>
                </div>
            </div>
        </div>
    );
}
