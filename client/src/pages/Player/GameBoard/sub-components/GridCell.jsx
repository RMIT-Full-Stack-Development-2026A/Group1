import React from 'react';
import { renderOMarker, renderXMarker } from '../../../../utils/markerRenderer';

const GridCell = ({ value, markerVariant, isWinCell, onClick, disabled }) => (
    <div
        className={[
            'aspect-square border-r border-b border-[#2a2a4e] flex items-center justify-center overflow-hidden',
            'flex items-center justify-center transition-all duration-100',
            isWinCell ? 'bg-[#fad100]/20' : '',
            
            // UPDATED: Use the 'disabled' prop to control cursor styling
            disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-[#292937] active:bg-[#343342]',
        ].join(' ')}
        style={isWinCell ? { boxShadow: 'inset 0 0 8px rgba(250,209,0,0.25)' } : {}}
        
        // UPDATED: Prevent the onClick event from firing if the cell is disabled
        onClick={disabled ? undefined : onClick}
    >
        {value === 'X' && renderXMarker(markerVariant, "w-10 h-10 flex items-center justify-center")}
        {value === 'O' && renderOMarker(markerVariant, "w-10 h-10 flex items-center justify-center")}
    </div>
);

export default React.memo(GridCell);