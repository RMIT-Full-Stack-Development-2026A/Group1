// client/src/pages/Player/MatchReplay/sub-components/ReplayBoard.jsx
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { renderXMarker, renderOMarker } from '@/utils/markerRenderer';
import { getTheme } from '@/config/gameThemes.config';

const COL_LETTERS = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));

export default function ReplayBoard({ boardState, boardSize, playerX = {}, playerO = {}, markerStyle, boardStyle = 'CLASSIC' }) {
    const theme = getTheme(boardStyle) || getTheme('CLASSIC');

    const columns = useMemo(() => COL_LETTERS.slice(0, boardSize), [boardSize]);
    const rows = useMemo(() => Array.from({ length: boardSize }, (_, i) => i + 1), [boardSize]);

    return (
        <div className={`w-full overflow-hidden p-6 ${theme.boardWrapper}`} style={{ boxShadow: theme.boardGlow }}>
            <div style={{ maxWidth: boardSize <= 10 ? '640px' : '620px' }} className="mx-auto w-full">

                <div 
                    className="grid" 
                    style={{ gridTemplateColumns: '24px 1fr 24px', gridTemplateRows: '20px 1fr 20px' }}
                >
                    {/* Top Labels */}
                    <div className="col-start-2 flex justify-between px-1">
                        {columns.map(c => <span key={c} className="w-full text-center text-[9px] text-[#879398] font-mono">{c}</span>)}
                    </div>

                    {/* Left Labels */}
                    <div className="row-start-2 flex flex-col justify-between py-1 px-1">
                        {rows.map(r => <span key={r} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{r}</span>)}
                    </div>

                    {/* Main Board Grid */}
                    <div 
                        className={`col-start-2 row-start-2 grid ${theme.boardBorder}`}
                        style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
                    >
                        {theme.bgImage && (
                                    <img 
                                        src={theme.bgImage} 
                                        alt={`${theme.bgImage} background`}
                                        className="absolute inset-0 w-full h-full object-cover opacity-15 z-0 pointer-events-none"
                                    />
                                )}
                        {boardState.map((row, rIdx) => row.map((cell, cIdx) => (
                            <div 
                                key={`${rIdx}-${cIdx}`}
                                className={`aspect-square flex items-center justify-center relative ${theme.cellBorder}
                                    ${cell?.isWinning ? 'bg-[#fad100]/10 z-10' : ''}
                                    ${cell?.isLatest ? 'z-20 shadow-[0_0_8px_#4cc9f0]' : ''}`}
                            >
                                {cell && (
                                    <>
                                        {/* Marker Render */}
                                        {cell.mark === 'X'
                                            ? renderXMarker(playerX.markerStyle || playerO.markerStyle || 'CLASSIC', "w-[65%] h-[65%] flex items-center justify-center")
                                            : renderOMarker(playerO.markerStyle || playerX.markerStyle || 'CLASSIC', "w-[65%] h-[65%] flex items-center justify-center")
                                        }
                                        {/* Step Index */}
                                        <span className="absolute top-0.5 right-0.5 text-[7px] text-[#879398] font-mono">
                                            {String(cell.stepIndex).padStart(2, '0')}
                                        </span>
                                    </>
                                )}
                            </div>
                        )))}
                    </div>

                    {/* Right Labels */}
                    <div className="row-start-2 col-start-3 flex flex-col justify-between py-1 px-1">
                        {rows.map(r => <span key={r} className="h-full flex items-center text-[9px] text-[#879398] font-mono">{r}</span>)}
                    </div>

                    {/* Bottom Labels */}
                    <div className="col-start-2 row-start-3 flex justify-between px-1">
                        {columns.map(c => <span key={c} className="w-full text-center text-[9px] text-[#879398] font-mono">{c}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

ReplayBoard.propTypes = {
    boardState: PropTypes.arrayOf(PropTypes.array).isRequired,
    boardSize: PropTypes.number.isRequired,
    playerX: PropTypes.object,
    playerO: PropTypes.object,
    boardStyle: PropTypes.string,
};