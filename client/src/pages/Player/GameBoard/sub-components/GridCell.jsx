import React from 'react';

/**
 * CustomMarkerX / CustomMarkerO — SVG placeholders.
 * Design team: replace the path inside each SVG with your pixel art graphic.
 */
const CustomMarkerX = () => (
    /* Design team will replace this SVG */
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="3" y1="3" x2="17" y2="17" stroke="#ffb4ab" strokeWidth="2.5" strokeLinecap="square"/>
        <line x1="17" y1="3" x2="3" y2="17" stroke="#ffb4ab" strokeWidth="2.5" strokeLinecap="square"/>
    </svg>
);

const CustomMarkerO = () => (
    /* Design team will replace this SVG */
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="14" stroke="#93e2ff" strokeWidth="2.5"/>
    </svg>
);

/**
 * renderMarker — returns the correct visual for a cell value.
 * Extend the switch cases as new marker styles are designed.
 */
const renderMarker = (value, markerStyle) => {
    if (!value) return null;

    switch (markerStyle) {
        case 'custom_1':
            return value === 'X' ? <CustomMarkerX /> : <CustomMarkerO />;

        case 'default':
        default:
            return value === 'X'
                ? (
                    <span
                        className="font-headline text-lg select-none"
                        style={{ color: '#ffb4ab', textShadow: '0 0 8px #93000a' }}
                    >
                        X
                    </span>
                )
                : (
                    <span
                        className="font-headline text-lg select-none"
                        style={{ color: '#93e2ff', textShadow: '0 0 8px #4cc9f0' }}
                    >
                        O
                    </span>
                );
    }
};

/**
 * GridCell — pure presentational cell.
 * Props:
 * value        null | 'X' | 'O'
 * markerStyle  string
 * isWinCell    boolean
 * onClick      () => void
 * disabled     boolean
 */
const GridCell = ({ value, markerStyle, isWinCell, onClick, disabled }) => (
    <div
        className={[
            'aspect-square border-r border-b border-[#2a2a4e]',
            'flex items-center justify-center transition-all duration-100',
            isWinCell ? 'bg-[#fad100]/20' : '',
            
            // UPDATED: Use the 'disabled' prop to control cursor styling
            disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-[#292937] active:bg-[#343342]',
        ].join(' ')}
        style={isWinCell ? { boxShadow: 'inset 0 0 8px rgba(250,209,0,0.25)' } : {}}
        
        // UPDATED: Prevent the onClick event from firing if the cell is disabled
        onClick={disabled ? undefined : onClick}
    >
        {renderMarker(value, markerStyle)}
    </div>
);

export default React.memo(GridCell);