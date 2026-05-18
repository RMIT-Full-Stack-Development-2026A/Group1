// client/src/pages/Player/MatchReplay/sub-components/ReplayBoard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { renderXMarker, renderOMarker } from '@/utils/markerRenderer';

const BOARD_THEMES = {
    CLASSIC: { wrapper: 'bg-[#1e1e2c] border border-[#2a2a4e]', gap: '#2a2a4e', cellBg: '#12121f' },
    NEON: { wrapper: 'bg-[#0a0a1a] border border-[#4cc9f0]', gap: 'rgba(76,201,240,0.3)', cellBg: '#050510', glow: '0 0 20px rgba(76,201,240,0.15)' },
    DARK: { wrapper: 'bg-[#0f0f0f] border-4 border-[#3a3a3a]', gap: '#1a1a1a', cellBg: '#0f0f0f' },
};

export default function ReplayBoard({ boardState, boardSize, markerStyle, boardStyle = 'CLASSIC' }) {
    const columns = Array.from({ length: boardSize }, (_, i) => String.fromCharCode(65 + i));
    const rows = Array.from({ length: boardSize }, (_, i) => i + 1);
    const theme = BOARD_THEMES[boardStyle] ?? BOARD_THEMES.CLASSIC;

    return (
        <div className={`w-full overflow-hidden chunky-shadow-surface p-6 ${theme.wrapper}`} style={{ boxShadow: theme.glow }}>
            <div style={{ maxWidth: boardSize <= 10 ? '640px' : '620px' }} className="mx-auto w-full">
                <div className="grid" style={{ gridTemplateColumns: '24px 1fr 24px', gridTemplateRows: '20px 1fr 20px' }}>
                    <div />
                    <div className="flex justify-between px-1">
                        {columns.map(c => <span key={c} className="w-full text-center text-[9px] text-[#879398] font-mono">{c}</span>)}
                    </div>
                    <div />

                    <div className="flex flex-col justify-between py-1 px-1">
                        {rows.map(r => <span key={r} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{String(r).padStart(2, '0')}</span>)}
                    </div>

                    <div className="grid border border-[#3d484d] gap-[1px]"
                        style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`, backgroundColor: theme.gap }}>
                        {boardState.map((row, rIdx) => row.map((cell, cIdx) => (
                            <div key={`${rIdx}-${cIdx}`}
                                className={`aspect-square flex items-center justify-center relative
                             ${cell?.isWinning ? 'bg-[#fad100]/10 border border-[#fad100] z-10' : ''}
                             ${cell?.isLatest ? 'border-2 border-[#4cc9f0] z-20 shadow-[0_0_8px_#4cc9f0]' : ''}`}
                                style={{ backgroundColor: theme.cellBg }}>

                                {cell && (
                                    <>
                                        {/* Render marker */}
                                        {cell.mark === 'X'
                                            ? renderXMarker(markerStyle, "w-[65%] h-[65%] flex items-center justify-center")
                                            : renderOMarker(markerStyle, "w-[65%] h-[65%] flex items-center justify-center")
                                        }
                                        <span className="absolute top-0.5 right-0.5 text-[7px] text-[#879398] font-mono">
                                            {String(cell.stepIndex).padStart(2, '0')}
                                        </span>
                                    </>
                                )}
                            </div>
                        )))}
                    </div>

                    <div className="flex flex-col justify-between py-1 px-1">
                        {rows.map(r => <span key={r} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{String(r).padStart(2, '0')}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

ReplayBoard.propTypes = {
    boardState: PropTypes.arrayOf(PropTypes.array).isRequired,
    boardSize: PropTypes.number.isRequired,
    markerStyle: PropTypes.string.isRequired,
    boardStyle: PropTypes.string,
};