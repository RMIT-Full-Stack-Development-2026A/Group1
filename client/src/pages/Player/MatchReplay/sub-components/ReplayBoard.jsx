import React from 'react';

const ReplayBoard = ({ boardState, boardSize }) => {
  const cols = Array.from({ length: boardSize }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: boardSize }, (_, i) => boardSize - i);

  return (
    <div className="relative p-8 bg-surface-container border border-outline-variant chunky-shadow overflow-auto max-w-full">
      <div className="grid border border-outline-variant gap-[1px] bg-outline-variant" 
           style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(40px, 48px))` }}>
        
        {boardState.map((row, rIdx) => (
          row.map((cell, cIdx) => (
            <div key={`${rIdx}-${cIdx}`} 
                 className={`h-10 md:h-12 bg-[#1a1a2e] flex items-center justify-center relative transition-colors hover:bg-surface-container-highest
                 ${cell?.isWinning ? 'bg-[#1a3a1a] border border-secondary-container z-10' : ''}
                 ${cell?.isLatest ? 'border-2 border-primary-container z-20 shadow-[0_0_8px_#4cc9f0]' : ''}`}>
              
              {cell && (
                <>
                  <span className={`font-headline text-lg md:text-xl ${cell.mark === 'X' ? 'text-error-container drop-shadow-[0_0_6px_rgba(147,0,10,0.8)]' : 'text-primary-container drop-shadow-[0_0_6px_rgba(76,201,240,0.8)]'}`}>
                    {cell.mark}
                  </span>
                  <span className="absolute top-0.5 right-0.5 text-[8px] bg-white text-black px-[2px] font-body font-bold">
                    {String(cell.stepIndex).padStart(2, '0')}
                  </span>
                </>
              )}
            </div>
          ))
        ))}

      </div>
    </div>
  );
};
export default ReplayBoard;