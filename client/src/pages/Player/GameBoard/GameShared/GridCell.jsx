import React from 'react';
import { renderOMarker, renderXMarker } from '@/utils/markerRenderer';

const GridCell = ({ value, markerVariant, p1MarkerVariant, p2MarkerVariant, cellBorderClass, isWinCell, onClick, disabled, player1Mark, player2Mark }) => {
    const borderClass = cellBorderClass ?? 'border-r border-b border-[#2a2a4e]';
    const resolvedP1MarkerVariant = p1MarkerVariant ?? markerVariant;
    const resolvedP2MarkerVariant = p2MarkerVariant ?? markerVariant;

    return (
        <>
            {/* Inject custom extreme keyframes only when this cell is a winning cell */}
            {isWinCell && (
                <style>{`
                    @keyframes cyberLevitate {
                        0%, 100% { 
                            transform: translateY(0) scale(1.1); 
                            box-shadow: inset 0 0 20px rgba(250,209,0,0.5), 0 0 30px rgba(250,209,0,0.6); 
                            background-color: rgba(250,209,0,0.25); 
                            border-color: rgba(250,209,0,1); 
                        }
                        50% { 
                            transform: translateY(-12px) scale(1.15); 
                            box-shadow: inset 0 0 40px rgba(250,209,0,0.9), 0 15px 40px rgba(250,209,0,0.9); 
                            background-color: rgba(250,209,0,0.5); 
                            border-color: #ffffff; 
                        }
                    }
                    
                    @keyframes markerTremble {
                        0%, 100% { 
                            transform: rotate(-6deg) scale(1.2); 
                            filter: drop-shadow(0 0 10px #fad100); 
                        }
                        50% { 
                            transform: rotate(6deg) scale(1.35); 
                            filter: drop-shadow(0 0 25px #ffffff); 
                        }
                    }

                    .win-cell-master {
                        /* 0.8s for a smooth floating effect */
                        animation: cyberLevitate 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                        z-index: 50;
                    }

                    .win-marker-master {
                        /* 0.1s for a violent shaking/trembling effect */
                        animation: markerTremble 0.1s linear infinite;
                    }
                `}</style>
            )}

            <div
                className={[
                    'aspect-square flex items-center justify-center overflow-hidden relative',
                    borderClass,
                    // Basic transition for normal hovering states
                    'transition-colors duration-200',
                    // Apply the levitation animation class if it is a winning cell
                    isWinCell ? 'win-cell-master rounded-sm' : '',
                    disabled && !isWinCell ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-[#292937] active:bg-[#343342]',
                ].join(' ')}
                onClick={disabled ? undefined : onClick}
            >
                {/* Marker Container with Tremble Animation */}
                <div className={`
                    relative z-10 flex items-center justify-center w-full h-full
                    ${isWinCell ? 'win-marker-master' : 'scale-100 transition-transform duration-300'}
                `}>
                    {value === player1Mark && (
                        player1Mark === 'X' 
                            // Render X marker if player1Mark is exactly 'X'
                            ? renderXMarker(resolvedP1MarkerVariant, "w-28 h-20 flex items-center justify-center") 
                            // Render O marker otherwise
                            : renderOMarker(resolvedP1MarkerVariant, "w-28 h-20 flex items-center justify-center")
                        )}
                    {value === player2Mark && (
                        player2Mark === 'X' 
                            // Render X marker if player2Mark is exactly 'X'
                            ? renderXMarker(resolvedP2MarkerVariant, "w-28 h-20 flex items-center justify-center") 
                            // Render O marker otherwise
                            : renderOMarker(resolvedP2MarkerVariant, "w-28 h-20 flex items-center justify-center")
                        )}
                </div>
            </div>
        </>
    );
};

export default React.memo(GridCell);