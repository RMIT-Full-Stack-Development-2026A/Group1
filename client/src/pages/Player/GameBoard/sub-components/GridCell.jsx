import React from 'react';

const GridCell = ({ value, row, col, onClick, disabled }) => {
    // Render ký hiệu X (Error/Red) và O (Primary/Cyan) theo design
    const renderMark = () => {
        if (value === 'X') {
            return (
                <span className="text-[#ffb4ab] [text-shadow:0_0_8px_#ffb4ab] font-headline text-lg drop-shadow-[0_0_10px_#93000a]">
                    X
                </span>
            );
        } else if (value === 'O') {
            return (
                <span className="text-[#93e2ff] [text-shadow:0_0_8px_#4cc9f0] font-headline text-lg drop-shadow-[0_0_10px_#4cc9f0]">
                    O
                </span>
            );
        }
        return null;
    };

    return (
        <div
            className={`
                aspect-square border-r border-b border-[#2a2a4e] 
                flex items-center justify-center
                transition-all duration-100
                ${disabled && !value ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-[#292937] active:bg-[#343342]'}
            `}
            onClick={disabled ? undefined : onClick}
        >
            {renderMark()}
        </div>
    );
};

export default React.memo(GridCell);