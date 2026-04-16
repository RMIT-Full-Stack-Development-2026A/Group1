// client/src/pages/Player/MatchReplay/sub-components/ReplayBoard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { renderXMarker, renderOMarker } from '@/utils/markerRenderer';

export default function ReplayBoard({ boardState, boardSize, markerStyle }) {
    const columns = Array.from({ length: boardSize }, (_, i) => String.fromCharCode(65 + i));
    const rows = Array.from({ length: boardSize }, (_, i) => i + 1);

    return (
        <div className="w-full overflow-auto bg-[#1e1e2c] border border-[#3d484d] chunky-shadow-surface p-6">
            <div className="grid min-w-max" style={{ gridTemplateColumns: '24px 1fr 24px', gridTemplateRows: '20px 1fr 20px' }}>
                <div />
                <div className="flex justify-between px-1">
                    {columns.map(c => <span key={c} className="w-full text-center text-[9px] text-[#879398] font-mono">{c}</span>)}
                </div>
                <div />

                <div className="flex flex-col justify-between py-1 px-1">
                    {rows.map(r => <span key={r} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{String(r).padStart(2, '0')}</span>)}
                </div>

                {/* Grid chính */}
                <div className="grid border border-[#3d484d] bg-[#3d484d] gap-[1px]" 
                     style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(40px, 1fr))` }}>
                    {boardState.map((row, rIdx) => row.map((cell, cIdx) => (
                        <div key={`${rIdx}-${cIdx}`} 
                             className={`aspect-square bg-[#12121f] flex items-center justify-center relative
                             ${cell?.isWinning ? 'bg-[#fad100]/10 border border-[#fad100] z-10' : ''}
                             ${cell?.isLatest ? 'border-2 border-[#4cc9f0] z-20 shadow-[0_0_8px_#4cc9f0]' : ''}`}>
                            
                            {cell && (
                                <>
                                    {/* Render marker */}
                                    {cell.mark === 'X' 
                                        ? renderXMarker(markerStyle, "w-8 h-8 flex items-center justify-center") 
                                        : renderOMarker(markerStyle, "w-8 h-8 flex items-center justify-center")
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
    );
}

ReplayBoard.propTypes = {
    boardState: PropTypes.arrayOf(PropTypes.array).isRequired,
    boardSize: PropTypes.number.isRequired,
    markerStyle: PropTypes.string.isRequired,
};