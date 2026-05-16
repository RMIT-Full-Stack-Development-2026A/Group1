import React from 'react';
import { renderOMarker, renderXMarker } from '@/utils/markerRenderer';

const GridCell = ({ value, markerVariant, cellBorderClass, isWinCell, onClick, disabled }) => {
    const borderClass = cellBorderClass ?? 'border-r border-b border-[#2a2a4e]';

    return (
        <div
            className={[
                'aspect-square flex items-center justify-center overflow-hidden',
                borderClass,
                'flex items-center justify-center transition-all duration-100',
                isWinCell ? 'bg-[#fad100]/20' : '',
                disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-[#292937] active:bg-[#343342]',
            ].join(' ')}
            style={isWinCell ? { boxShadow: 'inset 0 0 8px rgba(250,209,0,0.25)' } : {}}
            onClick={disabled ? undefined : onClick}
        >
            {value === 'X' && renderXMarker(markerVariant, "w-28 h-20 flex items-center justify-center")}
            {value === 'O' && renderOMarker(markerVariant, "w-28 h-20 flex items-center justify-center")}
        </div>
    );
};

export default React.memo(GridCell);